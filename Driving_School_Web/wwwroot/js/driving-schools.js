let state = {
    drivingSchools: [], // Список автошкол для фильтрайии
    cities: [], // Список городов для фильтрации
    filters: { // Фильтры
        city: '',
        address: ''
    },
    tempFilters: {
        city: '',
        address: ''
    },
    currentPage: 1, // Текущая страница
    pageSize: 10, // Размер страницы
    totalPages: 1 // Общее количество страниц
};

document.addEventListener('DOMContentLoaded', async () => {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('driving-schools.html')) {
        // Проверка доступа для администраторов и инструкторов
        if (!restrictAccess([ROLES.ADMIN, ROLES.INSTRUCTOR])) return;

        const profileData = JSON.parse(localStorage.getItem('profileData'));
        const drivingSchools = JSON.parse(localStorage.getItem('drivingSchools')) || [];
        const cities = JSON.parse(localStorage.getItem('cities')) || [];
        const citySelect = document.getElementById('city-filter');

        // Установка фильтра по городу пользователя перед загрузкой данных
        if (profileData && profileData.drivingSchool_ID) {
            const userDrivingSchool = drivingSchools.find(ds => ds.id === profileData.drivingSchool_ID);
            if (userDrivingSchool && userDrivingSchool.city_ID) {
                const userCityId = userDrivingSchool.city_ID.toString();
                state.filters.city = userCityId;
                state.tempFilters.city = userCityId;
                if (citySelect) {
                    citySelect.value = userCityId;
                    citySelect.dispatchEvent(new Event('change'));
                }
            }
        }

        // Загрузка списка автошкол
        await fetchDrivingSchools();

        const user = JSON.parse(localStorage.getItem('user'));
        // Скрытие кнопки "Добавить" для инструкторов
        if (user.user_Type !== ROLES.ADMIN) {
            const addBtn = document.getElementById('add-driving-school');
            if (addBtn) addBtn.style.display = 'none';
        }

        // Обработчик кнопки "Предыдущая страница"
        document.getElementById('prev-page').addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                fetchDrivingSchools();
            }
        });

        // Обработчик кнопки "Следующая страница"
        document.getElementById('next-page').addEventListener('click', () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                fetchDrivingSchools();
            }
        });

        // Обработчик кнопки сброса фильтров
        document.getElementById('reset-filters').addEventListener('click', () => {
            state.filters = { city: '', address: '' };
            state.tempFilters = { city: '', address: '' };
            document.getElementById('city-filter').value = '';
            document.getElementById('address-filter').value = '';
            state.currentPage = 1;
            fetchDrivingSchools();
        });

        // Обработчик кнопки применения фильтров
        document.getElementById('apply-filters').addEventListener('click', () => {
            state.filters = { ...state.tempFilters };
            const citySelect = document.getElementById('city-filter');
            const selectedCity = state.filters.city;

            if (citySelect) {
                citySelect.value = selectedCity || '';
            }
            state.currentPage = 1;
            fetchDrivingSchools();
        });

        // Обработчик изменения фильтра по городу
        document.getElementById('city-filter').addEventListener('change', () => {
            state.tempFilters.city = document.getElementById('city-filter').value;
        });

        // Обработчик ввода адреса
        document.getElementById('address-filter').addEventListener('input', () => {
            state.tempFilters.address = document.getElementById('address-filter').value.trim().toLowerCase();
        });

        // Обработчик изменения размера страницы
        const pageSizeSelect = document.getElementById('page-size');
        pageSizeSelect.addEventListener('change', () => {
            state.pageSize = parseInt(pageSizeSelect.value);
            state.currentPage = 1;
            fetchDrivingSchools();
        });

        // Обработчик кнопки добавления автошколы
        document.getElementById('add-driving-school').addEventListener('click', () => {
            showAddModal();
        });
    }
});

// Функция загрузки списка автошкол
async function fetchDrivingSchools() {
    const drivingSchoolsList = document.getElementById('driving-schools-list');
    if (!drivingSchoolsList) {
        console.error('Элемент с id "driving-schools-list" не найден');
        return;
    }

    try {
        // Загрузка городов, если они ещё не загружены
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

        // Формирование объекта фильтра для запроса
        const cityId = state.filters.city ? parseInt(state.filters.city) : null;
        const filter = {
            cityId: isNaN(cityId) ? null : cityId,
            address: state.filters.address,
            page: state.currentPage,
            pageSize: state.pageSize
        };

        // Отправка запроса на сервер
        const response = await fetch('https://localhost:7174/driving_Schools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filter)
        });

        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось загрузить автошколы');
        const responseData = await response.json();

        state.drivingSchools = Array.isArray(responseData.data) ? responseData.data : [];
        state.totalPages = responseData.totalPages || 1;

        // Инициализация фильтров при первой загрузке
        if (state.currentPage === 1 && !document.getElementById('address-filter').value) {
            initFilters();
        }
        initTableHeader();
        render();

        // Восстановление значений фильтров в полях
        document.getElementById('city-filter').value = state.filters.city;
        document.getElementById('address-filter').value = state.filters.address;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        drivingSchoolsList.innerHTML = `<tr><td colspan="5">Ошибка: ${error.message}</td></tr>`;
    }
}

