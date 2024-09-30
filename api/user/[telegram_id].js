const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json()); // Додаємо підтримку JSON в запитах

// Підключення до бази даних PostgreSQL
const pool = new Pool({
    user: 'default', // Замінити на твій користувацький обліковий запис
    host: 'ep-mute-cake-a4wta3k0-pooler.us-east-1.aws.neon.tech', // Хост бази даних
    database: 'verceldb', // Назва бази даних
    password: 'ad0U6MnWmZvH', // Пароль
    port: 5432, // Порт
    ssl: {
        rejectUnauthorized: false // Для підключення через SSL
    }
});

// Маршрут для отримання даних користувача або створення нового, якщо його немає
app.get('/api/user/:telegram_id', async (req, res) => {
    const telegramId = req.params.telegram_id;

    if (!telegramId) {
        return res.status(400).json({ error: "telegram_id не отримано" });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);

        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            const newUser = {
                telegram_id: telegramId,
                name: 'Username', // Заміни на дефолтне значення
                has_butterfly: false,
                level: 1,
                points: 0,
                referral_code: null,
                referred_by: null,
                friends: 0,
                wallet_address: null,
                claimedbutterfly: false,
            };

            await pool.query(
                `INSERT INTO users (telegram_id, name, has_butterfly, level, points, referral_code, referred_by, friends, wallet_address, claimedbutterfly) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [telegramId, newUser.name, newUser.has_butterfly, newUser.level, newUser.points, newUser.referral_code, newUser.referred_by, newUser.friends, newUser.wallet_address, newUser.claimedbutterfly]
            );

            res.json(newUser);
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// Маршрут для оновлення даних користувача
app.post('/api/user/:telegram_id', async (req, res) => {
    const telegramId = req.params.telegram_id;
    const {
        name, has_butterfly, level, points, referral_code,
        referred_by, friends, wallet_address, claimedbutterfly
    } = req.body;

    if (!telegramId) {
        return res.status(400).json({ error: "telegram_id не отримано" });
    }

    try {
        await pool.query(
            `UPDATE users
             SET name = $2, has_butterfly = $3, level = $4, points = $5, referral_code = $6, referred_by = $7, friends = $8, wallet_address = $9, claimedbutterfly = $10
             WHERE telegram_id = $1`,
            [telegramId, name, has_butterfly, level, points, referral_code, referred_by, friends, wallet_address, claimedbutterfly]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// Маршрут для перевірки унікальності реферального коду
app.get('/api/check-referral/:referral_code', async (req, res) => {
    const referralCode = req.params.referral_code;

    try {
        const result = await pool.query('SELECT referral_code FROM users WHERE referral_code = $1', [referralCode]);
        
        if (result.rows.length > 0) {
            res.json({ isUnique: false }); // Код не унікальний
        } else {
            res.json({ isUnique: true }); // Код унікальний
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
