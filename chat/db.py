import aiomysql
from datetime import date, timedelta, datetime
from typing import Optional, Dict, Any, List, Union
from config import settings


class Database:
    def __init__(self):
        self.pool = None

    async def create_pool(self):
        self.pool = await aiomysql.create_pool(
            host=settings.db_host,
            user=settings.db_user,
            password=settings.db_password,
            db=settings.db_name,
            autocommit=True,
            minsize=1,
            maxsize=5
        )

    # -------------------------
    # ВСПОМОГАТЕЛЬНЫЕ (внутренние)
    # -------------------------

    def _goal_id_from_goal_name(self, goal_name: str) -> int:
        return 1 if goal_name == "Похудение" else 3

    def _goal_name_from_goal_id(self, goal_id: Optional[int]) -> str:
        return "Похудение" if goal_id == 1 else "Коррекция тела"

    def _age_group_from_dob(self, dob: Optional[date]) -> str:
        if not dob:
            return "20-30"
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return "30-40" if age > 30 else "20-30"

    def _parse_users_programcol(self, meta: Optional[str]) -> Dict[str, str]:
        """
        meta формат: "Мужской|20-30|Похудение|Средний"
        difficulty может отсутствовать (старые записи)
        """
        result = {"gender": "", "age_group": "", "goal": "", "difficulty": ""}
        if not meta:
            return result
        parts = [p.strip() for p in meta.split("|")]
        if len(parts) >= 1:
            result["gender"] = parts[0]
        if len(parts) >= 2:
            result["age_group"] = parts[1]
        if len(parts) >= 3:
            result["goal"] = parts[2]
        if len(parts) >= 4:
            result["difficulty"] = parts[3]
        return result

    def _build_users_programcol(self, gender_ru: str, age_group: str, goal: str, difficulty: str) -> str:
        return f"{gender_ru}|{age_group}|{goal}|{difficulty}"

    def _sets_by_difficulty(self, difficulty: str) -> int:
        if difficulty == "Начинающий":
            return 1
        if difficulty == "Продвинутый":
            return 3
        return 2

    # -------------------------
    # ПОЛЬЗОВАТЕЛЬ
    # -------------------------

    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT u.*, ac.coef_value 
                    FROM `User` u
                    LEFT JOIN `active_coefficient` ac ON u.coefficient_ID = ac.coefficient_ID
                    WHERE u.user_ID = %s
                """, (user_id,))
                return await cur.fetchone()

    async def add_user(self, user_id: str, data: Dict[str, Any]):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                trial_start = date.today()
                trial_end = trial_start + timedelta(days=30)

                await cur.execute("""
                    INSERT INTO `User` 
                    (user_ID, gender, date_of_birth, height, weight, goal_ID, coefficient_ID, 
                     trial_period_start, trial_period_end, trial_period_user_flag)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    gender = %s,
                    date_of_birth = %s,
                    height = %s,
                    weight = %s,
                    goal_ID = %s,
                    coefficient_ID = %s
                """, (
                    user_id, data.get('gender'), data.get('birthdate'), data.get('height'),
                    data.get('weight'), data.get('goal_ID'), data.get('coefficient_ID'),
                    trial_start, trial_end, 1,
                    data.get('gender'), data.get('birthdate'), data.get('height'),
                    data.get('weight'), data.get('goal_ID'), data.get('coefficient_ID')
                ))

    async def update_user_profile_from_program_form(self, user_id: str, gender_ru: str, goal_name: str):
        """
        Сохраняем изменения анкеты в User
        """
        goal_id = self._goal_id_from_goal_name(goal_name)

        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    UPDATE `User`
                    SET gender = %s,
                        goal_ID = %s
                    WHERE user_ID = %s
                """, (gender_ru, goal_id, user_id))

    # -------------------------
    # МАКРОСЫ / ПОДПИСКИ / РЕЦЕПТЫ / ЕЖЕДНЕВНОЕ
    # -------------------------

    async def get_latest_calories(self, user_id: str) -> Optional[int]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT daily_calorie_target 
                    FROM Macros_Calculation 
                    WHERE user_ID = %s 
                    ORDER BY macros_calculation_ID DESC 
                    LIMIT 1
                """, (user_id,))
                result = await cur.fetchone()
                return result['daily_calorie_target'] if result else None

    async def get_latest_macros(self, user_id: str) -> Optional[Dict[str, Any]]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT daily_calorie_target, protein, fat, carbs 
                    FROM Macros_Calculation 
                    WHERE user_ID = %s 
                    ORDER BY macros_calculation_ID DESC 
                    LIMIT 1
                """, (user_id,))
                return await cur.fetchone()

    async def get_active_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT s.*, sp.name as period_name, sp.num_sub_interval
                    FROM Subscription s
                    JOIN Subscription_Period sp ON s.sub_period_ID = sp.sub_period_ID
                    WHERE s.user_ID = %s AND s.is_active = 1
                    ORDER BY s.end_date DESC
                    LIMIT 1
                """, (user_id,))
                return await cur.fetchone()

    async def get_recipes_by_goal(self, goal_id: int) -> list:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = """
                    SELECT 
                        r.recipe_ID, r.category_ID, r.name as recipe_name, r.description, 
                        r.image, r.calories, r.protein, r.fat, r.carbs,
                        rc.quantity, i.name as ingredient_name, u.name as unit_name
                    FROM recipe r
                    LEFT JOIN recipe_composition rc ON r.recipe_ID = rc.recipe_ID
                    LEFT JOIN ingredient i ON rc.ingredient_ID = i.ingredient_ID
                    LEFT JOIN unit_ofmeasure u ON i.unit_ID = u.unit_ID
                    WHERE r.goal_ID = %s
                """
                await cur.execute(query, (goal_id,))
                rows = await cur.fetchall()

                recipes_dict = {}
                for row in rows:
                    rid = row['recipe_ID']
                    if rid not in recipes_dict:
                        recipes_dict[rid] = {
                            "id": rid,
                            "category_ID": row['category_ID'],
                            "title": row['recipe_name'],
                            "instructions": row['description'],
                            "image": row['image'],
                            "calories": row['calories'],
                            "protein": float(row['protein']) if row['protein'] else 0,
                            "fat": float(row['fat']) if row['fat'] else 0,
                            "carbs": float(row['carbs']) if row['carbs'] else 0,
                            "ingredients": []
                        }

                    if row['ingredient_name']:
                        qty = float(row['quantity']) if row['quantity'] else 0
                        qty_str = f"{qty:g}"
                        ingredient_str = f"{row['ingredient_name']} - {qty_str} {row['unit_name']}"
                        recipes_dict[rid]["ingredients"].append(ingredient_str)

                return list(recipes_dict.values())

    async def get_or_create_daily_exercise(self, user_id: str) -> Optional[dict]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT e.name, e.description, e.visual_representation 
                    FROM Daily_Exercise de
                    JOIN Exercise e ON de.exercise_ID = e.exercise_ID
                    WHERE de.user_ID = %s AND DATE(de.date) = CURDATE()
                    ORDER BY de.date DESC
                    LIMIT 1
                """, (user_id,))

                existing_exercise = await cur.fetchone()
                if existing_exercise:
                    return existing_exercise

                await cur.execute("SELECT user_ID FROM `User` WHERE user_ID = %s", (user_id,))
                if not await cur.fetchone():
                    trial_start = date.today()
                    trial_end = trial_start + timedelta(days=30)
                    await cur.execute("""
                        INSERT INTO `User` (user_ID, trial_period_start, trial_period_end, trial_period_user_flag)
                        VALUES (%s, %s, %s, 1)
                    """, (user_id, trial_start, trial_end))

                await cur.execute(
                    "SELECT exercise_ID, name, description, visual_representation FROM Exercise ORDER BY RAND() LIMIT 1"
                )
                random_exercise = await cur.fetchone()
                if not random_exercise:
                    return None

                await cur.execute(
                    "INSERT INTO Daily_Exercise (user_ID, exercise_ID, date) VALUES (%s, %s, CURDATE())",
                    (user_id, random_exercise['exercise_ID'])
                )

                return {
                    "name": random_exercise['name'],
                    "description": random_exercise['description'],
                    "visual_representation": random_exercise['visual_representation']
                }

    async def save_kbju(self, user_id: str, result: dict, user_data):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                db_gender = "Мужской" if user_data.gender == "male" else "Женский"
                goal_map = {"lose": 1, "gain": 2, "maintain": 3}
                db_goal_id = goal_map.get(user_data.goal, 3)

                db_coef_id = 3
                if user_data.activity == 1.2: db_coef_id = 1
                elif user_data.activity == 1.375: db_coef_id = 2
                elif user_data.activity == 1.55: db_coef_id = 3
                elif user_data.activity == 1.725: db_coef_id = 4
                elif user_data.activity == 1.9: db_coef_id = 5

                today = date.today()
                try:
                    approx_dob = today.replace(year=today.year - user_data.age)
                except ValueError:
                    approx_dob = today.replace(year=today.year - user_data.age, day=28)

                await cur.execute("""
                    UPDATE `User` 
                    SET weight = %s, 
                        height = %s, 
                        gender = %s,
                        goal_ID = %s,
                        coefficient_ID = %s,
                        date_of_birth = %s
                    WHERE user_ID = %s
                """, (
                    user_data.weight,
                    user_data.height,
                    db_gender,
                    db_goal_id,
                    db_coef_id,
                    approx_dob,
                    user_id
                ))

                await cur.execute("""
                    INSERT INTO Macros_Calculation (user_ID, daily_calorie_target, protein, fat, carbs)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, result['tdee'], result['protein'], result['fat'], result['carbs']))

    async def get_trial_end_date(self, user_id: str) -> Optional[date]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT trial_period_end FROM `User` WHERE user_ID = %s", (user_id,))
                result = await cur.fetchone()
                return result['trial_period_end'] if result else None

    async def create_or_extend_subscription(self, user_id: str, sub_period_id: int, days: int) -> Dict[str, Any]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT name FROM Subscription_Period WHERE sub_period_ID = %s", (sub_period_id,))
                period_result = await cur.fetchone()
                period_name = period_result['name'] if period_result else f"{days} дней"

                active_sub = await self.get_active_subscription(user_id)

                if active_sub:
                    new_start = active_sub['end_date']
                    new_end = new_start + timedelta(days=days)
                    await cur.execute("UPDATE Subscription SET end_date = %s WHERE sub_ID = %s",
                                      (new_end, active_sub['sub_ID']))
                    return {'start_date': new_start, 'end_date': new_end, 'period_name': period_name, 'action': 'extended'}
                else:
                    trial_end = await self.get_trial_end_date(user_id)
                    today = date.today()
                    new_start = trial_end if (trial_end and trial_end > today) else today
                    new_end = new_start + timedelta(days=days)

                    await cur.execute("""
                        INSERT INTO Subscription (user_ID, sub_period_ID, start_date, end_date, is_active)
                        VALUES (%s, %s, %s, %s, 1)
                    """, (user_id, sub_period_id, new_start, new_end))
                    return {'start_date': new_start, 'end_date': new_end, 'period_name': period_name, 'action': 'created'}

    # -------------------------
    # РАСПИСАНИЕ / УВЕДОМЛЕНИЯ
    # -------------------------

    async def save_schedule(self, user_id: str, category_id: Optional[int],
                            program_id: Optional[int], planned_date: date):
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("""
                        INSERT INTO schedule (user_ID, program_ID, category_ID, planned_date)
                        VALUES (%s, %s, %s, %s)
                    """, (user_id, program_id, category_id, planned_date))
                    return cur.lastrowid
        except Exception as e:
            print(f"Ошибка в save_schedule: {e}")
            return None

    async def save_notification(self, user_id: str, schedule_id: int, notification_time: datetime):
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("""
                        INSERT INTO notifications (user_ID, schedule_ID, date_and_time_ending, is_sent)
                        VALUES (%s, %s, %s, 0)
                    """, (user_id, schedule_id, notification_time))
                    return cur.lastrowid
        except Exception as e:
            print(f"Ошибка в save_notification: {e}")
            return None

    async def get_user_schedule_for_dates(self, user_id: str, dates: List[str]):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT s.schedule_ID, s.program_ID, s.category_ID, s.planned_date,
                        p.name AS program_name
                    FROM schedule s
                    LEFT JOIN program p ON s.program_ID = p.program_ID
                    WHERE s.user_ID = %s AND s.planned_date IN %s
                    ORDER BY s.planned_date, s.schedule_ID
                """, (user_id, tuple(dates)))
                return await cur.fetchall()

    async def delete_schedule_entry(self, schedule_id: int, user_id: str) -> bool:
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM notifications WHERE schedule_ID = %s", (schedule_id,))
                await cur.execute("DELETE FROM schedule WHERE schedule_ID = %s AND user_ID = %s", (schedule_id, user_id))
                return cur.rowcount > 0

    # -------------------------
    # ИНДИВИДУАЛЬНЫЕ ПРОГРАММЫ
    # -------------------------

    async def get_program_form_data(self, user_id: str) -> Dict[str, str]:
        """
        Возвращает данные для анкеты:
        gender: "Мужской"/"Женский"
        age_group: "20-30"/"30-40"
        goal: "Похудение"/"Коррекция тела"
        """
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT Users_programcol
                    FROM program
                    WHERE user_ID = %s AND Users_programcol IS NOT NULL AND Users_programcol <> ''
                    ORDER BY program_ID DESC
                    LIMIT 1
                """, (user_id,))
                row = await cur.fetchone()

        if row and row.get("Users_programcol"):
            parsed = self._parse_users_programcol(row["Users_programcol"])
            if parsed["gender"] and parsed["age_group"] and parsed["goal"]:
                return {
                    "gender": parsed["gender"],
                    "age_group": parsed["age_group"],
                    "goal": parsed["goal"]
                }

        user = await self.get_user(user_id)
        if not user:
            return {"gender": "Женский", "age_group": "20-30", "goal": "Коррекция тела"}

        gender = user.get("gender") or "Женский"
        age_group = self._age_group_from_dob(user.get("date_of_birth"))
        goal = self._goal_name_from_goal_id(user.get("goal_ID"))

        return {"gender": gender, "age_group": age_group, "goal": goal}

    async def generate_individual_program(self, user_id: str, gender: str, age_group: str, goal_id: int, goal_name: str) -> Optional[Dict[str, Any]]:
        """
        MODIFIED: Генерирует программу БЕЗ сохранения в БД
        Возвращает только данные для фронтенда
        """
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                try:
                    db_gender = "Мужской" if gender == "male" else "Женский"
                    db_gender_alt = "male" if gender == "male" else "female"
                    short_gender = "М" if gender == "male" else "Ж"
                    
                    # Подбираем упражнения
                    await cur.execute("""
                        SELECT exercise_ID, name, description, visual_representation, repetitions, execution,
                            gender, age_group, goal_ID
                        FROM exercise
                        WHERE (gender = %s OR gender = %s OR gender LIKE %s OR gender IS NULL OR gender = '')
                        AND (age_group = %s OR age_group LIKE %s OR age_group IS NULL OR age_group = '')
                        AND goal_ID = %s
                        ORDER BY RAND()
                        LIMIT 10
                    """, (db_gender, db_gender_alt, f"%{short_gender}%", age_group, f"%{age_group}%", goal_id))
                    
                    exercises = await cur.fetchall()
                    
                    if not exercises:
                        return None
                    
                    # Формируем данные для фронта БЕЗ сохранения в БД
                    display_difficulty = "Средний"
                    sets = self._sets_by_difficulty(display_difficulty)
                    
                    exercises_for_front = []
                    for ex in exercises:
                        reps_val = ex["execution"] or (str(ex["repetitions"]) if ex["repetitions"] is not None else "15")
                        exercises_for_front.append({
                            "id": ex["exercise_ID"],
                            "name": ex["name"],
                            "description": ex["description"] or ex["execution"] or "",
                            "image": ex["visual_representation"],
                            "sets": sets,
                            "reps": reps_val
                        })
                    
                    # Возвращаем программу с временными данными (НЕ сохраняя в БД)
                    return {
                        "id": None,  # Нет ID, так как не сохранена
                        "title": f"{goal_name} (черновик)",
                        "difficulty": display_difficulty,
                        "focus": goal_name,
                        "exercises": exercises_for_front,
                        "is_finalized": False,
                        "meta": {  # Метаданные для последующего сохранения
                            "gender": db_gender,
                            "age_group": age_group,
                            "goal_name": goal_name,
                            "goal_id": goal_id
                        }
                    }
            
                except Exception as main_error:
                    print(f"Ошибка generate_individual_program: {main_error}")
                    import traceback
                    traceback.print_exc()
                    return None

    async def create_user_program(self, user_id: str, title: str, difficulty: str, focus: str, exercises: list, meta: dict) -> Optional[int]:
        """
        НОВАЯ ФУНКЦИЯ: Создаёт программу в БД только при явном сохранении
        """
        if len(exercises) < 5:
            print("Ошибка: попытка сохранить программу с менее чем 5 упражнениями.")
            return None
            
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                try:
                    await conn.begin()
                    
                    # Считаем номер программы
                    like_title = f"{focus}%"
                    await cur.execute("""
                        SELECT COUNT(*) as cnt FROM program 
                        WHERE user_ID = %s AND name LIKE %s
                    """, (user_id, like_title))
                    cnt_row = await cur.fetchone()
                    number = (cnt_row["cnt"] if cnt_row else 0) + 1
                    final_title = f"{focus} #{number}"
                    
                    # Формируем метаданные
                    gender = meta.get("gender", "Женский")
                    age_group = meta.get("age_group", "20-30")
                    goal_name = meta.get("goal_name", focus)
                    
                    users_programcol = self._build_users_programcol(gender, age_group, goal_name, difficulty)
                    
                    # Создаём запись программы
                    first_exercise_id = exercises[0]["id"]
                    await cur.execute("""
                        INSERT INTO program (user_ID, exercise_ID, name, creation_date, Users_programcol)
                        VALUES (%s, %s, %s, CURDATE(), %s)
                    """, (user_id, first_exercise_id, final_title, users_programcol))
                    program_id = cur.lastrowid
                    
                    # Связываем упражнения
                    values = [(program_id, ex["id"]) for ex in exercises]
                    await cur.executemany("""
                        INSERT INTO ex_prog (program_ID, exercise_ID)
                        VALUES (%s, %s)
                    """, values)
                    
                    await conn.commit()
                    return program_id
                
                except Exception as e:
                    try:
                        await conn.rollback()
                    except Exception:
                        pass
                    print(f"Ошибка create_user_program: {e}")
                    import traceback
                    traceback.print_exc()
                    return None

    async def get_user_program_exercises(self, user_id: str):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT program_ID, name 
                    FROM program
                    WHERE user_ID = %s
                """, (user_id,))
                result = await cur.fetchall()
                if not result:
                    return []
                return [{'id': row['program_ID'], 'name': row['name']} for row in result]

    async def get_user_programs_with_exercises(self, user_id: str) -> list:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT program_ID, name, creation_date, Users_programcol
                    FROM program
                    WHERE user_ID = %s
                    ORDER BY program_ID DESC
                """, (user_id,))
                programs = await cur.fetchall()
                if not programs:
                    return []

                program_ids = [p["program_ID"] for p in programs]
                placeholders = ",".join(["%s"] * len(program_ids))

                await cur.execute(f"""
                    SELECT ep.program_ID, e.exercise_ID, e.name, e.description, e.visual_representation, e.repetitions, e.execution
                    FROM ex_prog ep
                    JOIN exercise e ON ep.exercise_ID = e.exercise_ID
                    WHERE ep.program_ID IN ({placeholders})
                """, tuple(program_ids))
                exercises_rows = await cur.fetchall()

                prog_dict: Dict[int, Dict[str, Any]] = {}
                for p in programs:
                    parsed = self._parse_users_programcol(p.get("Users_programcol"))
                    focus = parsed["goal"] or "Индивидуальная"
                    
                    # Определение is_finalized и difficulty
                    is_finalized = parsed["difficulty"] != "PENDING_EDIT"
                    difficulty = parsed["difficulty"] if is_finalized else "Средний"

                    prog_dict[p["program_ID"]] = {
                        "id": p["program_ID"],
                        "title": p["name"],
                        "difficulty": difficulty,
                        "focus": focus,
                        "is_finalized": is_finalized,
                        "exercises": []
                    }

                for ex in exercises_rows:
                    pid = ex["program_ID"]
                    if pid not in prog_dict:
                        continue
                    difficulty = prog_dict[pid]["difficulty"]
                    sets = self._sets_by_difficulty(difficulty)
                    reps_val = ex["execution"] or (str(ex["repetitions"]) if ex["repetitions"] is not None else "15")

                    prog_dict[pid]["exercises"].append({
                        "id": ex["exercise_ID"],
                        "name": ex["name"],
                        "description": ex["description"] or ex["execution"] or "",
                        "image": ex["visual_representation"],
                        "sets": sets,
                        "reps": reps_val
                    })

                return list(prog_dict.values())

    async def update_user_program(self, user_id: str, program_id: int, difficulty: str, exercises: list) -> bool:
        """
        Обновляет СУЩЕСТВУЮЩУЮ программу (только если она ещё редактируемая)
        """
        if len(exercises) < 5:
            print("Ошибка: попытка сохранить программу с менее чем 5 упражнениями.")
            return False
            
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                try:
                    await conn.begin()
                    
                    await cur.execute("""
                        SELECT program_ID, Users_programcol
                        FROM program
                        WHERE program_ID = %s AND user_ID = %s
                    """, (program_id, user_id))
                    program_row = await cur.fetchone()
                    if not program_row:
                        await conn.rollback()
                        return False
                    
                    parsed = self._parse_users_programcol(program_row.get("Users_programcol"))

                    # Проверяем, можно ли редактировать
                    if parsed["difficulty"] != "PENDING_EDIT":
                        print(f"Программа {program_id} уже финализирована. Редактирование запрещено.")
                        await conn.rollback()
                        return False

                    # Обновляем связи упражнений
                    await cur.execute("DELETE FROM ex_prog WHERE program_ID = %s", (program_id,))

                    if exercises:
                        values = [(program_id, ex["id"]) for ex in exercises]
                        await cur.executemany("""
                            INSERT INTO ex_prog (program_ID, exercise_ID)
                            VALUES (%s, %s)
                        """, values)

                    gender_ru = parsed["gender"]
                    age_group = parsed["age_group"]
                    goal = parsed["goal"]
                    
                    new_meta = self._build_users_programcol(gender_ru, age_group, goal, difficulty)
                    
                    await cur.execute("""
                        UPDATE program
                        SET Users_programcol = %s
                        WHERE program_ID = %s AND user_ID = %s
                    """, (new_meta, program_id, user_id))

                    await conn.commit()
                    return True

                except Exception as e:
                    try:
                        await conn.rollback()
                    except Exception:
                        pass
                    print(f"Ошибка при обновлении программы: {e}")
                    return False

    async def delete_user_program(self, user_id: str, program_id: int) -> bool:
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                try:
                    await conn.begin()

                    await cur.execute("SELECT program_ID FROM program WHERE program_ID = %s AND user_ID = %s", (program_id, user_id))
                    if not await cur.fetchone():
                        await conn.rollback()
                        return False

                    await cur.execute("""
                        DELETE FROM notifications 
                        WHERE schedule_ID IN (
                            SELECT schedule_ID FROM schedule WHERE program_ID = %s
                        )
                    """, (program_id,))

                    await cur.execute("DELETE FROM schedule WHERE program_ID = %s", (program_id,))
                    await cur.execute("DELETE FROM ex_prog WHERE program_ID = %s", (program_id,))
                    await cur.execute("DELETE FROM program WHERE program_ID = %s AND user_ID = %s", (program_id, user_id))

                    await conn.commit()
                    return True

                except Exception as e:
                    try:
                        await conn.rollback()
                    except Exception:
                        pass
                    print(f"Ошибка при удалении программы: {e}")
                    return False

    # -------------------------
    # УВЕДОМЛЕНИЯ
    # -------------------------

    async def get_pending_notifications(self, current_time: datetime):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT 
                        n.*, 
                        s.planned_date, 
                        s.user_ID, 
                        s.category_ID, 
                        s.program_ID,
                        p.name AS program_name 
                    FROM notifications n
                    JOIN schedule s ON n.schedule_ID = s.schedule_ID
                    LEFT JOIN program p ON s.program_ID = p.program_ID
                    WHERE n.date_and_time_ending <= %s 
                    AND n.is_sent = 0
                """, (current_time,))
                return await cur.fetchall()

    async def mark_notification_sent(self, notification_id: int):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    UPDATE notifications 
                    SET is_sent = 1, sent_at = NOW() 
                    WHERE notification_ID = %s
                """, (notification_id,))

    async def close(self):
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()

    # -------------------------
    # ТРЕНИРОВКИ
    # -------------------------

    async def get_workouts(self, user_gender: str, user_age_group: str) -> Dict[str, List[Dict[str, Any]]]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                db_gender_alt = "male" if user_gender == "Мужской" else "female"
                short_gender = "М" if user_gender == "Мужской" else "Ж"

                query = """
                    SELECT 
                        t.training_ID as id, 
                        t.name as title, 
                        c.name as section_title, 
                        t.difficulty, 
                        t.duration,
                        g.name as goal_name
                    FROM training t
                    JOIN goal g ON t.goal_ID = g.goal_ID
                    JOIN exercise_category c ON t.category_ID = c.category_ID
                    WHERE EXISTS (
                        SELECT 1
                        FROM training_composition tc
                        JOIN exercise e ON tc.exercise_ID = e.exercise_ID
                        WHERE tc.training_ID = t.training_ID
                          AND (e.gender = %s OR e.gender = %s OR e.gender LIKE %s OR e.gender IS NULL OR e.gender = '')
                          AND (e.age_group = %s OR e.age_group LIKE %s OR e.age_group IS NULL OR e.age_group = '')
                    )
                    ORDER BY g.name, c.name, t.training_ID
                """
                await cur.execute(query, (user_gender, db_gender_alt, f"%{short_gender}%", user_age_group, f"%{user_age_group}%"))
                rows = await cur.fetchall()

                workouts_by_goal = {}
                for row in rows:
                    goal = row['goal_name']
                    section = row['section_title']

                    if goal not in workouts_by_goal:
                        workouts_by_goal[goal] = {}
                    if section not in workouts_by_goal[goal]:
                        workouts_by_goal[goal][section] = []

                    workouts_by_goal[goal][section].append({
                        "id": row['id'],
                        "title": row['title'],
                        "difficulty": row['difficulty'],
                        "duration": row['duration']
                    })

                result = {}
                for goal, sections in workouts_by_goal.items():
                    result[goal] = [
                        {"sectionTitle": sec_title, "workouts": works}
                        for sec_title, works in sections.items()
                    ]

                return result

    async def get_workout_exercises(self, training_id: int, gender: str, age_group: str) -> List[Dict[str, Any]]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                final_exercises = []
                used_ids = set()

                db_gender_alt = "male" if gender == "Мужской" else "female"
                short_gender = "М" if gender == "Мужской" else "Ж"

                await cur.execute("SELECT goal_ID FROM training WHERE training_ID = %s", (training_id,))
                goal_row = await cur.fetchone()
                if not goal_row:
                    return []
                training_goal_id = goal_row['goal_ID']

                await cur.execute("""
                    SELECT e.exercise_ID as id, e.name, e.description, e.visual_representation, 
                           e.execution, e.repetitions, 
                           tc.number as composition_number
                    FROM exercise e
                    JOIN training_composition tc ON e.exercise_ID = tc.exercise_ID
                    WHERE tc.training_ID = %s 
                      AND (e.gender = %s OR e.gender = %s OR e.gender LIKE %s OR e.gender IS NULL OR e.gender = '')
                      AND (e.age_group = %s OR e.age_group LIKE %s OR e.age_group IS NULL OR e.age_group = '')
                    ORDER BY tc.number ASC
                """, (training_id, gender, db_gender_alt, f"%{short_gender}%", age_group, f"%{age_group}%"))

                for ex in await cur.fetchall():
                    final_exercises.append(ex)
                    used_ids.add(ex['id'])

                if len(final_exercises) < 6:
                    needed = 6 - len(final_exercises)

                    if used_ids:
                        placeholders = ','.join(['%s'] * len(used_ids))
                        query = f"""
                            SELECT exercise_ID as id, name, description, visual_representation, 
                                   execution, repetitions
                            FROM exercise
                            WHERE goal_ID = %s 
                              AND (gender = %s OR gender = %s OR gender LIKE %s OR gender IS NULL)
                              AND (age_group = %s OR age_group LIKE %s OR age_group IS NULL)
                              AND exercise_ID NOT IN ({placeholders})
                            ORDER BY RAND() LIMIT %s
                        """
                        params = [training_goal_id, gender, db_gender_alt, f"%{short_gender}%", age_group, f"%{age_group}%"] + list(used_ids) + [needed]
                    else:
                        query = """
                            SELECT exercise_ID as id, name, description, visual_representation, 
                                   execution, repetitions
                            FROM exercise
                            WHERE goal_ID = %s 
                              AND (gender = %s OR gender = %s OR gender LIKE %s OR gender IS NULL)
                              AND (age_group = %s OR age_group LIKE %s OR age_group IS NULL)
                            ORDER BY RAND() LIMIT %s
                        """
                        params = [training_goal_id, gender, db_gender_alt, f"%{short_gender}%", age_group, f"%{age_group}%", needed]

                    await cur.execute(query, tuple(params))

                    next_number = len(final_exercises) + 1
                    for ex in await cur.fetchall():
                        ex['composition_number'] = next_number
                        final_exercises.append(ex)
                        next_number += 1
                        used_ids.add(ex['id'])

                for ex in final_exercises:
                    ex['description'] = ex['description'] or ""
                    ex['execution'] = ex['execution'] or "Выполнение"
                    if not ex.get('repetitions'):
                        ex['repetitions'] = 15

                final_exercises.sort(key=lambda x: x.get('composition_number', float('inf')))
                return final_exercises


db = Database()