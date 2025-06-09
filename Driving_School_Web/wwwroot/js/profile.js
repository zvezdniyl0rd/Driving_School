document.addEventListener('DOMContentLoaded', async () => {
    const userDetails = document.getElementById('user-details');
    const logoutBtn = document.getElementById('logout-btn');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        window.location.href = '/main.html';
        return;
    }

    let profileData = JSON.parse(localStorage.getItem('profileData'));
    let accountData;

    // Получаем данные профиля
    try {
        let url;
        if (user.user_Type === 2) {
            if (!user.student_ID) throw new Error('ID студента не указан');
            url = `https://localhost:7174/students/${user.student_ID}`;
        } else if (user.user_Type === 1) {
            if (!user.instructor_ID) throw new Error('ID инструктора не указан');
            url = `https://localhost:7174/instructors/${user.instructor_ID}`;
        } else if (user.user_Type === 3) {
            if (!user.admin_ID) throw new Error('ID администратора не указан');
            url = `https://localhost:7174/admins/${user.admin_ID}`;
        } else {
            throw new Error('Неизвестный тип пользователя');
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error((await response.json()).message || 'Ошибка получения данных профиля');
        profileData = await response.json();
        localStorage.setItem('profileData', JSON.stringify(profileData));

        // Получаем данные аккаунта
        const accountResponse = await fetch(`https://localhost:7174/accounts/${user.id}`);
        if (!accountResponse.ok) throw new Error((await accountResponse.json()).message || 'Ошибка получения данных аккаунта');
        accountData = await accountResponse.json();
    } catch (error) {
        userDetails.innerHTML = `<p>Ошибка: ${error.message}</p>`;
        return;
    }

    // Получаем данные автошкол
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

    // Получаем данные городов
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

    // Находим город и автошколу пользователя
    const drivingSchool = drivingSchools.find(ds => ds.id === profileData.drivingSchool_ID);
    const city = cities.find(c => c.id === (drivingSchool ? drivingSchool.city_ID : null));
    const drivingSchoolInfo = drivingSchool
        ? `<span>г. ${city ? city.name : 'Не указан'}, ${drivingSchool.address}</span>`
        : 'Не указана автошкола';

    // Получаем URL фото профиля
    let profilePhotoUrl = 'https://localhost:7174/Uploads/placeholder.jpg';
    if (profileData.attachment_ID) {
        try {
            const attachmentResponse = await fetch(`https://localhost:7174/attachment/${profileData.attachment_ID}`);
            if (attachmentResponse.ok) {
                const attachment = await attachmentResponse.json();
                profilePhotoUrl = `https://localhost:7174${attachment.name}`;
            }
        } catch (error) {
            console.error('Ошибка загрузки фото профиля:', error);
        }
    }

    // Получаем URL фото автомобиля (для инструктора)
    let carPhotoUrl = 'https://localhost:7174/Uploads/placeholder.jpg';
    let carData;
    if (user.user_Type === 1 && profileData.car_ID) {
        try {
            const carResponse = await fetch(`https://localhost:7174/cars/${profileData.car_ID}`);
            if (carResponse.ok) {
                carData = await carResponse.json();
                if (carData.attachment_ID) {
                    const carAttachmentResponse = await fetch(`https://localhost:7174/attachment/${carData.attachment_ID}`);
                    if (carAttachmentResponse.ok) {
                        const carAttachment = await carAttachmentResponse.json();
                        carPhotoUrl = `https://localhost:7174${carAttachment.name}`;
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки фото автомобиля:', error);
        }
    }

    // Отображаем данные пользователя
    let userDetailsHtml = `
        <div class="profile-photo-container">
            <img src="${profilePhotoUrl}" alt="Фото профиля" id="profile-photo" class="profile-photo">
            <div class="photo-actions">
                <input type="file" id="profile-photo-input" accept="image/*" style="display: none;">
                <button id="upload-profile-photo-btn" title="${profileData.attachment_ID ? 'Сменить фото' : 'Добавить фото'}">
                    ${profileData.attachment_ID ? '✏️' : '➕'}
                </button>
            </div>
        </div>
        <div class="profile-info">
            <p><strong>Фамилия:</strong> <span id="surname" contenteditable="false">${profileData.surname || 'Не указана'}</span></p>
            <p><strong>Имя:</strong> <span id="name" contenteditable="false">${profileData.name || 'Не указано'}</span></p>
            <p><strong>Отчество:</strong> <span id="patronymic" contenteditable="false">${profileData.patronymic || 'Не указано'}</span></p>
            <p><strong>Телефон:</strong> <span id="phoneNumber" contenteditable="false">${profileData.phoneNumber || 'Не указан'}</span></p>
            <p><strong>Email:</strong> <span id="email" contenteditable="false">${profileData.email || 'Не указан'}</span></p>
            <p><strong>Логин:</strong> <span id="login" contenteditable="false">${accountData.login || 'Не указан'}</span></p>
            <p><strong>Пароль:</strong> <span id="password" contenteditable="false">••••••••</span></p>
    `;

    if (user.user_Type === 2) {
        // Студент
        userDetailsHtml += `
            <p><strong>Дата рождения:</strong> <span id="birthdate" contenteditable="false">${profileData.birthdate || 'Не указана'}</span></p>
            <p><strong>Автошкола:</strong> ${drivingSchoolInfo}</p>
            <p><strong>Рейтинг:</strong> ${profileData.rating || 'Не указан'}</p>
        `;
    } else if (user.user_Type === 1) {
        // Инструктор
        userDetailsHtml += `
            <p><strong>Автошкола:</strong> ${drivingSchoolInfo}</p>
            <p><strong>Марка автомобиля:</strong> <span id="carBrand" contenteditable="false">${carData ? carData.brand || 'Не указана' : 'Не указана'}</span></p>
            <p><strong>Модель автомобиля:</strong> <span id="carModel" contenteditable="false">${carData ? carData.model || 'Не указана' : 'Не указана'}</span></p>
            <p><strong>Цвет автомобиля:</strong> <span id="carColor" contenteditable="false">${carData ? carData.color || 'Не указан' : 'Не указан'}</span></p>
            <p><strong>Номерной знак:</strong> <span id="carNumber" contenteditable="false">${carData ? carData.car_Number || 'Не указан' : 'Не указан'}</span></p>
            <p><strong>Рейтинг:</strong> ${profileData.rating || 'Не указан'}</p>
            <div class="car-photo-container">
                <img src="${carPhotoUrl}" alt="Фото автомобиля" id="car-photo" class="car-photo">
                <div class="photo-actions">
                    <input type="file" id="car-photo-input" accept="image/*" style="display: none;">
                    <button id="upload-car-photo-btn" title="${carData && carData.attachment_ID ? 'Сменить фото автомобиля' : 'Добавить фото автомобиля'}">
                        ${carData && carData.attachment_ID ? '✏️' : '➕'}
                    </button>
                </div>
            </div>
        `;
    } else if (user.user_Type === 3) {
        // Администратор
        userDetailsHtml += `
            <p><strong>Автошкола:</strong> ${drivingSchoolInfo}</p>
        `;
    } else {
        userDetailsHtml += `<p>Неизвестный тип пользователя</p>`;
    }

    userDetailsHtml += `
        </div>
        <button id="edit-profile-btn">Редактировать профиль</button>
        <div id="photo-modal" class="photo-modal">
            <span id="close-modal" class="close-modal">×</span>
            <img id="modal-image" class="modal-image" src="" alt="Фото">
        </div>
    `;

    userDetails.innerHTML = userDetailsHtml;

    // Обработчики для редактирования профиля
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileInfo = document.querySelector('.profile-info');

    editProfileBtn.onclick = () => {
        editProfileBtn.style.display = 'none';
        const fields = profileInfo.querySelectorAll('span[contenteditable="false"]');
        fields.forEach(field => {
            field.contentEditable = true;
            field.classList.add('editing');
            // Для пароля очищаем поле, чтобы пользователь ввёл новый пароль
            if (field.id === 'password') {
                field.textContent = '';
                field.setAttribute('data-placeholder', 'Введите новый пароль');
            }
        });
        addSaveCancelButtons();
    };

    function addSaveCancelButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'edit-buttons';
        buttonContainer.innerHTML = `
            <button id="save-profile-btn">Сохранить</button>
            <button id="cancel-edit-btn">Отмена</button>
            <p id="edit-error" class="error-message" style="display: none;"></p>
        `;
        userDetails.appendChild(buttonContainer);

        const saveProfileBtn = document.getElementById('save-profile-btn');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');

        saveProfileBtn.onclick = async () => {
            const errorMessage = document.getElementById('edit-error');
            const updatedProfile = {
                id: user.user_Type === 2 ? user.student_ID : user.user_Type === 1 ? user.instructor_ID : user.admin_ID,
                surname: document.getElementById('surname').textContent.trim(),
                name: document.getElementById('name').textContent.trim(),
                patronymic: document.getElementById('patronymic').textContent.trim(),
                phoneNumber: document.getElementById('phoneNumber').textContent.trim(),
                email: document.getElementById('email').textContent.trim(),
                drivingSchool_ID: profileData.drivingSchool_ID,
                attachment_ID: profileData.attachment_ID
            };

            if (user.user_Type === 2) {
                updatedProfile.birthdate = document.getElementById('birthdate').textContent.trim() || profileData.birthdate;
                updatedProfile.attachment_ID = profileData.attachment_ID;
            } else if (user.user_Type === 3) {
                // Для админа не добавляем лишних полей
            }

            const updatedAccount = {
                id: user.id, // Используем user.id из localStorage
                login: document.getElementById('login').textContent.trim(),
                password: document.getElementById('password').textContent.trim() || undefined, // Пароль может быть пустым
            };

            if (user.user_Type === 1 && carData) {
                updatedProfile.car_ID = profileData.car_ID; // Предполагается, что car_ID не редактируется напрямую
            }

            // Валидация
            if (!updatedProfile.surname || !updatedProfile.name) {
                errorMessage.textContent = 'Фамилия и имя обязательны';
                errorMessage.style.display = 'block';
                return;
            }
            if (!updatedAccount.login) {
                errorMessage.textContent = 'Логин обязателен';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                // Обновляем профиль
                let updateUrl;
                if (user.user_Type === 2) {
                    updateUrl = `https://localhost:7174/students/${updatedProfile.id}`;
                } else if (user.user_Type === 1) {
                    updateUrl = `https://localhost:7174/instructors/${updatedProfile.id}`;
                } else if (user.user_Type === 3) {
                    updateUrl = `https://localhost:7174/admins/${updatedProfile.id}`;
                }

                const profileResponse = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProfile),
                });
                if (!profileResponse.ok) throw new Error((await profileResponse.json()).message || 'Не удалось обновить профиль');

                // Обновляем аккаунт (логин и пароль)
                const accountResponse = await fetch(`https://localhost:7174/account/${updatedAccount.id}`, {
                    method: 'PUT',
                    headers: {
                        'accept': '*/*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        login: updatedAccount.login,
                        password: updatedAccount.password || accountData.password // Если пароль не изменён, оставляем старый
                    }),
                });
                if (!accountResponse.ok) throw new Error((await accountResponse.json()).message || 'Не удалось обновить аккаунт');

                // Обновляем данные автомобиля (для инструктора)
                if (user.user_Type === 1 && carData) {
                    const updatedCar = {
                        id: carData.id,
                        brand: document.getElementById('carBrand').textContent.trim(),
                        model: document.getElementById('carModel').textContent.trim(),
                        color: document.getElementById('carColor').textContent.trim(),
                        car_Number: document.getElementById('carNumber').textContent.trim(),
                        attachment_ID: carData.attachment_ID,
                    };
                    const carResponse = await fetch(`https://localhost:7174/cars/${updatedCar.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedCar),
                    });
                    if (!carResponse.ok) throw new Error((await carResponse.json()).message || 'Не удалось обновить данные автомобиля');
                }

                // Обновляем localStorage
                localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                localStorage.setItem('user', JSON.stringify({ ...user, login: updatedAccount.login }));
                alert('Профиль успешно обновлён');
                window.location.reload();
            } catch (error) {
                errorMessage.textContent = `Ошибка: ${error.message}`;
                errorMessage.style.display = 'block';
            }
        };

        cancelEditBtn.onclick = () => {
            window.location.reload(); // Перезагрузка для отмены изменений
        };
    }

    // Обработчики для фото профиля
    const uploadProfilePhotoBtn = document.getElementById('upload-profile-photo-btn');
    const profilePhotoInput = document.getElementById('profile-photo-input');
    const profilePhoto = document.getElementById('profile-photo');

    uploadProfilePhotoBtn.onclick = () => profilePhotoInput.click();
    profilePhotoInput.onchange = async () => {
        const file = profilePhotoInput.files[0];
        if (!file) return;

        try {
            // Загружаем новое фото
            const formData = new FormData();
            formData.append('file', file);
            const uploadResponse = await fetch('https://localhost:7174/attachment', {
                method: 'POST',
                body: formData,
            });
            if (!uploadResponse.ok) throw new Error((await uploadResponse.json()).message || 'Не удалось загрузить фото');
            const { attachmentId } = await uploadResponse.json();

            // Обновляем attachment_ID в профиле
            profileData.attachment_ID = attachmentId;
            const updateUrl = user.user_Type === 2 ? `https://localhost:7174/students/${user.student_ID}` :
                user.user_Type === 1 ? `https://localhost:7174/instructors/${user.instructor_ID}` :
                    `https://localhost:7174/admins/${user.admin_ID}`;
            const updateResponse = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });
            if (!updateResponse.ok) throw new Error('Не удалось обновить профиль');

            localStorage.setItem('profileData', JSON.stringify(profileData));
            window.location.reload();
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Раскрытие фото профиля на полный экран
    const photoModal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.getElementById('close-modal');

    profilePhoto.onclick = () => {
        modalImage.src = profilePhoto.src;
        photoModal.style.display = 'flex';
    };

    closeModal.onclick = () => {
        photoModal.style.display = 'none';
    };

    // Закрытие модального окна при клике вне фото
    photoModal.onclick = (e) => {
        if (e.target === photoModal) {
            photoModal.style.display = 'none';
        }
    };

    // Обработчики для фото автомобиля (для инструктора)
    if (user.user_Type === 1) {
        const uploadCarPhotoBtn = document.getElementById('upload-car-photo-btn');
        const carPhotoInput = document.getElementById('car-photo-input');
        const carPhoto = document.getElementById('car-photo');

        uploadCarPhotoBtn.onclick = () => carPhotoInput.click();
        carPhotoInput.onchange = async () => {
            const file = carPhotoInput.files[0];
            if (!file) return;

            try {                
                // Загружаем новое фото
                const formData = new FormData();
                formData.append('file', file);
                const uploadResponse = await fetch('https://localhost:7174/attachment', {
                    method: 'POST',
                    body: formData,
                });
                if (!uploadResponse.ok) throw new Error((await uploadResponse.json()).message || 'Не удалось загрузить фото');
                const { attachmentId } = await uploadResponse.json();

                // Обновляем attachment_ID в машине
                carData.attachment_ID = attachmentId;
                const updateCarResponse = await fetch(`https://localhost:7174/cars/${carData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(carData),
                });
                if (!updateCarResponse.ok) throw new Error('Не удалось обновить данные автомобиля');

                window.location.reload();
            } catch (error) {
                alert(`Ошибка: ${error.message}`);
            }
        };

        // Раскрытие фото автомобиля на полный экран
        carPhoto.onclick = () => {
            modalImage.src = carPhoto.src;
            photoModal.style.display = 'flex';
        };
    }

    // Обработка выхода
    logoutBtn.onclick = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('profileData');
        localStorage.removeItem('drivingSchools');
        localStorage.removeItem('cities');
        window.location.href = '/main.html';
    };
});