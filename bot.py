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
    # Перевіряємо, чи є реферальний код у повідомленні
    if len(message.text.split()) > 1:
        ref_code = message.text.split()[1].replace("startapp=", "")  # Отримуємо реферальний код
        bot.send_message(message.chat.id, f"Referral code detected: {ref_code}")
        handle_referral_code(message.chat.id, ref_code)
    else:
        bot.send_message(message.chat.id, "Welcome to the bot!")

    # Виводимо повідомлення з веб-апп кнопкою
    markup = types.InlineKeyboardMarkup()
    web_app = types.WebAppInfo("https://bostion-surospx31s-projects.vercel.app/")  # URL mini web app
    button = types.InlineKeyboardButton("Open Web App", web_app=web_app)
    markup.add(button)
    bot.send_message(message.chat.id, "Click to open the app", reply_markup=markup)

def handle_referral_code(invited_user_id, ref_code):
    """
    Опрацювання реферального коду:
    - Додаємо поінти рефереру та запрошеному
    - Оновлюємо кількість друзів у реферера
    """
    try:
        # Перевіряємо, чи є такий реферальний код у базі даних
        cursor.execute("SELECT telegram_id, points, friends FROM users WHERE referral_code = %s", (ref_code,))
        referrer = cursor.fetchone()

        if referrer:
            referrer_id, referrer_points, referrer_friends = referrer

            # Додаємо +10 поінтів тому, хто запросив
            updated_referrer_points = referrer_points + 10
            updated_referrer_friends = referrer_friends + 1
            cursor.execute(
                "UPDATE users SET points = %s, friends = %s WHERE telegram_id = %s",
                (updated_referrer_points, updated_referrer_friends, referrer_id)
            )
            connection.commit()

            # Додаємо +10 поінтів новому користувачу та зберігаємо, хто його запросив
            cursor.execute("SELECT points FROM users WHERE telegram_id = %s", (invited_user_id,))
            invited_user_points = cursor.fetchone()[0] + 10
            cursor.execute(
                "UPDATE users SET points = %s, referred_by = %s WHERE telegram_id = %s",
                (invited_user_points, referrer_id, invited_user_id)
            )
            connection.commit()

            # Повідомляємо про реферальні поінти
            bot.send_message(referrer_id, f"You've earned +10 points for inviting a new friend!")
            bot.send_message(invited_user_id, f"You've joined with a referral code and earned +10 points!")
        else:
            bot.send_message(invited_user_id, "Invalid referral code. Please try again.")
    
    except Exception as e:
        bot.send_message(invited_user_id, "An error occurred while processing your referral code.")
        print(f"Error: {e}")

# Запускаємо бота
bot.polling()