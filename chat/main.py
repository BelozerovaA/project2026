import asyncio
import logging
import re
from datetime import datetime, date
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove, WebAppInfo

from config import settings
from db import db

bot = Bot(token=settings.bot_token)
dp = Dispatcher()

GENDER_MAP_DB = {
    "Мужчина 👨": "male",
    "Женщина 👩": "female"
}

GOAL_MAP_DB = {
    "Похудеть": 1,
    "Набрать массу": 2,
    "Поддерживать форму": 3
}

ACTIVITY_MAP_DB = {
    "Минимальная": 1,
    "Низкая": 2,
    "Средняя": 3,
    "Высокая": 4,
    "Очень высокая": 5
}

SUBSCRIPTION_MAP = {
    "1 месяц": {"sub_period_ID": 1, "days": 30},
    "3 месяца": {"sub_period_ID": 2, "days": 90},
    "1 год": {"sub_period_ID": 3, "days": 365}
}

class Survey(StatesGroup):
    waiting_for_start = State()
    waiting_for_gender = State()
    waiting_for_birthdate = State()
    waiting_for_height = State()
    waiting_for_weight = State()
    waiting_for_activity = State()
    waiting_for_goal = State()
    choosing_subscription = State()
    confirm_payment = State()

def get_start_keyboard():
    kb = [[KeyboardButton(text="Начать 🏃‍♀️")]]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)

def get_gender_keyboard():
    kb = [[KeyboardButton(text="Мужчина 👨"), KeyboardButton(text="Женщина 👩")]]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)

