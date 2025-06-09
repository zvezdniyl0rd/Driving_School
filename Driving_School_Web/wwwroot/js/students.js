let state = {
    students: [], // Список студентов
    drivingSchools: [], // Список автошкол
    cities: [], // Список городов
    filters: { // Фильтры для поиска
        surname: '',
        name: '',
        patronymic: '',
        phoneNumber: '',
        email: '',
        drivingSchool: '',
        city: '' // Фильтр по городу
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
    if (currentPath.endsWith('students.html')) {
        // Проверка доступа для администраторов и инструкторов
        if (!restrictAccess([ROLES.ADMIN, ROLES.INSTRUCTOR])) return;

        // Получение данных профиля и автошкол из localStorage
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

        // Загрузка списка студентов
        await fetchStudents();

        const user = JSON.parse(localStorage.getItem('user'));
        // Скрытие кнопки "Добавить" для инструкторов
        if (user.user_Type !== ROLES.ADMIN) {
            const addBtn = document.getElementById('add-student-btn');
            if (addBtn) addBtn.style.display = 'none';
        }

        // Обработчик кнопки "Предыдущая страница"
        document.getElementById('prev-page').addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                fetchStudents();
            }
        });

        // Обработчик кнопки "Следующая страница"
        document.getElementById('next-page').addEventListener('click', () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                fetchStudents();
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
            fetchStudents();
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
            fetchStudents();
        });

        // Обработчики ввода в поля фильтров
        document.getElementById('surname-filter').addEventListener('input', () => {
            state.tempFilters.surname = document.getElementById('surname-filter').value.trim().toLowerCase();
        });

        document.getElementById('name-filter').addEventListener('input', () => {
            state.tempFilters.name = document.getElementById('name-filter').value.trim().toLowerCase();
        });

        document.getElementById('patronymic-filter').addEventListener('input', () => {
            state.tempFilters.patronymic = document.getElementById('patronymic-filter').value.trim().toLowerCase();
        });

        document.getElementById('phone-filter').addEventListener('input', () => {
            state.tempFilters.phoneNumber = document.getElementById('phone-filter').value.trim().toLowerCase();
        });

        document.getElementById('email-filter').addEventListener('input', () => {
            state.tempFilters.email = document.getElementById('email-filter').value.trim().toLowerCase();
        });

        document.getElementById('driving-school-filter').addEventListener('change', () => {
            state.tempFilters.drivingSchool = document.getElementById('driving-school-filter').value;
        });

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
            fetchStudents();
        });

        //// Обработчик кнопки добавления студента
        //document.getElementById('add-student-btn').addEventListener('click', () => {
        //    showAddModal();
        //});

        // Обработчик клика по строке таблицы для перехода на страницу деталей
        document.getElementById('students-list').addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            if (row && !event.target.closest('button')) {
                const studentId = row.dataset.id;
                //// Обновление localStorage для управления видимостью меню
                //localStorage.setItem('menuItems', JSON.stringify(['Расписание', 'Студенты', 'Профиль']));
                window.location.href = `/student-details.html?id=${studentId}`;
            }
        });
    }
});

// Функция загрузки списка студентов с сервера
async function fetchStudents() {
    const studentsList = document.getElementById('students-list');
    if (!studentsList) {
        console.error('Элемент с id "students-list" не найден');
        return;
    }

    try {
        // Загрузка автошкол, если они ещё не загружены
        if (!state.drivingSchools.length) {
            try {
                const drivingSchoolsResponse = await fetch('https://localhost:7174/driving_Schools');
                if (!drivingSchoolsResponse.ok) throw new Error((await drivingSchoolsResponse.json()).message || 'Не удалось загрузить автошколы');
                state.drivingSchools = await drivingSchoolsResponse.json();
            } catch (error) {
                console.error('Ошибка загрузки автошкол:', error);
                state.drivingSchools = [];
            }
        }

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

        const cityId = state.filters.city ? parseInt(state.filters.city) : null;
        // Формирование объекта фильтра для запроса
        const filter = {
            surname: state.filters.surname,
            name: state.filters.name,
            patronymic: state.filters.patronymic,
            phoneNumber: state.filters.phoneNumber,
            email: state.filters.email,
            drivingSchool_Id: state.filters.drivingSchool ? parseInt(state.filters.drivingSchool) : null,
            city_ID: isNaN(cityId) ? null : cityId,
            page: state.currentPage,
            pageSize: state.pageSize
        };

        // Отправка запроса на сервер
        const response = await fetch('https://localhost:7174/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filter)
        });

        if (!response.ok) throw new Error((await response.json()).message || 'Не удалось загрузить студентов');
        const responseData = await response.json();

        state.students = Array.isArray(responseData.data) ? responseData.data : [];
        state.totalPages = responseData.totalPages || 1;

        // Инициализация фильтров при первой загрузке
        if (state.currentPage === 1 && !document.getElementById('surname-filter').value) {
            initFilters();
        }
        initTableHeader();
        render();

        // Восстановление значений фильтров в полях
        document.getElementById('surname-filter').value = state.filters.surname;
        document.getElementById('name-filter').value = state.filters.name;
        document.getElementById('patronymic-filter').value = state.filters.patronymic;
        document.getElementById('phone-filter').value = state.filters.phoneNumber;
        document.getElementById('email-filter').value = state.filters.email;
        document.getElementById('driving-school-filter').value = state.filters.drivingSchool;
        document.getElementById('city-filter').value = state.filters.city;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        studentsList.innerHTML = `<tr><td colspan="6">Ошибка: ${error.message}</td></tr>`;
    }
}

