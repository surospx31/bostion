const TelegramBot = require('node-telegram-bot-api');

// Токен бота
const TOKEN = '6540307506:AAFlc4_ZMwmKScwO8mRaJrs38d-Dm3gB_d0';

// Ініціалізація бота
const bot = new TelegramBot(TOKEN, { polling: true });

// Обробник для команди /start без реферального коду
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Привітальне повідомлення
    bot.sendMessage(chatId, "Ласкаво просимо до бота!");

    // Додаємо кнопку з посиланням на mini web app
    const webAppUrl = "https://www.wellactcodepages.xyz/";
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Відкрити додаток", web_app: { url: webAppUrl } }]
            ]
        }
    };
    bot.sendMessage(chatId, "Натисніть для відкриття додатку", opts);
});
