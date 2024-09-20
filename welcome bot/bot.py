import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telebot import types
import os

# Токен бота
TOKEN ='7024273953:AAGDkJM5Yl_Yus2vwyTFbqGhK4PqsFHM3_A'  # Замініть на свій реальний токен

# Ініціалізуємо бота
bot = telebot.TeleBot(TOKEN)

# Отримуємо абсолютний шлях до файлу зображення
photo_path = os.path.join(os.path.dirname(__file__), 'welcome.jpg')

# Обробник для команди /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    # Текст повідомлення
    text = "Hi, wanna play?"

    # Створюємо клавіатуру з посиланням на Mini Web App
    markup = types.InlineKeyboardMarkup()
    web_app_url = "https://surospx31.github.io/bostion/"  # Посилання на mini web app
    web_app = types.WebAppInfo(web_app_url)  # Створюємо об'єкт WebAppInfo
    button = types.InlineKeyboardButton("Wellact app", web_app=web_app)
    markup.add(button)

    # Відправляємо зображення та повідомлення
    try:
        with open(photo_path, 'rb') as photo:
            bot.send_photo(message.chat.id, photo, caption=text, reply_markup=markup)
    except FileNotFoundError:
        bot.send_message(message.chat.id, text, reply_markup=markup)
        print(f"Зображення не знайдено за шляхом: {photo_path}. Переконайтесь, що файл існує.")

# Запускаємо бота
bot.polling()
