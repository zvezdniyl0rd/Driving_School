let state = {
    accounts: [],
    cities: [],
    students: [],
    instructors: [],
    admins: [],
    drivingSchools: [],
    filters: {
        login: '',
        userType: '',
        fullName: '',
        city: '',
        drivingSchool: ''
    },
    tempFilters: {
        login: '',
        userType: '',
        fullName: '',
        city: '',
        drivingSchool: ''
    },
    currentPage: 1,
    pageSize: 10,
    totalPages: 1
};

document.addEventListener('DOMContentLoaded', async () => {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('accounts.html')) {
        if (!restrictAccess([ROLES.ADMIN, ROLES.INSTRUCTOR])) return;

        // Установка фильтра по городу из профиля перед загрузкой данных
        const profileData = JSON.parse(localStorage.getItem('profileData'));
        const drivingSchools = JSON.parse(localStorage.getItem('drivingSchools')) || [];
        const citySelect = document.getElementById('city-filter');
        const drivingSchoolSelect = document.getElementById('driving-school-filter');

        if (profileData && profileData.drivingSchool_ID) {
            const userDrivingSchool = drivingSchools.find(ds => ds.id === profileData.drivingSchool_ID);
            if (userDrivingSchool && userDrivingSchool.city_ID) {
                const userCityId = userDrivingSchool.city_ID.toString();
                state.filters.city = userCityId;
                state.tempFilters.city = userCityId;
                if (citySelect) {
                    citySelect.value = userCityId;
                    updateDrivingSchoolFilter(userCityId, drivingSchoolSelect);
                    citySelect.dispatchEvent(new Event('change'));
                }
            }
        }

        // Загрузка данных после установки фильтра
        initFilters();
        await fetchAccounts();

        document.getElementById('prev-page').addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                fetchAccounts();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                fetchAccounts();
            }
        });

        document.getElementById('reset-filters').addEventListener('click', () => {
            state.filters = {
                login: '',
                userType: '',
                fullName: '',
                city: '',
                drivingSchool: ''
            };
            state.tempFilters = {
                login: '',
                userType: '',
                fullName: '',
                city: '',
                drivingSchool: ''
            };
            document.getElementById('login-filter').value = '';
            document.getElementById('user-type-filter').value = '';
            document.getElementById('full-name-filter').value = '';
            document.getElementById('city-filter').value = '';
            document.getElementById('driving-school-filter').value = '';
            updateDrivingSchoolFilter('', document.getElementById('driving-school-filter'));
            // Переустановка фильтра по городу из профиля при сбросе
            if (profileData && profileData.drivingSchool_ID) {
                const userDrivingSchool = state.drivingSchools.find(ds => ds.id === profileData.drivingSchool_ID);
                if (userDrivingSchool && userDrivingSchool.city_ID) {
                    const userCityId = userDrivingSchool.city_ID.toString();
                    state.filters.city = userCityId;
                    state.tempFilters.city = userCityId;
                    document.getElementById('city-filter').value = userCityId;
                    updateDrivingSchoolFilter(userCityId, drivingSchoolSelect);
                    citySelect.dispatchEvent(new Event('change'));
                }
            }

            state.currentPage = 1;
            fetchAccounts();
        });

        document.getElementById('apply-filters').addEventListener('click', () => {
            state.filters = { ...state.tempFilters };
            const citySelect = document.getElementById('city-filter');
            const drivingSchoolSelect = document.getElementById('driving-school-filter');
            const selectedCity = state.filters.city;
            if (citySelect) {
                citySelect.value = selectedCity || '';
            }
            if (selectedCity) {
                updateDrivingSchoolFilter(selectedCity, drivingSchoolSelect);
                const validDrivingSchool = Array.from(drivingSchoolSelect.options).some(option => option.value === state.filters.drivingSchool);
                drivingSchoolSelect.value = validDrivingSchool ? state.filters.drivingSchool : '';
                if (!validDrivingSchool && state.filters.drivingSchool) {
                    state.filters.drivingSchool = '';
                    state.tempFilters.drivingSchool = '';
                }
            } else {
                updateDrivingSchoolFilter('', drivingSchoolSelect);
                drivingSchoolSelect.value = state.filters.drivingSchool || '';
            }
            state.currentPage = 1;
            fetchAccounts();
        });

        document.getElementById('login-filter').addEventListener('input', () => {
            state.tempFilters.login = document.getElementById('login-filter').value.trim().toLowerCase();
        });

        document.getElementById('user-type-filter').addEventListener('change', () => {
            state.tempFilters.userType = document.getElementById('user-type-filter').value;
        });

        document.getElementById('full-name-filter').addEventListener('input', () => {
            state.tempFilters.fullName = document.getElementById('full-name-filter').value.trim().toLowerCase();
        });

        document.getElementById('city-filter').addEventListener('change', (e) => {
            const cityId = e.target.value;
            state.tempFilters.city = cityId;
            const drivingSchoolSelect = document.getElementById('driving-school-filter');
            updateDrivingSchoolFilter(cityId, drivingSchoolSelect);
            state.tempFilters.drivingSchool = '';
            drivingSchoolSelect.value = '';
        });

        document.getElementById('driving-school-filter').addEventListener('change', () => {
            state.tempFilters.drivingSchool = document.getElementById('driving-school-filter').value;
        });

        const pageSizeSelect = document.getElementById('page-size');
        pageSizeSelect.addEventListener('change', () => {
            state.pageSize = parseInt(pageSizeSelect.value);
            state.currentPage = 1;
            fetchAccounts();
        });

        document.getElementById('add-account').addEventListener('click', () => {
            showAddModal();
        });
    }
});

