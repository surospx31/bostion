document.addEventListener('DOMContentLoaded', () => {
    // Перевірка наявності об'єкту Telegram Web Apps API
    let userId = null; // Ініціалізація значення для telegram_id
    let name = 'Username';
    let hasButterfly = false;
    let points = 0;
    let level = 1;
    let walletAddress = "";
    let referralCode = "";
    let claimedButterfly = false;

    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand(); // Розгортає міні-додаток на весь екран

        // Отримуємо дані користувача з Telegram WebApp API
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            userId = tg.initDataUnsafe.user.id; // Telegram ID
            name = tg.initDataUnsafe.user.first_name || tg.initDataUnsafe.user.username || 'Username';
        } else {
            console.error("Telegram WebApp не повертає дані користувача");
        }

        const userNicknameElement = document.getElementById('userNickname');
        userNicknameElement = name; // Встановлення імені користувача
    }

    // Якщо telegram_id не вдалося отримати, виводимо повідомлення про помилку
    if (!userId) {
        console.error('Не вдалося отримати telegram_id користувача');
        return;
    }

    // Змінні для секцій та елементів
    document.addEventListener('touchmove', function(event) {
        event.preventDefault(); // Забороняє прокрутку на мобільних пристроях
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

    const startSpinButton = document.getElementById('startSpinButton'); // Додаємо кнопку для Spin
    const luckyWheel = document.getElementById('luckyWheel'); // Колесо удачі

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

            updateUI();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Оновлюємо інтерфейс користувача після завантаження даних
    function updateUI() {
        currentPointsElement.textContent = points;
        levelElement.textContent = level;

        // Якщо користувач вже отримав метелика, показуємо основний екран
        if (hasButterfly) {
            welcomeSection.style.display = 'none';
            butterflySection.style.display = 'block';
        } else {
            welcomeSection.style.display = 'block'; // Показуємо кнопку GET
            butterflySection.style.display = 'none';
        }
    }

    // Функція для збереження даних користувача
    async function saveUserData() {
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
                    referred_by: null, // Поки не реалізовано
                    friends: 0, // Поки не реалізовано
                    wallet_address: walletAddress,
                    claimedbutterfly: claimedButterfly
                }),
            });
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    // Подія для кнопки GET
    getButterflyButton.addEventListener('click', async () => {
        // Відзначаємо, що користувач отримав метелика
        hasButterfly = true;

        // Оновлюємо інтерфейс
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'block';

        // Зберігаємо це в базу даних
        await saveUserData();
    });

    // Логіка обертання колеса
    startSpinButton.addEventListener('click', async () => {
        startSpinButton.disabled = true;

        // Анімація обертання
        luckyWheel.style.transition = 'transform 5s ease-out';
        const randomDegree = Math.floor(Math.random() * 360) + 1440; // Випадкове число обертів
        luckyWheel.style.transform = `rotate(${randomDegree}deg)`;

        // Після обертання — результат
        setTimeout(async () => {
            const prize = getRandomPrize();
            alert(`You won ${prize.text}`);

            // Оновлюємо очки
            points += prize.points;
            if (points >= level * 5) {
                level += 1;
                points = 0; // Скидаємо очки після досягнення нового рівня
            }
            updateUI();

            // Зберігаємо оновлені дані
            await saveUserData();
            startSpinButton.disabled = false;
        }, 5000); // Час завершення анімації обертання
    });

    // Випадковий виграш
    function getRandomPrize() {
        const prizes = [
            { text: '0.5 TON', points: 0 },
            { text: '5 Points', points: 5 },
            { text: '10 Points', points: 10 },
            { text: '1 TON', points: 0 },
        ];
        return prizes[Math.floor(Math.random() * prizes.length)];
    }

    // Повернутися на головну
    homeButton.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });

    // Відкрити секцію друзів
    friendsButton.addEventListener('click', () => {
        hideAllSections();
        friendsSection.style.display = 'block';
        generateReferralLink();
    });

    // Відкрити секцію завдань
    tasksButton.addEventListener('click', () => {
        hideAllSections();
        tasksSection.style.display = 'block';
    });

    // Відкрити секцію маркету
    marketButton.addEventListener('click', () => {
        hideAllSections();
        marketSection.style.display = 'block';
    });

    // Повернення на головну з друзів
    backToHome.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });

    // Повернення на головну з завдань
    backToHomeFromTasks.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });

    // Повернення на головну з маркету
    backToHomeFromMarket.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });

    // Додавання очок за завдання з анімацією завантаження
    taskItems.forEach((task) => {
        task.addEventListener('click', () => {
            if (task.classList.contains('completed') || task.classList.contains('loading')) {
                return; // Якщо завдання вже завершене або в процесі завантаження, нічого не робимо
            }

            task.classList.add('loading'); // Додаємо клас завантаження
            setTimeout(async () => {
                task.classList.remove('loading');
                task.classList.add('completed'); // Додаємо клас завершеного завдання
                task.querySelector('.task-points').textContent = 'Completed'; // Зміна тексту на Completed
                points += 5; // Додаємо 5 очок за кожне завдання
                updateProgress();

                // Зберігаємо оновлені дані після виконання завдання
                await saveUserData();
            }, 10000); // 10 секунд очікування

            // Переадресація на посилання
            const link = task.getAttribute('data-link');
            window.open(link, '_blank'); // Відкриття посилання у новій вкладці
        });
    });

    // Оновлення прогрес бару та рівня
    function updateProgress() {
        currentPointsElement.textContent = points;
        let pointsForNextLevel = level * 5;
        pointsForNextLevelElement.textContent = pointsForNextLevel; // Оновлення необхідних поінтів
        let progress = (points % pointsForNextLevel) / pointsForNextLevel * 100 + '%'; // Прогрес бар на основі поінтів
        progressElement.style.width = progress;

        // Підвищення рівня кожні 5 * рівень поінтів
        if (points >= pointsForNextLevel) {
            level += 1;
            points = 0;
            levelElement.textContent = level;
            pointsForNextLevelElement.textContent = level * 5; // Оновлення необхідних поінтів для нового рівня
        }
    }

    // Генерація реферального посилання
    function generateReferralLink() {
        let referralLink = window.location.origin + '?ref=' + userId;
        referralLinkElement.textContent = referralLink;
    }

    // Сховати всі секції
    function hideAllSections() {
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'none';
        friendsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        marketSection.style.display = 'none';
    }

    loadUserData(); // Завантаження даних користувача при старті
});
