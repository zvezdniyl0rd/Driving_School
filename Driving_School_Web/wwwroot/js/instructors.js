let state = {
    instructors: [], // Список инструкторов
    drivingSchools: [], // Список автошкол
    cities: [], // Список городов
    cars: [], // Список автомобилей
    filters: { // Фильтры для поиска
        surname: '',
        name: '',
        patronymic: '',
        phoneNumber: '',
        email: '',
        drivingSchool: '',
        city: ''
    },
    tempFilters: { // Временные фильтры
        surname: '',
        name: '',
        patronymic: '',
        phoneNumber: '',
        email: '',
        drivingSchool: '',
        city: ''
    },
    currentPage: 1, // Текущая страница
    pageSize: 10, // Размер страницы
    totalPages: 1 // Общее количество страниц
};

document.addEventListener('DOMContentLoaded', async () => {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('instructors.html')) {
        // Проверка доступа для администраторов, инструкторов и студентов
        if (!restrictAccess([ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT])) return;

        const profileData = JSON.parse(localStorage.getItem('profileData'));
        const drivingSchools = JSON.parse(localStorage.getItem('drivingSchools')) || [];
        const cities = JSON.parse(localStorage.getItem('cities')) || [];
        const citySelect = document.getElementById('city-filter');
        const drivingSchoolSelect = document.getElementById('driving-school-filter');

        // Установка фильтра по городу пользователя перед загрузкой данных
        if (profileData && profileData.drivingSchool_ID) {
            const userDrivingSchool = drivingSchools.find(ds => ds.id === profileData.drivingSchool_ID);
            if (userDrivingSchool && userDrivingSchool.city_ID) {
                const userCityId = userDrivingSchool.city_ID.toString();
                state.filters.city = userCityId;
                state.tempFilters.city = userCityId;
                if (citySelect) {
                    citySelect.value = userCityId;
                    updateDrivingSchools(userCityId, drivingSchoolSelect);
                    citySelect.dispatchEvent(new Event('change'));
                }
            }
        }

        // Загрузка списка инструкторов
        await fetchInstructors();

        const user = JSON.parse(localStorage.getItem('user'));
        // Скрытие кнопки "Добавить" для неадминистраторов
        if (user.user_Type !== ROLES.ADMIN) {
            const addBtn = document.getElementById('add-instructor-btn');
            if (addBtn) addBtn.style.display = 'none';
        }

        // Обработчик кнопки "Предыдущая страница"
        document.getElementById('prev-page').addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                fetchInstructors();
            }
        });

        // Обработчик кнопки "Следующая страница"
        document.getElementById('next-page').addEventListener('click', () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                fetchInstructors();
            }
        });

        // Обработчик сброса фильтров
        document.getElementById('reset-filters').addEventListener('click', () => {
            state.filters = {
                surname: '',
                name: '',
                patronymic: '',
                phoneNumber: '',
                email: '',
                drivingSchool: '',
                city: ''
            };
            state.tempFilters = {
                surname: '',
                name: '',
                patronymic: '',
                phoneNumber: '',
                email: '',
                drivingSchool: '',
                city: ''
            };
            document.getElementById('surname-filter').value = '';
            document.getElementById('name-filter').value = '';
            document.getElementById('patronymic-filter').value = '';
            document.getElementById('phone-filter').value = '';
            document.getElementById('email-filter').value = '';
            document.getElementById('driving-school-filter').value = '';
            document.getElementById('city-filter').value = '';
            state.currentPage = 1;
            updateDrivingSchools('', document.getElementById('driving-school-filter'));
            fetchInstructors();
        });

        // Обработчик применения фильтров
        document.getElementById('apply-filters').addEventListener('click', () => {
            state.filters = { ...state.tempFilters };
            const citySelect = document.getElementById('city-filter');
            const drivingSchoolSelect = document.getElementById('driving-school-filter');
            const selectedCity = state.filters.city;
            const selectedDrivingSchool = state.filters.drivingSchool;

            if (citySelect) {
                citySelect.value = selectedCity || '';
            }
            if (selectedCity) {
                updateDrivingSchools(selectedCity, drivingSchoolSelect);
                const validDrivingSchool = Array.from(drivingSchoolSelect.options).some(option => option.value === selectedDrivingSchool);
                drivingSchoolSelect.value = validDrivingSchool ? selectedDrivingSchool : '';
                if (!validDrivingSchool && selectedDrivingSchool) {
                    state.filters.drivingSchool = '';
                    state.tempFilters.drivingSchool = '';
                }
            } else {
                updateDrivingSchools('', drivingSchoolSelect);
                drivingSchoolSelect.value = selectedDrivingSchool || '';
            }
            state.currentPage = 1;
            fetchInstructors();
        });

        // Обработчик ввода фамилии
        document.getElementById('surname-filter').addEventListener('input', () => {
            state.tempFilters.surname = document.getElementById('surname-filter').value.trim().toLowerCase();
        });

        // Обработчик ввода имени
        document.getElementById('name-filter').addEventListener('input', () => {
            state.tempFilters.name = document.getElementById('name-filter').value.trim().toLowerCase();
        });

        // Обработчик ввода отчества
        document.getElementById('patronymic-filter').addEventListener('input', () => {
            state.tempFilters.patronymic = document.getElementById('patronymic-filter').value.trim().toLowerCase();
        });

        // Обработчик ввода номера телефона
        document.getElementById('phone-filter').addEventListener('input', () => {
            state.tempFilters.phoneNumber = document.getElementById('phone-filter').value.trim().toLowerCase();
        });

        // Обработчик ввода email
        document.getElementById('email-filter').addEventListener('input', () => {
            state.tempFilters.email = document.getElementById('email-filter').value.trim().toLowerCase();
        });

        // Обработчик изменения автошколы
        document.getElementById('driving-school-filter').addEventListener('change', () => {
            state.tempFilters.drivingSchool = document.getElementById('driving-school-filter').value;
        });

        // Обработчик изменения города
        document.getElementById('city-filter').addEventListener('change', (e) => {
            const cityId = e.target.value;
            state.tempFilters.city = cityId;
            const drivingSchoolSelect = document.getElementById('driving-school-filter');
            updateDrivingSchools(cityId, drivingSchoolSelect);
            state.tempFilters.drivingSchool = '';
            drivingSchoolSelect.value = '';
        });

        // Обработчик изменения размера страницы
        const pageSizeSelect = document.getElementById('page-size');
        pageSizeSelect.addEventListener('change', () => {
            state.pageSize = parseInt(pageSizeSelect.value);
            state.currentPage = 1;
            fetchInstructors();
        });

        // Обработчик клика по строке таблицы для перехода к деталям инструктора
        document.getElementById('instructors-list').addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            if (row && !event.target.closest('button')) {
                const instructorId = row.dataset.id;
                window.location.href = `/instructor-details.html?id=${instructorId}`;
            }
        });
    }
});