async function fetchAccounts() {
    const accountsList = document.getElementById('accounts-list');
    if (!accountsList) {
        console.error('Элемент с id "accounts-list" не найден');
        return;
    }

    try {
        if (!state.cities.length) {
            try {
                const citiesResponse = await fetch('https://localhost:7174/city');
                if (!citiesResponse.ok) {
                    const errorData = await citiesResponse.json();
                    throw new Error(errorData.message || 'Не удалось загрузить города');
                }
                state.cities = await citiesResponse.json();
                console.log('Загруженные города:', state.cities);
                localStorage.setItem('cities', JSON.stringify(state.cities));
            } catch (error) {
                console.error('Ошибка при загрузке городов:', error);
                state.cities = [];
                accountsList.innerHTML = `<tr><td colspan="7">Ошибка загрузки городов: ${error.message}</td></tr>`;
                return;
            }
        }

        if (!state.drivingSchools.length) {
            try {
                let drivingSchools = JSON.parse(localStorage.getItem('drivingSchools'));
                if (!drivingSchools) {
                    const drivingSchoolsResponse = await fetch('https://localhost:7174/driving_Schools');
                    if (!drivingSchoolsResponse.ok) {
                        const errorData = await drivingSchoolsResponse.json();
                        throw new Error(errorData.message || 'Не удалось загрузить автошколы');
                    }
                    drivingSchools = await drivingSchoolsResponse.json();
                    localStorage.setItem('drivingSchools', JSON.stringify(drivingSchools));
                }
                state.drivingSchools = drivingSchools;
                console.log('Загруженные автошколы:', state.drivingSchools);
            } catch (error) {
                console.error('Ошибка при загрузке автошкол:', error);
                state.drivingSchools = [];
                accountsList.innerHTML = `<tr><td colspan="7">Ошибка загрузки автошкол: ${error.message}</td></tr>`;
                return;
            }
        }

        if (!state.students.length) {
            try {
                const studentsResponse = await fetch('https://localhost:7174/students');
                if (!studentsResponse.ok) {
                    const errorData = await studentsResponse.json();
                    throw new Error(errorData.message || 'Не удалось загрузить студентов');
                }
                state.students = await studentsResponse.json();
                console.log('Загруженные студенты:', state.students);
            } catch (error) {
                console.error('Ошибка при загрузке студентов:', error);
                state.students = [];
            }
        }

        if (!state.instructors.length) {
            try {
                const instructorsResponse = await fetch('https://localhost:7174/instructors');
                if (!instructorsResponse.ok) {
                    const errorData = await instructorsResponse.json();
                    throw new Error(errorData.message || 'Не удалось загрузить инструкторов');
                }
                state.instructors = await instructorsResponse.json();
                console.log('Загруженные инструкторы:', state.instructors);
            } catch (error) {
                console.error('Ошибка при загрузке инструкторов:', error);
                state.instructors = [];
            }
        }

        if (!state.admins.length) {
            try {
                const adminsResponse = await fetch('https://localhost:7174/admins');
                if (!adminsResponse.ok) {
                    const errorData = await adminsResponse.json();
                    throw new Error(errorData.message || 'Не удалось загрузить администраторов');
                }
                state.admins = await adminsResponse.json();
                console.log('Загруженные администраторы:', state.admins);
            } catch (error) {
                console.error('Ошибка при загрузке администраторов:', error);
                state.admins = [];
            }
        }

        const cityId = state.filters.city ? parseInt(state.filters.city) : null;
        const drivingSchoolId = state.filters.drivingSchool ? parseInt(state.filters.drivingSchool) : null;
        const filter = {
            login: state.filters.login,
            userType: state.filters.userType ? parseInt(state.filters.userType) : null,
            fullName: state.filters.fullName,
            cityId: isNaN(cityId) ? null : cityId,
            drivingSchool_Id: isNaN(drivingSchoolId) ? null : drivingSchoolId,
            page: state.currentPage,
            pageSize: state.pageSize
        };

        const accountsResponse = await fetch('https://localhost:7174/accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filter)
        });

        if (!accountsResponse.ok) {
            const errorData = await accountsResponse.json();
            throw new Error(errorData.message || 'Не удалось загрузить аккаунты');
        }
        const responseData = await accountsResponse.json();
        console.log('Загруженные аккаунты:', responseData);

        state.accounts = responseData.data.map(account => {
            let linkedUser = null;
            if (account.student_ID) {
                linkedUser = state.students.find(student => student.id === account.student_ID);
            } else if (account.instructor_ID) {
                linkedUser = state.instructors.find(instructor => instructor.id === account.instructor_ID);
            } else if (account.admin_ID) {
                linkedUser = state.admins.find(admin => admin.id === account.admin_ID);
            }
            return { ...account, linkedUser };
        });
        console.log('Обновлённый state.accounts:', state.accounts);

        state.totalPages = responseData.totalPages || 1;

        // Инициализация фильтров после загрузки городов
        if (state.currentPage === 1 && !document.getElementById('login-filter').value) {
            initFilters();
        }
        initTableHeader();
        render();

        // Восстановление значений фильтров
        document.getElementById('login-filter').value = state.filters.login;
        document.getElementById('user-type-filter').value = state.filters.userType || '';
        document.getElementById('full-name-filter').value = state.filters.fullName;
        document.getElementById('city-filter').value = state.filters.city || '';
        updateDrivingSchoolFilter(state.filters.city, document.getElementById('driving-school-filter'));
        document.getElementById('driving-school-filter').value = state.filters.drivingSchool || '';
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        accountsList.innerHTML = `<tr><td colspan="7">Ошибка: ${error.message}</td></tr>`;
    }
}

