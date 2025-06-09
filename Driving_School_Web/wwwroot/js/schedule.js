let isFetchingSchedule = false;
let displayedDate = new Date();
const currentDate = new Date(); // Текущая дата
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const allowedMonths = [
    { year: currentYear, month: currentMonth },
    { year: currentMonth >= 10 ? currentYear + 1 : currentYear, month: (currentMonth + 1) % 12 },
    { year: currentMonth >= 9 ? currentYear + 1 : currentYear, month: (currentMonth + 2) % 12 }
];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('schedules.js: Событие DOMContentLoaded сработало');
    if (!isAuthenticated()) {
        console.log('schedules.js: Пользователь не авторизован, перенаправление на /auth.html');
        window.location.href = '/auth.html';
        return;
    }
    if (!restrictAccess(null)) {
        console.log('schedules.js: Доступ ограничен');
        return;
    }

    const userRole = getUserRole();
    console.log('schedules.js: Роль пользователя:', userRole);
    if (userRole !== ROLES.INSTRUCTOR) {
        const addScheduleBtn = document.getElementById('add-schedule');
        const addScheduleModal = document.getElementById('add-schedule-modal');
        if (addScheduleBtn) addScheduleBtn.style.display = 'none';
        if (addScheduleModal) addScheduleModal.style.display = 'none';
    }

    if (!isFetchingSchedule) {
        console.log('schedules.js: Начало загрузки расписания');
        isFetchingSchedule = true;
        await fetchSchedule();
        setupAddScheduleModal();
    } else {
        console.log('schedules.js: isFetchingSchedule равно true, пропуск загрузки');
    }
});

