import os
import sys
import json
import hmac
import hashlib
from datetime import date
from urllib.parse import parse_qsl

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAT_DIR = os.path.join(BASE_DIR, "chat")
sys.path.append(CHAT_DIR)

from db import db
from config import settings

app = FastAPI()

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "https://snnfitmate.ru",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.on_event("startup")
# async def startup():
#    await db.create_pool()

# @app.on_event("shutdown")
# async def shutdown():
#    await db.close()

class KBJURequest(BaseModel):
    init_data: str
    gender: str
    weight: float
    height: float
    age: int
    activity: float
    goal: str

class InitDataRequest(BaseModel):
    init_data: str


# --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

def format_date_ru(value):
    if not value:
        return None
    return value.strftime("%d.%m.%Y")

def get_age_string(age: int) -> str:
    """Склонение возраста: год/года/лет"""
    if age % 10 == 1 and age % 100 != 11:
        return f"{age} год"
    elif 2 <= age % 10 <= 4 and (age % 100 < 10 or age % 100 >= 20):
        return f"{age} года"
    else:
        return f"{age} лет"

def translate_gender(gender: str) -> str:
    """Перевод пола на русский"""
    if not gender: 
        return "—"
    g = gender.lower()
    if g in ["male", "мужской", "м", "m"]: return "Мужской"
    if g in ["female", "женский", "ж", "f"]: return "Женский"
    return gender.capitalize()

def validate_telegram_init_data(init_data: str, bot_token: str):
    parsed_data = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed_data.pop("hash", None)
    if not received_hash:
        return None

    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(parsed_data.items()))
    secret_key = hmac.new(key=b"WebAppData", msg=bot_token.encode(), digestmod=hashlib.sha256).digest()
    calculated_hash = hmac.new(key=secret_key, msg=data_check_string.encode(), digestmod=hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        return None

    user_data = parsed_data.get("user")
    if user_data:
        try:
            parsed_data["user"] = json.loads(user_data)
        except json.JSONDecodeError:
            parsed_data["user"] = None

    return parsed_data


# --- РОУТЫ ---

@app.get("/")
async def root():
    return {"status": "ok"}


@app.post("/calculate-kbju")
async def calculate_kbju(data: KBJURequest):
    validated_data = validate_telegram_init_data(data.init_data, settings.bot_token)
    if not validated_data:
        raise HTTPException(status_code=401, detail="Invalid init data")

    tg_user = validated_data.get("user")
    user_id = str(tg_user.get("id"))

    # BMR
    if data.gender == "male":
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
    else:
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161

    # TDEE
    if data.goal == "lose": tdee = bmr * data.activity * (1 - 0.175)
    elif data.goal == "gain": tdee = bmr * data.activity * (1 + 0.1)
    else: tdee = bmr * data.activity

    # КБЖУ
    if data.goal == "maintain": protein_p, fat_p, carbs_p = 0.2, 0.3, 0.5
    elif data.goal == "gain": protein_p, fat_p, carbs_p = 0.25, 0.25, 0.5
    else: protein_p, fat_p, carbs_p = 0.3, 0.22, 0.48

    result = {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "protein": round((tdee * protein_p) / 4),
        "fat": round((tdee * fat_p) / 9),
        "carbs": round((tdee * carbs_p) / 4),
    }

    # Сохраняем в БД
    await db.save_kbju(user_id, result)
    return result


@app.post("/telegram/user")
async def get_telegram_user(data: InitDataRequest):
    validated_data = validate_telegram_init_data(data.init_data, settings.bot_token)
    if not validated_data:
        raise HTTPException(status_code=401, detail="Invalid init data")

    tg_user = validated_data.get("user")
    if not tg_user:
        raise HTTPException(status_code=400, detail="Telegram user data not found")

    telegram_user_id = str(tg_user.get("id"))
    db_user = await db.get_user(telegram_user_id)

    # Базовая инфа о ТГ-юсере
    tg_response = {
        "id": tg_user.get("id"),
        "first_name": tg_user.get("first_name"),
        "last_name": tg_user.get("last_name"),
        "username": tg_user.get("username"),
        "language_code": tg_user.get("language_code"),
    }

    if not db_user:
        return {"telegram": tg_response, "profile": None, "message": "Пользователь не найден в БД"}

    # --- 1. Возраст ---
    age_str = "—"
    if db_user.get("date_of_birth"):
        dob = db_user["date_of_birth"]
        today = date.today()
        # Считаем полные года
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        age_str = get_age_string(age)

    # --- 2. Рост и Вес ---
    height_str = f"{db_user.get('height')} см" if db_user.get("height") else "—"
    weight_str = f"{db_user.get('weight')} кг" if db_user.get("weight") else "—"

    # --- 3. Калории ---
    calories_target = await db.get_latest_calories(telegram_user_id)
    calories_str = f"{calories_target} ккал" if calories_target else "—"

    # --- 4. Подписка ---
    active_sub = await db.get_active_subscription(telegram_user_id)
    subscription_str = "Нет"
    
    if active_sub:
        subscription_str = active_sub.get("period_name", "Активна")
    else:
        trial_end = db_user.get("trial_period_end")
        if db_user.get("trial_period_user_flag") == 1 and trial_end and trial_end >= date.today():
            subscription_str = f"Пробный (до {trial_end.strftime('%d.%m.%Y')})"

    return {
        "telegram": tg_response,
        "profile": {
            "gender": translate_gender(db_user.get("gender")),
            "age": age_str,
            "height": height_str,
            "weight": weight_str,
            "caloriesPerDay": calories_str,
            "subscription": subscription_str
        }
    }