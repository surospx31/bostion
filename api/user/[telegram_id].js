const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json()); // Додаємо підтримку JSON в запитах

// Підключення до бази даних PostgreSQL
const pool = new Pool({
    user: 'default', 
    host: 'ep-mute-cake-a4wta3k0-pooler.us-east-1.aws.neon.tech', 
    database: 'verceldb', 
    password: 'ad0U6MnWmZvH', 
    port: 5432, 
    ssl: {
        rejectUnauthorized: false 
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
                name: 'Username',
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

    console.log('Referred by:', referred_by); // Додаємо логування

    if (!telegramId) {
        return res.status(400).json({ error: "telegram_id не отримано" });
    }

    try {
        // Отримуємо поточне значення referred_by з бази
        const currentUser = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
        const currentReferredBy = currentUser.rows[0].referred_by;

        // Якщо referred_by не передано, зберігаємо поточне значення
        const finalReferredBy = referred_by || currentReferredBy;

        await pool.query(
            `UPDATE users
             SET name = $2, has_butterfly = $3, level = $4, points = $5, referral_code = $6, referred_by = $7, friends = $8, wallet_address = $9, claimedbutterfly = $10
             WHERE telegram_id = $1`,
            [telegramId, name, has_butterfly, level, points, referral_code, finalReferredBy, friends, wallet_address, claimedbutterfly]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

