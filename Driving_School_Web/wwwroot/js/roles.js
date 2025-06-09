const ROLES = {
    STUDENT: 2,
    INSTRUCTOR: 1,
    ADMIN: 3
};

// Получение роли пользователя из localStorage
function getUserRole() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.user_Type : null;
}

// Проверка, аутентифицирован ли пользователь
function isAuthenticated() {
    return getUserRole() !== null;
}

// Ограничение доступа к странице или функции на основе роли
function restrictAccess(roleRequired, redirectUrl = '/main.html') {
    const userRole = getUserRole();
    const isRoleAllowed = roleRequired === null ? isAuthenticated() :
        Array.isArray(roleRequired) ? roleRequired.includes(userRole) : userRole === roleRequired;
    if (!isAuthenticated() || !isRoleAllowed) {
        console.log('roles.js: Доступ ограничен, роль пользователя:', userRole, 'требуемая роль:', roleRequired);
        return false;
    }
    return true;
}

// Инициализация интерфейса на основе роли пользователя
function initializeRoleBasedUI() {
    const userRole = getUserRole();
    if (!userRole) {
        console.log('roles.js: Роль пользователя отсутствует, пропускаем инициализацию интерфейса');
        return;
    }

    const navLinks = document.querySelectorAll('nav ul li a');
    const buttons = document.querySelectorAll('nav ul li button');

    // Разрешения для ролей
    const rolePermissions = {
        [ROLES.STUDENT]: ['/schedule.html', '/instructors.html', '/student-schedules.html', '/profile.html'],
        [ROLES.INSTRUCTOR]: ['/schedule.html', '/students.html', '/instructor-schedules.html', '/driving-schools.html', '/profile.html'],
        [ROLES.ADMIN]: ['/students.html', '/instructors.html', '/cars.html', '/driving-schools.html', '/accounts.html', '/profile.html']
    };

    // Управление видимостью навигационных ссылок
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (userRole && !rolePermissions[userRole].includes(href)) {
            link.parentElement.style.display = 'none';
        } else {
            link.parentElement.style.display = 'block';
        }
    });

    // Управление видимостью кнопок
    buttons.forEach(button => {
        if (button.id === 'profile-btn' || button.id === 'logout-btn') {
            button.parentElement.style.display = 'block';
        }
    });

    // Скрытие модального окна добавления расписания для студентов
    if (userRole === ROLES.STUDENT) {
        const addScheduleModal = document.getElementById('add-schedule-modal');
        if (addScheduleModal) addScheduleModal.style.display = 'none';
    }
}

// Ограничение доступа к странице на основе разрешенных ролей
function restrictPageAccess(allowedRoles) {
    const userRole = getUserRole();
    if (!isAuthenticated() || !allowedRoles.includes(userRole)) {
        console.log('roles.js: Доступ к странице ограничен, роль пользователя:', userRole, 'разрешенные роли:', allowedRoles);
    }
}

document.addEventListener('DOMContentLoaded', initializeRoleBasedUI);