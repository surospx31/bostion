document.addEventListener('DOMContentLoaded', () => {
    // Підключення Telegram Web Apps API
    const tg = window.Telegram.WebApp;

    // Розгорнути додаток на весь екран
    tg.expand();

    // Інші наявні функції
    const getButterflyButton = document.getElementById('getButterflyButton');
    const butterflySection = document.getElementById('butterflySection');
    const welcomeSection = document.getElementById('welcome');
    const homeButton = document.getElementById('homeButton');
    const friendsButton = document.getElementById('friendsButton');
    const tasksButton = document.getElementById('tasksButton');
    const marketButton = document.getElementById('marketButton');
    const pointsElement = document.getElementById('points');
    const progressElement = document.getElementById('progress');
    const levelElement = document.getElementById('level');
    const friendsSection = document.getElementById('friendsSection');
    const tasksSection = document.getElementById('tasksSection');
    const marketSection = document.getElementById('marketSection');
    const backToHome = document.getElementById('backToHome');
    const backToHomeFromTasks = document.getElementById('backToHomeFromTasks');
    const backToHomeFromMarket = document.getElementById('backToHomeFromMarket');
    const referralLinkElement = document.getElementById('referralLink');
    const taskItems = document.querySelectorAll('.task-item');

    let points = 0;
    let level = 1;

    // Показати секцію з метеликом після натискання Get
    getButterflyButton.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'block';
    });

    // Повернутися на головну
    homeButton.addEventListener('click', () => {
        friendsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        marketSection.style.display = 'none';
        butterflySection.style.display = 'block';
    });

    // Відкрити секцію друзів
    friendsButton.addEventListener('click', () => {
        butterflySection.style.display = 'none';
        friendsSection.style.display = 'block';
        generateReferralLink();
    });

    // Відкрити секцію завдань
    tasksButton.addEventListener('click', () => {
        butterflySection.style.display = 'none';
        tasksSection.style.display = 'block';
    });

    // Відкрити секцію маркету
    marketButton.addEventListener('click', () => {
        butterflySection.style.display = 'none';
        marketSection.style.display = 'block';
    });

    // Повернення на головну з друзів
    backToHome.addEventListener('click', () => {
        friendsSection.style.display = 'none';
        butterflySection.style.display = 'block';
    });

    // Повернення на головну з завдань
    backToHomeFromTasks.addEventListener('click', () => {
        tasksSection.style.display = 'none';
        butterflySection.style.display = 'block';
    });

    // Повернення на головну з маркету
    backToHomeFromMarket.addEventListener('click', () => {
        marketSection.style.display = 'none';
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
        pointsElement.textContent = points;
        let progress = (points % (level * 5)) / (level * 5) * 100 + '%'; // Прогрес бар на основі поінтів
        progressElement.style.width = progress;

        // Підвищення рівня кожні 5 * рівень поінтів
        if (points >= level * 5) {
            level += 1;
            points = 0;
            levelElement.textContent = level;
        }
    }

    // Генерація реферального посилання
    function generateReferralLink() {
        let userId = 'user' + Math.floor(Math.random() * 10000);
        let referralLink = window.location.origin + '?ref=' + userId;
        referralLinkElement.textContent = referralLink;
    }
});
