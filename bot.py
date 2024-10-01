import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
from telebot import types
import psycopg2 

# Токен бота (отримай його у BotFather)
TOKEN = '7024273953:AAGDkJM5Yl_Yus2vwyTFbqGhK4PqsFHM3_A'  # Замініть на свій реальний токен

# Ініціалізуємо бота
bot = telebot.TeleBot(TOKEN)

# Підключення до бази даних PostgreSQL
connection = psycopg2.connect(
    user='default',
    host='ep-mute-cake-a4wta3k0-pooler.us-east-1.aws.neon.tech',
    database='verceldb',
    password='ad0U6MnWmZvH',
    port=5432,
    sslmode='require'
)
cursor = connection.cursor()

# Обробник для команди /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    # Перевірка на реферальний код
    if len(message.text.split()) > 1:
        ref_code = message.text.split()[1]
        bot.send_message(message.chat.id, f"Referral code detected: {ref_code}")
        handle_referral_code(message.chat.id, ref_code)
    else:
        bot.send_message(message.chat.id, "Welcome to the bot!")

def handle_referral_code(invited_user_id, ref_code):
    """
    Обробка реферального коду: додаємо поінти рефереру та новому користувачу
    """
    try:
        # Перевіряємо реферальний код
        cursor.execute("SELECT telegram_id, points, friends FROM users WHERE referral_code = %s", (ref_code,))
        referrer = cursor.fetchone()

        if referrer:
            referrer_id, referrer_points, referrer_friends = referrer

            # Оновлюємо поінти та кількість друзів у реферера
            cursor.execute(
                "UPDATE users SET points = %s, friends = %s WHERE telegram_id = %s",
                (referrer_points + 10, referrer_friends + 1, referrer_id)
            )
            connection.commit()

            # Оновлюємо поінти у нового користувача та записуємо реферера
            cursor.execute("SELECT points FROM users WHERE telegram_id = %s", (invited_user_id,))
            invited_user_points = cursor.fetchone()[0] + 10
            cursor.execute(
                "UPDATE users SET points = %s, referred_by = %s WHERE telegram_id = %s",
                (invited_user_points, referrer_id, invited_user_id)
            )
            connection.commit()

            bot.send_message(referrer_id, "You've earned +10 points for inviting a new friend!")
            bot.send_message(invited_user_id, "You've earned +10 points for joining via a referral code!")
        else:
            bot.send_message(invited_user_id, "Invalid referral code.")
    
    except Exception as e:
        bot.send_message(invited_user_id, "Error occurred while processing your referral.")
        print(f"Error: {e}")

bot.polling()