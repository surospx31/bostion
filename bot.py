import telebot
from telebot import types
import psycopg2
import time
# Токен бота
TOKEN = '6540307506:AAFlc4_ZMwmKScwO8mRaJrs38d-Dm3gB_d0'

# Ініціалізація бота
bot = telebot.TeleBot(TOKEN)

# Підключення до бази даних PostgreSQL
connection = psycopg2.connect(
    user='default',
    host='ep-mute-cake-a4wta3k0-pooler.us-east-1.aws.neon.tech',
    database='verceldb',
    password='ad0U6MnWmZvH',
    port=5432,
    sslmode='prefer'
)
cursor = connection.cursor()

# Обробник для команди /start з обробкою реферальних кодів і кнопкою
@bot.message_handler(commands=['start'])
def send_welcome(message):
    # Перевірка на реферальний код
    if len(message.text.split()) > 1:
        ref_code = message.text.split()[1]
        bot.send_message(message.chat.id, f"Виявлено реферальний код: {ref_code}")
        handle_referral_code(message.chat.id, ref_code)
    else:
        bot.send_message(message.chat.id, "Ласкаво просимо до бота!")
    
    # Додаємо кнопку з посиланням на mini web app
    markup = types.InlineKeyboardMarkup()
    web_app = types.WebAppInfo("https://www.wellactcodepages.xyz/")  # URL mini web app
    button = types.InlineKeyboardButton("Відкрити додаток", web_app=web_app)
    markup.add(button)
    bot.send_message(message.chat.id, "Натисніть для відкриття додатку", reply_markup=markup)

# Функція для перевірки наявності користувача в базі та створення нового, якщо його немає
def ensure_user_exists(telegram_id, ref_code=None):
    cursor.execute("SELECT telegram_id FROM users WHERE telegram_id = %s", (str(telegram_id),))
    user = cursor.fetchone()

    if not user:
        # Створюємо нового користувача з базовими налаштуваннями
        cursor.execute(
            "INSERT INTO users (telegram_id, name, has_butterfly, level, points, referral_code, referred_by, friends, wallet_address, claimedbutterfly) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (str(telegram_id), 'Username', False, 1, 0, None, None, 0, None, False)
        )
        connection.commit()

# Функція для обробки реферального коду
def handle_referral_code(invited_user_id, ref_code):
    """
    Обробка реферального коду: додаємо поінти рефереру та новому користувачу
    """
    try:
        # Перевіряємо реферальний код та існування реферера
        cursor.execute("SELECT telegram_id, points, friends FROM users WHERE referral_code = %s", (ref_code,))
        referrer = cursor.fetchone()

        if referrer:
            referrer_id, referrer_points, referrer_friends = referrer

            # Оновлюємо поінти та кількість друзів у реферера
            cursor.execute(
                "UPDATE users SET points = %s, friends = %s WHERE telegram_id = %s",
                (referrer_points + 10, referrer_friends + 1, str(referrer_id))
            )
            connection.commit()

            # Перевіряємо, чи існує новий користувач у базі, і додаємо його
            ensure_user_exists(invited_user_id)

            # Оновлюємо поінти у нового користувача
            cursor.execute("SELECT points FROM users WHERE telegram_id = %s", (str(invited_user_id),))
            invited_user_points = cursor.fetchone()[0] + 10
            cursor.execute(
                "UPDATE users SET points = %s WHERE telegram_id = %s",
                (invited_user_points, str(invited_user_id))
            )
            connection.commit()

            # Надсилаємо повідомлення про успішне виконання
            bot.send_message(referrer_id, "Ви отримали +10 поінтів за запрошення нового друга!")
            bot.send_message(invited_user_id, "Ви отримали +10 поінтів за приєднання через реферальний код!")

            # Затримка 5 секунд перед оновленням поля referred_by
            time.sleep(5)

            # Оновлюємо поле referred_by у базі даних
            cursor.execute(
                "UPDATE users SET referred_by = %s WHERE telegram_id = %s",
                (ref_code, str(invited_user_id))
            )
            connection.commit()

        else:
            bot.send_message(invited_user_id, "Невірний реферальний код.")
    
    except Exception as e:
        bot.send_message(invited_user_id, "Сталася помилка при обробці реферального коду.")
        print(f"Error: {e}")

bot.polling()