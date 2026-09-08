/* Gather Platform - Left Sidebar Component */

import { auth } from '../utils/auth.js';

export function renderSidebar(activePage = 'home', unreadNotificationsCount = 0) {
  const sidebarContainer = document.getElementById('sidebar-left-container');
  if (!sidebarContainer) return;

  const currentUser = auth.getUser() || {
    full_name: 'Guest User',
    username: 'guest',
    avatar_url: null
  };

  const initial = currentUser.full_name ? currentUser.full_name[0].toUpperCase() : 'G';

  sidebarContainer.innerHTML = `
    <aside class="sidebar-left">
      <div>
        <a href="/home.html" class="brand-logo">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span>Gather</span>
        </a>

        <nav class="nav-list">
          <a href="/home.html" class="nav-item ${activePage === 'home' ? 'active' : ''}">
            <i data-lucide="home"></i>
            <span>Home</span>
          </a>
          <a href="/explore.html" class="nav-item ${activePage === 'explore' ? 'active' : ''}">
            <i data-lucide="compass"></i>
            <span>Explore</span>
          </a>
          <a href="/notifications.html" class="nav-item ${activePage === 'notifications' ? 'active' : ''}">
            <i data-lucide="bell"></i>
            <span>Notifications</span>
            ${unreadNotificationsCount > 0 ? `<span class="nav-badge">${unreadNotificationsCount}</span>` : ''}
          </a>
          <a href="/bookmarks.html" class="nav-item ${activePage === 'bookmarks' ? 'active' : ''}">
            <i data-lucide="bookmark"></i>
            <span>Bookmarks</span>
          </a>
          <a href="/profile.html?username=${currentUser.username}" class="nav-item ${activePage === 'profile' ? 'active' : ''}">
            <i data-lucide="user"></i>
            <span>Profile</span>
          </a>
          <a href="/settings.html" class="nav-item ${activePage === 'settings' ? 'active' : ''}">
            <i data-lucide="settings"></i>
            <span>Settings</span>
          </a>
        </nav>

        <button class="btn-create-post" id="sidebar-create-post-btn">
          <i data-lucide="pen-tool"></i>
          <span>Create Post</span>
        </button>
      </div>

      <div style="position: relative;">
        <div class="sidebar-user" id="sidebar-user-trigger">
          <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
            ${currentUser.avatar_url 
              ? `<img src="${currentUser.avatar_url}" alt="${currentUser.full_name}" class="user-avatar-sm">`
              : `<div class="user-avatar-sm">${initial}</div>`}
            <div class="user-info-text">
              <span class="user-info-name">${currentUser.full_name}</span>
              <span class="user-info-handle">@${currentUser.username}</span>
            </div>
          </div>
          <i data-lucide="more-horizontal" style="color: var(--color-text-muted); width: 18px;"></i>
        </div>

        <div class="user-dropdown hidden" id="sidebar-user-dropdown">
          <a href="/settings.html" class="dropdown-item">
            <i data-lucide="settings" style="width: 16px;"></i>
            <span>Account Settings</span>
          </a>
          <button class="dropdown-item danger" id="sidebar-logout-btn">
            <i data-lucide="log-out" style="width: 16px;"></i>
            <span>Log out @${currentUser.username}</span>
          </button>
        </div>
      </div>
    </aside>
  `;

  // Attach event listeners
  const userTrigger = document.getElementById('sidebar-user-trigger');
  const userDropdown = document.getElementById('sidebar-user-dropdown');
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  const createBtn = document.getElementById('sidebar-create-post-btn');

  if (userTrigger && userDropdown) {
    userTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.add('hidden');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.logout();
    });
  }

  if (createBtn) {
    createBtn.addEventListener('click', () => {
      if (window.openCreatePostModal) {
        window.openCreatePostModal();
      }
    });
  }
}

// Global listener for realtime user profile updates
window.addEventListener('gather:user-updated', () => {
  const activeNavItem = document.querySelector('.sidebar-left .nav-item.active');
  let activePage = 'home';
  if (activeNavItem) {
    const text = activeNavItem.innerText.toLowerCase();
    if (text.includes('explore')) activePage = 'explore';
    else if (text.includes('notifications')) activePage = 'notifications';
    else if (text.includes('bookmarks')) activePage = 'bookmarks';
    else if (text.includes('profile')) activePage = 'profile';
    else if (text.includes('settings')) activePage = 'settings';
  }
  renderSidebar(activePage);
});
