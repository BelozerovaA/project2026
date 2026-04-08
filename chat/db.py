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

                # Используем ON DUPLICATE KEY UPDATE для поддержки команды /restart
                # Если юзер новый - создастся. Если старый - обновятся его рост, вес, цель и активность
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
                    # Данные для INSERT (если новый)
                    user_id, data.get('gender'), data.get('birthdate'), data.get('height'),
                    data.get('weight'), data.get('goal_ID'), data.get('coefficient_ID'),
                    trial_start, trial_end, 1,
                    # Данные для UPDATE (если уже существует)
                    data.get('gender'), data.get('birthdate'), data.get('height'),
                    data.get('weight'), data.get('goal_ID'), data.get('coefficient_ID')
                ))

    # --- МЕТОДЫ ДЛЯ ВЕБ-ПРИЛОЖЕНИЯ (ПРОФИЛЬ) ---
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

    # --- МЕТОДЫ ПОДПИСКИ И ТРЕНИРОВОК ---
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
                # ДОБАВЛЕНЫ r.fat, r.carbs в SELECT
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
                    WHERE de.user_ID = %s AND de.date = CURDATE()
                """, (user_id,))
                
                existing_exercise = await cur.fetchone()
                if existing_exercise:
                    return existing_exercise

                await cur.execute("SELECT exercise_ID, name, description, visual_representation FROM Exercise ORDER BY RAND() LIMIT 1")
                random_exercise = await cur.fetchone()

                if not random_exercise:
                    return None 
                await cur.execute("INSERT INTO Daily_Exercise (user_ID, exercise_ID, date) VALUES (%s, %s, CURDATE())", 
                                  (user_id, random_exercise['exercise_ID']))
                return {
                    "name": random_exercise['name'], 
                    "description": random_exercise['description'],
                    "visual_representation": random_exercise['visual_representation']
                }

    async def save_kbju(self, user_id: str, result: dict, user_data):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("UPDATE `User` SET weight = %s, height = %s WHERE user_ID = %s", 
                                  (user_data.weight, user_data.height, user_id))
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

    # --- МЕТОДЫ РАСПИСАНИЯ И УВЕДОМЛЕНИЙ ---
    
    async def get_user_program_exercises(self, user_id: str):
        """Получить упражнения из личной программы"""
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT p.program_ID, e.name 
                    FROM Program p
                    JOIN Exercise e ON p.exercise_ID = e.exercise_ID
                    WHERE p.user_ID = %s
                """, (user_id,))
                result = await cur.fetchall()
                if not result:
                    return []
                return [{'id': row['program_ID'], 'name': row['name']} for row in result]

    async def save_schedule(self, user_id: str, category_id: Optional[int],
                            program_id: Optional[int], planned_date: date):
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    print(f"Попытка записи в schedule: user={user_id}, cat={category_id}, prog={program_id}, date={planned_date}")
                    await cur.execute("""
                        INSERT INTO schedule (user_ID, program_ID, category_ID, planned_date, complete_mark)
                        VALUES (%s, %s, %s, %s, 0)
                    """, (user_id, program_id, category_id, planned_date))
                    
                    await conn.commit() # Жестко фиксируем транзакцию
                    new_id = cur.lastrowid
                    print(f"УСПЕХ. ID нового расписания: {new_id}")
                    return new_id
        except Exception as e:
            print(f"!!! ОШИБКА SQL В ТАБЛИЦЕ SCHEDULE: {e}")
            return None

    async def save_notification(self, user_id: str, schedule_id: int, notification_time: datetime):
        """Сохранить уведомление"""
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    print(f"Попытка записи в notifications: user={user_id}, schedule_id={schedule_id}, time={notification_time}")
                    await cur.execute("""
                        INSERT INTO notifications (user_ID, schedule_ID, date_and_time_ending, is_sent)
                        VALUES (%s, %s, %s, 0)
                    """, (user_id, schedule_id, notification_time))
                    
                    await conn.commit() # Жестко фиксируем транзакцию
                    new_id = cur.lastrowid
                    print(f"УСПЕХ. ID нового уведомления: {new_id}")
                    return new_id
        except Exception as e:
            print(f"!!! ОШИБКА SQL В ТАБЛИЦЕ NOTIFICATIONS: {e}")
            return None

    async def get_user_schedule_for_dates(self, user_id: str, dates: List[str]):
        """Получить расписание на указанные даты"""
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT schedule_ID, program_ID, category_ID, planned_date, complete_mark
                    FROM schedule
                    WHERE user_ID = %s AND planned_date IN %s
                    ORDER BY planned_date, schedule_ID
                """, (user_id, tuple(dates)))
                return await cur.fetchall()

    async def delete_schedule_entry(self, schedule_id: int, user_id: str) -> bool:
        """Удалить запись из расписания (с проверкой прав)"""
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Сначала удаляем уведомления
                await cur.execute("""
                    DELETE FROM notifications WHERE schedule_ID = %s
                """, (schedule_id,))

                # Затем удаляем тренировку
                await cur.execute("""
                    DELETE FROM schedule 
                    WHERE schedule_ID = %s AND user_ID = %s
                """, (schedule_id, user_id))

                return cur.rowcount > 0



    async def get_pending_notifications(self, current_time: datetime):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT n.*, s.planned_date, s.user_ID 
                    FROM notifications n
                    JOIN schedule s ON n.schedule_ID = s.schedule_ID
                    WHERE n.date_and_time_ending <= %s 
                    AND n.is_sent = 0
                    AND s.complete_mark = 0
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

        # === МЕТОДЫ ДЛЯ ПОЛЬЗОВАТЕЛЬСКИХ ПРОГРАММ ===

    async def save_user_program(self, user_id: str, title: str, exercise_ids: list) -> Optional[int]:
        """Сохранить новую пользовательскую программу и ее упражнения"""
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    # 1. Создаем саму программу
                    # Поле exercise_ID в таблице users_program пропускаем, т.к. связь идет через ex_prog
                    await cur.execute("""
                        INSERT INTO users_program (user_ID, name, creation_date)
                        VALUES (%s, %s, CURDATE())
                    """, (user_id, title))
                    
                    await conn.commit()
                    program_id = cur.lastrowid
                    
                    # 2. Добавляем упражнения в таблицу ex_prog
                    if exercise_ids and program_id:
                        values = [(program_id, ex_id) for ex_id in exercise_ids]
                        await cur.executemany("""
                            INSERT INTO ex_prog (program_ID, exercise_ID)
                            VALUES (%s, %s)
                        """, values)
                        await conn.commit()
                        
                    return program_id
        except Exception as e:
            print(f"Ошибка при сохранении программы: {e}")
            return None

    async def get_user_programs_with_exercises(self, user_id: str) -> list:
        """Получить все кастомные программы пользователя с их упражнениями"""
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # 1. Получаем список программ
                await cur.execute("""
                    SELECT program_ID, name, creation_date
                    FROM users_program
                    WHERE user_ID = %s
                    ORDER BY program_ID DESC
                """, (user_id,))
                programs = await cur.fetchall()
                
                if not programs:
                    return []
                
                # 2. Получаем упражнения для этих программ
                program_ids = [p['program_ID'] for p in programs]
                format_strings = ','.join(['%s'] * len(program_ids))
                
                await cur.execute(f"""
                    SELECT ep.program_ID, e.exercise_ID, e.name, e.description, e.visual_representation
                    FROM ex_prog ep
                    JOIN exercise e ON ep.exercise_ID = e.exercise_ID
                    WHERE ep.program_ID IN ({format_strings})
                """, tuple(program_ids))
                
                exercises = await cur.fetchall()
                
                # 3. Формируем итоговый словарь для фронтенда
                prog_dict = {p['program_ID']: {
                    "id": p['program_ID'],
                    "title": p['name'],
                    "difficulty": "Средний", # Стандартное значение (в БД нет такого поля)
                    "duration": "30 мин",
                    "calories": 300,
                    "focus": "Индивидуальная",
                    "exercises": []
                } for p in programs}
                
                for ex in exercises:
                    prog_dict[ex['program_ID']]['exercises'].append({
                        "id": ex['exercise_ID'],
                        "name": ex['name'],
                        "description": ex['description'],
                        "image": ex['visual_representation']
                    })
                    
                return list(prog_dict.values())

    async def delete_user_program(self, user_id: str, program_id: int) -> bool:
        """Удалить программу и связи с упражнениями"""
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                try:
                    # Сначала удаляем связи из ex_prog
                    await cur.execute("DELETE FROM ex_prog WHERE program_ID = %s", (program_id,))
                    # Затем удаляем саму программу (с проверкой user_ID)
                    await cur.execute("DELETE FROM users_program WHERE program_ID = %s AND user_ID = %s", 
                                      (program_id, user_id))
                    await conn.commit()
                    return cur.rowcount > 0
                except Exception as e:
                    print(f"Ошибка при удалении программы: {e}")
                    return False

db = Database()
