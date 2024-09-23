document.addEventListener('DOMContentLoaded', () => {
    // Перевірка наявності об'єкту Telegram Web Apps API
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand(); // Розгортає міні-додаток на весь екран

        // Отримання нікнейму користувача з Telegram WebApp API
        const userNicknameElement = document.getElementById('userNickname');
        const userBalanceElement = document.getElementById('userBalance');

        // Встановлення початкових значень
        userNicknameElement.textContent = tg.initDataUnsafe.user.first_name || "Username";
        userBalanceElement.textContent = `Balance: ${tg.initDataUnsafe.user.balance || 0}`;
    }

    // Змінні для секцій та елементів
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

    let points = 0;
    let level = 1;

    // Початкове значення необхідних поінтів для наступного рівня
    pointsForNextLevelElement.textContent = level * 5;

    // Показати секцію з метеликом після натискання Get
    getButterflyButton.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'block';
    });

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
            setTimeout(() => {
                task.classList.remove('loading');
                task.classList.add('completed'); // Додаємо клас завершеного завдання
                task.querySelector('.task-points').textContent = 'Completed'; // Зміна тексту на Completed
                points += 5; // Додаємо 5 очок за кожне завдання
                updateProgress();
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
        let userId = 'user' + Math.floor(Math.random() * 10000);
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
});
