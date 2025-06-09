// Загрузка данных при инициализации страницы
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const instructorId = urlParams.get('id');

    if (!instructorId) {
        document.getElementById('instructor-info').innerHTML = '<p>Ошибка: ID инструктора не указан</p>';
        return;
    }

    // Проверка доступа для студентов, инструкторов и администраторов
    if (!restrictAccess([ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN])) return;

    console.log('Загрузка данных для инструктора:', instructorId);
    await fetchInstructorDetails(instructorId);
    await fetchReviews(instructorId);

    // Инициализация звёздного рейтинга
    let selectedRating = 0;
    const stars = document.querySelectorAll('#review-stars .star');
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const value = parseInt(star.dataset.value);
            stars.forEach(s => s.classList.remove('active'));
            for (let i = 0; i < value; i++) {
                stars[i].classList.add('active');
            }
        });

        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.remove('active'));
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add('active');
            }
        });

        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach(s => s.classList.remove('active'));
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add('active');
            }
        });
    });

    // Обработчик отправки отзыва
    document.getElementById('submit-review').addEventListener('click', () => submitReview(instructorId, selectedRating));
});

// Загрузка данных об инструкторе
async function fetchInstructorDetails(instructorId) {
    try {
        // Получение данных об инструкторе
        const instructorResponse = await fetch(`https://localhost:7174/instructors/${instructorId}`);
        if (!instructorResponse.ok) throw new Error((await instructorResponse.json()).message || 'Не удалось загрузить данные инструктора');
        const instructor = await instructorResponse.json();

        // Загрузка данных об автошколах
        let drivingSchools = JSON.parse(localStorage.getItem('drivingSchools')) || [];
        if (!drivingSchools.length) {
            try {
                const drivingSchoolsResponse = await fetch('https://localhost:7174/driving_Schools');
                if (!drivingSchoolsResponse.ok) throw new Error((await drivingSchoolsResponse.json()).message || 'Не удалось загрузить автошколы');
                drivingSchools = await drivingSchoolsResponse.json();
                localStorage.setItem('drivingSchools', JSON.stringify(drivingSchools));
            } catch (error) {
                console.error('Ошибка загрузки автошкол:', error);
                drivingSchools = [];
            }
        }
        const drivingSchool = drivingSchools.find(ds => ds.id === instructor.drivingSchool_ID) || {};

        // Загрузка данных о городах
        let cities = JSON.parse(localStorage.getItem('cities')) || [];
        if (!cities.length) {
            try {
                const citiesResponse = await fetch('https://localhost:7174/city');
                if (!citiesResponse.ok) throw new Error((await citiesResponse.json()).message || 'Не удалось загрузить города');
                cities = await citiesResponse.json();
                localStorage.setItem('cities', JSON.stringify(cities));
            } catch (error) {
                console.error('Ошибка загрузки городов:', error);
                cities = [];
            }
        }
        const city = cities.find(c => c.id === drivingSchool.city_ID) || { name: 'Не указан' };

        // Загрузка данных об автомобилях
        let cars = JSON.parse(localStorage.getItem('cars')) || [];
        if (!cars.length) {
            try {
                const carsResponse = await fetch('https://localhost:7174/cars');
                if (!carsResponse.ok) throw new Error((await carsResponse.json()).message || 'Не удалось загрузить автомобили');
                cars = await carsResponse.json();
                localStorage.setItem('cars', JSON.stringify(cars));
            } catch (error) {
                console.error('Ошибка загрузки автомобилей:', error);
                cars = [];
            }
        }
        const car = cars.find(c => c.id === instructor.car_ID) || {};

        // Отображение информации об инструкторе
        const instructorText = document.getElementById('instructor-text');
        instructorText.innerHTML = `
            <p><strong>ФИО:</strong> ${instructor.surname} ${instructor.name} ${instructor.patronymic || ''}</p>
            <p><strong>Телефон:</strong> ${instructor.phoneNumber || 'Не указан'}</p>
            <p><strong>Email:</strong> ${instructor.email || 'Не указан'}</p>
            <p><strong>Автошкола:</strong> г. ${city.name}, ${drivingSchool.address || 'Не указана'}</p>
            <p><strong>Рейтинг:</strong> ${instructor.rating || 'Не указан'}</p>
        `;

        // Отображение информации об автомобиле
        const carDetails = document.getElementById('car-details');
        carDetails.innerHTML = `
            <p><strong>Марка:</strong> ${car.brand || 'Не указана'}</p>
            <p><strong>Модель:</strong> ${car.model || 'Не указана'}</p>
            <p><strong>Цвет:</strong> ${car.color || 'Не указан'}</p>
            <p><strong>Номер:</strong> ${car.car_Number || 'Не указан'}</p>
        `;

        // Отображение фото инструктора
        const instructorPhoto = document.getElementById('instructor-photo');
        if (instructor.attachment_ID) {
            try {
                const attachmentResponse = await fetch(`https://localhost:7174/attachment/${instructor.attachment_ID}`);
                if (attachmentResponse.ok) {
                    const attachment = await attachmentResponse.json();
                    instructorPhoto.src = `https://localhost:7174${attachment.name}`;
                } else {
                    instructorPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
                    console.warn('Фото не найдено для инструктора:', instructorId);
                }
            } catch (error) {
                instructorPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
                console.error('Ошибка загрузки фото инструктора:', error);
            }
        } else {
            instructorPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
        }

        // Отображение фото автомобиля
        const carPhoto = document.getElementById('car-photo');
        if (car.attachment_ID) {
            try {
                const attachmentResponse = await fetch(`https://localhost:7174/attachment/${car.attachment_ID}`);
                if (attachmentResponse.ok) {
                    const attachment = await attachmentResponse.json();
                    carPhoto.src = `https://localhost:7174${attachment.name}`;
                } else {
                    carPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
                    console.warn('Фото не найдено для автомобиля инструктора:', instructorId);
                }
            } catch (error) {
                carPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
                console.error('Ошибка загрузки фото автомобиля:', error);
            }
        } else {
            carPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
        }
    } catch (error) {
        document.getElementById('instructor-info').innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

// Загрузка отзывов об инструкторе
async function fetchReviews(instructorId) {
    try {
        // Загрузка данных о студентах
        let students = JSON.parse(localStorage.getItem('students')) || [];
        if (!students.length) {
            try {
                const studentsResponse = await fetch('https://localhost:7174/students');
                if (!studentsResponse.ok) throw new Error((await studentsResponse.json()).message || 'Не удалось загрузить студентов');
                students = await studentsResponse.json();
                localStorage.setItem('students', JSON.stringify(students));
            } catch (error) {
                console.error('Ошибка загрузки студентов:', error);
                students = [];
            }
        }

        const response = await fetch(`https://localhost:7174/reviews/to-instructor/${instructorId}`);
        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось загрузить отзывы');
        const reviews = await response.json();

        const reviewsList = document.getElementById('reviews-list');
        reviewsList.innerHTML = '';

        if (!reviews.length) {
            reviewsList.innerHTML = '<p>Отзывов нет</p>';
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        const isAdmin = user?.user_Type === ROLES.ADMIN;

        reviews.forEach(review => {
            const student = students.find(s => s.id === review.student_ID);
            const studentName = student
                ? `${student.surname} ${student.name} ${student.patronymic || ''}`.trim()
                : 'Неизвестный студент';

            const card = document.createElement('div');
            card.className = 'review-card';
            let deleteButtonHtml = '';
            if (isAdmin) {
                deleteButtonHtml = `<button class="delete-review-btn" data-review-id="${review.id}">Удалить</button>`;
            }
            card.innerHTML = `
                <div class="header">
                    <span class="author">${studentName}</span>
                    <span class="date">${new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
                <div class="rating">${'★'.repeat(review.mark)}${'☆'.repeat(5 - review.mark)}</div>
                <div class="text">${review.text}</div>
                ${deleteButtonHtml}
            `;
            reviewsList.appendChild(card);
        });

        // Добавление обработчиков для кнопок удаления
        document.querySelectorAll('.delete-review-btn').forEach(button => {
            button.addEventListener('click', () => {
                const reviewId = button.dataset.reviewId;
                showDeleteReviewModal(reviewId, instructorId);
            });
        });
    } catch (error) {
        document.getElementById('reviews-list').innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

// Отображение модального окна для подтверждения удаления отзыва
function showDeleteReviewModal(reviewId, instructorId) {
    const modal = document.getElementById('delete-review-modal');
    modal.style.display = 'flex';

    const confirmButton = document.getElementById('confirm-delete-review');
    const cancelButton = document.getElementById('cancel-delete-review');

    const newConfirmButton = confirmButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newConfirmButton.addEventListener('click', async () => {
        await deleteReview(reviewId, instructorId);
        modal.style.display = 'none';
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Удаление отзыва
async function deleteReview(reviewId, instructorId) {
    try {
        const response = await fetch(`https://localhost:7174/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось удалить отзыв');
        await fetchReviews(instructorId);
        await fetchInstructorDetails(instructorId); // Обновление рейтинга инструктора
    } catch (error) {
        console.error('Ошибка удаления отзыва:', error);
        alert(`Ошибка при удалении отзыва: ${error.message}`);
    }
}

// Отправка нового отзыва
async function submitReview(instructorId, selectedRating) {
    const reviewText = document.getElementById('review-text').value.trim();
    const errorMessage = document.getElementById('review-error');

    if (!reviewText || selectedRating === 0) {
        errorMessage.textContent = 'Заполните текст отзыва и выберите оценку';
        errorMessage.style.display = 'block';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.student_ID) {
        errorMessage.textContent = 'Ошибка: авторизация как студент не выполнена';
        errorMessage.style.display = 'block';
        return;
    }

    const reviewData = {
        instructor_ID: parseInt(instructorId),
        student_ID: user.student_ID,
        type_ID: 1, // Отзыв студента на инструктора
        mark: selectedRating,
        text: reviewText
    };

    try {
        const response = await fetch('https://localhost:7174/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось отправить отзыв');
        alert('Отзыв успешно отправлен');
        document.getElementById('review-text').value = '';
        selectedRating = 0;
        document.querySelectorAll('#review-stars .star').forEach(s => s.classList.remove('active'));
        errorMessage.style.display = 'none';
        await fetchReviews(instructorId);
        await fetchInstructorDetails(instructorId); // Обновление рейтинга инструктора
    } catch (error) {
        errorMessage.textContent = `Ошибка: ${error.message}`;
        errorMessage.style.display = 'block';
    }
}

// Проверка доступа
function restrictAccess(allowedRoles) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.user_Type || !allowedRoles.includes(user.user_Type)) {
        window.location.href = '/auth.html';
        return false;
    }
    return true;
}