// Инициализация выпадающего списка фильтров
function initFilters() {
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
    }
}

// Инициализация заголовков таблицы
function initTableHeader() {
    const headers = document.querySelectorAll('#driving-schools-table th');
    const user = JSON.parse(localStorage.getItem('user'));
    const headerTitles = user.user_Type === ROLES.ADMIN ?
        ['Адрес', 'Город', 'Телефон', 'Email', 'Действия'] :
        ['Адрес', 'Город', 'Телефон', 'Email'];
    headers.forEach((header, index) => {
        header.textContent = headerTitles[index];
        header.style.cursor = 'default';
    });
}

// Отображение модального окна подтверждения удаления
function showDeleteModal(id) {
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'flex';

    const confirmButton = document.getElementById('confirm-delete');
    const cancelButton = document.getElementById('cancel-delete');

    const newConfirmButton = confirmButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newConfirmButton.addEventListener('click', async () => {
        modal.style.display = 'none';
        try {
            const response = await fetch(`https://localhost:7174/driving_Schools/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось удалить автошколу');
            fetchDrivingSchools();
        } catch (error) {
            console.error('Ошибка удаления автошколы:', error);
            alert(`Ошибка при удалении автошколы: ${error.message}`);
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Отображение модального окна редактирования автошколы
function showEditModal(school) {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'flex';

    document.getElementById('edit-address').value = school.address || '';
    document.getElementById('edit-phoneNumber').value = school.phoneNumber || '';
    document.getElementById('edit-email').value = school.email || '';

    const citySelect = document.getElementById('edit-city');
    citySelect.innerHTML = '<option value="">Выберите город</option>';
    state.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        citySelect.appendChild(option);
    });
    if (school.city_ID) citySelect.value = school.city_ID;

    const errorMessage = document.getElementById('edit-error');
    errorMessage.style.display = 'none';

    const saveButton = document.getElementById('save-edit');
    const cancelButton = document.getElementById('cancel-edit');

    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newSaveButton.addEventListener('click', async () => {
        const updatedSchool = {
            address: document.getElementById('edit-address').value.trim(),
            phoneNumber: document.getElementById('edit-phoneNumber').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            city_ID: parseInt(document.getElementById('edit-city').value) || null
        };

        if (!validateFormData(updatedSchool, errorMessage, 'edit')) return;

        try {
            const response = await fetch(`https://localhost:7174/driving_Schools/${school.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSchool)
            });

            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось обновить автошколу');

            modal.style.display = 'none';
            fetchDrivingSchools();
        } catch (error) {
            console.error('Ошибка обновления автошколы:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Отображение модального окна добавления автошколы
function showAddModal() {
    const modal = document.getElementById('add-modal');
    modal.style.display = 'flex';

    const citySelect = document.getElementById('add-city');
    const newCityContainer = document.getElementById('new-city-input');
    const newCityInput = document.getElementById('add-new-city-name');
    const newCityButton = document.getElementById('add-new-city');
    const cancelNewCityButton = document.getElementById('cancel-new-city');

    citySelect.innerHTML = '<option value="">Выберите город</option>';
    state.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        citySelect.appendChild(option);
    });
    newCityContainer.style.display = 'none';
    newCityInput.value = '';
    document.getElementById('add-address').value = '';
    document.getElementById('add-phoneNumber').value = '';
    document.getElementById('add-email').value = '';
    citySelect.value = '';

    const errorMessage = document.getElementById('add-error');
    errorMessage.style.display = 'none';

    newCityButton.addEventListener('click', () => {
        newCityContainer.style.display = 'flex';
        citySelect.style.display = 'none';
        newCityButton.style.display = 'none';
    });

    cancelNewCityButton.addEventListener('click', () => {
        newCityContainer.style.display = 'none';
        citySelect.style.display = 'block';
        newCityButton.style.display = 'block';
        newCityInput.value = '';
    });

    const saveButton = document.getElementById('save-add');
    const cancelButton = document.getElementById('cancel-add');

    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newSaveButton.addEventListener('click', async () => {
        let cityId = parseInt(citySelect.value);
        const newCityName = newCityInput.value.trim();

        const newSchool = {
            address: document.getElementById('add-address').value.trim(),
            phoneNumber: document.getElementById('add-phoneNumber').value.trim(),
            email: document.getElementById('add-email').value.trim(),
            city_ID: cityId
        };

        if (newCityContainer.style.display === 'flex' && !newCityName) {
            errorMessage.textContent = 'Пожалуйста, введите название нового города';
            errorMessage.style.display = 'block';
            newCityInput.classList.add('error');
            return;
        }

        if (!validateFormData(newSchool, errorMessage, 'add')) return;

        if (newCityContainer.style.display === 'flex' && newCityName) {
            try {
                const cityResponse = await fetch('https://localhost:7174/city', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newCityName })
                });
                if (!cityResponse.ok) throw new Error((await cityResponse.json()).message || 'Не удалось добавить город');
                const newCity = await cityResponse.json();
                cityId = newCity.id;
                state.cities.push(newCity);
                newSchool.city_ID = cityId;
            } catch (error) {
                console.error('Ошибка добавления города:', error);
                errorMessage.textContent = `Ошибка при добавлении города: ${error.message}`;
                errorMessage.style.display = 'block';
                return;
            }
        }

        try {
            const response = await fetch('https://localhost:7174/driving_School', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchool)
            });

            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось добавить автошколу');

            modal.style.display = 'none';
            fetchDrivingSchools();
        } catch (error) {
            console.error('Ошибка добавления автошколы:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
        newCityContainer.style.display = 'none';
        citySelect.style.display = 'block';
        newCityButton.style.display = 'block';
        newCityInput.value = '';
    });
}

