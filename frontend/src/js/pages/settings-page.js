/* Gather Platform - Settings Page Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { showToast } from '../utils/ui.js';
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

  if (form && currentUser) {
    document.getElementById('setting-fullname').value = currentUser.full_name || '';
    document.getElementById('setting-username').value = currentUser.username || '';
    document.getElementById('setting-email').value = currentUser.email || '';
    document.getElementById('setting-bio').value = currentUser.bio || '';
    document.getElementById('setting-location').value = currentUser.location || '';
    document.getElementById('setting-avatar').value = currentUser.avatar_url || '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = document.getElementById('setting-fullname').value.trim();
      const bio = document.getElementById('setting-bio').value.trim();
      const location = document.getElementById('setting-location').value.trim();
      const avatar_url = document.getElementById('setting-avatar').value.trim();

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      try {
        const updated = await api.patch('/users/profile', {
          full_name,
          bio,
          location,
          avatar_url
        });

        auth.updateUser(updated || { full_name, bio, location, avatar_url });
        showToast('Profile settings saved!', 'success');
        renderSidebar('settings');
      } catch (err) {
        // Fallback local state update
        auth.updateUser({ full_name, bio, location, avatar_url });
        showToast('Profile updated locally', 'success');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.logout();
    });
  }
});