async function fetchSchedule() {
    console.log('schedules.js: Вход в функцию fetchSchedule');
    const scheduleTable = document.getElementById('schedule-table');
    if (!scheduleTable) {
        console.error('schedules.js: Элемент с id "schedule-table" не найден');
        return;
    }
    console.log('schedules.js: scheduleTable найден, продолжаем');
    scheduleTable.innerHTML = '';

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('calendar-header');

    const prevButton = document.createElement('button');
    prevButton.textContent = '◄';
    prevButton.classList.add('nav-button');
    headerContainer.appendChild(prevButton);

    const monthTitle = document.createElement('h3');
    monthTitle.classList.add('month-title');
    headerContainer.appendChild(monthTitle);

    const nextButton = document.createElement('button');
    nextButton.textContent = '►';
    nextButton.classList.add('nav-button');
    headerContainer.appendChild(nextButton);

    scheduleTable.appendChild(headerContainer);

    async function updateCalendar() {
        const year = displayedDate.getFullYear();
        const month = displayedDate.getMonth();

        console.log('schedules.js: Обновление календаря для месяца:', month + 1, 'года:', year);

        // Проверка допустимого месяца
        const isAllowedMonth = allowedMonths.some(m => m.year === year && m.month === month);
        if (!isAllowedMonth) {
            // Если месяц вне диапазона, устанавливаем ближайший допустимый месяц
            if (year < allowedMonths[0].year || (year === allowedMonths[0].year && month < allowedMonths[0].month)) {
                displayedDate.setFullYear(allowedMonths[0].year);
                displayedDate.setMonth(allowedMonths[0].month);
            } else if (year > allowedMonths[2].year || (year === allowedMonths[2].year && month > allowedMonths[2].month)) {
                displayedDate.setFullYear(allowedMonths[2].year);
                displayedDate.setMonth(allowedMonths[2].month);
            }
            console.warn('schedules.js: Месяц вне допустимого диапазона, скорректирован:', displayedDate);
        }

        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        monthTitle.textContent = `${monthNames[month]} ${year}`;

        let schedules = [];
        const user = JSON.parse(localStorage.getItem('user'));
        const userRole = getUserRole();
        if (!user) {
            console.error('schedules.js: Пользователь не авторизован');
            scheduleTable.innerHTML = '<tr><td colspan="7">Ошибка: Пользователь не авторизован</td></tr>';
            return;
        }

        try {
            let apiUrl = `https://localhost:7174/schedules?month=${month + 1}&year=${year}`;
            console.log('schedules.js: Загрузка данных с URL:', apiUrl);

            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Не удалось загрузить расписание');
            }
            schedules = await response.json();
            console.log('schedules.js: Расписание для пользователя:', schedules);

            // Фильтруем записи: оставляем только актуальные (дата >= текущей даты, а для текущего дня — время после текущего)
            schedules = schedules.filter(schedule => {
                const scheduleDate = new Date(schedule.date);
                const scheduleDateOnly = new Date(scheduleDate.toISOString().split('T')[0]);
                const currentDateOnly = new Date(currentDate.toISOString().split('T')[0]);

                // Если дата раньше текущей, исключаем запись
                if (scheduleDateOnly < currentDateOnly) {
                    return false;
                }

                if (scheduleDateOnly.getTime() === currentDateOnly.getTime()) {
                    const [hours, minutes] = schedule.slotTime.split(':').map(Number);
                    const scheduleTimeInMinutes = hours * 60 + minutes;
                    const currentHours = currentDate.getUTCHours();
                    const currentMinutes = currentDate.getUTCMinutes();
                    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

                    // Оставляем только слоты после текущего времени
                    return scheduleTimeInMinutes > currentTimeInMinutes;
                }
                return true;
            });

        } catch (error) {
            console.error('schedules.js: Ошибка загрузки расписания:', error);
            scheduleTable.innerHTML = `<tr><td colspan="7">Ошибка: ${error.message}</td></tr>`;
            return;
        }

        const schedulesByDay = {};
        schedules.forEach(schedule => {
            const scheduleDate = new Date(schedule.date);
            const day = scheduleDate.getDate();
            if (!schedulesByDay[day]) {
                schedulesByDay[day] = { available: 0, unavailable: 0 };
            }
            if (schedule.isAvailable) {
                schedulesByDay[day].available++;
            } else {
                schedulesByDay[day].unavailable++;
            }
        });

        const table = document.createElement('table');
        const headerRow = document.createElement('tr');

        const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        daysOfWeek.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const totalCells = adjustedFirstDay + daysInMonth;
        const weeksInMonth = Math.ceil(totalCells / 7);

        table.setAttribute('data-weeks', weeksInMonth);

        let currentDay = 1;
        let row = document.createElement('tr');

        for (let i = 0; i < adjustedFirstDay; i++) {
            const td = document.createElement('td');
            row.appendChild(td);
        }

        const today = new Date(currentDate);
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = today.getDate();

        while (currentDay <= daysInMonth) {
            const td = document.createElement('td');

            const dateSpan = document.createElement('span');
            dateSpan.classList.add('date-number');
            dateSpan.textContent = currentDay;
            td.appendChild(dateSpan);

            const daySchedules = schedulesByDay[currentDay];
            if (daySchedules) {
                const statusDiv = document.createElement('div');
                statusDiv.classList.add('slots-container');
                if (daySchedules.available > 0) {
                    const availableSpan = document.createElement('span');
                    availableSpan.classList.add('slot', 'available');
                    availableSpan.textContent = `Свободно: ${daySchedules.available}`;
                    statusDiv.appendChild(availableSpan);
                    td.classList.add('has-available');
                    td.style.cursor = 'pointer';

                    const dayForUrl = currentDay;
                    const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayForUrl).padStart(2, '0')}`;
                    td.onclick = async (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        console.log('schedules.js: Клик по ячейке для даты:', selectedDate);
                        try {
                            let detailUrl = `https://localhost:7174/schedules?month=${month + 1}&year=${year}&day=${dayForUrl}`;

                            const response = await fetch(detailUrl);
                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.message || 'Не удалось загрузить расписание');
                            }
                            const daySchedules = await response.json();

                            // Фильтрация записей для текущего дня, оставляем только те, что после текущего времени
                            const filteredDaySchedules = daySchedules.filter(schedule => {
                                const scheduleDate = new Date(schedule.date);
                                const scheduleDateOnly = new Date(scheduleDate.toISOString().split('T')[0]);
                                const currentDateOnly = new Date(currentDate.toISOString().split('T')[0]);

                                if (scheduleDateOnly.getTime() === currentDateOnly.getTime()) {
                                    const [hours, minutes] = schedule.slotTime.split(':').map(Number);
                                    const scheduleTimeInMinutes = hours * 60 + minutes;
                                    const currentHours = currentDate.getUTCHours();
                                    const currentMinutes = currentDate.getUTCMinutes();
                                    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
                                    return scheduleTimeInMinutes > currentTimeInMinutes;
                                }
                                return true;
                            });

                            localStorage.setItem('selectedSchedules', JSON.stringify(filteredDaySchedules));
                            localStorage.setItem('selectedDate', selectedDate);

                            console.log('schedules.js: Перенаправление на:', `/schedule-date.html?date=${selectedDate}`);
                            window.location.href = `/schedule-date.html?date=${selectedDate}`;
                        } catch (error) {
                            console.error('schedules.js: Ошибка загрузки расписания:', error);
                            alert('Ошибка при загрузке расписания: ' + error.message);
                        }
                    };
                } else {
                    td.classList.add('no-available');
                }
                td.appendChild(statusDiv);
            }

            if (isCurrentMonth && currentDay === todayDate) {
                td.classList.add('current-date');
            }

            row.appendChild(td);
            currentDay++;

            if (row.children.length === 7) {
                table.appendChild(row);
                row = document.createElement('tr');
            }
        }

        if (row.children.length > 0) {
            while (row.children.length < 7) {
                const td = document.createElement('td');
                row.appendChild(td);
            }
            table.appendChild(row);
        }

        const existingTable = scheduleTable.querySelector('table');
        if (existingTable) {
            existingTable.remove();
        }
        scheduleTable.appendChild(table);

        if (Object.keys(schedulesByDay).length === 0) {
            const messageRow = document.createElement('tr');
            const messageCell = document.createElement('td');
            messageCell.colSpan = 7;
            messageCell.textContent = 'Расписание на этот месяц отсутствует';
            messageRow.appendChild(messageCell);
            table.appendChild(messageRow);
        }

        prevButton.disabled = (year === allowedMonths[0].year && month === allowedMonths[0].month);
        nextButton.disabled = (year === allowedMonths[2].year && month === allowedMonths[2].month);
    }

    updateCalendar();

    prevButton.addEventListener('click', () => {
        displayedDate.setDate(1);
        displayedDate.setMonth(displayedDate.getMonth() - 1);
        updateCalendar();
    });

    nextButton.addEventListener('click', () => {
        displayedDate.setDate(1);
        displayedDate.setMonth(displayedDate.getMonth() + 1);
        updateCalendar();
    });
}