// Удаление автошколы
function deleteDrivingSchool(id) {
    showDeleteModal(id);
}

// Редактирование автошколы
async function editDrivingSchool(id) {
    const school = state.drivingSchools.find(s => s.id === id);
    if (school) {
        showEditModal(school);
    } else {
        alert('Автошкола не найдена');
    }
}

// Создание строки таблицы для автошколы
function createDrivingSchoolRow(school) {
    const user = JSON.parse(localStorage.getItem('user'));
    const row = document.createElement('tr');
    const city = state.cities.find(c => c.id === school.city_ID) || { name: 'Не указан' };

    const addressCell = document.createElement('td');
    addressCell.textContent = school.address || 'Не указан';
    row.appendChild(addressCell);

    const cityCell = document.createElement('td');
    cityCell.textContent = city.name;
    row.appendChild(cityCell);

    const phoneCell = document.createElement('td');
    phoneCell.textContent = school.phoneNumber || 'Не указан';
    row.appendChild(phoneCell);

    const emailCell = document.createElement('td');
    emailCell.textContent = school.email || 'Не указан';
    row.appendChild(emailCell);

    // Добавление кнопок действий для администратора
    if (user.user_Type === ROLES.ADMIN) {
        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.addEventListener('click', () => editDrivingSchool(school.id));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.addEventListener('click', () => deleteDrivingSchool(school.id));

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
    }

    return row;
}

// Отрисовка таблицы автошкол
function render() {
    const drivingSchoolsList = document.getElementById('driving-schools-list');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');

    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === state.totalPages || state.totalPages === 0;
    pageNumbers.innerHTML = `<span>Страница ${state.currentPage} из ${state.totalPages}</span>`;

    drivingSchoolsList.innerHTML = '';

    if (state.drivingSchools.length === 0) {
        drivingSchoolsList.innerHTML = '<tr><td colspan="5">Автошколы не найдены.</td></tr>';
        return;
    }

    state.drivingSchools.forEach(school => {
        drivingSchoolsList.appendChild(createDrivingSchoolRow(school));
    });
}

// Валидация данных формы
function validateFormData(school, errorMessage, prefix) {
    const formInputs = document.querySelectorAll(`#${prefix}-modal .edit-form input, #${prefix}-modal .edit-form select`);
    formInputs.forEach(input => input.classList.remove('error'));

    const missingFields = [];

    if (!school.address) missingFields.push('Адрес');
    if (!school.phoneNumber) missingFields.push('Телефон');
    if (!school.email) missingFields.push('Email');
    if (!school.city_ID) missingFields.push('Город');

    if (missingFields.length > 0) {
        errorMessage.textContent = `Пожалуйста, заполните обязательные поля: ${missingFields.join(', ')}`;
        errorMessage.style.display = 'block';

        if (!school.address) document.getElementById(`${prefix}-address`).classList.add('error');
        if (!school.phoneNumber) document.getElementById(`${prefix}-phoneNumber`).classList.add('error');
        if (!school.email) document.getElementById(`${prefix}-email`).classList.add('error');
        if (!school.city_ID) document.getElementById(`${prefix}-city`).classList.add('error');

        return false;
    }

    return true;
}