// Функция загрузки списка инструкторов
async function fetchInstructors() {
    const instructorsList = document.getElementById('instructors-list');
    if (!instructorsList) {
        console.error('Элемент с id "instructors-list" не найден');
        return;
    }

    try {
        if (!state.drivingSchools.length) {
            try {
                let drivingSchools = JSON.parse(localStorage.getItem('drivingSchools'));
                if (!drivingSchools) {
                    const drivingSchoolsResponse = await fetch('https://localhost:7174/driving_Schools');
                    if (!drivingSchoolsResponse.ok) throw new Error((await drivingSchoolsResponse.json()).message || 'Не удалось загрузить автошколы');
                    drivingSchools = await drivingSchoolsResponse.json();
                    localStorage.setItem('drivingSchools', JSON.stringify(drivingSchools));
                }
                state.drivingSchools = drivingSchools;
            } catch (error) {
                console.error('Ошибка загрузки автошкол:', error);
                state.drivingSchools = [];
            }
        }

        if (!state.cities.length) {
            try {
                const citiesResponse = await fetch('https://localhost:7174/city');
                if (!citiesResponse.ok) throw new Error((await citiesResponse.json()).message || 'Не удалось загрузить города');
                state.cities = await citiesResponse.json();
            } catch (error) {
                console.error('Ошибка загрузки городов:', error);
                state.cities = [];
            }
        }

        if (!state.cars.length) {
            try {
                const carsResponse = await fetch('https://localhost:7174/cars');
                if (!carsResponse.ok) throw new Error((await carsResponse.json()).message || 'Не удалось загрузить автомобили');
                state.cars = await carsResponse.json();
            } catch (error) {
                console.error('Ошибка загрузки автомобилей:', error);
                state.cars = [];
            }
        }

        const cityId = state.filters.city ? parseInt(state.filters.city) : null;
        const drivingSchoolId = state.filters.drivingSchool ? parseInt(state.filters.drivingSchool) : null;
        const filter = {
            surname: state.filters.surname,
            name: state.filters.name,
            patronymic: state.filters.patronymic,
            phoneNumber: state.filters.phoneNumber,
            email: state.filters.email,
            drivingSchool_ID: isNaN(drivingSchoolId) ? null : drivingSchoolId,
            city_ID: isNaN(cityId) ? null : cityId,
            page: state.currentPage,
            pageSize: state.pageSize
        };

        const response = await fetch('https://localhost:7174/instructors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filter)
        });

        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось загрузить инструкторов');
        const responseData = await response.json();

        state.instructors = Array.isArray(responseData.data) ? responseData.data : [];
        state.totalPages = responseData.totalPages || 1;

        if (state.currentPage === 1 && !document.getElementById('surname-filter').value) {
            initFilters();
        }
        initTableHeader();
        render();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        instructorsList.innerHTML = `<tr><td colspan="6">Ошибка: ${error.message}</td></tr>`;
    }
}