function setupAddScheduleModal() {
    console.log('schedules.js: Настройка модального окна добавления расписания');
    const addButton = document.getElementById('add-schedule');
    const modal = document.getElementById('add-schedule-modal');
    if (!addButton || !modal) {
        console.error('schedules.js: Элементы add-schedule или add-schedule-modal не найдены');
        return;
    }

    const closeBtn = modal.querySelector('.close');
    const createBtn = document.getElementById('create-schedule');
    const cancelBtn = document.getElementById('cancel-add-schedule');
    const dateInput = document.getElementById('schedule-date');
    const timeInput = document.getElementById('schedule-time');
    const errorMessage = document.getElementById('add-schedule-error');

    const currentDateStr = currentDate.toISOString().split('T')[0];
    const minDate = currentDateStr;
    const maxDate = `${allowedMonths[2].year}-${String(allowedMonths[2].month + 1).padStart(2, '0')}-${new Date(allowedMonths[2].year, allowedMonths[2].month + 1, 0).getDate()}`;
    dateInput.setAttribute('min', minDate);
    dateInput.setAttribute('max', maxDate);

    addButton.addEventListener('click', () => {
        modal.style.display = 'block';
        errorMessage.style.display = 'none';
        dateInput.value = '';
        timeInput.value = '';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    const user = JSON.parse(localStorage.getItem('user'));

    createBtn.addEventListener('click', async () => {
        const date = dateInput.value;
        const slotTime = timeInput.value;
        const instructorId = user.instructor_ID;

        if (!date || !slotTime || !instructorId) {
            errorMessage.textContent = 'Пожалуйста, заполните все обязательные поля';
            errorMessage.style.display = 'block';
            return;
        }

        const selectedDate = new Date(date);
        const currentDateOnly = new Date(currentDate.toISOString().split('T')[0]);
        if (selectedDate < currentDateOnly) {
            errorMessage.textContent = 'Нельзя создать запись на прошедшую дату';
            errorMessage.style.display = 'block';
            return;
        }

        const [hours, minutes] = slotTime.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        const minTime = 8 * 60;
        const maxTime = 20 * 60;

        if (timeInMinutes < minTime || timeInMinutes > maxTime) {
            errorMessage.textContent = 'Время должно быть в диапазоне с 8:00 до 20:00';
            errorMessage.style.display = 'block';
            return;
        }

        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();
        const isDateAllowed = allowedMonths.some(m => m.year === selectedYear && m.month === selectedMonth);
        if (!isDateAllowed) {
            const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            errorMessage.textContent = `Укажите дату в промежутке между ${monthNames[allowedMonths[0].month]} и ${monthNames[allowedMonths[2].month]}`;
            errorMessage.style.display = 'block';
            return;
        }

        const scheduleData = {
            date: date,
            slotTime: slotTime,
            isAvailable: true,
            instructor_ID: instructorId,
            student_ID: null
        };

        try {
            const response = await fetch('https://localhost:7174/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scheduleData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Не удалось создать расписание');
            }

            modal.style.display = 'none';
            await fetchSchedule();
        } catch (error) {
            console.error('schedules.js: Ошибка создания расписания:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}