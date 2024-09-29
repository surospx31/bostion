import { Pool } from 'pg';

// Налаштування для підключення до PostgreSQL
const pool = new Pool({
  user: 'default', // Твій користувач бази даних
  host: 'ep-mute-cake-a4wta3k0-pooler.us-east-1.aws.neon.tech', // Хост бази даних
  database: 'verceldb', // Назва бази даних
  password: 'ad0U6MnWmZvH', // Пароль
  port: 5432, // Порт
  ssl: {
    rejectUnauthorized: false // Для SSL-з'єднання
  }
});

export default async function handler(req, res) {
  const { telegram_id } = req.query;

  if (req.method === 'GET') {
    // Обробка GET-запиту для отримання даних користувача
    try {
      const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegram_id]);

      if (result.rows.length) {
        res.json(result.rows[0]); // Повертаємо знайденого користувача
      } else {
        // Якщо користувача немає, реєструємо нового
        const newUser = {
          telegram_id: telegram_id,
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

        // Збереження нового користувача в базу
        await pool.query(
          `INSERT INTO users (telegram_id, name, has_butterfly, level, points, referral_code, referred_by, friends, wallet_address, claimedbutterfly) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [telegram_id, newUser.name, newUser.has_butterfly, newUser.level, newUser.points, newUser.referral_code, newUser.referred_by, newUser.friends, newUser.wallet_address, newUser.claimedbutterfly]
        );

        // Повертаємо новоствореного користувача
        res.json(newUser);
      }
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error', details: err.message });
    }

  } else if (req.method === 'POST') {
    // Обробка POST-запиту для оновлення даних користувача
    const {
      name, has_butterfly, level, points, referral_code,
      referred_by, friends, wallet_address, claimedbutterfly
    } = req.body;

    try {
      // Оновлюємо дані користувача в базі
      await pool.query(
        `UPDATE users
         SET name = $2, has_butterfly = $3, level = $4, points = $5, referral_code = $6, referred_by = $7, friends = $8, wallet_address = $9, claimedbutterfly = $10
         WHERE telegram_id = $1`,
        [telegram_id, name, has_butterfly, level, points, referral_code, referred_by, friends, wallet_address, claimedbutterfly]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
