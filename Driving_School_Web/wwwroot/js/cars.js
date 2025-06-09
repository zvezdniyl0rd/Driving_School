let state = {
    cars: [], // Список автомобилей
    instructors: [], // Список инструкторов
    drivingSchools: [], // Список автошкол
    cities: [], // Список городов
    filters: { // Фильтры для поиска
        city: '',
        carNumber: ''
    },
    tempFilters: { // Временные фильтры
        city: '',
        carNumber: ''
    },
    currentPage: 1, // Текущая страница
    pageSize: 10, // Размер страницы
    totalPages: 1 // Общее количество страниц
};

document.addEventListener('DOMContentLoaded', async () => {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('cars.html')) {
        // Проверка доступа для администраторов и инструкторов
        if (!restrictAccess([ROLES.ADMIN, ROLES.INSTRUCTOR])) return;

        const user = JSON.parse(localStorage.getItem('user'));
        // Скрытие кнопки "Добавить" для инструкторов
        if (user.user_Type !== ROLES.ADMIN) {
            const addBtn = document.getElementById('add-car');
            if (addBtn) addBtn.style.display = 'none';
        }

        const profileData = JSON.parse(localStorage.getItem('profileData'));
        const drivingSchools = JSON.parse(localStorage.getItem('drivingSchools')) || [];
        const cities = JSON.parse(localStorage.getItem('cities')) || [];
        // Установка фильтра по городу пользователя перед загрузкой данных
        if (profileData && profileData.drivingSchool_ID) {
            const userDrivingSchool = drivingSchools.find(ds => ds.id === profileData.drivingSchool_ID);
            if (userDrivingSchool && userDrivingSchool.city_ID) {
                const userCityId = userDrivingSchool.city_ID.toString();
                state.filters.city = userCityId;
                state.tempFilters.city = userCityId;
                const cityFilter = document.getElementById('city-filter');
                if (cityFilter) {
                    cityFilter.value = userDrivingSchool.city_ID;
                    cityFilter.dispatchEvent(new Event('change'));
                }
            }
        }

        // Загрузка списка автомобилей
        await fetchCars();

        // Обработчик кнопки "Предыдущая страница"
        document.getElementById('prev-page').addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                fetchCars();
            }
        });

        // Обработчик кнопки "Следующая страница"
        document.getElementById('next-page').addEventListener('click', () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                fetchCars();
            }
        });

        // Обработчик сброса фильтров
        document.getElementById('reset-filters').addEventListener('click', () => {
            state.filters = { city: '', carNumber: '' };
            state.tempFilters = { city: '', carNumber: '' };
            document.getElementById('city-filter').value = '';
            document.getElementById('car-number-filter').value = '';
            state.currentPage = 1;
            fetchCars();
        });

        // Обработчик применения фильтров
        document.getElementById('apply-filters').addEventListener('click', () => {
            state.filters = { ...state.tempFilters };
            state.currentPage = 1;
            fetchCars();
        });

        // Обработчик изменения фильтра по городу
        document.getElementById('city-filter').addEventListener('change', () => {
            state.tempFilters.city = document.getElementById('city-filter').value;
        });

        // Обработчик ввода регистрационного номера
        document.getElementById('car-number-filter').addEventListener('input', () => {
            state.tempFilters.carNumber = document.getElementById('car-number-filter').value.trim().toLowerCase();
        });

        // Обработчик изменения размера страницы
        const pageSizeSelect = document.getElementById('page-size');
        pageSizeSelect.addEventListener('change', () => {
            state.pageSize = parseInt(pageSizeSelect.value);
            state.currentPage = 1;
            fetchCars();
        });

        // Обработчик кнопки добавления автомобиля
        document.getElementById('add-car').addEventListener('click', () => {
            showAddModal();
        });
    }
});

