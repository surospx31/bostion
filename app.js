document.addEventListener('DOMContentLoaded', () => {
    let userId = null;
    let name = 'Username';
    let hasButterfly = false;
    let points = 0;
    let level = 1;
    let walletAddress = "";
    let referralCode = "";
    let claimedButterfly = false;
    let referredBy = null;

    const levels = [0, 50, 500, 1000, 5000];

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('startapp');
    console.log("Параметр startapp:", refCode);

    if (refCode) {
        referredBy = refCode;
        console.log(`Реферальний код отримано: ${referredBy}`);
    }

    const tg = window.Telegram.WebApp;
    tg.expand();

    document.addEventListener('touchmove', function (event) {
        event.preventDefault();
    }, { passive: false });

    const getButterflyButton = document.getElementById('getButterflyButton');
    const welcomeSection = document.getElementById('welcome');
    const butterflySection = document.getElementById('butterflySection');
    const friendsSection = document.getElementById('friendsSection');
    const tasksSection = document.getElementById('tasksSection');
    const marketSection = document.getElementById('marketSection');
    const navbarSection = document.getElementById('navbarSection');  // Панель навігації
    const referralLinkElement = document.getElementById('referralLink');
    const taskItems = document.querySelectorAll('.task-item');
    const progressElement = document.getElementById('progress');
    const levelElement = document.getElementById('level');
    const currentPointsElement = document.getElementById('currentPoints');
    const pointsForNextLevelElement = document.getElementById('pointsForNextLevel');

    const startSpinButton = document.getElementById('spinButton');
    const luckyWheel = document.getElementById('luckyWheel');

    // Завантажуємо дані користувача та керуємо відображенням панелі
    async function loadUserData() {
        try {
            const response = await fetch(`/api/user/${userId}`);
            const data = await response.json();

            points = data.points;
            level = data.level;
            name = data.name || name;
            hasButterfly = data.has_butterfly;
            referralCode = data.referral_code;
            walletAddress = data.wallet_address;
            claimedButterfly = data.claimedbutterfly;

            // Перевіряємо, чи вже є метелик, і керуємо відображенням навігаційної панелі
            if (hasButterfly) {
                welcomeSection.style.display = 'none';
                butterflySection.style.display = 'block';
                navbarSection.style.display = 'flex'; // Явно показуємо панель
                console.log("Метелик є, панель навігації показана.");
            } else {
                welcomeSection.style.display = 'block';
                butterflySection.style.display = 'none';
                navbarSection.style.display = 'none'; // Ховаємо панель
                console.log("Метелика немає, панель навігації прихована.");
            }

            updateUI();
        } catch (error) {
            console.error('Помилка при завантаженні даних користувача:', error);
        }
    }

    function calculatePointsForNextLevel(level) {
        return level < levels.length ? levels[level] : levels[levels.length - 1];
    }

    function updateUI() {
        currentPointsElement.textContent = points;
        levelElement.textContent = level;

        let pointsForNextLevel = calculatePointsForNextLevel(level);
        pointsForNextLevelElement.textContent = pointsForNextLevel;
        updateProgress(pointsForNextLevel);
    }

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
                    referred_by: referredBy,
                    friends: 0,
                    wallet_address: walletAddress,
                    claimedbutterfly: claimedButterfly
                }),
            });
            console.log('Дані успішно збережені');
            updateUI();
        } catch (error) {
            console.error('Помилка при збереженні даних користувача:', error);
        }
    }

    // Генерація реферального посилання
    function generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async function generateReferralLink() {
        if (!referralCode) {
            referralCode = generateReferralCode();
            await saveUserData();
        }
        
        const telegramBotLink = `https://t.me/wellact_bot?startapp=${referralCode}`;
        referralLinkElement.textContent = telegramBotLink;
    }

    // Подія для кнопки GET
    getButterflyButton.addEventListener('click', async () => {
        hasButterfly = true;
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'block';
        navbarSection.style.display = 'flex'; // Упевнюємось, що панель показується
        console.log("Метелик отриманий, навігаційна панель показана.");
        await saveUserData();
    });

    // Логіка для перемикання секцій
    function hideAllSections() {
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'none';
        friendsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        marketSection.style.display = 'none';
    }

    document.getElementById('homeBtn').addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
    });

    document.getElementById('earnsBtn').addEventListener('click', () => {
        hideAllSections();
        tasksSection.style.display = 'block';
    });

    document.getElementById('friendsBtn').addEventListener('click', () => {
        hideAllSections();
        friendsSection.style.display = 'block';
        generateReferralLink();
    });

    document.getElementById('marketBtn').addEventListener('click', () => {
        hideAllSections();
        marketSection.style.display = 'block';
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

                while (points >= pointsForNextLevel && level < 5) {
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

    loadUserData();
});
