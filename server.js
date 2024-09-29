const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// Налаштовуємо підключення до бази даних PostgreSQL
const pool = new Pool({
    user: 'default',
    host: 'ep-mute-cake-a4wta3k0-pooler.us-east-1.aws.neon.tech',
    database: 'verceldb',
    password: 'ad0U6MnWmZvH',
    port: 5432,
    ssl: {
        rejectUnauthorized: false // Дозволяє незахищене підключення через SSL
    }
});

// Отримання даних користувача
app.get('/api/user/:telegram_id', async (req, res) => {
    const telegramId = req.params.telegram_id;
    try {
        const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.json({
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
            }); // Якщо дані не знайдено, повертаємо дефолтні значення
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Оновлення даних користувача
app.post('/api/user/:telegram_id', async (req, res) => {
    const telegramId = req.params.telegram_id;
    const {
        name, has_butterfly, level, points, referral_code,
        referred_by, friends, wallet_address, claimedbutterfly
    } = req.body;

    try {
        await pool.query(
            `INSERT INTO users 
            (telegram_id, name, has_butterfly, level, points, referral_code, referred_by, friends, wallet_address, claimedbutterfly) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (telegram_id) DO UPDATE 
            SET name = $2, has_butterfly = $3, level = $4, points = $5, referral_code = $6, referred_by = $7, friends = $8, wallet_address = $9, claimedbutterfly = $10`,
            [telegramId, name, has_butterfly, level, points, referral_code, referred_by, friends, wallet_address, claimedbutterfly]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