function initFilters() {
    const drivingSchoolFilter = document.getElementById('driving-school-filter');
    const cityFilter = document.getElementById('city-filter');

    if (!cityFilter || !drivingSchoolFilter) return;

    // Заполнение выпадающего списка городов
    cityFilter.innerHTML = '<option value="">Любой</option>';
    state.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        cityFilter.appendChild(option);
    });

    // Заполнение выпадающего списка автошкол
    drivingSchoolFilter.innerHTML = '<option value="">Любая</option>';

    // Восстановление фильтра по городу из профиля
    if (state.filters.city) {
        cityFilter.value = state.filters.city;
        updateDrivingSchoolFilter(state.filters.city, drivingSchoolFilter);
    }

    // Восстановление фильтра по автошколе, если он задан
    if (state.filters.drivingSchool) {
        drivingSchoolFilter.value = state.filters.drivingSchool;
    }
}

function initTableHeader() {
    const headers = document.querySelectorAll('#accounts-table th');
    const headerTitles = [
        'Логин (номер телефона)',
        'Пароль',
        'Тип пользователя',
        'ФИО',
        'Город',
        'Автошкола',
        'Действия'
    ];
    headers.forEach((header, index) => {
        header.textContent = headerTitles[index];
        header.style.cursor = 'default';
    });
}

