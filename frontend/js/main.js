const app = document.getElementById('app');

// --- 1. Экран входа ---
function renderLogin() {
    app.innerHTML = `
        <div class="auth-container">
            <h1>Вход в Kanban</h1>
            <form id="login-form">
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Пароль" required>
                <button type="submit" style="width: 100%;">Войти</button>
            </form>
            <p style="text-align: center; margin-top: 15px;">
                Нет аккаунта? <a href="#" id="go-to-register" style="color: #0052cc;">Зарегистрироваться</a>
            </p>
        </div>
    `;

    document.getElementById('go-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        renderRegister();
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('token', data.token);
                renderBoards();
            } else {
                alert(data.message || 'Ошибка входа');
            }
        } catch (err) {
            console.error(err);
            alert('Сервер недоступен');
        }
    });
}

// --- 2. Экран регистрации ---
function renderRegister() {
    app.innerHTML = `
        <div class="auth-container">
            <h1>Регистрация</h1>
            <form id="register-form">
                <input type="text" id="reg-name" placeholder="Ваше имя" required>
                <input type="email" id="reg-email" placeholder="Email" required>
                <input type="password" id="reg-password" placeholder="Пароль (мин. 6 символов)" required>
                <button type="submit" style="width: 100%;">Создать аккаунт</button>
            </form>
            <p style="text-align: center; margin-top: 15px;">
                Уже есть аккаунт? <a href="#" id="go-to-login" style="color: #0052cc;">Войти</a>
            </p>
        </div>
    `;

    document.getElementById('go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        renderLogin();
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert('Аккаунт успешно создан! Теперь вы можете войти.');
                renderLogin();
            } else {
                alert(data.message || 'Ошибка регистрации');
            }
        } catch (err) {
            console.error(err);
            alert('Сервер недоступен');
        }
    });
}

// --- 3. Список досок ---
async function renderBoards() {
    const token = localStorage.getItem('token');
    if (!token) return renderLogin();

    app.innerHTML = `
        <div class="header-bar" style="background: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; margin-bottom: 30px;">
            <h1 style="margin:0;">Мои доски</h1>
            <button id="logout-btn">Выйти</button>
        </div>
        <div style="padding: 0 30px;">
            <div class="create-board-form" style="margin-bottom: 20px;">
                <input type="text" id="new-board-title" placeholder="Название новой доски">
                <button id="create-board-btn">Создать доску</button>
            </div>
            <div id="boards-list" class="boards-list" style="display: flex; gap: 15px; flex-wrap: wrap;">Загрузка...</div>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        renderLogin();
    });

    document.getElementById('create-board-btn').addEventListener('click', async () => {
        const title = document.getElementById('new-board-title').value;
        if (!title) return alert('Введите название');
        try {
            const res = await fetch('http://localhost:3000/api/boards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title })
            });
            if (res.ok) renderBoards();
        } catch (err) { console.error(err); }
    });

    try {
        const res = await fetch('http://localhost:3000/api/boards', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const boards = await res.json();
        const listContainer = document.getElementById('boards-list');
        
        if (boards.length === 0) {
            listContainer.innerHTML = '<p>У вас пока нет досок.</p>';
            return;
        }

        listContainer.innerHTML = boards.map(board => `
            <div class="board-card" data-id="${board.id}" id="board-${board.id}" style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; min-width: 200px;">
                <h3>${board.title}</h3>
            </div>
        `).join('');

        boards.forEach(board => {
            document.getElementById(`board-${board.id}`).addEventListener('click', () => {
                renderBoardDetail(board.id, board.title);
            });
        });
    } catch (err) { console.error(err); }
}

// --- 4. Внутри доски (Колонки) ---
async function renderBoardDetail(boardId, boardTitle) {
    const token = localStorage.getItem('token');
    
    app.innerHTML = `
        <div class="header-bar" style="background: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <button id="back-btn" style="background: #6c757d;">← Назад</button>
                <h1 style="margin:0;">${boardTitle}</h1>
            </div>
            <button id="logout-btn">Выйти</button>
        </div>
        <div style="padding: 0 30px; display: flex; gap: 15px; align-items: flex-start;" id="columns-container">
            Загрузка колонок...
        </div>
    `;

    document.getElementById('back-btn').addEventListener('click', renderBoards);
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token'); renderLogin();
    });

    try {
        const res = await fetch(`http://localhost:3000/api/boards/${boardId}/columns`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const columns = await res.json();
        const container = document.getElementById('columns-container');
        
        if (columns.length === 0) {
            container.innerHTML = '<p>В этой доске пока нет колонок.</p>';
            return;
        }

        container.innerHTML = columns.map(col => `
            <div class="column" data-col-id="${col.id}" style="background: #ebecf0; border-radius: 8px; padding: 15px; min-width: 250px;">
                <h3>${col.title}</h3>
                <div class="cards-list" id="col-${col.id}" style="min-height: 20px; margin-top: 10px;"></div>
                <button class="add-card-btn" data-col-id="${col.id}" style="margin-top: 10px; background: #0052cc; width: 100%;">+ Карточка</button>
            </div>
        `).join('');

        for (const col of columns) {
            await loadCardsForColumn(col.id, token);
        }

        // Drag & Drop
        document.querySelectorAll('.column').forEach(columnEl => {
            columnEl.addEventListener('dragover', (e) => { e.preventDefault(); columnEl.style.background = '#d1d5db'; });
            columnEl.addEventListener('dragleave', () => { columnEl.style.background = '#ebecf0'; });
            columnEl.addEventListener('drop', async (e) => {
                e.preventDefault(); columnEl.style.background = '#ebecf0';
                const cardId = e.dataTransfer.getData('text/plain');
                const newColumnId = columnEl.getAttribute('data-col-id');
                if (!cardId || !newColumnId) return;
                try {
                    const res = await fetch(`http://localhost:3000/api/cards/${cardId}/move`, {
                        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ columnId: newColumnId, position: 0 })
                    });
                    if (res.ok) { for (const col of columns) { await loadCardsForColumn(col.id, token); } }
                } catch (err) { console.error(err); }
            });
        });

        document.querySelectorAll('.add-card-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const colId = btn.getAttribute('data-col-id');
                const title = prompt('Название карточки:');
                if (!title) return;
                try {
                    const res = await fetch(`http://localhost:3000/api/columns/${colId}/cards`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ title })
                    });
                    if (res.ok) await loadCardsForColumn(colId, token);
                } catch (err) { console.error(err); }
            });
        });
    } catch (err) { console.error(err); }
}

