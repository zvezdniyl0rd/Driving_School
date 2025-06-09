document.addEventListener('DOMContentLoaded', async () => {
    console.log('Loading student-schedules.js');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User data:', user);
    await fetchStudentSchedules();
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

async function fetchStudentSchedules() {
    const schedulesContainer = document.getElementById('schedules-container');
    const user = JSON.parse(localStorage.getItem('user'));
    const studentId = user?.student_ID;
    const currentDate = new Date; // Текущая дата

    if (!studentId) {
        console.error('Student ID not found in user data');
        schedulesContainer.innerHTML = '<p>Ошибка: Не удалось определить студента. Пожалуйста, войдите в систему как студент.</p>';
        return;
    }

    try {
        console.log('Fetching schedules for studentId:', studentId);
        const response = await fetch(`https://localhost:7174/schedules/student/${studentId}`);
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

        let instructors = [];
        let cars = [];
        try {
            const instructorsResponse = await fetch('https://localhost:7174/instructors');
            if (!instructorsResponse.ok) throw new Error((await instructorsResponse.json()).message || 'Failed to fetch instructors');
            instructors = await instructorsResponse.json();
            cars = await window.fetchCars();
        } catch (error) {
            console.error('Error fetching additional data:', error);
            instructors = [];
            cars = [];
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

        const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

        schedulesContainer.innerHTML = '';

        if (Object.keys(schedulesByDate).length === 0) {
            schedulesContainer.innerHTML = '<p>Записей нет.</p>';
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
                card.classList.add('unavailable');
                card.dataset.scheduleId = schedule.id;

                const timeParts = schedule.slotTime.split(':');
                const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

                const time = document.createElement('p');
                time.classList.add('time');
                time.textContent = `Время: ${formattedTime}`;
                card.appendChild(time);

                const status = document.createElement('p');
                status.classList.add('status');
                status.textContent = 'Занято';
                card.appendChild(status);

                const instructor = instructors.find(i => i.id === schedule.instructor_ID);
                if (instructor) {
                    const fullName = `${instructor.surname} ${instructor.name} ${instructor.patronymic || ''}`.trim();
                    const instructorInfo = document.createElement('p');
                    instructorInfo.innerHTML = `<strong>Инструктор:</strong> ${fullName}`;
                    card.appendChild(instructorInfo);

                    const phone = document.createElement('p');
                    phone.innerHTML = `<strong>Телефон:</strong> ${instructor.phoneNumber}`;
                    card.appendChild(phone);

                    const instructorPhotoUrl = await fetchAttachmentUrl(instructor.attachment_ID);
                    const instructorImg = document.createElement('img');
                    instructorImg.src = instructorPhotoUrl;
                    instructorImg.alt = `Фото ${fullName}`;
                    instructorImg.classList.add('card-photo');
                    instructorImg.addEventListener('click', () => showFullscreenPhoto(instructorPhotoUrl, fullName));
                    card.appendChild(instructorImg);

                    const car = cars.find(c => c.id === instructor.car_ID);
                    if (car) {
                        const carInfo = document.createElement('p');
                        carInfo.innerHTML = `<strong>Автомобиль:</strong> ${car.brand} ${car.model}, ${car.color}`;
                        card.appendChild(carInfo);

                        const carNum = document.createElement('p');
                        carNum.innerHTML = `<strong>Рег. номер:</strong> ${car.car_Number}`;
                        card.appendChild(carNum);

                        const carPhotoUrl = await fetchAttachmentUrl(car.attachment_ID);
                        const carImg = document.createElement('img');
                        carImg.src = carPhotoUrl;
                        carImg.alt = `Фото автомобиля ${car.brand} ${car.model}`;
                        carImg.classList.add('card-photo');
                        carImg.addEventListener('click', () => showFullscreenPhoto(carPhotoUrl, `${car.brand} ${car.model}`));
                        card.appendChild(carImg);
                    }
                }

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
        console.error('Error fetching student schedules:', error);
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
        await fetchStudentSchedules();
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
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                isAvailable: true,
                student_ID: null
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Не удалось отменить запись');
        }
        console.log(`Запись с ID ${scheduleId} успешно отменена`);
        alert('Запись успешно отменена');
    } catch (error) {
        console.error('Ошибка при отмене записи:', error);
        alert(`Ошибка: ${error.message}`);
    }
}