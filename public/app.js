

document.addEventListener('DOMContentLoaded', () => {
    // === 1. ELEMENT SELECTORS ===
    const guestView = document.getElementById('guest-view');
    const userView = document.getElementById('user-view');
    const mainContent = document.getElementById('main-content');
    const welcomeMessage = document.getElementById('welcome-message');
    const postsList = document.getElementById('posts-list');
    const postForm = document.getElementById('post-form');
    const postIdInput = document.getElementById('post-id');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const imageInput = document.getElementById('image');

    // Auth Modal
    const authModal = document.getElementById('auth-modal');
    const authModalCloseBtn = authModal.querySelector('.close-modal');
    const authTitle = document.getElementById('auth-title');
    const authForm = document.getElementById('auth-form');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authToggleLink = document.getElementById('auth-toggle-link');
    const authError = document.getElementById('auth-error');

    // Image Modal
    const imageModal = document.getElementById('image-modal');
    const modalImageSrc = document.getElementById('modal-image-src');
    const imageModalCloseBtn = imageModal.querySelector('.close-modal');
    
    let user = null;
    let isLoginMode = true;

    // === 2. UI MANAGEMENT ===
    function updateUI() {
        if (user) {
            guestView.classList.add('hidden');
            userView.classList.remove('hidden');
            mainContent.classList.remove('hidden');
            welcomeMessage.textContent = `Вітаємо, ${user.name}!`;
        } else {
            guestView.classList.remove('hidden');
            userView.classList.add('hidden');
            mainContent.classList.add('hidden');
        }
        loadPosts();
    }

    // === 3. AUTHENTICATION ===
    function checkLoginStatus() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) { user = JSON.parse(savedUser); }
        updateUI();
    }

    async function handleAuth(e) {
        e.preventDefault();
        const name = document.getElementById('auth-name').value.trim();
        const password = document.getElementById('auth-password').value.trim();
        if (!name || !password) {
            authError.textContent = 'Будь ласка, заповніть усі поля.';
            authError.classList.remove('hidden');
            return;
        }
        
        const endpoint = isLoginMode ? '/api/users/login' : '/api/users/register';
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            localStorage.setItem('user', JSON.stringify(data));
            user = data;
            closeAuthModal();
            updateUI();
        } catch (error) {
            authError.textContent = error.message;
            authError.classList.remove('hidden');
        }
    }
    
    function handleLogout() {
        localStorage.removeItem('user');
        user = null;
        updateUI();
    }

    // === 4. POSTS CRUD OPERATIONS ===
    async function loadPosts() {
        try {
            const response = await fetch('/api/posts');
            const posts = await response.json();
            postsList.innerHTML = '';
            posts.forEach(post => {
                const isAuthor = user && post.author === user._id;
                const actionsHtml = isAuthor ? `
                    <div class="post-actions">
                        <button class="edit-btn" data-id="${post._id}">Редагувати</button>
                        <button class="delete-btn" data-id="${post._id}">Видалити</button>
                    </div>` : '';

                const imageHtml = post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image">` : '<div class="post-image-placeholder"></div>';

                const postElement = document.createElement('div');
                postElement.classList.add('post-item');
                postElement.innerHTML = `
                    ${imageHtml}
                    <div class="post-content">
                        <h3>${post.title}</h3>
                        <p>${post.description}</p>
                        <small>Автор: ${post.authorName} • Опубліковано: ${new Date(post.createdAt).toLocaleString('uk-UA')}</small>
                    </div>
                    ${actionsHtml}`;
                postsList.appendChild(postElement);
            });
        } catch (error) { console.error(error); }
    }


async function handlePostFormSubmit(e) {
    e.preventDefault();
    const postId = postIdInput.value;
    const url = postId ? `/api/posts/${postId}` : '/api/posts';
    const method = postId ? 'PUT' : 'POST';


    const formData = new FormData();
    
    // 1. Отримуємо значення з полів і додаємо їх до formData
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    
    formData.append('title', title);
    formData.append('description', description);

    // 2. Отримуємо файл і додаємо його, тільки якщо він обраний
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }


    try {
        const response = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${user.token}` },
            body: formData, 
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Не вдалося зберегти пост.');

        postForm.reset();
        postIdInput.value = '';
        document.getElementById('cancel-edit').classList.add('hidden'); 
        
        loadPosts();
    } catch (error) {
        alert(error.message);
    }
}

    postsList.addEventListener('click', async (e) => {
        const target = e.target;

        const imageToOpen = target.closest('.post-image');
        if (imageToOpen) {
            modalImageSrc.src = imageToOpen.src;
            imageModal.classList.remove('hidden');
            return;
        }

        const deleteButton = target.closest('.delete-btn');
        if (deleteButton) {
            const id = deleteButton.dataset.id;
            if (confirm('Ви впевнені?')) {
                try {
                    const response = await fetch(`/api/posts/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (!response.ok) throw new Error('Не вдалося видалити пост.');
                    loadPosts();
                } catch (error) { alert(error.message); }
            }
        }

        const editButton = target.closest('.edit-btn');
        if (editButton) {
            // Заповнюємо форму для редагування
            const postItem = editButton.closest('.post-item');
            postIdInput.value = editButton.dataset.id;
            document.getElementById('title').value = postItem.querySelector('h3').textContent;
            document.getElementById('description').value = postItem.querySelector('p').textContent;
            cancelEditBtn.classList.remove('hidden');
            postForm.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // === 5. MODAL MANAGEMENT & EVENT LISTENERS ===
    function openAuthModal(isLogin) {
        isLoginMode = isLogin;
        authTitle.textContent = isLogin ? 'Вхід' : 'Реєстрація';
        authSubmitBtn.textContent = isLogin ? 'Увійти' : 'Створити акаунт';
        authToggleLink.innerHTML = isLogin ? 'Немає акаунту? <a href="#">Зареєструватися</a>' : 'Вже є акаунт? <a href="#">Увійти</a>';
        authForm.reset();
        authError.classList.add('hidden');
        authModal.classList.remove('hidden');
    }

    function closeAuthModal() { authModal.classList.add('hidden'); }
    function closeImageModal() { imageModal.classList.add('hidden'); }

    document.getElementById('login-btn').addEventListener('click', () => openAuthModal(true));
    document.getElementById('register-btn').addEventListener('click', () => openAuthModal(false));
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    authModalCloseBtn.addEventListener('click', closeAuthModal);
    authForm.addEventListener('submit', handleAuth);
    authToggleLink.addEventListener('click', (e) => { e.preventDefault(); openAuthModal(!isLoginMode); });

    postForm.addEventListener('submit', handlePostFormSubmit);
    cancelEditBtn.addEventListener('click', () => {
        postForm.reset();
        postIdInput.value = '';
        cancelEditBtn.classList.add('hidden');
    });
    
    imageModalCloseBtn.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', e => { if (e.target === imageModal) closeImageModal(); });

    // === 6. INITIALIZATION ===
    checkLoginStatus();
});