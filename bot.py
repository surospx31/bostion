import telebot
from telebot import types

# Токен бота
TOKEN = '6540307506:AAFlc4_ZMwmKScwO8mRaJrs38d-Dm3gB_d0'

# Ініціалізація бота
bot = telebot.TeleBot(TOKEN)

# Обробник для команди /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    # Відправляємо фото з текстом
    photo = open('welcome.jpg', 'rb')
    markup = types.InlineKeyboardMarkup()
    web_app = types.WebAppInfo("https://www.wellactcodepages.xyz/")
    button = types.InlineKeyboardButton("🦋Get Butterfly", web_app=web_app)
    markup.add(button)

    bot.send_photo(message.chat.id, photo, caption="Hi! Wanna boost your butterfly?💍", reply_markup=markup)
    photo.close()

# Запуск бота
bot.polling()

