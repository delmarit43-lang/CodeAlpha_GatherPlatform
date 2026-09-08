/* Gather Platform - Settings Page Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { showToast, setTheme, getCurrentTheme, initIcons } from '../utils/ui.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderRightSidebar } from '../components/right-sidebar.js';
import { renderMobileNav } from '../components/mobile-nav.js';
import { setupCreatePostModal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', () => {
  auth.requireAuth();

  renderSidebar('settings');
  renderRightSidebar();
  renderMobileNav('settings');
  setupCreatePostModal();

  const currentUser = auth.getUser();
  const form = document.getElementById('settings-profile-form');
  const logoutBtn = document.getElementById('settings-logout-btn');

  // Avatar Elements
  const avatarFileInput = document.getElementById('setting-avatar-file');
  const avatarUrlInput = document.getElementById('setting-avatar');
  const avatarPreviewImg = document.getElementById('avatar-preview-img');
  const avatarPreviewInitial = document.getElementById('avatar-preview-initial');
  const removeAvatarBtn = document.getElementById('remove-avatar-btn');
  const presetAvatarImgs = document.querySelectorAll('.preset-avatar-opt');

  let currentAvatarData = currentUser?.avatar_url || '';

  function updateAvatarPreview(url) {
    currentAvatarData = url || '';
    if (avatarUrlInput) avatarUrlInput.value = url || '';

    if (url) {
      avatarPreviewImg.src = url;
      avatarPreviewImg.style.display = 'block';
      avatarPreviewInitial.style.display = 'none';
    } else {
      avatarPreviewImg.style.display = 'none';
      avatarPreviewInitial.style.display = 'inline-block';
      const initial = currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'U';
      avatarPreviewInitial.textContent = initial;
    }
  }

  // Populate Initial Values
  if (currentUser) {
    document.getElementById('setting-fullname').value = currentUser.full_name || '';
    document.getElementById('setting-username').value = currentUser.username || '';
    document.getElementById('setting-email').value = currentUser.email || '';
    document.getElementById('setting-bio').value = currentUser.bio || '';
    document.getElementById('setting-location').value = currentUser.location || '';
    updateAvatarPreview(currentUser.avatar_url);
  }

  // File Upload Handler (FileReader Data URL)
  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        updateAvatarPreview(base64Url);
        showToast('Photo uploaded! Click "Save Profile Changes" to apply.', 'info');
      };
      reader.readAsDataURL(file);
    });
  }

  // Preset Avatars Handler
  presetAvatarImgs.forEach(img => {
    img.addEventListener('click', () => {
      const url = img.getAttribute('data-url');
      updateAvatarPreview(url);
      showToast('Preset avatar selected', 'info');
    });
  });

  // Remove Photo Handler
  if (removeAvatarBtn) {
    removeAvatarBtn.addEventListener('click', () => {
      updateAvatarPreview('');
      showToast('Photo removed', 'info');
    });
  }

  // Text URL input manual change
  if (avatarUrlInput) {
    avatarUrlInput.addEventListener('input', (e) => {
      updateAvatarPreview(e.target.value.trim());
    });
  }

  // Handle Form Submission
  if (form && currentUser) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = document.getElementById('setting-fullname').value.trim();
      const bio = document.getElementById('setting-bio').value.trim();
      const location = document.getElementById('setting-location').value.trim();
      const avatar_url = currentAvatarData || avatarUrlInput.value.trim();

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving Changes...';

      try {
        const updated = await api.patch('/users/profile', {
          full_name,
          bio,
          location,
          avatar_url
        });

        auth.updateUser(updated || { full_name, bio, location, avatar_url });
        showToast('Profile updated successfully!', 'success');
        renderSidebar('settings');
      } catch (err) {
        // Local fallback update
        auth.updateUser({ full_name, bio, location, avatar_url });
        showToast('Profile saved locally!', 'success');
        renderSidebar('settings');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Profile Changes';
      }
    });
  }

  // Theme Customization Handling
  const themeCards = document.querySelectorAll('.theme-card-option');
  const currentTheme = getCurrentTheme();

  function highlightActiveTheme(activeId) {
    themeCards.forEach(card => {
      const id = card.getAttribute('data-theme-id');
      if (id === activeId) {
        card.style.borderColor = 'var(--color-primary)';
        card.style.boxShadow = '0 0 0 3px var(--color-primary-light)';
      } else {
        card.style.borderColor = 'var(--color-border)';
        card.style.boxShadow = 'none';
      }
    });
  }

  highlightActiveTheme(currentTheme);

  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      const themeId = card.getAttribute('data-theme-id');
      setTheme(themeId);
      highlightActiveTheme(themeId);
      showToast(`Theme changed to ${themeId.toUpperCase()}!`, 'success');
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.logout();
    });
  }

  initIcons();
});
