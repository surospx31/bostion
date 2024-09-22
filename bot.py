import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
from telebot import types

# Токен бота (отримай його у BotFather)
TOKEN = '7024273953:AAGDkJM5Yl_Yus2vwyTFbqGhK4PqsFHM3_A'  # Замініть на свій реальний токен

# Ініціалізуємо бота
bot = telebot.TeleBot(TOKEN)

# Обробник для команди /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    # Текст повідомлення
    text = "Hi, wanna play?"
    
    # Створюємо клавіатуру з посиланням на Mini Web App
    markup = types.InlineKeyboardMarkup()
    web_app = types.WebAppInfo("https://bostion-surospx31s-projects.vercel.app/")  # Посилання на mini web app
    button = types.InlineKeyboardButton("Wellact app", web_app=web_app)
    markup.add(button)
    
    # Відправляємо зображення та повідомлення
    with open('welcome.jpg', 'rb') as photo:  # Заміни на реальний шлях до зображення
        bot.send_photo(message.chat.id, photo, caption=text, reply_markup=markup)

# Запускаємо бота
bot.polling()