function initFilters() {
    const drivingSchoolFilter = document.getElementById('driving-school-filter');
    drivingSchoolFilter.innerHTML = '<option value="">Любая</option>';
    const cityFilter = document.getElementById('city-filter');
    cityFilter.innerHTML = '<option value="">Любой</option>';
    state.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        cityFilter.appendChild(option);
    });

    if (state.filters.city) {
        cityFilter.value = state.filters.city;
        updateDrivingSchools(state.filters.city, drivingSchoolFilter);
    }

    if (state.filters.drivingSchool) {
        drivingSchoolFilter.value = state.filters.drivingSchool;
    }
}

// Инициализация заголовков таблицы
function initTableHeader() {
    const headers = document.querySelectorAll('#instructors-table th');
    const user = JSON.parse(localStorage.getItem('user'));
    const headerTitles = user.user_Type === ROLES.ADMIN ?
        ['ФИО', 'Телефон', 'Email', 'Автошкола', 'Автомобиль', 'Действия'] :
        ['ФИО', 'Телефон', 'Email', 'Автошкола', 'Автомобиль'];
    headers.forEach((header, index) => {
        header.textContent = headerTitles[index] || '';
        header.style.cursor = 'default';
    });
}

// Отображение модального окна для подтверждения удаления
function showDeleteModal(id) {
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'flex';
    modal.classList.add('active');

    const confirmButton = document.getElementById('confirm-delete');
    const cancelButton = document.getElementById('cancel-delete');

    const newConfirmButton = confirmButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newConfirmButton.addEventListener('click', async () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        try {
            const response = await fetch(`https://localhost:7174/instructors/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось удалить инструктора');
            fetchInstructors();
        } catch (error) {
            console.error('Ошибка удаления инструктора:', error);
            alert(`Ошибка при удалении инструктора: ${error.message}`);
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

// Отображение модального окна для редактирования инструктора
function showEditModal(instructor) {
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = 'Редактирование инструктора';
    modal.style.display = 'flex';
    modal.classList.add('active');

    document.getElementById('edit-surname').value = instructor.surname || '';
    document.getElementById('edit-name').value = instructor.name || '';
    document.getElementById('edit-patronymic').value = instructor.patronymic || '';
    document.getElementById('edit-phone').value = instructor.phoneNumber || '';
    document.getElementById('edit-email').value = instructor.email || '';

    const citySelect = document.getElementById('edit-city');
    const drivingSchoolSelect = document.getElementById('edit-driving-school');
    citySelect.innerHTML = '<option value="">Выберите город</option>';
    drivingSchoolSelect.innerHTML = '<option value="">Выберите автошколу</option>';

    state.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        citySelect.appendChild(option);
    });

    const instructorDrivingSchool = state.drivingSchools.find(ds => ds.id === instructor.drivingSchool_ID);
    const instructorCity = instructorDrivingSchool ? state.cities.find(c => c.id === instructorDrivingSchool.city_ID) : null;
    if (instructorCity) {
        citySelect.value = instructorCity.id;
        updateDrivingSchools(instructorCity.id, drivingSchoolSelect);
        drivingSchoolSelect.value = instructorDrivingSchool.id;
    }

    const car = state.cars.find(c => c.id === instructor.car_ID) || { brand: '', model: '', color: '', car_Number: '' };
    document.getElementById('edit-car-brand').value = car.brand || '';
    document.getElementById('edit-car-model').value = car.model || '';
    document.getElementById('edit-car-color').value = car.color || '';
    document.getElementById('edit-car-number').value = car.car_Number || '';

    const errorMessage = document.getElementById('edit-error');
    errorMessage.style.display = 'none';

    const cityChangeHandler = () => {
        updateDrivingSchools(citySelect.value, drivingSchoolSelect);
    };
    citySelect.removeEventListener('change', cityChangeHandler);
    citySelect.addEventListener('change', cityChangeHandler);

    const saveButton = document.getElementById('save-edit');
    const cancelButton = document.getElementById('cancel-edit');

    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newSaveButton.addEventListener('click', async () => {
        const updatedInstructor = {
            surname: document.getElementById('edit-surname').value.trim(),
            name: document.getElementById('edit-name').value.trim(),
            patronymic: document.getElementById('edit-patronymic').value.trim() || null,
            phoneNumber: document.getElementById('edit-phone').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            drivingSchool_ID: document.getElementById('edit-driving-school').value ? parseInt(document.getElementById('edit-driving-school').value) : null,
            car_ID: instructor.car_ID
        };

        const updatedCar = {
            brand: document.getElementById('edit-car-brand').value.trim(),
            model: document.getElementById('edit-car-model').value.trim(),
            color: document.getElementById('edit-car-color').value.trim(),
            car_Number: document.getElementById('edit-car-number').value.trim()
        };

        if (!updatedInstructor.surname || !updatedInstructor.name || !updatedInstructor.phoneNumber || !updatedInstructor.email || !updatedInstructor.drivingSchool_ID) {
            errorMessage.textContent = 'Заполните обязательные поля инструктора: фамилия, имя, телефон, email, автошкола';
            errorMessage.style.display = 'block';
            return;
        }

        if (!instructor.car_ID) {
            errorMessage.textContent = 'Инструктор не связан с автомобилем';
            errorMessage.style.display = 'block';
            return;
        }
        if (!updatedCar.brand || !updatedCar.model || !updatedCar.color || !updatedCar.car_Number) {
            errorMessage.textContent = 'Заполните обязательные поля автомобиля: марка, модель, цвет, регистрационный номер';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const instructorResponse = await fetch(`https://localhost:7174/instructors/${instructor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedInstructor)
            });

            if (!instructorResponse.ok) throw new Error((await instructorResponse.json()).message || 'Не удалось обновить данные инструктора');

            const carResponse = await fetch(`https://localhost:7174/cars/${instructor.car_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCar)
            });

            if (!carResponse.ok) throw new Error((await carResponse.json()).message || 'Не удалось обновить данные автомобиля');

            const carsResponse = await fetch('https://localhost:7174/cars');
            if (!carsResponse.ok) throw new Error((await carsResponse.json()).message || 'Не удалось обновить список автомобилей');
            state.cars = await carsResponse.json();

            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            fetchInstructors();
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

// Обновление списка автошкол в зависимости от выбранного города
function updateDrivingSchools(cityId, drivingSchoolSelect) {
    drivingSchoolSelect.innerHTML = '<option value="">Любая</option>';
    if (cityId) {
        const filteredSchools = state.drivingSchools.filter(ds => ds.city_ID === parseInt(cityId));
        filteredSchools.forEach(school => {
            const city = state.cities.find(c => c.id === school.city_ID);
            const schoolText = city ? `г. ${city.name}, ${school.address}` : school.address;
            const option = document.createElement('option');
            option.value = school.id;
            option.textContent = schoolText;
            drivingSchoolSelect.appendChild(option);
        });
    } else {
        state.drivingSchools.forEach(school => {
            const city = state.cities.find(c => c.id === school.city_ID);
            const schoolText = city ? `г. ${city.name}, ${school.address}` : school.address;
            const option = document.createElement('option');
            option.value = school.id;
            option.textContent = schoolText;
            drivingSchoolSelect.appendChild(option);
        });
    }
    drivingSchoolSelect.disabled = !cityId;
}

// Удаление инструктора
function deleteInstructor(id) { showDeleteModal(id); }

// Редактирование инструктора
function editInstructor(id) {
    const instructor = state.instructors.find(i => i.id === id);
    if (instructor) {
        showEditModal(instructor);
    } else {
        alert('Инструктор не найден');
    }
}

// Создание строки таблицы для инструктора
function createInstructorRow(instructor) {
    const user = JSON.parse(localStorage.getItem('user'));
    const row = document.createElement('tr');
    row.dataset.id = instructor.id;
    const drivingSchool = state.drivingSchools.find(ds => ds.id === instructor.drivingSchool_ID) || { address: 'Не указана' };
    const city = drivingSchool ? state.cities.find(c => c.id === drivingSchool.city_ID) : null;
    const car = state.cars.find(c => c.id === instructor.car_ID) || null;
    const fullName = `${instructor.surname} ${instructor.name} ${instructor.patronymic || ''}`.trim() || 'Не указано';
    const schoolText = city ? `г. ${city.name}, ${drivingSchool.address}` : drivingSchool.address;
    const carText = car ? `${car.brand} ${car.model}, ${car.color}, ${car.car_Number}` : 'Не указан';

    const fioCell = document.createElement('td');
    fioCell.textContent = fullName;
    row.appendChild(fioCell);

    const phoneCell = document.createElement('td');
    phoneCell.textContent = instructor.phoneNumber;
    row.appendChild(phoneCell);

    const emailCell = document.createElement('td');
    emailCell.textContent = instructor.email;
    row.appendChild(emailCell);

    const drivingSchoolCell = document.createElement('td');
    drivingSchoolCell.textContent = schoolText;
    row.appendChild(drivingSchoolCell);

    const carCell = document.createElement('td');
    carCell.textContent = carText;
    row.appendChild(carCell);

    // Добавление кнопок действий для администратора
    if (user.user_Type === ROLES.ADMIN) {
        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.addEventListener('click', () => editInstructor(instructor.id));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.addEventListener('click', () => deleteInstructor(instructor.id));

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
    }
    return row;
}

// Отрисовка таблицы инструкторов
function render() {
    const instructorsList = document.getElementById('instructors-list');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');

    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === state.totalPages || state.totalPages === 0;
    pageNumbers.innerHTML = `<span>Страница ${state.currentPage} из ${state.totalPages}</span>`;

    instructorsList.innerHTML = '';

    if (state.instructors.length === 0) {
        instructorsList.innerHTML = '<tr><td colspan="6">Инструкторы не найдены</td></tr>';
        return;
    }

    state.instructors.forEach(instructor => {
        instructorsList.appendChild(createInstructorRow(instructor));
    });
}

// Отображение модального окна для добавления инструктора
function showAddModal() {
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = 'Добавление инструктора';
    modal.style.display = 'flex';
    modal.classList.add('active');

    document.getElementById('edit-surname').value = '';
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-patronymic').value = '';
    document.getElementById('edit-phone').value = '';
    document.getElementById('edit-email').value = '';
    document.getElementById('edit-car-brand').value = '';
    document.getElementById('edit-car-model').value = '';
    document.getElementById('edit-car-color').value = '';
    document.getElementById('edit-car-number').value = '';

    const citySelect = document.getElementById('edit-city');
    const drivingSchoolSelect = document.getElementById('edit-driving-school');
    const errorMessage = document.getElementById('edit-error');
    errorMessage.style.display = 'none';

    citySelect.innerHTML = '<option value="">Выберите город</option>';
    state.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        citySelect.appendChild(option);
    });

    drivingSchoolSelect.innerHTML = '<option value="">Выберите автошколу</option>';

    const cityChangeHandler = () => {
        updateDrivingSchools(citySelect.value, drivingSchoolSelect);
    };
    citySelect.removeEventListener('change', cityChangeHandler);
    citySelect.addEventListener('change', cityChangeHandler);

    const saveButton = document.getElementById('save-edit');
    const cancelButton = document.getElementById('cancel-edit');

    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newSaveButton.addEventListener('click', async () => {
        const newInstructor = {
            surname: document.getElementById('edit-surname').value.trim(),
            name: document.getElementById('edit-name').value.trim(),
            patronymic: document.getElementById('edit-patronymic').value.trim() || null,
            phoneNumber: document.getElementById('edit-phone').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            drivingSchool_ID: parseInt(document.getElementById('edit-driving-school').value)
        };

        const newCar = {
            brand: document.getElementById('edit-car-brand').value.trim(),
            model: document.getElementById('edit-car-model').value.trim(),
            color: document.getElementById('edit-car-color').value.trim(),
            car_Number: document.getElementById('edit-car-number').value.trim()
        };

        if (!validateFormData(newInstructor, newCar, errorMessage)) return;

        try {
            const carResponse = await fetch('https://localhost:7174/cars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCar)
            });

            if (!carResponse.ok) throw new Error((await carResponse.json()).message || 'Не удалось создать автомобиль');

            const carData = await carResponse.json();
            newInstructor.car_ID = carData.id;

            const instructorResponse = await fetch('https://localhost:7174/instructor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInstructor)
            });

            if (!instructorResponse.ok) throw new Error((await instructorResponse.json()).message || 'Не удалось создать инструктора');

            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            fetchInstructors();
        } catch (error) {
            console.error('Ошибка добавления данных:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

// Валидация данных формы
function validateFormData(instructor, car, errorMessage) {
    const formInputs = document.querySelectorAll('.edit-form input, .edit-form select');
    formInputs.forEach(input => input.classList.remove('error'));

    const missingFields = [];

    if (!instructor.surname) missingFields.push('Фамилия');
    if (!instructor.name) missingFields.push('Имя');
    if (!instructor.phoneNumber) missingFields.push('Телефон');
    if (!instructor.email) missingFields.push('Email');
    if (!instructor.drivingSchool_ID) missingFields.push('Автошкола');

    if (!car.brand) missingFields.push('Марка автомобиля');
    if (!car.model) missingFields.push('Модель автомобиля');
    if (!car.color) missingFields.push('Цвет автомобиля');
    if (!car.car_Number) missingFields.push('Регистрационный номер');

    if (missingFields.length > 0) {
        errorMessage.textContent = `Заполните обязательные поля: ${missingFields.join(', ')}`;
        errorMessage.style.display = 'block';

        if (!instructor.surname) document.getElementById('edit-surname').classList.add('error');
        if (!instructor.name) document.getElementById('edit-name').classList.add('error');
        if (!instructor.phoneNumber) document.getElementById('edit-phone').classList.add('error');
        if (!instructor.email) document.getElementById('edit-email').classList.add('error');
        if (!instructor.drivingSchool_ID) document.getElementById('edit-driving-school').classList.add('error');
        if (!car.brand) document.getElementById('edit-car-brand').classList.add('error');
        if (!car.model) document.getElementById('edit-car-model').classList.add('error');
        if (!car.color) document.getElementById('edit-car-color').classList.add('error');
        if (!car.car_Number) document.getElementById('edit-car-number').classList.add('error');

        return false;
    }

    return true;
}

// Ограничение доступа
function restrictAccess(allowedRoles) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.user_Type || !allowedRoles.includes(user.user_Type)) {
        window.location.href = '/auth.html';
        return false;
    }
    return true;
}