// --- 5. Карточки в колонке ---
async function loadCardsForColumn(columnId, token) {
    try {
        const res = await fetch(`http://localhost:3000/api/columns/${columnId}/cards`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cards = await res.json();
        const container = document.getElementById(`col-${columnId}`);
        if (!container) return;

        if (cards.length === 0) { container.innerHTML = ''; return; }

        container.innerHTML = cards.map(card => `
            <div class="card" id="card-${card.id}" draggable="true" style="background: white; padding: 10px; border-radius: 4px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); cursor: grab;">
                <h4 style="margin: 0;">${card.title}</h4>
                ${card.dueDate ? `<small style="color: #d9534f;">Дедлайн: ${new Date(card.dueDate).toLocaleDateString()}</small>` : ''}
            </div>
        `).join('');

        cards.forEach(card => {
            const cardEl = document.getElementById(`card-${card.id}`);
            cardEl.addEventListener('click', () => openCardModal(card, token));
            cardEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.id);
                setTimeout(() => cardEl.style.opacity = '0.5', 0);
            });
            cardEl.addEventListener('dragend', () => { cardEl.style.opacity = '1'; });
        });
    } catch (err) { console.error(err); }
}

// --- 6. Модалка карточки ---
async function openCardModal(card, token) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;`;

    overlay.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 8px; width: 500px; max-width: 90%; position: relative;">
            <button id="close-modal" style="position: absolute; top: 10px; right: 10px; background: none; color: black; font-size: 20px;">×</button>
            <h2 style="margin-top: 0;">${card.title}</h2>
            <div style="margin-bottom: 15px;">
                <strong>Описание:</strong>
                <p style="background: #f4f5f7; padding: 10px; border-radius: 4px; min-height: 40px;">${card.description || 'Нет описания'}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Дедлайн:</strong> <span>${card.dueDate ? new Date(card.dueDate).toLocaleDateString() : 'Не указан'}</span>
            </div>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
            <h3>Комментарии</h3>
            <div id="comments-list" style="max-height: 150px; overflow-y: auto; margin-bottom: 15px;">Загрузка...</div>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="new-comment-text" placeholder="Написать комментарий..." style="flex-grow: 1; margin-bottom: 0;">
                <button id="send-comment-btn">Отправить</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById('close-modal').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    async function loadComments() {
        try {
            const res = await fetch(`http://localhost:3000/api/cards/${card.id}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const comments = await res.json();
            const list = document.getElementById('comments-list');
            if (comments.length === 0) {
                list.innerHTML = '<p style="color: #888; font-size: 12px;">Пока нет комментариев</p>';
            } else {
                list.innerHTML = comments.map(c => `
                    <div style="background: #f4f5f7; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                        <small style="color: #6c757d; display: block; margin-bottom: 4px;">${c.author.name} (${new Date(c.createdAt).toLocaleString()}):</small>
                        <span>${c.text}</span>
                    </div>
                `).join('');
            }
        } catch (err) { console.error(err); }
    }

    document.getElementById('send-comment-btn').addEventListener('click', async () => {
        const input = document.getElementById('new-comment-text');
        const text = input.value;
        if (!text) return;
        try {
            const res = await fetch(`http://localhost:3000/api/cards/${card.id}/comments`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text })
            });
            if (res.ok) { input.value = ''; await loadComments(); }
        } catch (err) { console.error(err); }
    });

    await loadComments();
}

// --- ЗАПУСК ---
if (localStorage.getItem('token')) renderBoards();
else renderLogin();