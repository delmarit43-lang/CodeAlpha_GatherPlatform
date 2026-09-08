/* Gather Platform - Right Sidebar Component */

import { api } from '../utils/api.js';
import { auth } from '../utils/auth.js';

export function renderRightSidebar(suggestedUsers = [], trendingTopics = []) {
  const container = document.getElementById('sidebar-right-container');
  if (!container) return;

  // Default suggested people if none supplied
  const defaultPeople = suggestedUsers.length ? suggestedUsers : [
    { id: 2, full_name: 'Ayaan Mohamed', username: 'ayaan_m', bio: 'Software Architect & Tech enthusiast', is_following: false },
    { id: 3, full_name: 'Abdi Hassan', username: 'abdi_h', bio: 'Product Designer & Photographer', is_following: false },
    { id: 4, full_name: 'Maryan Ali', username: 'maryan_a', bio: 'Data Analyst & Educator', is_following: false },
    { id: 5, full_name: 'Yusuf Ahmed', username: 'yusuf_a', bio: 'Full-stack Developer', is_following: false }
  ];

  const defaultTopics = trendingTopics.length ? trendingTopics : [
    { tag: '#SomalilandTech', count: '1,420 posts' },
    { tag: '#Photography', count: '890 posts' },
    { tag: '#WebDevelopment', count: '750 posts' },
    { tag: '#Books', count: '530 posts' },
    { tag: '#Entrepreneurship', count: '410 posts' }
  ];

  container.innerHTML = `
    <aside class="sidebar-right">
      <!-- Search Input Widget -->
      <div class="widget-card" style="padding: 12px 14px;">
        <form id="right-sidebar-search-form" style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="search" style="color: var(--color-text-muted); width: 18px;"></i>
          <input type="text" id="right-sidebar-search-input" placeholder="Search Gather..." style="border: none; outline: none; background: transparent; width: 100%; font-size: 14px;">
        </form>
      </div>

      <!-- People to Follow -->
      <div class="widget-card">
        <h3 class="widget-title">People to Follow</h3>
        <div class="people-list">
          ${defaultPeople.map(person => {
            const initial = person.full_name ? person.full_name[0].toUpperCase() : 'U';
            return `
              <div class="person-item" data-user-id="${person.id}">
                <a href="/profile.html?username=${person.username}" class="person-info">
                  ${person.avatar_url 
                    ? `<img src="${person.avatar_url}" class="user-avatar-sm" alt="${person.full_name}">`
                    : `<div class="user-avatar-sm">${initial}</div>`}
                  <div>
                    <div class="person-name">${person.full_name}</div>
                    <div class="person-handle">@${person.username}</div>
                  </div>
                </a>
                <button class="btn-follow ${person.is_following ? 'following' : ''}" data-user-id="${person.id}">
                  <span>${person.is_following ? 'Following' : 'Follow'}</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Trending Discussions -->
      <div class="widget-card">
        <h3 class="widget-title">Trending Discussions</h3>
        <div class="trending-list">
          ${defaultTopics.map(item => `
            <a href="/explore.html?q=${encodeURIComponent(item.tag)}" class="trending-item">
              <span class="trending-tag">${item.tag}</span>
              <span class="trending-count">${item.count}</span>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Community Stats -->
      <div class="widget-card">
        <h3 class="widget-title">Community Stats</h3>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">12,482</div>
            <div class="stat-label">Members</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">3,248</div>
            <div class="stat-label">Posts this week</div>
          </div>
        </div>
      </div>
    </aside>
  `;

  // Attach search form submit
  const searchForm = document.getElementById('right-sidebar-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('right-sidebar-search-input').value.trim();
      if (q) {
        window.location.href = `/explore.html?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // Attach follow buttons toggle
  container.querySelectorAll('.btn-follow').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const targetUserId = btn.getAttribute('data-user-id');
      const isFollowing = btn.classList.contains('following');

      try {
        if (isFollowing) {
          await api.delete(`/users/${targetUserId}/follow`);
          btn.classList.remove('following');
          btn.querySelector('span').textContent = 'Follow';
        } else {
          await api.post(`/users/${targetUserId}/follow`, {});
          btn.classList.add('following');
          btn.querySelector('span').textContent = 'Following';
        }
      } catch (err) {
        // UI Optimistic Fallback if server is in demo mode
        btn.classList.toggle('following');
        btn.querySelector('span').textContent = btn.classList.contains('following') ? 'Following' : 'Follow';
      }
    });
  });
}
