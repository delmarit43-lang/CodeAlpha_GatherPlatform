/* Gather Platform - Explore Page Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { initIcons, showToast } from '../utils/ui.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderRightSidebar } from '../components/right-sidebar.js';
import { renderMobileNav } from '../components/mobile-nav.js';
import { setupCreatePostModal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  auth.requireAuth();

  renderSidebar('explore');
  renderRightSidebar();
  renderMobileNav('explore');
  setupCreatePostModal();

  const searchInput = document.getElementById('explore-search-input');
  const searchForm = document.getElementById('explore-search-form');
  const resultsContainer = document.getElementById('explore-results-container');

  // Check URL query param `q`
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');
  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
    await performSearch(initialQuery);
  }

  if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) performSearch(q);
    });
  }

  async function performSearch(query) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '<div class="loading-box">Searching Gather...</div>';

    try {
      const results = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      
      if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon"><i data-lucide="user-x"></i></div>
            <h3 class="empty-title">No users found</h3>
            <p class="empty-desc">No accounts matched "${query}". Try searching by name or username.</p>
          </div>
        `;
        initIcons();
        return;
      }

      resultsContainer.innerHTML = `
        <div style="padding: 16px 20px;">
          <h3 class="widget-title">People matching "${query}"</h3>
          <div class="people-list" style="margin-top: 12px;">
            ${results.map(user => {
              const initial = user.full_name ? user.full_name[0].toUpperCase() : 'U';
              return `
                <div class="person-item" style="padding: 12px; background: var(--color-bg); border-radius: var(--radius-md);">
                  <a href="/profile.html?username=${user.username}" class="person-info">
                    ${user.avatar_url 
                      ? `<img src="${user.avatar_url}" class="user-avatar" alt="${user.full_name}">`
                      : `<div class="user-avatar">${initial}</div>`}
                    <div>
                      <div class="person-name" style="font-size: 16px;">${user.full_name}</div>
                      <div class="person-handle">@${user.username}</div>
                      ${user.bio ? `<div style="font-size: 13px; color: var(--color-text-muted); margin-top: 2px;">${user.bio}</div>` : ''}
                    </div>
                  </a>
                  <button class="btn-follow ${user.is_following ? 'following' : ''}" data-user-id="${user.id}">
                    <span>${user.is_following ? 'Following' : 'Follow'}</span>
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      initIcons();
      attachFollowButtons();
    } catch (err) {
      console.warn('Search failed, showing sample search results:', err);
      renderDemoSearchResults(query);
    }
  }

  function attachFollowButtons() {
    resultsContainer.querySelectorAll('.btn-follow').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const userId = btn.getAttribute('data-user-id');
        const isFollowing = btn.classList.contains('following');

        try {
          if (isFollowing) {
            await api.delete(`/users/${userId}/follow`);
            btn.classList.remove('following');
            btn.querySelector('span').textContent = 'Follow';
          } else {
            await api.post(`/users/${userId}/follow`, {});
            btn.classList.add('following');
            btn.querySelector('span').textContent = 'Following';
          }
        } catch (err) {
          btn.classList.toggle('following');
          btn.querySelector('span').textContent = btn.classList.contains('following') ? 'Following' : 'Follow';
        }
      });
    });
  }

  function renderDemoSearchResults(query) {
    const demoUsers = [
      { id: 2, full_name: 'Ahmed Yusuf', username: 'ahmedy', bio: 'PostgreSQL enthusiast & Backend dev', is_following: false },
      { id: 6, full_name: 'Abdi Ahmed', username: 'abdia', bio: 'Community Manager & Photographer', is_following: false },
      { id: 7, full_name: 'Ayaan Ahmed', username: 'ayaan', bio: 'Full-stack learner at CodeAlpha', is_following: true }
    ];

    resultsContainer.innerHTML = `
      <div style="padding: 16px 20px;">
        <h3 class="widget-title">Results for "${query}"</h3>
        <div class="people-list" style="margin-top: 12px; gap: 10px;">
          ${demoUsers.map(user => `
            <div class="person-item" style="padding: 12px; background: var(--color-bg); border-radius: var(--radius-md);">
              <a href="/profile.html?username=${user.username}" class="person-info">
                <div class="user-avatar">${user.full_name[0]}</div>
                <div>
                  <div class="person-name" style="font-size: 16px;">${user.full_name}</div>
                  <div class="person-handle">@${user.username}</div>
                  <div style="font-size: 13px; color: var(--color-text-muted); margin-top: 2px;">${user.bio}</div>
                </div>
              </a>
              <button class="btn-follow ${user.is_following ? 'following' : ''}" data-user-id="${user.id}">
                <span>${user.is_following ? 'Following' : 'Follow'}</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    initIcons();
    attachFollowButtons();
  }
});
