// Загрузка данных при инициализации страницы
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (!studentId) {
        document.getElementById('student-info').innerHTML = '<p>Ошибка: ID студента не указан</p>';
        return;
    }

    // Проверка доступа для студентов, инструкторов и администраторов
    if (!restrictAccess([ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN])) return;

    await fetchStudentDetails(studentId);
    await fetchReviews(studentId);

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
    document.getElementById('submit-review').addEventListener('click', () => submitReview(studentId, selectedRating));
});

// Загрузка данных о студенте
async function fetchStudentDetails(studentId) {
    try {
        const response = await fetch(`https://localhost:7174/students/${studentId}`);
        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось загрузить данные студента');
        const student = await response.json();

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
        const drivingSchool = drivingSchools.find(ds => ds.id === student.drivingSchool_ID) || {};

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

        // Отображение информации о студенте
        const studentText = document.getElementById('student-text');
        studentText.innerHTML = `
            <p><strong>ФИО:</strong> ${student.surname} ${student.name} ${student.patronymic || ''}</p>
            <p><strong>Телефон:</strong> ${student.phoneNumber || 'Не указан'}</p>
            <p><strong>Email:</strong> ${student.email || 'Не указан'}</p>
            <p><strong>Дата рождения:</strong> ${student.birthdate ? student.birthdate.split('-').reverse().join('.') : 'Не указана'}</p>
            <p><strong>Автошкола:</strong> г. ${city.name}, ${drivingSchool.address || 'Не указана'}</p>
            <p><strong>Рейтинг:</strong> ${student.rating || 'Не указан'}</p>
        `;

        // Отображение фото студента
        const studentPhoto = document.getElementById('student-photo');
        if (student.attachment_ID) {
            try {
                const attachmentResponse = await fetch(`https://localhost:7174/attachment/${student.attachment_ID}`);
                if (attachmentResponse.ok) {
                    const attachment = await attachmentResponse.json();
                    studentPhoto.src = `https://localhost:7174${attachment.name}`;
                } else {
                    studentPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
                    console.warn('Фото не найдено для студента:', studentId);
                }
            } catch (error) {
                studentPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
                console.error('Ошибка загрузки фото студента:', error);
            }
        } else {
            studentPhoto.src = 'https://localhost:7174/Uploads/placeholder.jpg';
        }
    } catch (error) {
        document.getElementById('student-info').innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

// Загрузка отзывов о студенте
async function fetchReviews(studentId) {
    try {
        // Загрузка данных об инструкторах
        let instructors = JSON.parse(localStorage.getItem('instructors')) || [];
        if (!instructors.length) {
            try {
                const instructorsResponse = await fetch('https://localhost:7174/instructors');
                if (!instructorsResponse.ok) throw new Error((await instructorsResponse.json()).message || 'Не удалось загрузить инструкторов');
                instructors = await instructorsResponse.json();
                localStorage.setItem('instructors', JSON.stringify(instructors));
            } catch (error) {
                console.error('Ошибка загрузки инструкторов:', error);
                instructors = [];
            }
        }

        const response = await fetch(`https://localhost:7174/reviews/to-student/${studentId}`);
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
            const instructor = instructors.find(i => i.id === review.instructor_ID);
            const instructorName = instructor
                ? `${instructor.surname} ${instructor.name} ${instructor.patronymic || ''}`.trim()
                : 'Неизвестный инструктор';

            const card = document.createElement('div');
            card.className = 'review-card';
            let deleteButtonHtml = '';
            if (isAdmin) {
                deleteButtonHtml = `<button class="delete-review-btn" data-review-id="${review.id}">Удалить</button>`;
            }
            card.innerHTML = `
                <div class="header">
                    <span class="author">${instructorName}</span>
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
                showDeleteReviewModal(reviewId, studentId);
            });
        });
    } catch (error) {
        document.getElementById('reviews-list').innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

// Отображение модального окна для подтверждения удаления отзыва
function showDeleteReviewModal(reviewId, studentId) {
    const modal = document.getElementById('delete-review-modal');
    modal.style.display = 'flex';

    const confirmButton = document.getElementById('confirm-delete-review');
    const cancelButton = document.getElementById('cancel-delete-review');

    const newConfirmButton = confirmButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newConfirmButton.addEventListener('click', async () => {
        await deleteReview(reviewId, studentId);
        modal.style.display = 'none';
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Удаление отзыва
async function deleteReview(reviewId, studentId) {
    try {
        const response = await fetch(`https://localhost:7174/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось удалить отзыв');
        await fetchReviews(studentId);
    } catch (error) {
        console.error('Ошибка удаления отзыва:', error);
        alert(`Ошибка при удалении отзыва: ${error.message}`);
    }
}

// Отправка нового отзыва
async function submitReview(studentId, selectedRating) {
    const reviewText = document.getElementById('review-text').value.trim();
    const errorMessage = document.getElementById('review-error');

    if (!reviewText || selectedRating === 0) {
        errorMessage.textContent = 'Заполните текст отзыва и выберите оценку';
        errorMessage.style.display = 'block';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.instructor_ID) {
        errorMessage.textContent = 'Ошибка: авторизация как инструктор не выполнена';
        errorMessage.style.display = 'block';
        return;
    }

    const reviewData = {
        student_ID: parseInt(studentId),
        instructor_ID: user.instructor_ID,
        type_ID: 2, // Отзыв инструктора на студента
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
        await fetchReviews(studentId);
    } catch (error) {
        errorMessage.textContent = `Ошибка: ${error.message}`;
        errorMessage.style.display = 'block';
    }
}