// Инициализация выпадающих списков фильтров
function initFilters() {
    const drivingSchoolFilter = document.getElementById('driving-school-filter');
    const cityFilter = document.getElementById('city-filter');
    cityFilter.innerHTML = '<option value="">Любой</option>';
    state.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        cityFilter.appendChild(option);
    });

    drivingSchoolFilter.innerHTML = '<option value="">Любая</option>';
    state.drivingSchools.forEach(school => {
        const city = state.cities.find(c => c.id === school.city_ID);
        const schoolText = city ? `г. ${city.name}, ${school.address}` : school.address;
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = schoolText;
        drivingSchoolFilter.appendChild(option);
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
    const headers = document.querySelectorAll('#students-table th');
    const user = JSON.parse(localStorage.getItem('user'));
    const headerTitles = user.user_Type === ROLES.ADMIN ?
        ['ФИО', 'Телефон', 'Email', 'Дата рождения', 'Автошкола', 'Действия'] :
        ['ФИО', 'Телефон', 'Email', 'Дата рождения', 'Автошкола'];
    headers.forEach((header, index) => {
        header.textContent = headerTitles[index];
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
            const response = await fetch(`https://localhost:7174/students/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось удалить студента');
            fetchStudents();
        } catch (error) {
            console.error('Ошибка удаления студента:', error);
            alert(`Ошибка при удалении студента: ${error.message}`);
        }
    });

    newCancelButton.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

// Отображение модального окна для редактирования студента
function showEditModal(student) {
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = 'Редактирование студента';
    modal.style.display = 'flex';
    modal.classList.add('active');

    document.getElementById('edit-surname').value = student.surname || '';
    document.getElementById('edit-name').value = student.name || '';
    document.getElementById('edit-patronymic').value = student.patronymic || '';
    document.getElementById('edit-phone').value = student.phoneNumber || '';
    document.getElementById('edit-email').value = student.email || '';
    document.getElementById('edit-birthdate').value = student.birthdate || '';

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

    const studentDrivingSchool = state.drivingSchools.find(ds => ds.id === student.drivingSchool_ID);
    const studentCity = studentDrivingSchool ? state.cities.find(c => c.id === studentDrivingSchool.city_ID) : null;
    if (studentCity) {
        citySelect.value = studentCity.id;
        updateDrivingSchools(studentCity.id, drivingSchoolSelect);
        drivingSchoolSelect.value = studentDrivingSchool.id;
    }

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
        const updatedStudent = {
            surname: document.getElementById('edit-surname').value.trim(),
            name: document.getElementById('edit-name').value.trim(),
            patronymic: document.getElementById('edit-patronymic').value.trim() || null,
            phoneNumber: document.getElementById('edit-phone').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            birthdate: document.getElementById('edit-birthdate').value || null,
            drivingSchool_ID: document.getElementById('edit-driving-school').value ? parseInt(document.getElementById('edit-driving-school').value) : null
        };

        if (!validateFormData(updatedStudent, errorMessage)) return;

        try {
            const response = await fetch(`https://localhost:7174/students/${student.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStudent)
            });

            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось обновить данные студента');

            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            fetchStudents();
        } catch (error) {
            console.error('Ошибка обновления студента:', error);
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

// Отображение модального окна для добавления студента
function showAddModal() {
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = 'Добавление студента';
    modal.style.display = 'flex';
    modal.classList.add('active');

    document.getElementById('edit-surname').value = '';
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-patronymic').value = '';
    document.getElementById('edit-phone').value = '';
    document.getElementById('edit-email').value = '';
    document.getElementById('edit-birthdate').value = '';

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
        const newStudent = {
            surname: document.getElementById('edit-surname').value.trim(),
            name: document.getElementById('edit-name').value.trim(),
            patronymic: document.getElementById('edit-patronymic').value.trim() || null,
            phoneNumber: document.getElementById('edit-phone').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            birthdate: document.getElementById('edit-birthdate').value || null,
            drivingSchool_ID: document.getElementById('edit-driving-school').value ? parseInt(document.getElementById('edit-driving-school').value) : null
        };

        if (!validateFormData(newStudent, errorMessage)) return;

        try {
            const response = await fetch('https://localhost:7174/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStudent)
            });

            if (!response.ok) throw new Error((await response.json()).message || 'Не удалось создать студента');

            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            fetchStudents();
        } catch (error) {
            console.error('Ошибка добавления студента:', error);
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
    }
}

// Удаление студента
function deleteStudent(id) {
    showDeleteModal(id);
}

// Редактирование студента
function editStudent(id) {
    const student = state.students.find(s => s.id === id);
    if (student) {
        showEditModal(student);
    } else {
        alert('Студент не найден');
    }
}

// Создание строки таблицы для студента
function createStudentRow(student) {
    const user = JSON.parse(localStorage.getItem('user'));
    const row = document.createElement('tr');
    row.dataset.id = student.id;
    const drivingSchool = state.drivingSchools.find(ds => ds.id === student.drivingSchool_ID) || { address: 'Не указана' };
    const city = drivingSchool ? state.cities.find(c => c.id === drivingSchool.city_ID) : null;
    const fullName = `${student.surname} ${student.name} ${student.patronymic || ''}`.trim() || 'Не указан';
    const schoolText = city ? `г. ${city.name}, ${drivingSchool.address}` : drivingSchool.address;
    const [year, month, day] = student.birthdate ? student.birthdate.split('-') : ['Не', 'ука', 'зана'];
    const formattedBirthdate = student.birthdate ? `${day}.${month}.${year}` : 'Не указана';

    const fioCell = document.createElement('td');
    fioCell.textContent = fullName;
    row.appendChild(fioCell);

    const phoneCell = document.createElement('td');
    phoneCell.textContent = student.phoneNumber || 'Не указан';
    row.appendChild(phoneCell);

    const emailCell = document.createElement('td');
    emailCell.textContent = student.email || 'Не указан';
    row.appendChild(emailCell);

    const birthdateCell = document.createElement('td');
    birthdateCell.textContent = formattedBirthdate;
    row.appendChild(birthdateCell);

    const drivingSchoolCell = document.createElement('td');
    drivingSchoolCell.textContent = schoolText;
    row.appendChild(drivingSchoolCell);

    // Добавление кнопок действий для администратора
    if (user.user_Type === ROLES.ADMIN) {
        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Предотвращение срабатывания клика по строке
            editStudent(student.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Предотвращение срабатывания клика по строке
            deleteStudent(student.id);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
    }

    return row;
}

// Отрисовка таблицы студентов
function render() {
    const studentsList = document.getElementById('students-list');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');

    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === state.totalPages || state.totalPages === 0;
    pageNumbers.innerHTML = `<span>Страница ${state.currentPage} из ${state.totalPages}</span>`;

    studentsList.innerHTML = '';

    if (state.students.length === 0) {
        studentsList.innerHTML = '<tr><td colspan="6">Студенты не найдены.</td></tr>';
        return;
    }

    state.students.forEach(student => {
        studentsList.appendChild(createStudentRow(student));
    });
}

// Валидация данных формы
function validateFormData(student, errorMessage) {
    const formInputs = document.querySelectorAll('.edit-form input, .edit-form select');
    formInputs.forEach(input => input.classList.remove('error'));

    const missingFields = [];

    if (!student.surname) missingFields.push('Фамилия');
    if (!student.name) missingFields.push('Имя');
    if (!student.phoneNumber) missingFields.push('Телеф он');
    if (!student.birthdate) missingFields.push('Дата рождения');
    if (!student.drivingSchool_ID) missingFields.push('Автошкола');

    if (missingFields.length > 0) {
        errorMessage.textContent = `Пожалуйста, заполните обязательные поля: ${missingFields.join(', ')}`;
        errorMessage.style.display = 'block';

        if (!student.surname) document.getElementById('edit-surname').classList.add('error');
        if (!student.name) document.getElementById('edit-name').classList.add('error');
        if (!student.phoneNumber) document.getElementById('edit-phone').classList.add('error');
        if (!student.birthdate) document.getElementById('edit-birthdate').classList.add('error');
        if (!student.drivingSchool_ID) document.getElementById('edit-driving-school').classList.add('error');

        return false;
    }

    return true;
}