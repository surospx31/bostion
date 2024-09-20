from flask import Flask, render_template, redirect, url_for, session, request
import psycopg2
import random
import string

app = Flask(__name__)
app.secret_key = '500500500'  # Замінити на свій секретний ключ

# Налаштування підключення до бази даних PostgreSQL
DB_HOST = 'ep-mute-cake-a4wta3k0-pooler.us-east-1.aws.neon.tech'
DB_NAME = 'verceldb'
DB_USER = 'default'
DB_PASS = 'тad0U6MnWmZvH'

# Функція для підключення до бази даних
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    return conn

# Функція для генерації унікального реферального коду
def generate_referral_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Початкова сторінка
@app.route('/')
def index():
    if 'telegram_id' in session:
        user_data = get_user_data(session['telegram_id'])
        if user_data and user_data['has_butterfly']:
            return redirect(url_for('butterfly'))
    return render_template('index.html')

# Обробка кнопки "get"
@app.route('/get_butterfly')
def get_butterfly():
    if 'telegram_id' not in session:
        return redirect(url_for('index'))
    
    update_user_data(session['telegram_id'], {'has_butterfly': True})
    return redirect(url_for('butterfly'))

# Сторінка з метеликом
@app.route('/butterfly')
def butterfly():
    if 'telegram_id' not in session:
        return redirect(url_for('index'))
    
    user_data = get_user_data(session['telegram_id'])
    if not user_data or not user_data['has_butterfly']:
        return redirect(url_for('index'))
    
    return render_template('butterfly.html', user=user_data)

# Функція для отримання даних користувача з бази
def get_user_data(telegram_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE telegram_id = %s", (telegram_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if user:
        return {
            'id': user[0],
            'telegram_id': user[1],
            'name': user[2],
            'has_butterfly': user[3],
            'level': user[4],
            'points': user[5],
            'referral_code': user[6],
            'referred_by': user[7],
            'friends': user[8]
        }
    return None

# Функція для оновлення даних користувача в базі
def update_user_data(telegram_id, updates):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Формуємо SQL-запит для оновлення потрібних полів
    query = "UPDATE users SET "
    query += ", ".join([f"{key} = %s" for key in updates.keys()])
    query += " WHERE telegram_id = %s"
    
    values = list(updates.values())
    values.append(telegram_id)
    
    cursor.execute(query, tuple(values))
    conn.commit()
    cursor.close()
    conn.close()

# Функція для додавання нового користувача
@app.route('/register_user', methods=['POST'])
def register_user():
    telegram_id = request.form.get('telegram_id')
    name = request.form.get('name')
    referred_by = request.form.get('referred_by')  # Реферальний код, якщо користувач запрошений

    if not telegram_id or not name:
        return "Telegram ID and Name are required", 400

    # Генеруємо унікальний реферальний код
    referral_code = generate_referral_code()

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Вставляємо нового користувача
        cursor.execute("""
            INSERT INTO users (telegram_id, name, referral_code, referred_by) 
            VALUES (%s, %s, %s, %s) 
            ON CONFLICT (telegram_id) DO NOTHING
        """, (telegram_id, name, referral_code, referred_by))
        conn.commit()
    except Exception as e:
        print(f"Error inserting user: {e}")
        return "Error inserting user", 500
    finally:
        cursor.close()
        conn.close()
    
    session['telegram_id'] = telegram_id
    return redirect(url_for('index'))

# Оновлюємо кількість друзів, запрошених користувачем
def update_friends_count(referral_code):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET friends = friends + 1 WHERE referral_code = %s", (referral_code,))
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == '__main__':
    app.run(debug=True)
