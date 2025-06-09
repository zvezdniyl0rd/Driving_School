window.handleDrivingSchoolClick = function (event) {
    if (event.target.classList.contains('driving-school-address')) {
        const contacts = event.target.getAttribute('data-school-contacts');
        let contactsElement = event.target.nextElementSibling;

        if (contactsElement && contactsElement.classList.contains('contacts-info')) {
            contactsElement.remove();
        } else {
            // Парсим строку контактов
            const contactsArray = contacts.split(', ');
            const phone = contactsArray[0].replace('Телефон: ', '');
            const email = contactsArray[1].replace('Email: ', '');

            // Создаём элемент с построчным отображением
            contactsElement = document.createElement('div');
            contactsElement.classList.add('contacts-info');
            contactsElement.innerHTML = `
                <p>Телефон: ${phone}</p>
                <p>Email: ${email}</p>
            `;
            // Добавляем элемент на страницу
            event.target.insertAdjacentElement('afterend', contactsElement);
        }
    }
};

window.fetchDrivingSchools = async function () {
    console.log('Fetching driving schools...');
    try {
        const response = await fetch('https://localhost:7174/driving_Schools');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch driving schools');
        }
        const data = await response.json();
        console.log('Driving schools fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching driving schools:', error);
        return [];
    }
};

window.fetchCars = async function () {
    console.log('Fetching cars...');
    try {
        const response = await fetch('https://localhost:7174/cars');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch cars');
        }
        const data = await response.json();
        console.log('Cars fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching cars:', error);
        return [];
    }
};

// Добавляем обработчик клика для driving-school-address
document.addEventListener('click', window.handleDrivingSchoolClick);