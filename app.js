document.addEventListener('DOMContentLoaded', () => {
    let userId = null;
    let name = 'User';
    let hasButterfly = false;
    let points = 0;
    let level = 1;
    let walletAddress = "";
    let referralCode = "";
    let claimedButterfly = false;
    let referredBy = null; // Додаємо змінну для реферального коду

    const levels = [0, 50, 500, 1000, 5000]; // Кількість поінтів для кожного рівня

    // Отримуємо значення параметра tgWebAppStartParam
    const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;

    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        && !(window.Telegram && window.Telegram.WebApp)) {
        window.location.href = "onpc.html"; // Якщо не мобільний пристрій і не Telegram WebApp
    }
    
    
    
    if (startParam) {
        console.log('Реферальний код:', startParam);
        saveUserDataWithReferral(startParam); // Виклик функції з реферальним кодом
    } else {
        console.log('Немає реферального коду, зберігаємо стандартний запис'); // Виклик без реферального коду
    }

    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            userId = tg.initDataUnsafe.user.id;
            name = tg.initDataUnsafe.user.first_name;
            console.log('Нікнейм користувача:', name);
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
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Знімаємо клас active з усіх кнопок і замінюємо іконки на неактивні
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                const img = btn.querySelector('img');
                img.src = img.src.replace('_active.png', '_inactive.png'); // Замінюємо іконку на неактивну
            });
            
            // Додаємо клас active до натиснутої кнопки і замінюємо іконку на активну
            this.classList.add('active');
            const img = this.querySelector('img');
            img.src = img.src.replace('_inactive.png', '_active.png'); // Замінюємо іконку на активну
        });
    });

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
    
    async function saveUserDataWithReferral(startParam) {
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
                    referral_code: referralCode, // Генеруємо новий код або використовуємо існуючий
                    referred_by: startParam, // Якщо є реферальний код
                    friends: 0,
                    wallet_address: walletAddress,
                    claimedbutterfly: claimedButterfly
                }),
            });
            console.log('Дані успішно збережені');
        } catch (error) {
            console.error('Помилка при збереженні даних користувача:', error);
        }
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
                    name,  // Тут буде username або first_name
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
        
        const telegramBotLink = `https://t.me/wellact_bot/app?startapp=XABLJ8${referralCode}`;
        referralLinkElement.textContent = telegramBotLink;
    }

    // Подія для кнопки GET
    getButterflyButton.addEventListener('click', async () => {
        hasButterfly = true;
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'block';
        navbarSection.style.display = 'flex'; // Упевнюємось, що панель показується
        console.log("Метелик отриманий, навігаційна панель показана.");
    
        // Отримуємо username користувача, якщо він є
        const userUsername = tg.initDataUnsafe.user.username || name; // Якщо є username, використовуємо його, інакше залишаємо ім'я
        
        // Оновлюємо відображення нікнейму на екрані
        const userNicknameElement = document.getElementById('userNickname');
        userNicknameElement.textContent = userUsername;
    
        // Оновлюємо значення змінної name, яке буде збережено в базі
        name = userUsername;
    
        // Зберігаємо дані користувача після натискання кнопки GET
        if (startParam) {
            console.log('Реферальний код:', startParam);
            await saveUserDataWithReferral(startParam); // Виклик функції з реферальним кодом
        } else {
            console.log('Немає реферального коду, зберігаємо стандартний запис');
            await saveUserData(); // Виклик функції без реферального коду
        }
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

    document.getElementById('friendsBtn').addEventListener('click', async () => {
        hideAllSections();
        friendsSection.style.display = 'block';
    
        try {
            const response = await fetch(`/api/user/${userId}`);
            const data = await response.json();
            
            const friendsList = document.getElementById('friendsList');
            friendsList.innerHTML = ''; // Очищуємо поточний список
    
            if (data.friends.length > 0) {
                data.friends.forEach(friend => {
                    const friendItem = document.createElement('p');
                    friendItem.textContent = friend; // Встановлюємо нікнейм друга
                    friendsList.appendChild(friendItem);
                });
            } else {
                friendsList.textContent = 'No friends yet';
            }
        } catch (error) {
            console.error('Помилка при отриманні списку друзів:', error);
        }
        
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
    
    document.getElementById('copyButton').addEventListener('click', () => {
        const referralLink = document.getElementById('referralLink').textContent;
        navigator.clipboard.writeText(referralLink).then(() => {
            alert('Посилання скопійовано!');
        }).catch(err => {
            console.error('Помилка при копіюванні:', err);
        });
    });
    
    
    
    
    loadUserData();
    
});