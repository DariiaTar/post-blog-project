// public/app.js

// === 1. GLOBAL VARIABLES AND ACCESS TO ELEMENTS ===

const API_URL = '/api/posts';

const postForm = document.getElementById('post-form');
const postIdInput = document.getElementById('post-id');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const authorInput = document.getElementById('author');
const imageInput = document.getElementById('image');
const cancelEditBtn = document.getElementById('cancel-edit');
const imageModal = document.getElementById('image-modal');
const modalImageSrc = document.getElementById('modal-image-src');
const closeModalBtn = document.querySelector('.close-modal');
const postsList = document.getElementById('posts-list');


// === 2. LOADING AND DISPLAYING POSTS (READ) ===
async function loadPosts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Не вдалося завантажити пости');
        
        const posts = await response.json();

      // Clear the list before adding new elements to it
        postsList.innerHTML = '';

      // If there are no posts, show a message
        if (posts.length === 0) {
            postsList.innerHTML = '<p style="text-align: center;">Постів ще немає. Створіть перший!</p>';
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post-item');
            const imageHtml = post.imageUrl
                ? `<img src="${post.imageUrl}" alt="Зображення поста" class="post-image">`
                : '<div class="post-image-placeholder"></div>'; 

            postElement.innerHTML = `
                ${imageHtml}
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p>${post.description}</p>
                    <small>
                        Автор: ${post.author} • 
                        Опубліковано: ${new Date(post.createdAt).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}
                    </small>
                </div>
                <div class="post-actions">
                    <button class="edit-btn" data-id="${post._id}">Редагувати</button>
                    <button class="delete-btn" data-id="${post._id}">Видалити</button>
                </div>
            `;
            postsList.appendChild(postElement);
        });
    } catch (error) {
        console.error('Помилка при завантаженні постів:', error);
        postsList.innerHTML = '<p style="text-align: center; color: red;">Не вдалося завантажити дані. Спробуйте оновити сторінку.</p>';
    }
}


// === 3. FORM SUBMISSION PROCESSING (CREATE and UPDATE) ===
postForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const formData = new FormData();
    formData.append('title', titleInput.value);
    formData.append('description', descriptionInput.value);
    formData.append('author', authorInput.value);

    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    const postId = postIdInput.value;
    const isEditing = !!postId; 
    const url = isEditing ? `${API_URL}/${postId}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData, 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Не вдалося зберегти пост');
        }

        resetForm();
        loadPosts(); 

    } catch (error) {
        console.error('Помилка при збереженні поста:', error);
        alert(`Помилка: ${error.message}`);
    }
});


// === 4. PROCESSING ACTIONS IN THE POST LIST (DELETE, UPDATE, OPEN IMAGE) ===
postsList.addEventListener('click', async (event) => {
    const target = event.target;
    const imageToOpen = target.closest('.post-image');
    if (imageToOpen) {
        modalImageSrc.src = imageToOpen.src; 
        imageModal.classList.remove('hidden'); 
        return; 
    }

    const deleteButton = target.closest('.delete-btn');
    if (deleteButton) {
        const id = deleteButton.dataset.id;
        if (!confirm('Ви впевнені, що хочете видалити цей пост?')) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Не вдалося видалити пост');
            loadPosts();
        } catch (error) {
            console.error('Помилка видалення:', error);
            alert(`Помилка: ${error.message}`);
        }
        return;
    }

    const editButton = target.closest('.edit-btn');
    if (editButton) {
        const id = editButton.dataset.id;
        const postItem = editButton.closest('.post-item');
        
        const title = postItem.querySelector('h3').textContent;
        const description = postItem.querySelector('p').textContent;
        const author = postItem.querySelector('small').textContent.split('Автор: ')[1].split(' •')[0];
        
        postIdInput.value = id;
        titleInput.value = title;
        descriptionInput.value = description;
        authorInput.value = author;
        
        cancelEditBtn.classList.remove('hidden');
        postForm.scrollIntoView({ behavior: 'smooth' });
        return;
    }
});




cancelEditBtn.addEventListener('click', () => {
    resetForm();
});

function resetForm() {
    postForm.reset(); 
    postIdInput.value = ''; 
    cancelEditBtn.classList.add('hidden'); 
}


document.addEventListener('DOMContentLoaded', loadPosts);

function closeModal() {
    imageModal.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeModal);

imageModal.addEventListener('click', (event) => {
    if (event.target === imageModal) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !imageModal.classList.contains('hidden')) {
        closeModal();
    }
});