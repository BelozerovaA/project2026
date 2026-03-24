import aiomysql
from datetime import date, timedelta
from typing import Optional, Dict, Any
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
                await cur.execute("SELECT * FROM `User` WHERE user_ID = %s", (user_id,))
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
                """, (
                    user_id,
                    data.get('gender'),
                    data.get('birthdate'),
                    data.get('height'),
                    data.get('weight'),
                    data.get('goal_ID'),
                    data.get('coefficient_ID'),
                    trial_start,
                    trial_end,
                    1
                ))

    # --- МЕТОДЫ ДЛЯ ВЕБ-ПРИЛОЖЕНИЯ (ПРОФИЛЬ) ---

    async def get_latest_calories(self, user_id: str) -> Optional[int]:
        """Получает последнюю рассчитанную норму калорий пользователя"""
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

    async def save_kbju(self, user_id: str, data: dict):
        """Сохраняет рассчитанное КБЖУ в БД"""
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO Macros_Calculation 
                    (user_ID, daily_calorie_target, protein, fat, carbs)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, data['tdee'], data['protein'], data['fat'], data['carbs']))

    # --- МЕТОДЫ ПОДПИСКИ ---

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

    async def close(self):
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()

db = Database()