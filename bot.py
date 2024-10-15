import telebot
from telebot import types
# Токен бота
TOKEN = '6540307506:AAFlc4_ZMwmKScwO8mRaJrs38d-Dm3gB_d0'
# Ініціалізація бота
bot = telebot.TeleBot(TOKEN)
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
bot.polling()