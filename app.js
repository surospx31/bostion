document.addEventListener('DOMContentLoaded', () => {
    let userId = null;
    let name = 'Username';
    let hasButterfly = false;
    let points = 0;
    let level = 1;
    let walletAddress = "";
    let referralCode = ""; // Ініціалізуємо реферальний код
    let claimedButterfly = false;

    const levels = [0, 50, 500, 1000, 5000]; // Кількість поінтів для кожного рівня

    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            userId = tg.initDataUnsafe.user.id;
            name = tg.initDataUnsafe.user.first_name || tg.initDataUnsafe.user.username || 'Username';
        } else {
            console.error("Telegram WebApp не повертає дані користувача");
        }

        const userNicknameElement = document.getElementById('userNickname');
        userNicknameElement.textContent = name;
    }

    if (!userId) {
        console.error('Не вдалося отримати telegram_id користувача');
        return;
    }

    document.addEventListener('touchmove', function(event) {
        event.preventDefault();
    }, { passive: false });

    const getButterflyButton = document.getElementById('getButterflyButton');
    const welcomeSection = document.getElementById('welcome');
    const butterflySection = document.getElementById('butterflySection');
    const friendsButton = document.getElementById('friendsButton');
    const referralLinkElement = document.getElementById('referralLink');
    const progressElement = document.getElementById('progress');
    const levelElement = document.getElementById('level');
    const currentPointsElement = document.getElementById('currentPoints');
    const pointsForNextLevelElement = document.getElementById('pointsForNextLevel');

    // Завантаження даних користувача при завантаженні сторінки
    async function loadUserData() {
        try {
            const response = await fetch(`/api/user/${userId}`);
            const data = await response.json();

            // Оновлюємо змінні з отриманими даними
            points = data.points;
            level = data.level;
            name = data.name || name;
            hasButterfly = data.has_butterfly;
            referralCode = data.referral_code || generateReferralCode(); // Генеруємо, якщо немає
            walletAddress = data.wallet_address;
            claimedButterfly = data.claimedbutterfly;

            // Якщо реферального коду немає, зберігаємо його в базу
            if (!data.referral_code) {
                await saveReferralCode(referralCode);
            }

            // Перевірка наявності метелика
            if (hasButterfly) {
                // Якщо метелик вже отриманий, одразу переходимо до основного екрану
                welcomeSection.style.display = 'none';
                butterflySection.style.display = 'block';
            } else {
                // Якщо метелик ще не отриманий, показуємо кнопку GET
                welcomeSection.style.display = 'block';
                butterflySection.style.display = 'none';
            }

            updateUI(); // Оновлюємо інтерфейс після завантаження даних
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Функція для збереження реферального коду в базу даних
    async function saveReferralCode(referralCode) {
        try {
            await fetch(`/api/user/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    referral_code: referralCode,
                }),
            });
            console.log('Реферальний код успішно збережено:', referralCode);
        } catch (error) {
            console.error('Error saving referral code:', error);
        }
    }

    // Функція для генерації унікального реферального коду
    function generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Символи для коду
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    function updateUI() {
        currentPointsElement.textContent = points;
        levelElement.textContent = level;

        let pointsForNextLevel = calculatePointsForNextLevel(level);
        pointsForNextLevelElement.textContent = pointsForNextLevel;
        updateProgress(pointsForNextLevel);
    }

    // Оновлення прогресу
    function updateProgress(pointsForNextLevel) {
        let progress = (points / pointsForNextLevel) * 100 + '%';
        progressElement.style.width = progress;
    }

    friendsButton.addEventListener('click', () => {
        generateReferralLink(); // Створення посилання при відкритті вкладки Friends
    });

    function generateReferralLink() {
        const telegramBotLink = `https://t.me/devionsxtest_bot?ref=${referralCode}`; // Формуємо посилання
        referralLinkElement.textContent = telegramBotLink; // Виводимо посилання на сторінку
    }

    loadUserData(); // Завантажуємо дані при старті
});
