/* Gather Platform - Mobile Bottom Navigation Component */

import { auth } from '../utils/auth.js';

export function renderMobileNav(activePage = 'home') {
  const container = document.getElementById('mobile-nav-container');
  if (!container) return;

  const currentUser = auth.getUser() || { username: 'guest' };

  container.innerHTML = `
    <nav class="mobile-nav-bar">
      <a href="/home.html" class="mobile-nav-item ${activePage === 'home' ? 'active' : ''}">
        <i data-lucide="home" style="width: 20px; height: 20px;"></i>
        <span>Home</span>
      </a>
      <a href="/explore.html" class="mobile-nav-item ${activePage === 'explore' ? 'active' : ''}">
        <i data-lucide="compass" style="width: 20px; height: 20px;"></i>
        <span>Explore</span>
      </a>
      <button class="mobile-nav-item" id="mobile-create-post-btn" style="border: none; background: none;">
        <i data-lucide="plus-circle" style="width: 22px; height: 22px; color: var(--color-primary);"></i>
        <span>Create</span>
      </button>
      <a href="/notifications.html" class="mobile-nav-item ${activePage === 'notifications' ? 'active' : ''}">
        <i data-lucide="bell" style="width: 20px; height: 20px;"></i>
        <span>Notifications</span>
      </a>
      <a href="/profile.html?username=${currentUser.username}" class="mobile-nav-item ${activePage === 'profile' ? 'active' : ''}">
        <i data-lucide="user" style="width: 20px; height: 20px;"></i>
        <span>Profile</span>
      </a>
    </nav>
  `;

  const mobileCreateBtn = document.getElementById('mobile-create-post-btn');
  if (mobileCreateBtn) {
    mobileCreateBtn.addEventListener('click', () => {
      if (window.openCreatePostModal) {
        window.openCreatePostModal();
      }
    });
  }
}
