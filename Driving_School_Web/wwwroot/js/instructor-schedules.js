document.addEventListener('DOMContentLoaded', async () => {
    if (!restrictAccess([ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN])) return;
    await fetchInstructorSchedules();
});

async function fetchAttachmentUrl(attachmentId) {
    const defaultUrl = 'https://localhost:7174/Uploads/placeholder.jpg';
    if (!attachmentId) return defaultUrl;

    try {
        const response = await fetch(`https://localhost:7174/attachment/${attachmentId}`);
        if (!response.ok) throw new Error('Не удалось загрузить фото');
        const attachment = await response.json();
        return `https://localhost:7174${attachment.name}`;
    } catch (error) {
        console.error('Ошибка загрузки фото:', error);
        return defaultUrl;
    }
}

async function fetchInstructorSchedules() {
    const schedulesContainer = document.getElementById('schedules-container');
    const user = JSON.parse(localStorage.getItem('user'));
    const instructorId = user.instructor_ID;
    const currentDate = new Date; // Текущая дата

    if (!instructorId) {
        schedulesContainer.innerHTML = '<p>Ошибка: Не удалось определить инструктора. Пожалуйста, войдите в систему.</p>';
        return;
    }

    try {
        const response = await fetch(`https://localhost:7174/schedules/instructor/${instructorId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch schedules');
        }
        let schedules = await response.json();

        // Фильтруем записи, оставляем только актуальные (дата >= текущей даты)
        schedules = schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.date);
            return scheduleDate >= currentDate;
        });

        let students = [];
        try {
            const studentsResponse = await fetch('https://localhost:7174/students');
            if (!studentsResponse.ok) {
                const errorData = await studentsResponse.json();
                throw new Error(errorData.message || 'Failed to fetch students');
            }
            students = await studentsResponse.json();
        } catch (error) {
            console.error('Error fetching students:', error);
            students = [];
        }

        schedules.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA - dateB !== 0) return dateA - dateB;
            return a.slotTime.localeCompare(b.slotTime);
        });

        const schedulesByDate = {};
        for (const schedule of schedules) {
            const date = new Date(schedule.date).toISOString().split('T')[0];
            if (!schedulesByDate[date]) schedulesByDate[date] = [];
            schedulesByDate[date].push(schedule);
        }

        const monthNames = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];

        schedulesContainer.innerHTML = '';

        if (Object.keys(schedulesByDate).length === 0) {
            schedulesContainer.innerHTML = '<p>Записи отсутствуют.</p>';
            return;
        }

        for (const dateStr of Object.keys(schedulesByDate)) {
            const date = new Date(dateStr);
            const day = date.getDate();
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            const formattedDate = `${day} ${month} ${year}`;

            const dateBlock = document.createElement('div');
            dateBlock.classList.add('date-block');

            const dateTitle = document.createElement('h3');
            dateTitle.textContent = formattedDate;
            dateBlock.appendChild(dateTitle);

            const cardsContainer = document.createElement('div');
            cardsContainer.classList.add('schedule-cards');

            for (const schedule of schedulesByDate[dateStr]) {
                const card = document.createElement('div');
                card.classList.add('schedule-card');
                card.classList.add(schedule.isAvailable ? 'available' : 'unavailable');
                card.dataset.scheduleId = schedule.id;

                const timeParts = schedule.slotTime.split(':');
                const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

                const time = document.createElement('p');
                time.classList.add('time');
                time.textContent = `Время: ${formattedTime}`;
                card.appendChild(time);

                const status = document.createElement('p');
                status.classList.add('status');
                status.textContent = schedule.isAvailable ? 'Свободно' : 'Занято';
                card.appendChild(status);

                if (!schedule.isAvailable && schedule.student_ID) {
                    const student = students.find(s => s.id === schedule.student_ID);
                    if (student) {
                        const fullName = `${student.surname} ${student.name} ${student.patronymic || ''}`.trim();
                        const studentInfo = document.createElement('p');
                        studentInfo.textContent = `Студент: ${fullName}`;
                        card.appendChild(studentInfo);

                        const birthdate = document.createElement('p');
                        const [year, month, day] = student.birthdate.split('-');
                        birthdate.textContent = `Дата рождения: ${day}.${month}.${year}`;
                        card.appendChild(birthdate);

                        const phone = document.createElement('p');
                        phone.textContent = `Телефон: ${student.phoneNumber}`;
                        card.appendChild(phone);

                        const studentPhotoUrl = await fetchAttachmentUrl(student.attachment_ID);
                        const studentImg = document.createElement('img');
                        studentImg.src = studentPhotoUrl;
                        studentImg.alt = `Фото ${fullName}`;
                        studentImg.classList.add('card-photo');
                        studentImg.addEventListener('click', () => showFullscreenPhoto(studentPhotoUrl, fullName));
                        card.appendChild(studentImg);
                    } else {
                        const studentInfo = document.createElement('p');
                        studentInfo.textContent = `Студент: ID ${schedule.student_ID} (данные недоступны)`;
                        card.appendChild(studentInfo);
                    }
                }

                // Кнопка "Отменить" для всех записей
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Отменить';
                cancelButton.classList.add('cancel-button');
                cancelButton.addEventListener('click', () => showCancelConfirmation(schedule.id));
                card.appendChild(cancelButton);

                cardsContainer.appendChild(card);
            }

            dateBlock.appendChild(cardsContainer);
            schedulesContainer.appendChild(dateBlock);
        }
    } catch (error) {
        console.error('Error fetching instructor schedules:', error);
        schedulesContainer.innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

function showFullscreenPhoto(photoUrl, altText) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content fullscreen-photo">
            <span class="close">×</span>
            <img src="${photoUrl}" alt="${altText}" class="fullscreen-image">
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));
    modal.addEventListener('click', (event) => {
        if (event.target === modal) document.body.removeChild(modal);
    });
}

function showCancelConfirmation(scheduleId) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Подтверждение отмены</h3>
            <p>Вы уверены, что хотите отменить эту запись?</p>
            <p class="warning">Внимание: эта операция необратима.</p>
            <div class="modal-buttons">
                <button id="confirm-cancel">Подтвердить</button>
                <button id="cancel-action">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const confirmButton = modal.querySelector('#confirm-cancel');
    const cancelButton = modal.querySelector('#cancel-action');

    confirmButton.addEventListener('click', async () => {
        await cancelSchedule(scheduleId);
        document.body.removeChild(modal);
        await fetchInstructorSchedules();
    });

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) document.body.removeChild(modal);
    });
}

async function cancelSchedule(scheduleId) {
    try {
        const response = await fetch(`https://localhost:7174/schedules/${scheduleId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Не удалось отменить запись');
        }
        console.log(`Запись с ID ${scheduleId} успешно отменена`);
    } catch (error) {
        console.error('Ошибка при отмене записи:', error);
        alert(`Ошибка: ${error.message}`);
    }
}