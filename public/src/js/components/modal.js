/* Gather Platform - Create Post Modal Component */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { showToast, initIcons } from '../utils/ui.js';

export function setupCreatePostModal(onSuccessCallback) {
  let modalContainer = document.getElementById('global-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'global-modal-container';
    document.body.appendChild(modalContainer);
  }

  window.openCreatePostModal = function() {
    const user = auth.getUser() || { full_name: 'User', avatar_url: null };
    const initial = user.full_name ? user.full_name[0].toUpperCase() : 'U';

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="create-post-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Create Post</h3>
            <button class="modal-close-btn" id="modal-close-btn">
              <i data-lucide="x" style="width: 20px; height: 20px;"></i>
            </button>
          </div>
          <div class="modal-body">
            <div style="display: flex; gap: 14px;">
              ${user.avatar_url 
                ? `<img src="${user.avatar_url}" class="user-avatar" alt="${user.full_name}">`
                : `<div class="user-avatar">${initial}</div>`}
              <div style="flex: 1;">
                <textarea id="modal-post-content" class="create-post-textarea" placeholder="Share something with your community..." rows="4"></textarea>
                <div id="modal-image-preview" class="image-preview-container hidden">
                  <img id="modal-preview-img" src="" alt="Preview">
                  <button class="remove-image-btn" id="modal-remove-img">&times;</button>
                </div>
                <div class="create-post-actions">
                  <div class="media-upload-options">
                    <label class="btn-icon-label" for="modal-image-input">
                      <i data-lucide="image" style="width: 18px;"></i>
                      <span>Photo</span>
                    </label>
                    <input type="file" id="modal-image-input" accept="image/*" style="display: none;">
                  </div>
                  <button class="btn btn-primary" id="modal-submit-post-btn">Post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    initIcons();

    const overlay = document.getElementById('create-post-overlay');
    const closeBtn = document.getElementById('modal-close-btn');
    const textarea = document.getElementById('modal-post-content');
    const submitBtn = document.getElementById('modal-submit-post-btn');
    const imageInput = document.getElementById('modal-image-input');
    const imagePreview = document.getElementById('modal-image-preview');
    const previewImg = document.getElementById('modal-preview-img');
    const removeImgBtn = document.getElementById('modal-remove-img');

    let imageFileUrl = null;

    textarea.focus();

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    function closeModal() {
      modalContainer.innerHTML = '';
    }

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imageFileUrl = event.target.result;
          previewImg.src = imageFileUrl;
          imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });

    removeImgBtn.addEventListener('click', () => {
      imageFileUrl = null;
      imageInput.value = '';
      imagePreview.classList.add('hidden');
    });

    submitBtn.addEventListener('click', async () => {
      const content = textarea.value.trim();
      if (!content && !imageFileUrl) {
        showToast('Please enter some text or add an image', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';

      try {
        const newPost = await api.post('/posts', {
          content,
          image_url: imageFileUrl
        });

        showToast('Post created successfully!', 'success');
        closeModal();
        if (onSuccessCallback) onSuccessCallback(newPost);
      } catch (err) {
        showToast(err.message || 'Failed to publish post', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    });
  };
}
