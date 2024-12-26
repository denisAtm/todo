let tasks = loadTasksFromStorage();

/**
 * Инициализация скриптов после загрузки соответствующего HTML
 */
function initPageScripts(hash) {
    switch (hash) {
        case 'add':
            initAddTaskPage();
            break;
        case 'list':
            initTaskListPage();
            break;
        case 'completed':
            initCompletedTasksPage();
            break;
        default:
            initAddTaskPage();
    }
}

/**
 * Загрузка данных из localStorage
 */
function loadTasksFromStorage() {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
}

/**
 * Сохранение массива tasks в localStorage
 */
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Показ всплывающего уведомления
 */
function showNotification(message) {
    const notificationEl = document.getElementById('notification');
    notificationEl.innerText = message;
    notificationEl.classList.add('show');

    setTimeout(() => {
        notificationEl.classList.remove('show');
    }, 2000);
}

/**
 * Инициализация страницы "Добавить задачу"
 */
function initAddTaskPage() {
    const addButton = document.getElementById('addButton');
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const deadlineInput = document.getElementById('deadlineInput');

    addButton.addEventListener('click', () => {
        const newTaskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const deadline = deadlineInput.value;

        if (newTaskText) {
            addTask(newTaskText, priority, deadline);
            taskInput.value = '';
            prioritySelect.value = 'normal';
            deadlineInput.value = '';
            showNotification('Задача успешно добавлена!');
        } else {
            showNotification('Введите текст задачи!');
        }
    });
}

/**
 * Функция добавления новой задачи
 */
function addTask(text, priority, deadline) {
    const newTask = {
        id: Date.now(),
        text: text,
        priority: priority,
        deadline: deadline,
        completed: false
    };
    tasks.push(newTask);
    saveTasksToStorage();
}

/**
 * Инициализация страницы "Список задач"
 */
function initTaskListPage() {
    // Рендерим список при загрузке
    renderTaskList(tasks);

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = tasks.filter(task =>
            task.text.toLowerCase().includes(query) && !task.completed
        );
        renderTaskList(filtered);
    });

    const filterAllBtn = document.getElementById('filterAll');
    const filterHighBtn = document.getElementById('filterHigh');
    const sortByDeadlineBtn = document.getElementById('sortByDeadline');

    filterAllBtn.addEventListener('click', () => {
        resetActiveFilterBtn();
        filterAllBtn.classList.add('active');
        const query = searchInput.value.toLowerCase();
        const filtered = tasks.filter(task =>
            task.text.toLowerCase().includes(query) && !task.completed
        );
        renderTaskList(filtered);
    });

    filterHighBtn.addEventListener('click', () => {
        resetActiveFilterBtn();
        filterHighBtn.classList.add('active');
        const query = searchInput.value.toLowerCase();
        const filtered = tasks.filter(task =>
            !task.completed &&
            task.priority === 'high' &&
            task.text.toLowerCase().includes(query)
        );
        renderTaskList(filtered);
    });

    sortByDeadlineBtn.addEventListener('click', () => {
        resetActiveFilterBtn();
        sortByDeadlineBtn.classList.add('active');
        const tasksWithDeadline = tasks.filter(t => !t.completed && t.deadline).sort((a, b) => {
            return new Date(a.deadline) - new Date(b.deadline);
        });
        const tasksWithoutDeadline = tasks.filter(t => !t.completed && !t.deadline);
        const sorted = [...tasksWithDeadline, ...tasksWithoutDeadline];
        renderTaskList(sorted);
    });
}

/**
 * Сброс "active" класса у всех кнопок фильтра
 */
function resetActiveFilterBtn() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

/**
 * Отрисовать список текущих (не завершённых) задач
 */
