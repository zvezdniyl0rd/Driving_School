document.addEventListener('DOMContentLoaded', async () => {
    console.log('schedule-date.js loaded for URL:', window.location.href);
    await displayScheduleDate();
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

async function displayScheduleDate() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get('date') || localStorage.getItem('selectedDate');

    if (!selectedDate) {
        document.getElementById('schedule-date-content').innerHTML = '<p>Дата не указана.</p>';
        return;
    }

    const dateObj = new Date(selectedDate);
    const day = dateObj.getDate();
    const monthNames = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    const dateHeader = document.createElement('h2');
    dateHeader.textContent = `Записи на ${formattedDate}`;
    document.getElementById('schedule-date-content').innerHTML = '';
    document.getElementById('schedule-date-content').appendChild(dateHeader);

    const schedules = JSON.parse(localStorage.getItem('selectedSchedules')) || [];

    if (schedules.length === 0) {
        const placeholder = document.createElement('p');
        placeholder.textContent = 'На эту дату записей нет.';
        document.getElementById('schedule-date-content').appendChild(placeholder);
        return;
    }

    schedules.sort((a, b) => a.slotTime.localeCompare(b.slotTime));

    let instructors = [];
    let cars = [];
    let students = [];
    try {
        const instructorsResponse = await fetch('https://localhost:7174/instructors');
        if (!instructorsResponse.ok) throw new Error((await instructorsResponse.json()).message || 'Failed to fetch instructors');
        instructors = await instructorsResponse.json();

        cars = await window.fetchCars();

        const studentsResponse = await fetch('https://localhost:7174/students');
        if (!studentsResponse.ok) throw new Error((await studentsResponse.json()).message || 'Failed to fetch students');
        students = await studentsResponse.json();
    } catch (error) {
        console.error('Error fetching additional data:', error);
        document.getElementById('schedule-date-content').innerHTML += `<p>Ошибка при загрузке данных: ${error.message}</p>`;
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user.user_Type;
    const userId = userRole === ROLES.STUDENT ? user.student_ID : user.instructor_ID;

    if (!userId) {
        document.getElementById('schedule-date-content').innerHTML += '<p>Ошибка: Не удалось определить пользователя.</p>';
        return;
    }

    const scheduleContainer = document.createElement('div');
    scheduleContainer.classList.add('schedule-cards');

    for (const schedule of schedules) {
        if (userRole === ROLES.STUDENT && !schedule.isAvailable) continue;

        const card = document.createElement('div');
        card.classList.add('schedule-card');
        card.classList.add(schedule.isAvailable ? 'available' : 'unavailable');
        card.dataset.scheduleId = schedule.id;

        const timeParts = schedule.slotTime.split(':');
        const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

        const instructor = instructors.find(inst => inst.id === schedule.instructor_ID);
        let instructorInfo = 'Инструктор не найден';
        let instructorPhoneNum = 'Телефон не найден';
        let instructorPhotoUrl = 'https://localhost:7174/Uploads/placeholder.jpg';
        let carInfo = 'Автомобиль не указан';
        let carNum = 'Регистрационный номер не указан';
        let carPhotoUrl = 'https://localhost:7174/Uploads/placeholder.jpg';

        if (instructor) {
            instructorInfo = `${instructor.surname} ${instructor.name} ${instructor.patronymic || ''}`.trim();
            instructorPhoneNum = instructor.phoneNumber;
            instructorPhotoUrl = await fetchAttachmentUrl(instructor.attachment_ID);

            const car = cars.find(c => c.id === instructor.car_ID);
            if (car) {
                carInfo = `${car.brand} ${car.model}, ${car.color}`;
                carNum = car.car_Number;
                carPhotoUrl = await fetchAttachmentUrl(car.attachment_ID);
            }
        }

        const timeP = document.createElement('p');
        timeP.classList.add('time');
        timeP.textContent = formattedTime;
        card.appendChild(timeP);

        const statusP = document.createElement('p');
        statusP.classList.add('status');
        statusP.textContent = schedule.isAvailable ? 'Свободно' : 'Занято';
        card.appendChild(statusP);

        const instructorP = document.createElement('p');
        instructorP.innerHTML = `<strong>Инструктор:</strong> ${instructorInfo}`;
        card.appendChild(instructorP);

        const phoneP = document.createElement('p');
        phoneP.innerHTML = `<strong>Номер телефона:</strong> ${instructorPhoneNum}`;
        card.appendChild(phoneP);

        const carP = document.createElement('p');
        carP.innerHTML = `<strong>Автомобиль:</strong> ${carInfo}`;
        card.appendChild(carP);

        const carNumP = document.createElement('p');
        carNumP.innerHTML = `<strong>Рег. номер:</strong> ${carNum}`;
        card.appendChild(carNumP);

        // Фото инструктора для студентов
        if (userRole === ROLES.STUDENT) {
            const instructorImg = document.createElement('img');
            instructorImg.src = instructorPhotoUrl;
            instructorImg.alt = `Фото ${instructorInfo}`;
            instructorImg.classList.add('card-photo');
            instructorImg.addEventListener('click', () => showFullscreenPhoto(instructorPhotoUrl, instructorInfo));
            card.appendChild(instructorImg);
        }

        // Фото автомобиля
        const carImg = document.createElement('img');
        carImg.src = carPhotoUrl;
        carImg.alt = `Фото автомобиля ${carInfo}`;
        carImg.classList.add('card-photo');
        carImg.addEventListener('click', () => showFullscreenPhoto(carPhotoUrl, carInfo));
        card.appendChild(carImg);

        // Для инструкторов: фото студента в забронированных слотах
        if (userRole === ROLES.INSTRUCTOR && !schedule.isAvailable) {
            const student = students.find(s => s.id === schedule.student_ID);
            if (student) {
                const studentInfo = `${student.surname} ${student.name}`;
                const studentPhotoUrl = await fetchAttachmentUrl(student.attachment_ID);
                const studentP = document.createElement('p');
                studentP.innerHTML = `<strong>Студент:</strong> ${studentInfo}`;
                card.appendChild(studentP);

                const studentImg = document.createElement('img');
                studentImg.src = studentPhotoUrl;
                studentImg.alt = `Фото ${studentInfo}`;
                studentImg.classList.add('card-photo');
                studentImg.addEventListener('click', () => showFullscreenPhoto(studentPhotoUrl, studentInfo));
                card.appendChild(studentImg);
            }
        }

        if (userRole === ROLES.STUDENT && schedule.isAvailable) {
            const bookButton = document.createElement('button');
            bookButton.classList.add('book-button');
            bookButton.textContent = 'Записаться';
            bookButton.addEventListener('click', () => showBookingConfirmation(schedule.id, userId, formattedDate, formattedTime, instructorInfo));
            card.appendChild(bookButton);
        }

        scheduleContainer.appendChild(card);
    }

    document.getElementById('schedule-date-content').appendChild(scheduleContainer);
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

function showBookingConfirmation(scheduleId, studentId, formattedDate, formattedTime, instructorInfo) {
    if (getUserRole() !== ROLES.STUDENT) return;

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Подтверждение записи</h3>
            <p>Вы хотите записаться на ${formattedDate} в ${formattedTime}?</p>
            <p><strong>Инструктор:</strong> ${instructorInfo}</p>
            <div class="modal-buttons">
                <button id="confirm-book">Подтвердить</button>
                <button id="cancel-book">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const confirmButton = modal.querySelector('#confirm-book');
    const cancelButton = modal.querySelector('#cancel-book');

    confirmButton.addEventListener('click', async () => {
        await bookSchedule(scheduleId, studentId, formattedDate, formattedTime, instructorInfo);
        document.body.removeChild(modal);
        window.location.href = '/schedule.html';
    });

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) document.body.removeChild(modal);
    });
}

async function bookSchedule(scheduleId, studentId, formattedDate, formattedTime, instructorInfo) {
    try {
        const response = await fetch(`https://localhost:7174/schedules/${scheduleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                isAvailable: false,
                student_ID: studentId
            })
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось записаться');
        alert(`Вы успешно записались: ${formattedDate}, ${formattedTime} с инструктором ${instructorInfo}`);
    } catch (error) {
        console.error('Ошибка при бронировании:', error);
        alert(`Ошибка: ${error.message}`);
    }
}