document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
    }

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

    pointsForNextLevelElement.textContent = level * 5;

    getButterflyButton.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'block';
    });

    homeButton.addEventListener('click', () => {
        hideAllSections();
        butterflySection.style.display = 'block';
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
            setTimeout(() => {
                task.classList.remove('loading');
                task.classList.add('completed');
                task.querySelector('.task-points').textContent = 'Completed';
                points += 5;
                updateProgress();
            }, 10000);

            const link = task.getAttribute('data-link');
            window.open(link, '_blank');
        });
    });

    function updateProgress() {
        currentPointsElement.textContent = points;
        let pointsForNextLevel = level * 5;
        pointsForNextLevelElement.textContent = pointsForNextLevel;
        let progress = (points % pointsForNextLevel) / pointsForNextLevel * 100 + '%';
        progressElement.style.width = progress;

        if (points >= pointsForNextLevel) {
            level += 1;
            points = 0;
            levelElement.textContent = level;
            pointsForNextLevelElement.textContent = level * 5;
        }
    }

    function generateReferralLink() {
        let userId = 'user' + Math.floor(Math.random() * 10000);
        let referralLink = window.location.origin + '?ref=' + userId;
        referralLinkElement.textContent = referralLink;
    }

    function hideAllSections() {
        welcomeSection.style.display = 'none';
        butterflySection.style.display = 'none';
        friendsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        marketSection.style.display = 'none';
    }
});
