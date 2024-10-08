document.addEventListener('DOMContentLoaded', () => {
    let userId = null;
    let name = 'Username';
    let hasButterfly = false;
    let points = 0;
    let level = 1;
    let walletAddress = "";
    let referralCode = "";
    let claimedButterfly = false;
    let referredBy = null; // Додаємо змінну для реферального коду

    const levels = [0, 50, 500, 1000, 5000]; // Кількість поінтів для кожного рівня

    // Отримуємо реферальний код із URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('startapp'); // Шукаємо параметр startapp
    console.log("Параметр startapp:", refCode); // Перевірка, чи правильно зчитано код

    
if (refCode) {
    referredBy = refCode; // Присвоюємо реферальний код змінній referred_by
    console.log(`Реферальний код отримано: ${referredBy}`);
} else {
    console.warn('Реферальний код не знайдено у URL');
}

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
    const homeButton = document.getElementById('homeButton');
    const friendsButton = document.getElementById('friendsButton');
    const tasksButton = document.getElementById('tasksButton');
    const marketButton = document.getElementById('marketButton');
    const friendsSection = document.getElementById('friendsSection');
    const tasksSection = document.getElementById('tasksSection');
    const marketSection = document.getElementById('marketSection');
    const backToHome = document.getElementById('backToHome');
    const backToHomeFromTasks = document.getElementById('backToHomeFromTasks');
    const backToHomeFromMarket = document.getElementById('backToHomeFromMarket');
    const referralLinkElement = document.getElementById('referralLink');
    const taskItems = document.querySelectorAll('.task-item');
    const progressElement = document.getElementById('progress');
    const levelElement = document.getElementById('level');
    const currentPointsElement = document.getElementById('currentPoints');
    const pointsForNextLevelElement = document.getElementById('pointsForNextLevel');

    const startSpinButton = document.getElementById('startSpinButton');
    const luckyWheel = document.getElementById('luckyWheel');
    
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
            referralCode = data.referral_code;
            walletAddress = data.wallet_address;
            claimedButterfly = data.claimedbutterfly;

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

    // Функція для обчислення кількості поінтів, необхідних для наступного рівня
    function calculatePointsForNextLevel(level) {
        if (level < levels.length) {
            return levels[level]; // Повертаємо поінти для поточного рівня
        } else {
            return levels[levels.length - 1]; // Якщо рівень більше 5, повертаємо максимальне значення
        }
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

    async function saveUserData() {
        console.log('Зберігаємо дані користувача...');
        try {
            await fetch(`/api/user/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    has_butterfly: hasButterfly,
                    level,
                    points,
                    referral_code: referralCode,
                    referred_by: referredBy, // Відправляємо реферальний код, якщо він присутній
                    friends: 0,
                    wallet_address: walletAddress,
                    claimedbutterfly: claimedButterfly
                }),
            });
            console.log('Дані успішно збережені');
            updateUI();
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    // Подія для кнопки GET
    getButterflyButton.addEventListener('click', async () => {
        hasButterfly = true;

        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'block';

        await saveUserData();
    });

    // Логіка обертання колеса
    startSpinButton.addEventListener('click', async () => {
        startSpinButton.disabled = true;

        luckyWheel.style.transition = 'transform 5s ease-out';
        const randomDegree = Math.floor(Math.random() * 360) + 1440;
        luckyWheel.style.transform = `rotate(${randomDegree}deg)`;

        setTimeout(async () => {
            const prize = getRandomPrize();
            alert(`You won ${prize.text}`);

            points += prize.points;
            let pointsForNextLevel = calculatePointsForNextLevel(level);

            // Перевірка, чи поінти достатні для переходу на новий рівень
            while (points >= pointsForNextLevel && level < 5) {  // Перевіряємо, що рівень менше 5
                points -= pointsForNextLevel;
                level += 1;
                pointsForNextLevel = calculatePointsForNextLevel(level);
            }

            updateUI();  // Оновлюємо інтерфейс
            await saveUserData();  // Зберігаємо оновлені дані
            startSpinButton.disabled = false;
        }, 5000);
    });

    function getRandomPrize() {
        const prizes = [
            { text: '0.5 TON', points: 0 },
            { text: '5 Points', points: 5 },
            { text: '10 Points', points: 10 },
            { text: '1 TON', points: 0 },
        ];
        return prizes[Math.floor(Math.random() * prizes.length)];
    }

    homeButton.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        // Додавання активного класу до кнопок
        document.querySelectorAll('.footer__button').forEach(button => {
            button.addEventListener('click', () => {
                // Видаляємо клас 'active' з усіх кнопок
                document.querySelectorAll('.footer__button').forEach(btn => btn.classList.remove('active'));
                // Додаємо 'active' до натиснутої кнопки
                button.classList.add('active');
            });
        });
    });

    friendsButton.addEventListener('click', () => {
        hideAllSections();
        friendsSection.style.display = 'block';
        generateReferralLink();
    });

    tasksButton.addEventListener('click', () => {
        hideAllSections();
        tasksSection.style.display = 'block';
    });

    marketButton.addEventListener('click', () => {
        hideAllSections();
        marketSection.style.display = 'block';
    });

    backToHome.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });

    backToHomeFromTasks.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });

    backToHomeFromMarket.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });

    taskItems.forEach((task) => {
        task.addEventListener('click', () => {
            if (task.classList.contains('completed') || task.classList.contains('loading')) {
                return;
            }

            task.classList.add('loading');
            setTimeout(async () => {
                task.classList.remove('loading');
                task.classList.add('completed');
                task.querySelector('.task-points').textContent = 'Completed';
                points += 5;
                let pointsForNextLevel = calculatePointsForNextLevel(level);

                while (points >= pointsForNextLevel && level < 5) {  // Перевіряємо, що рівень менше 5
                    points -= pointsForNextLevel;
                    level += 1;
                    pointsForNextLevel = calculatePointsForNextLevel(level);
                }

                updateProgress(pointsForNextLevel);
                await saveUserData();
            }, 10000);

            const link = task.getAttribute('data-link');
            window.open(link, '_blank');
        });
    });

    function generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Символи для коду
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    async function generateReferralLink() {
        if (!referralCode) {
            // Генерація реферального коду, якщо його ще немає
            referralCode = generateReferralCode();
            await saveUserData();
        }
        
        const telegramBotLink = `https://t.me/wellact_bot?startapp=${referralCode}`; // Формуємо посилання
        referralLinkElement.textContent = telegramBotLink; // Виводимо посилання на сторінку
    }
    

    function hideAllSections() {
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'none';
        friendsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        marketSection.style.display = 'none';
    }

    loadUserData();
});