function renderTaskList(list) {
    const taskListContainer = document.getElementById('taskListContainer');
    taskListContainer.innerHTML = '';

    list.forEach(task => {
        const taskEl = document.createElement('div');

        taskEl.classList.add('task-item');

        const infoWrapper = document.createElement('div');
        infoWrapper.classList.add('task-info');

        const textEl = document.createElement('span');
        textEl.innerText = task.text;
        textEl.classList.add('task-text');

        const priorityEl = document.createElement('span');
        priorityEl.innerText = `Приоритет: ${task.priority}`;
        priorityEl.classList.add(`priority-${task.priority}`);

        const deadlineEl = document.createElement('span');
        deadlineEl.innerText = task.deadline ? `Дедлайн: ${task.deadline}` : 'Без дедлайна';
        deadlineEl.classList.add('deadline');

        infoWrapper.appendChild(textEl);
        infoWrapper.appendChild(priorityEl);
        infoWrapper.appendChild(deadlineEl);
        taskEl.appendChild(infoWrapper);

        const actionsWrapper = document.createElement('div');
        actionsWrapper.classList.add('actions');

        const editBtn = document.createElement('button');
        editBtn.innerText = 'Редактировать';
        editBtn.classList.add('btn', 'secondary');
        editBtn.addEventListener('click', () => {
            const newText = prompt('Отредактируйте задачу:', task.text);
            if (newText !== null && newText.trim() !== '') {
                updateTask(task.id, newText);
            }
        });
        actionsWrapper.appendChild(editBtn);

        const completeBtn = document.createElement('button');
        completeBtn.innerText = 'Завершить';
        completeBtn.classList.add('btn', 'success');
        completeBtn.addEventListener('click', () => {
            completeTask(task.id);
        });
        actionsWrapper.appendChild(completeBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Удалить';
        deleteBtn.classList.add('btn', 'danger');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить задачу?')) {
                deleteTask(task.id);
            }
        });
        actionsWrapper.appendChild(deleteBtn);

        taskEl.appendChild(actionsWrapper);
        taskListContainer.appendChild(taskEl);
    });
}

/**
 * Удаление задачи
 */
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
    showNotification('Задача удалена');
    // Обновляем текущий список
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = tasks.filter(task =>
        task.text.toLowerCase().includes(query) && !task.completed
    );
    renderTaskList(filtered);
}

/**
 * Обновление текста задачи
 */
function updateTask(id, newText) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {...task, text: newText};
        }
        return task;
    });
    saveTasksToStorage();
    showNotification('Задача обновлена');
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = tasks.filter(task =>
        task.text.toLowerCase().includes(query) && !task.completed
    );
    renderTaskList(filtered);
}

/**
 * Пометить задачу как завершённую
 */
function completeTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {...task, completed: true};
        }
        return task;
    });
    saveTasksToStorage();
    showNotification('Задача завершена!');
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = tasks.filter(task =>
        task.text.toLowerCase().includes(query) && !task.completed
    );
    renderTaskList(filtered);
}

/**
 * Инициализация страницы "Завершённые задачи"
 */
function initCompletedTasksPage() {
    renderCompletedTasks();
}

/**
 * Отрисовка завершённых задач
 */
function renderCompletedTasks() {
    const completedContainer = document.getElementById('completedTasksContainer');

    completedContainer.innerHTML = '';

    const completedTasks = tasks.filter(task => task.completed);

    if (completedTasks.length === 0) {
        completedContainer.innerHTML = '<p>Нет завершённых задач.</p>';
        return;
    }

    completedTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.classList.add('task-item', 'completed');

        const infoWrapper = document.createElement('div');
        infoWrapper.classList.add('task-info');

        const textEl = document.createElement('span');
        textEl.innerText = task.text;
        textEl.classList.add('task-text');

        // Приоритет
        const priorityEl = document.createElement('span');
        priorityEl.innerText = `Приоритет: ${task.priority}`;
        priorityEl.classList.add(`priority-${task.priority}`);

        // Дедлайн
        const deadlineEl = document.createElement('span');
        deadlineEl.innerText = task.deadline ? `Дедлайн: ${task.deadline}` : 'Без дедлайна';
        deadlineEl.classList.add('deadline');

        infoWrapper.appendChild(textEl);
        infoWrapper.appendChild(priorityEl);
        infoWrapper.appendChild(deadlineEl);

        taskEl.appendChild(infoWrapper);
        completedContainer.appendChild(taskEl);
    });
}