// Функция загрузки списка автомобилей
async function fetchCars() {
    const carsList = document.getElementById('cars-list');
    if (!carsList) {
        console.error('Элемент с id "cars-list" не найден');
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

        // Загрузка автошкол, если они ещё не загружены
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

        // Загрузка инструкторов, если они ещё не загружены
        if (!state.instructors.length) {
            try {
                const instructorsResponse = await fetch('https://localhost:7174/instructors');
                if (!instructorsResponse.ok) throw new Error((await instructorsResponse.json()).message || 'Не удалось загрузить инструкторов');
                state.instructors = await instructorsResponse.json();
            } catch (error) {
                console.error('Ошибка загрузки инструкторов:', error);
                state.instructors = [];
            }
        }

        // Загрузка автомобилей, если они ещё не загружены
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

        let filteredCars = state.cars;
        const cityId = state.filters.city ? parseInt(state.filters.city) : null;
        const carNumberFilter = state.filters.carNumber;

        // Фильтрация по городу через инструкторов и автошколы
        if (cityId) {
            filteredCars = filteredCars.filter(car => {
                const instructor = state.instructors.find(i => i.car_ID === car.id);
                if (!instructor) return false;
                const drivingSchool = state.drivingSchools.find(ds => ds.id === instructor.drivingSchool_ID);
                return drivingSchool && drivingSchool.city_ID === cityId;
            });
        }

        // Фильтрация по номеру автомобиля
        if (carNumberFilter) {
            filteredCars = filteredCars.filter(car =>
                car.car_Number.toLowerCase().includes(carNumberFilter)
            );
        }

        // Вычисление общего количества страниц
        state.totalPages = Math.ceil(filteredCars.length / state.pageSize) || 1;

        // Инициализация фильтров при первой загрузке
        if (state.currentPage === 1 && !document.getElementById('car-number-filter').value) {
            initFilters();
        }
        initTableHeader();
        render(filteredCars);

        // Восстановление значений фильтров в полях
        document.getElementById('city-filter').value = state.filters.city;
        document.getElementById('car-number-filter').value = state.filters.carNumber;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        carsList.innerHTML = `<tr><td colspan="6">Ошибка: ${error.message}</td></tr>`;
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

    // Восстановление фильтра по городу
    if (state.filters.city) {
        cityFilter.value = state.filters.city;
    }
}

// Инициализация заголовков таблицы
function initTableHeader() {
    const headers = document.querySelectorAll('#cars-table th');
    const user = JSON.parse(localStorage.getItem('user'));
    const headerTitles = user.user_Type === ROLES.ADMIN ?
        ['Марка', 'Модель', 'Цвет', 'Регистрационный номер', 'Город', 'Действия'] :
        ['Марка', 'Модель', 'Цвет', 'Регистрационный номер', 'Город'];
    headers.forEach((header, index) => {
        header.textContent = headerTitles[index];
        header.style.cursor = 'default';
    });
}

// Отображение модального окна для подтверждения удаления
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
            const response = await fetch(`https://localhost:7174/cars/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось удалить автомобиль');
            fetchCars();
        } catch (error) {
            console.error('Ошибка удаления автомобиля:', error);
            alert(`Ошибка при удалении автомобиля: ${error.message}`);
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Отображение модального окна для редактирования автомобиля
function showEditModal(car) {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'flex';

    document.getElementById('edit-brand').value = car.brand || '';
    document.getElementById('edit-model').value = car.model || '';
    document.getElementById('edit-color').value = car.color || '';
    document.getElementById('edit-car-number').value = car.car_Number || '';

    const errorMessage = document.getElementById('edit-error');
    errorMessage.style.display = 'none';

    const saveButton = document.getElementById('save-edit');
    const cancelButton = document.getElementById('cancel-edit');

    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newSaveButton.addEventListener('click', async () => {
        const updatedCar = {
            brand: document.getElementById('edit-brand').value.trim(),
            model: document.getElementById('edit-model').value.trim(),
            color: document.getElementById('edit-color').value.trim(),
            car_Number: document.getElementById('edit-car-number').value.trim()
        };

        if (!validateFormData(updatedCar, errorMessage, 'edit')) return;

        try {
            const response = await fetch(`https://localhost:7174/cars/${car.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCar)
            });

            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось обновить автомобиль');

            modal.style.display = 'none';
            fetchCars();
        } catch (error) {
            console.error('Ошибка обновления автомобиля:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Отображение модального окна для добавления автомобиля
function showAddModal() {
    const modal = document.getElementById('add-modal');
    modal.style.display = 'flex';

    document.getElementById('add-brand').value = '';
    document.getElementById('add-model').value = '';
    document.getElementById('add-color').value = '';
    document.getElementById('add-car-number').value = '';

    const errorMessage = document.getElementById('add-error');
    errorMessage.style.display = 'none';

    const saveButton = document.getElementById('save-add');
    const cancelButton = document.getElementById('cancel-add');

    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newSaveButton.addEventListener('click', async () => {
        const newCar = {
            brand: document.getElementById('add-brand').value.trim(),
            model: document.getElementById('add-model').value.trim(),
            color: document.getElementById('add-color').value.trim(),
            car_Number: document.getElementById('add-car-number').value.trim()
        };

        if (!validateFormData(newCar, errorMessage, 'add')) return;

        try {
            const response = await fetch('https://localhost:7174/cars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCar)
            });

            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось добавить автомобиль');

            modal.style.display = 'none';
            fetchCars();
        } catch (error) {
            console.error('Ошибка добавления автомобиля:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Удаление автомобиля
function deleteCar(id) {
    showDeleteModal(id);
}

// Редактирование автомобиля
async function editCar(id) {
    const car = state.cars.find(c => c.id === id);
    if (car) {
        showEditModal(car);
    } else {
        alert('Автомобиль не найден');
    }
}

// Создание строки таблицы для автомобиля
function createCarRow(car) {
    const user = JSON.parse(localStorage.getItem('user'));
    const row = document.createElement('tr');

    const brandCell = document.createElement('td');
    brandCell.textContent = car.brand || 'Не указана';
    row.appendChild(brandCell);

    const modelCell = document.createElement('td');
    modelCell.textContent = car.model || 'Не указана';
    row.appendChild(modelCell);

    const colorCell = document.createElement('td');
    colorCell.textContent = car.color || 'Не указан';
    row.appendChild(colorCell);

    const carNumberCell = document.createElement('td');
    carNumberCell.textContent = car.car_Number || 'Не указан';
    row.appendChild(carNumberCell);

    const cityCell = document.createElement('td');
    let cityName = 'Не указан';
    const instructor = state.instructors.find(i => i.car_ID === car.id);
    if (instructor) {
        const drivingSchool = state.drivingSchools.find(ds => ds.id === instructor.drivingSchool_ID);
        if (drivingSchool) {
            const city = state.cities.find(c => c.id === drivingSchool.city_ID);
            cityName = city ? city.name : 'Не указан';
        }
    }
    cityCell.textContent = cityName;
    row.appendChild(cityCell);

    // Добавление кнопок действий для администратора
    if (user.user_Type === ROLES.ADMIN) {
        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.addEventListener('click', () => editCar(car.id));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.addEventListener('click', () => deleteCar(car.id));

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
    }

    return row;
}

// Отрисовка таблицы автомобилей
function render(filteredCars) {
    const carsList = document.getElementById('cars-list');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');

    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === state.totalPages || state.totalPages === 0;
    pageNumbers.innerHTML = `<span>Страница ${state.currentPage} из ${state.totalPages}</span>`;

    carsList.innerHTML = '';

    if (filteredCars.length === 0) {
        carsList.innerHTML = '<tr><td colspan="6">Автомобили не найдены.</td></tr>';
        return;
    }

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    filteredCars.slice(startIndex, endIndex).forEach(car => {
        carsList.appendChild(createCarRow(car));
    });
}

// Валидация данных формы
function validateFormData(car, errorMessage, prefix) {
    const formInputs = document.querySelectorAll(`#${prefix}-modal .edit-form input`);
    formInputs.forEach(input => input.classList.remove('error'));

    const missingFields = [];

    if (!car.brand) missingFields.push('Марка');
    if (!car.model) missingFields.push('Модель');
    if (!car.color) missingFields.push('Цвет');
    if (!car.car_Number) missingFields.push('Регистрационный номер');

    if (missingFields.length > 0) {
        errorMessage.textContent = `Пожалуйста, заполните обязательные поля: ${missingFields.join(', ')}`;
        errorMessage.style.display = 'block';

        if (!car.brand) document.getElementById(`${prefix}-brand`).classList.add('error');
        if (!car.model) document.getElementById(`${prefix}-model`).classList.add('error');
        if (!car.color) document.getElementById(`${prefix}-color`).classList.add('error');
        if (!car.car_Number) document.getElementById(`${prefix}-car-number`).classList.add('error');

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