function updateDrivingSchoolFilter(cityId, drivingSchoolSelect) {
    if (!drivingSchoolSelect) return;
    drivingSchoolSelect.innerHTML = '<option value="">Любая</option>';
    const parsedCityId = cityId ? parseInt(cityId) : null;
    if (parsedCityId) {
        const filteredSchools = state.drivingSchools.filter(ds => ds.city_ID === parsedCityId);
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
    drivingSchoolSelect.disabled = !parsedCityId;
}

function highlightText(text, query) {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

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
            // Поиск аккаунта по ID
            const account = state.accounts.find(a => a.id === id);
            if (!account) {
                throw new Error('Аккаунт не найден');
            }

            // Определение типа пользователя и ID связанного пользователя
            let userDeleteUrl = null;
            let userId = null;

            switch (account.user_Type) {
                case 2: // Студент
                    userId = account.student_ID;
                    userDeleteUrl = `https://localhost:7174/students/${userId}`;
                    break;
                case 1: // Инструктор
                    userId = account.instructor_ID;
                    userDeleteUrl = `https://localhost:7174/instructors/${userId}`;
                    break;
                case 3: // Администратор
                    userId = account.admin_ID;
                    userDeleteUrl = `https://localhost:7174/admins/${userId}`;
                    break;
                default:
                    throw new Error('Неизвестный тип пользователя');
            }

            // Удаление аккаунта
            const accountResponse = await fetch(`https://localhost:7174/accounts/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!accountResponse.ok) {
                const errorData = await accountResponse.json();
                throw new Error(errorData.message || 'Не удалось удалить аккаунт');
            }

            // Удаление пользователя, если он существует
            if (userId && userDeleteUrl) {
                const userResponse = await fetch(userDeleteUrl, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!userResponse.ok) {
                    const errorData = await userResponse.json();
                    throw new Error(errorData.message || `Не удалось удалить пользователя (тип: ${account.user_Type})`);
                }
            }
            
            // Обновление таблицы аккаунтов
            fetchAccounts();
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert(`Ошибка: ${error.message}`);
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

function showEditModal(account) {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'flex';

    document.getElementById('edit-login').value = account.login || '';
    document.getElementById('edit-password').value = account.password || '';

    const errorMessage = document.getElementById('edit-error');
    errorMessage.style.display = 'none';

    const saveButton = document.getElementById('save-edit');
    const cancelButton = document.getElementById('cancel-edit');

    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newSaveButton.addEventListener('click', async () => {
        const updatedAccount = {
            login: document.getElementById('edit-login').value.trim(),
            password: document.getElementById('edit-password').value.trim()
        };

        if (!updatedAccount.login || !updatedAccount.password) {
            errorMessage.textContent = 'Пожалуйста, заполните все обязательные поля (логин, пароль)';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`https://localhost:7174/account/${account.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedAccount)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Не удалось обновить аккаунт');
            }

            modal.style.display = 'none';
            fetchAccounts();
        } catch (error) {
            console.error('Ошибка при обновлении аккаунта:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

function showAddModal() {
    const modal = document.getElementById('add-modal');
    modal.style.display = 'flex';

    const formContainer = document.getElementById('add-form');
    const userTypeSelect = document.getElementById('add-user-type');
    const errorMessage = document.getElementById('add-error');

    userTypeSelect.innerHTML = `
        <option value="">Выберите тип пользователя</option>
        <option value="2">Студент</option>
        <option value="1">Инструктор</option>
        <option value="3">Администратор</option>
    `;
    formContainer.innerHTML = '';
    errorMessage.style.display = 'none';
    userTypeSelect.classList.remove('error');

    userTypeSelect.removeEventListener('change', handleUserTypeChange);
    userTypeSelect.addEventListener('change', handleUserTypeChange);

    function handleUserTypeChange() {
        const userType = userTypeSelect.value;
        formContainer.innerHTML = '';
        userTypeSelect.classList.remove('error');
        errorMessage.style.display = 'none';
        createDynamicForm(userType, formContainer);
    }

    const saveButton = document.getElementById('save-add');
    const cancelButton = document.getElementById('cancel-add');

    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    newSaveButton.addEventListener('click', async () => {
        const userType = userTypeSelect.value;

        if (!userType) {
            errorMessage.textContent = 'Пожалуйста, выберите тип пользователя';
            errorMessage.style.display = 'block';
            userTypeSelect.classList.add('error');
            return;
        }

        const formData = collectFormData(userType);

        if (!validateFormData(userType, formData, errorMessage)) return;

        try {
            let response;
            switch (userType) {
                case '2':
                    response = await fetch('https://localhost:7174/register/student', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    break;
                case '1':
                    response = await fetch('https://localhost:7174/register/instructor', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    break;
                case '3':
                    response = await fetch('https://localhost:7174/register/admin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    break;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Не удалось создать аккаунт');
            }
            modal.style.display = 'none';
            fetchAccounts();
        } catch (error) {
            console.error('Ошибка при добавлении аккаунта:', error);
            errorMessage.textContent = `Ошибка: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
        userTypeSelect.classList.remove('error');
        errorMessage.style.display = 'none';
    });
}

function createDynamicForm(userType, container) {
    const cities = state.cities || [];
    const drivingSchools = state.drivingSchools || [];

    const form = document.createElement('div');
    form.className = 'dynamic-form';

    let cityOptions = cities.map(city => `<option value="${city.id}">${city.name}</option>`).join('');
    let drivingSchoolOptions = '<option value="">Выберите автошколу</option>';

    switch (userType) {
        case '2':
            form.innerHTML = `
                <label for="add-surname" class="required">Фамилия:</label>
                <input type="text" id="add-surname" placeholder="Введите фамилию" required>
                <label for="add-name" class="required">Имя:</label>
                <input type="text" id="add-name" placeholder="Введите имя" required>
                <label for="add-patronymic">Отчество (если есть):</label>
                <input type="text" id="add-patronymic" placeholder="Введите отчество">
                <label for="add-phoneNumber" class="required">Номер телефона (логин):</label>
                <input type="text" id="add-phoneNumber" placeholder="Введите номер телефона" required>
                <label for="add-password" class="required">Пароль:</label>
                <input type="password" id="add-password" placeholder="Введите пароль" required>
                <label for="add-birthdate" class="required">День рождения:</label>
                <input type="date" id="add-birthdate" required>
                <label for="add-email">Email:</label>
                <input type="email" id="add-email" placeholder="Введите email">
                <label for="add-city" class="required">Город:</label>
                <select id="add-city" required>
                    <option value="">Выберите город</option>
                    ${cityOptions}
                </select>
                <label for="add-drivingSchool" class="required">Автошкола:</label>
                <select id="add-drivingSchool" required>
                    ${drivingSchoolOptions}
                </select>
            `;
            break;
        case '1':
            form.innerHTML = `
                <label for="add-surname" class="required">Фамилия:</label>
                <input type="text" id="add-surname" placeholder="Введите фамилию" required>
                <label for="add-name" class="required">Имя:</label>
                <input type="text" id="add-name" placeholder="Введите имя" required>
                <label for="add-patronymic">Отчество (если есть):</label>
                <input type="text" id="add-patronymic" placeholder="Введите отчество">
                <label for="add-phoneNumber" class="required">Номер телефона (логин):</label>
                <input type="text" id="add-phoneNumber" placeholder="Введите номер телефона" required>
                <label for="add-password" class="required">Пароль:</label>
                <input type="password" id="add-password" placeholder="Введите пароль" required>
                <label for="add-email" class="required">Email:</label>
                <input type="email" id="add-email" placeholder="Введите email" required>
                <label for="add-city" class="required">Город:</label>
                <select id="add-city" required>
                    <option value="">Выберите город</option>
                    ${cityOptions}
                </select>
                <label for="add-drivingSchool" class="required">Автошкола:</label>
                <select id="add-drivingSchool" required>
                    ${drivingSchoolOptions}
                </select>
                <label for="add-car-brand" class="required">Марка автомобиля:</label>
                <input type="text" id="add-car-brand" placeholder="Введите марку" required>
                <label for="add-car-model" class="required">Модель автомобиля:</label>
                <input type="text" id="add-car-model" placeholder="Введите модель" required>
                <label for="add-car-color" class="required">Цвет автомобиля:</label>
                <input type="text" id="add-car-color" placeholder="Введите цвет" required>
                <label for="add-car-regNumber" class="required">Регистрационный номер:</label>
                <input type="text" id="add-car-regNumber" placeholder="Введите номер" required>
            `;
            break;
        case '3':
            form.innerHTML = `
                <label for="add-surname" class="required">Фамилия:</label>
                <input type="text" id="add-surname" placeholder="Введите фамилию" required>
                <label for="add-name" class="required">Имя:</label>
                <input type="text" id="add-name" placeholder="Введите имя" required>
                <label for="add-patronymic">Отчество (если есть):</label>
                <input type="text" id="add-patronymic" placeholder="Введите отчество">
                <label for="add-phoneNumber" class="required">Номер телефона (логин):</label>
                <input type="text" id="add-phoneNumber" placeholder="Введите номер телефона" required>
                <label for="add-password" class="required">Пароль:</label>
                <input type="password" id="add-password" placeholder="Введите пароль" required>
                <label for="add-email">Email:</label>
                <input type="email" id="add-email" placeholder="Введите email">
                <label for="add-city" class="required">Город:</label>
                <select id="add-city" required>
                    <option value="">Выберите город</option>
                    ${cityOptions}
                </select>
                <label for="add-drivingSchool" class="required">Автошкола:</label>
                <select id="add-drivingSchool" required>
                    ${drivingSchoolOptions}
                </select>
            `;
            break;
    }

    container.appendChild(form);

    const citySelect = container.querySelector('#add-city');
    const drivingSchoolSelect = container.querySelector('#add-drivingSchool');

    if (citySelect && drivingSchoolSelect) {
        const updateDrivingSchools = () => {
            const cityId = citySelect.value;
            drivingSchoolSelect.innerHTML = '<option value="">Выберите автошколу</option>';
            if (cityId) {
                const filteredSchools = state.drivingSchools.filter(school => school.city_ID === parseInt(cityId));
                filteredSchools.forEach(school => {
                    const option = document.createElement('option');
                    option.value = school.id;
                    option.textContent = school.address;
                    drivingSchoolSelect.appendChild(option);
                });
            }
        };

        citySelect.removeEventListener('change', updateDrivingSchools);
        citySelect.addEventListener('change', updateDrivingSchools);
    }
}

function collectFormData(userType) {
    const data = {
        surname: document.getElementById('add-surname')?.value.trim() || '',
        name: document.getElementById('add-name')?.value.trim() || '',
        patronymic: document.getElementById('add-patronymic')?.value.trim() || null,
        phoneNumber: document.getElementById('add-phoneNumber')?.value.trim() || '',
        password: document.getElementById('add-password')?.value.trim() || '',
        drivingSchool_ID: document.getElementById('add-drivingSchool')?.value ? parseInt(document.getElementById('add-drivingSchool').value) : null
    };

    switch (userType) {
        case '2':
            data.birthdate = document.getElementById('add-birthdate')?.value || '';
            data.email = document.getElementById('add-email')?.value.trim() || null;
            break;
        case '1':
            data.email = document.getElementById('add-email')?.value.trim() || '';
            data.carBrand = document.getElementById('add-car-brand')?.value.trim() || '';
            data.carModel = document.getElementById('add-car-model')?.value.trim() || '';
            data.carColor = document.getElementById('add-car-color')?.value.trim() || '';
            data.carNumber = document.getElementById('add-car-regNumber')?.value.trim() || '';
            break;
        case '3':
            data.email = document.getElementById('add-email')?.value.trim() || null;
            break;
    }

    return data;
}

function validateFormData(userType, data, errorMessage) {
    const formInputs = document.querySelectorAll('.dynamic-form input, .dynamic-form select');
    formInputs.forEach(input => input.classList.remove('error'));

    const missingFields = [];

    if (!data.surname) missingFields.push('Фамилия');
    if (!data.name) missingFields.push('Имя');
    if (!data.phoneNumber) missingFields.push('Номер телефона');
    if (!data.password) missingFields.push('Пароль');
    if (!data.drivingSchool_ID) {
        missingFields.push('Автошкола');
        document.getElementById('add-city').classList.add('error');
        document.getElementById('add-drivingSchool').classList.add('error');
    }

    if (userType === '2') {
        if (!data.birthdate) {
            missingFields.push('День рождения');
            document.getElementById('add-birthdate').classList.add('error');
        }
    }

    if (userType === '1') {
        if (!data.email) {
            missingFields.push('Email');
            document.getElementById('add-email').classList.add('error');
        }
        if (!data.carBrand) {
            missingFields.push('Марка автомобиля');
            document.getElementById('add-car-brand').classList.add('error');
        }
        if (!data.carModel) {
            missingFields.push('Модель автомобиля');
            document.getElementById('add-car-model').classList.add('error');
        }
        if (!data.carColor) {
            missingFields.push('Цвет автомобиля');
            document.getElementById('add-car-color').classList.add('error');
        }
        if (!data.carNumber) {
            missingFields.push('Регистрационный номер');
            document.getElementById('add-car-regNumber').classList.add('error');
        }
    }

    if (missingFields.length > 0) {
        errorMessage.textContent = `Пожалуйста, заполните обязательные поля: ${missingFields.join(', ')}`;
        errorMessage.style.display = 'block';

        if (!data.surname) document.getElementById('add-surname').classList.add('error');
        if (!data.name) document.getElementById('add-name').classList.add('error');
        if (!data.phoneNumber) document.getElementById('add-phoneNumber').classList.add('error');
        if (!data.password) document.getElementById('add-password').classList.add('error');

        return false;
    }

    return true;
}

function deleteAccount(accountId) {
    showDeleteModal(accountId);
}

async function editAccount(accountId) {
    const account = state.accounts.find(a => a.id === accountId);
    if (account) {
        showEditModal(account);
    } else {
        alert('Аккаунт не найден');
    }
}

function createAccountRow(account) {
    const row = document.createElement('tr');

    const loginCell = document.createElement('td');
    loginCell.innerHTML = highlightText(account.login, state.filters.login);
    row.appendChild(loginCell);

    const passwordCell = document.createElement('td');
    passwordCell.className = 'password-cell';
    const passwordSpan = document.createElement('span');
    passwordSpan.className = 'password-hidden';
    passwordSpan.textContent = account.password || 'Не указан';
    passwordCell.appendChild(passwordSpan);
    row.appendChild(passwordCell);

    const userTypeCell = document.createElement('td');
    userTypeCell.textContent = account.user_Type === 2 ? 'Студент' : account.user_Type === 1 ? 'Инструктор' : account.user_Type === 3 ? 'Администратор' : 'Неизвестный';
    row.appendChild(userTypeCell);

    const fullNameCell = document.createElement('td');
    const fullName = account.linkedUser
        ? `${account.linkedUser.surname} ${account.linkedUser.name} ${account.linkedUser.patronymic || ''}`.trim()
        : 'Не найден';
    fullNameCell.innerHTML = highlightText(fullName, state.filters.fullName);
    row.appendChild(fullNameCell);

    const cityCell = document.createElement('td');
    let cityName = 'Не определён';
    if (account.linkedUser) {
        if (account.linkedUser.drivingSchool_ID) {
            const drivingSchool = state.drivingSchools.find(ds => ds.id === account.linkedUser.drivingSchool_ID);
            if (drivingSchool && drivingSchool.city_ID) {
                const city = state.cities.find(c => c.id === drivingSchool.city_ID);
                cityName = city ? city.name : 'Не указан';
            } else {
                cityName = 'Автошкола не найдена';
            }
        } else {
            cityName = 'Автошкола не указана';
        }
    }
    cityCell.textContent = cityName;
    row.appendChild(cityCell);

    const drivingSchoolCell = document.createElement('td');
    let drivingSchoolInfo = 'Не указана автошкола';
    if (account.linkedUser && account.linkedUser.drivingSchool_ID) {
        const drivingSchool = state.drivingSchools.find(ds => ds.id === account.linkedUser.drivingSchool_ID);
        drivingSchoolInfo = drivingSchool
            ? `<span class="driving-school-address" data-school-contacts="Телефон: ${drivingSchool.phoneNumber}, Email: ${drivingSchool.email}">${drivingSchool.address}</span>`
            : 'Не указана автошкола';
    }
    drivingSchoolCell.innerHTML = drivingSchoolInfo;
    const addressElement = drivingSchoolCell.querySelector('.driving-school-address');
    if (addressElement) {
        addressElement.addEventListener('click', handleDrivingSchoolClick);
    }
    row.appendChild(drivingSchoolCell);

    const actionsCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.className = 'edit';
    editButton.addEventListener('click', () => editAccount(account.id));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    deleteButton.addEventListener('click', () => deleteAccount(account.id));

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
    row.appendChild(actionsCell);

    return row;
}

function render() {
    const accountsList = document.getElementById('accounts-list');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');

    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === state.totalPages || state.totalPages === 0;
    pageNumbers.innerHTML = `<span>Страница ${state.currentPage} из ${state.totalPages}</span>`;

    accountsList.innerHTML = '';

    if (state.accounts.length === 0) {
        accountsList.innerHTML = '<tr><td colspan="7">Аккаунты не найдены.</td></tr>';
        return;
    }

    state.accounts.forEach(account => {
        accountsList.appendChild(createAccountRow(account));
    });
}

function handleDrivingSchoolClick(event) {
    const contacts = event.target.getAttribute('data-school-contacts');
    if (!contacts) return;

    const contactsInfo = document.createElement('div');
    contactsInfo.classList.add('contacts-info');
    contactsInfo.textContent = contacts;

    if (event.target.nextElementSibling?.classList.contains('contacts-info')) {
        event.target.nextElementSibling.remove();
    } else {
        event.target.parentNode.appendChild(contactsInfo);
    }
}

function restrictAccess(allowedRoles) {
    const userData = localStorage.getItem('user');
    if (!userData) {
        window.location.href = '/auth.html';
        return false;
    }

    try {
        const user = JSON.parse(userData);
        if (!user || !user.user_Type || !allowedRoles.includes(user.user_Type)) {
            window.location.href = '/auth.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Ошибка при разборе данных пользователя:', error);
        window.location.href = '/auth.html';
        return false;
    }
}