let isRedirecting = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (isRedirecting) {
        return;
    }

    const currentPath = window.location.pathname;
    console.log('auth.js: Текущая страница:', currentPath);

    if (currentPath.endsWith('auth.html')) {
        const loginBtn = document.getElementById('login-btn');
        const loginInput = document.getElementById('login-input');
        const passwordInput = document.getElementById('password-input');
        const errorMessage = document.getElementById('error-message');

        // Проверяем, авторизован ли пользователь
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && isAuthenticated()) {
            console.log('auth.js: Пользователь авторизован, редирект соглансо роли');
            isRedirecting = true;
            redirectByRole(user);
            return;
        }

        // Обработка авторизации
        loginBtn.onclick = async () => {
            const login = loginInput.value.trim();
            const password = passwordInput.value.trim();

            if (!login || !password) {
                errorMessage.textContent = 'Пожалуйста, заполните все поля';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('https://localhost:7174/login', {
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        login: login,
                        password: password
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Ошибка авторизации');
                }

                const userData = await response.json();
                if (!userData.user_Type || !userData.id || (userData.user_Type === 2 && !userData.student_ID) ||
                    (userData.user_Type === 1 && !userData.instructor_ID) || (userData.user_Type === 3 && !userData.admin_ID)) {
                    throw new Error('Недостаточно данных пользователя');
                }

                localStorage.setItem('user', JSON.stringify(userData));
                console.log('auth.js: Пользователь авторизовался');
                isRedirecting = true;
                redirectByRole(userData);
            } catch (error) {
                errorMessage.textContent = `Ошибка: ${error.message}`;
                errorMessage.style.display = 'block';
            }
        };
    } else {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!isAuthenticated()) {
            console.log('auth.js: Пользователь не авторизован, редирект на auth.html');
            isRedirecting = true;
            window.location.href = '/main.html';
            return;
        }

        console.log('auth.js: Пользователь авторизован, редирект на:', currentPath);

        // Устанавливаем только обработчики для кнопок "Профиль" и "Выйти", если они есть
        const profileBtn = document.getElementById('profile-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (profileBtn) {
            profileBtn.onclick = () => {
                console.log('auth.js: Переход на страницу profile.html');
                window.location.href = '/profile.html';
            };
        }

        if (logoutBtn) {
            logoutBtn.onclick = () => {
                console.log('auth.js: Пользователь разлогинился');
                localStorage.removeItem('user');
                localStorage.removeItem('profileData');
                localStorage.removeItem('drivingSchools');
                localStorage.removeItem('cities');
                localStorage.removeItem('cars');
                window.location.href = '/auth.html';
            };
        }
    }
});

function redirectByRole(user) {
    const role = user.user_Type;
    console.log('auth.js: Редирект для роли:', role);
    switch (role) {
        case 2: // Студент
            if (user.student_ID) {
                window.location.href = '/student-schedules.html';
            } else {
                window.location.href = '/auth.html';
            }
            break;
        case 1: // Инструктор
            if (user.instructor_ID) {
                window.location.href = '/schedule.html';
            } else {
                window.location.href = '/auth.html';
            }
            break;
        case 3: // Администратор
            if (user.admin_ID) {
                window.location.href = '/accounts.html';
            } else {
                window.location.href = '/auth.html';
            }
            break;
        default:
            window.location.href = '/auth.html';
            break;
    }
}

// Функция для проверки авторизации
function isAuthenticated() {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAuth = user && user.id && user.user_Type;
    console.log('auth.js: Авторизация:', isAuth);
    return isAuth;
}