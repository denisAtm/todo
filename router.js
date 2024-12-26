window.addEventListener('hashchange', loadPage);
window.addEventListener('DOMContentLoaded', loadPage);

function loadPage() {
    const hash = window.location.hash.slice(1);
    let page = '';


    switch (hash) {
        case 'add':
            page = 'addTask.html';
            break;
        case 'list':
            page = 'taskList.html';
            break;
        case 'completed':
            page = 'completedTasks.html';
            break;
        default:
            page = 'addTask.html';
    }

    fetch(`pages/${page}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            // Вызовем инициализацию скриптов
            if (typeof initPageScripts === 'function') {
                initPageScripts(hash);
            }
        })
        .catch(err => console.error('Ошибка при загрузке страницы:', err));
}