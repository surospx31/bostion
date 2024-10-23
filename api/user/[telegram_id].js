const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json()); // Підтримка JSON

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
    const name = req.params.name;


    if (!telegramId) {
        return res.status(400).json({ error: "telegram_id не отримано" });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);

        if (result.rows.length) {
            const user = result.rows[0];

            // Отримуємо нікнейми друзів
            const friendsResult = await pool.query('SELECT name FROM users WHERE referred_by = $1', [user.referral_code]);
            const friends = friendsResult.rows.map(friend => friend.name);  // Отримуємо імена друзів
            
            res.json({ ...user, friends });
        } else {
            const newUser = {
                telegram_id: telegramId,
                name: name,
                has_butterfly: false,
                level: 1,
                points: 0,
                referral_code: null,
                referred_by: null,
                friends: 0,
                wallet_address: null,
                claimedbutterfly: false,
                friendNames: [],
            };

            await pool.query(
                `INSERT INTO users (telegram_id, name, has_butterfly, level, points, referral_code, referred_by, friends, wallet_address, claimedbutterfly) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [telegramId, newUser.name, newUser.has_butterfly, newUser.level, newUser.points, newUser.referral_code, newUser.referred_by, newUser.friends, newUser.wallet_address, newUser.claimedbutterfly]
            );

            res.json(newUser);
        }
    } catch (err) {
        console.error('Помилка бази даних:', err);
        res.status(500).json({ error: 'Помилка бази даних', details: err.message });
    }
});


// Маршрут для оновлення даних користувача з урахуванням реферального коду
app.post('/api/user/:telegram_id', async (req, res) => {
    const telegramId = req.params.telegram_id;
    const {
        name, has_butterfly, level, points, referral_code,
        referred_by, friends, wallet_address, claimedbutterfly
    } = req.body;

    console.log('Referred by:', referred_by); // Логування для перевірки реферального коду

    if (!telegramId) {
        return res.status(400).json({ error: "telegram_id не отримано" });
    }

    try {
        // Отримуємо поточні дані користувача
        const currentUser = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
        const currentReferredBy = currentUser.rows[0]?.referred_by;

        // Визначаємо, чи є новий реферальний код
        const finalReferredBy = referred_by || currentReferredBy;

        // Оновлюємо дані користувача
        await pool.query(
            `UPDATE users
             SET name = $2, has_butterfly = $3, level = $4, points = $5, referral_code = $6, referred_by = $7, friends = $8, wallet_address = $9, claimedbutterfly = $10
             WHERE telegram_id = $1`,
            [telegramId, name, has_butterfly, level, points, referral_code, finalReferredBy, friends, wallet_address, claimedbutterfly]
        );

        // Якщо користувач зареєструвався за реферальним кодом, збільшуємо кількість друзів у реферера
        if (referred_by) {
            const referrer = await pool.query('SELECT * FROM users WHERE referral_code = $1', [referred_by]);
            if (referrer.rows.length > 0) {
                const referrerId = referrer.rows[0].telegram_id;
        
                // Перевіряємо, чи новий користувач не є "null"
                if (telegramId !== null) {
                    // Оновлюємо кількість друзів: додаємо 1 і ділимо на 2
                    await pool.query(
                        `UPDATE users
                         SET friends = friends + 1
                         WHERE telegram_id = $1`,
                        [referrerId]
                    );
                    console.log(`Кількість друзів для користувача з telegram_id ${referrerId} збільшено та поділено на 2`);
                } else {
                    console.log('Новий користувач має telegram_id null, кількість друзів не змінюється');
                }
            }
        }
        

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