def get_activity_keyboard():
    kb = [
        [KeyboardButton(text="Минимальная"), KeyboardButton(text="Низкая")],
        [KeyboardButton(text="Средняя"), KeyboardButton(text="Высокая")],
        [KeyboardButton(text="Очень высокая")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)

def get_goal_keyboard():
    kb = [
        [KeyboardButton(text="Похудеть"), KeyboardButton(text="Набрать массу")],
        [KeyboardButton(text="Поддерживать форму")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)

def get_main_menu():
    kb = [
        [KeyboardButton(text="Продлить/купить подписку")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)

def get_subscription_keyboard():
    kb = [
        [KeyboardButton(text="1 месяц")],
        [KeyboardButton(text="3 месяца")],
        [KeyboardButton(text="1 год")],
        [KeyboardButton(text="❌ Назад")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)

def get_confirm_keyboard():
    kb = [[KeyboardButton(text="Да"), KeyboardButton(text="Нет")]]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)

@dp.message(CommandStart())
async def cmd_start(message: types.Message, state: FSMContext):
    await state.clear()
    user_id = str(message.from_user.id)

    existing_user = await db.get_user(user_id)

    if existing_user:
        from datetime import date
        today = date.today()
        active_sub = await db.get_active_subscription(user_id)

        if active_sub and active_sub['end_date'] >= today:
            subscription_status = (
                f"💎 Платная подписка активна до {active_sub['end_date'].strftime('%d.%m.%Y')}.\n"
                f"Тариф: {active_sub['period_name']}"
            )
        else:
            trial_end = existing_user.get('trial_period_end')
            trial_flag = existing_user.get('trial_period_user_flag')

            if trial_flag == 1 and trial_end and trial_end >= today:
                subscription_status = (
                    f"🎁 Пробная подписка активна до {trial_end.strftime('%d.%m.%Y')}.\n"
                    f"У вас есть полный доступ ко всем функциям!"
                )
            elif trial_flag == 1 and trial_end and trial_end < today:
                subscription_status = (
                    f"⚠️ Пробная подписка истекла {trial_end.strftime('%d.%m.%Y')}.\n"
                    f"Оформите платную подписку для продолжения работы."
                )
            else:
                subscription_status = "❌ У вас нет активной подписки."

        await message.answer(
            f"С возвращением! 👋\n\n"
            f"Я помню тебя! Твои данные уже сохранены в системе.\n\n"
            f"{subscription_status}\n\n"
            f"Можешь сразу перейти к приложению или оформить подписку.",
            reply_markup=get_main_menu()
        )
    else:
        await message.answer(
            "Привет! Я твой персональный фитнес-помощник 💪.\n"
            "Чтобы я мог составить идеальную программу тренировок и план питания, "
            "мне нужно немного узнать о тебе. Это займет всего 1 минуту.",
            reply_markup=get_start_keyboard()
        )
        await state.set_state(Survey.waiting_for_start)

@dp.message(Survey.waiting_for_start, F.text == "Начать 🏃‍♀️")
async def process_start(message: types.Message, state: FSMContext):
    await message.answer(
        "Отлично! Для начала, кто ты? 🧍‍♂️🧍‍♀️",
        reply_markup=get_gender_keyboard()
    )
    await state.set_state(Survey.waiting_for_gender)

@dp.message(Survey.waiting_for_gender, F.text.in_(GENDER_MAP_DB.keys()))
async def process_gender(message: types.Message, state: FSMContext):
    clean_gender = GENDER_MAP_DB[message.text]
    await state.update_data(gender=clean_gender)

    await message.answer(
        "Принято! 🎯\n"
        "Теперь введите дату рождения в формате ДД.ММ.ГГГГ (например: 15.05.1995)",
        reply_markup=ReplyKeyboardRemove()
    )
    await state.set_state(Survey.waiting_for_birthdate)


@dp.message(Survey.waiting_for_gender)
async def invalid_gender(message: types.Message):
    await message.answer(
        "⚠️ Пожалуйста, выберите пол из кнопок ниже:",
        reply_markup=get_gender_keyboard()
    )

@dp.message(Survey.waiting_for_birthdate)
async def process_birthdate(message: types.Message, state: FSMContext):
    date_text = message.text.strip()
    if not re.match(r"^\d{2}\.\d{2}\.\d{4}$", date_text):
        await message.answer("❌ Неверный формат. Используйте ДД.ММ.ГГГГ (например: 15.05.1995)")
        return

    try:
        birth_date = datetime.strptime(date_text, "%d.%m.%Y")
    except ValueError:
        await message.answer("❌ Такой даты не существует. Проверьте ввод.")
        return

    today = datetime.now()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

    if age < 16 or age > 100:
        await message.answer(f"❌ К сожалению, возраст {age} не подходит нашему боту 😓\n"
                             "Вам должно быть 16 лет и выше.")
        return

    await state.update_data(birthdate=birth_date, age=age)
    await message.answer("Супер! 🎂 Какой у тебя рост в сантиметрах? (например: 175)")
    await state.set_state(Survey.waiting_for_height)

@dp.message(Survey.waiting_for_height)
async def process_height(message: types.Message, state: FSMContext):
    text = message.text.strip()

    if not text.isdigit() or len(text) > 3:
        await message.answer("❌ Введите число от 140 до 250 (максимум 3 цифры, например: 175)")
        return
    height = int(text)
    if height < 140 or height > 250:
        await message.answer("❌ Рост должен быть от 140 до 250 см. Попробуйте ещё раз.")
        return

    await state.update_data(height=height)
    await message.answer("А текущий вес в килограммах? (например: 70.5, максимум 2 знака после запятой) 🤸‍♀️")
    await state.set_state(Survey.waiting_for_weight)

@dp.message(Survey.waiting_for_weight)
async def process_weight(message: types.Message, state: FSMContext):
    text = message.text.strip().replace(',', '.')

    if not re.match(r"^\d+(\.\d{1,2})?$", text):
        await message.answer("❌ Введите число с максимум 2 знаками после запятой (например: 70.5 или 70,55)")
        return
    weight = float(text)
    if weight < 35 or weight > 300:
        await message.answer("❌ Вес должен быть от 35 до 300 кг. Попробуйте ещё раз.")
        return

    await state.update_data(weight=weight)

    activity_description = (
        "Почти готово! 🏃 Как бы ты описал свою обычную активность?\n\n"
        "🛀 Минимальная — сидячая работа, отсутствие спорта, редкие прогулки.\n"
        "🚶 Низкая — лёгкие тренировки 1–3 раза в неделю или работа «на ногах».\n"
        "🚴 Средняя — занятия спортом 3–5 раз в неделю или физический труд.\n"
        "🚵 Высокая — интенсивные тренировки 6–7 раз в неделю или тяжёлая физическая работа.\n"
        "🏋 Очень высокая — профессиональный спорт, экстремальные нагрузки."
    )
    await message.answer(activity_description, reply_markup=get_activity_keyboard())
    await state.set_state(Survey.waiting_for_activity)

@dp.message(Survey.waiting_for_activity, F.text.in_(ACTIVITY_MAP_DB.keys()))
async def process_activity(message: types.Message, state: FSMContext):
    await state.update_data(coefficient_ID=ACTIVITY_MAP_DB[message.text])
    await message.answer(
        "И последний вопрос. 🎯 Какова твоя главная цель сейчас?",
        reply_markup=get_goal_keyboard()
    )
    await state.set_state(Survey.waiting_for_goal)

@dp.message(Survey.waiting_for_activity)
async def invalid_activity(message: types.Message):
    await message.answer(
        "⚠️ Пожалуйста, выберите уровень активности из кнопок:",
        reply_markup=get_activity_keyboard()
    )

@dp.message(Survey.waiting_for_goal, F.text.in_(GOAL_MAP_DB.keys()))
async def process_goal(message: types.Message, state: FSMContext):
    goal_text = message.text
    data = await state.get_data()
    data['goal_ID'] = GOAL_MAP_DB[goal_text]

    user_id = str(message.from_user.id)
    await db.add_user(user_id, data)

    from datetime import date, timedelta
    trial_end = date.today() + timedelta(days=30)

    await message.answer(
        f"✅ Всё готово! Я сохранил твои данные.\n\n"
        f"🎁 Вам выдана пробная подписка на 30 дней!\n"
        f"📅 Действует до: {trial_end.strftime('%d.%m.%Y')}\n\n"
        f"Откройте мини-приложение для дальнейшей работы или оформите подписку, "
        f"чтобы использовать бот после окончания пробного периода 😉",
        reply_markup=get_main_menu()
    )
    await state.clear()

@dp.message(Survey.waiting_for_goal)
async def invalid_goal(message: types.Message):
    await message.answer(
        "⚠️ Пожалуйста, выберите цель из кнопок ниже:",
        reply_markup=get_goal_keyboard()
    )

@dp.message(F.text == "Продлить/купить подписку")
async def subscription_menu(message: types.Message, state: FSMContext):
    user_id = str(message.from_user.id)
    active_sub = await db.get_active_subscription(user_id)

    if active_sub:
        end_date = active_sub['end_date'].strftime('%d.%m.%Y')
        await message.answer(
            f"📋 Ваша текущая подписка: {active_sub['period_name']}\n"
            f"📅 Действует до: {end_date}\n\n"
            "Выберите срок новой подписки:",
            reply_markup=get_subscription_keyboard()
        )
    else:
        await message.answer(
            "Выберите срок подписки:",
            reply_markup=get_subscription_keyboard()
        )

    await state.set_state(Survey.choosing_subscription)

@dp.message(Survey.choosing_subscription, F.text == "❌ Назад")
async def subscription_back(message: types.Message, state: FSMContext):
    await message.answer(
        "Возвращаемся в главное меню 😎",
        reply_markup=get_main_menu()
    )
    await state.clear()

@dp.message(Survey.choosing_subscription, F.text.in_(SUBSCRIPTION_MAP.keys()))
async def choose_plan(message: types.Message, state: FSMContext):
    plan_text = message.text
    plan_info = SUBSCRIPTION_MAP[plan_text]

    await state.update_data(
        plan=plan_text,
        sub_period_ID=plan_info['sub_period_ID'],
        days=plan_info['days']
    )

    await message.answer(
        f"Вы выбрали подписку {plan_text}.\n"
        f"Проводим оплату?",
        reply_markup=get_confirm_keyboard()
    )
    await state.set_state(Survey.confirm_payment)

@dp.message(Survey.confirm_payment, F.text == "Да")
async def confirm_yes(message: types.Message, state: FSMContext):
    data = await state.get_data()
    user_id = str(message.from_user.id)

    sub_info = await db.create_or_extend_subscription(
        user_id=user_id,
        sub_period_id=data['sub_period_ID'],
        days=data['days']
    )

    end_date = sub_info['end_date'].strftime('%d.%m.%Y')

    if sub_info['action'] == 'extended':
        status_text = f"✅ Подписка продлена!\n"
    else:
        status_text = f"✅ Подписка оформлена!\n"

    await message.answer(
        f"{status_text}\n"
        f"📋 Тариф: {sub_info['period_name']}\n"
        f"📅 Действует до: {end_date}\n\n"
        f"Спасибо за покупку! 🎉",
        reply_markup=get_main_menu()
    )
    await state.clear()

@dp.message(Survey.confirm_payment, F.text == "Нет")
async def confirm_no(message: types.Message, state: FSMContext):
    await message.answer(
        "Покупка отменена. Возвращаемся в главное меню 😢",
        reply_markup=get_main_menu()
    )
    await state.clear()

@dp.message(Survey.confirm_payment, F.text == "Нет")
async def confirm_no(message: types.Message, state: FSMContext):
    await message.answer(
        "Выберите срок подписки:",
        reply_markup=get_subscription_keyboard()
    )
    await state.set_state(Survey.choosing_subscription)

async def main():
    await db.create_pool()
    logging.info("✅ БД подключена")
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    asyncio.run(main())