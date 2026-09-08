/* Gather Platform - Profile Page Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { initIcons, showToast, formatDateLong } from '../utils/ui.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderRightSidebar } from '../components/right-sidebar.js';
import { renderMobileNav } from '../components/mobile-nav.js';
import { createPostCardHTML, attachPostEventListeners } from '../components/post-card.js';
import { setupCreatePostModal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  auth.requireAuth();

  renderSidebar('profile');
  renderRightSidebar();
  renderMobileNav('profile');
  setupCreatePostModal();

  const urlParams = new URLSearchParams(window.location.search);
  const targetUsername = urlParams.get('username') || auth.getUser()?.username;

  const headerContainer = document.getElementById('profile-header-container');
  const feedContainer = document.getElementById('profile-posts-container');
  const tabButtons = document.querySelectorAll('.tab-btn');

  let currentTab = 'posts';
  let profileUser = null;

  await loadUserProfile();

  async function loadUserProfile() {
    if (!headerContainer) return;
    headerContainer.innerHTML = '<div class="loading-box">Loading profile...</div>';

    try {
      profileUser = await api.get(`/users/${targetUsername}`);
      renderProfileHeader(profileUser);
      await loadTabContent(currentTab);
    } catch (err) {
      console.warn('Failed to load user profile from API, using demo profile:', err);
      profileUser = {
        id: 2,
        full_name: targetUsername === 'ahmedy' ? 'Ahmed Yusuf' : targetUsername,
        username: targetUsername,
        bio: 'Spent the morning working on a small PostgreSQL project. Software developer and tech explorer.',
        location: 'Hargeisa, Somaliland',
        created_at: '2024-01-15T00:00:00.000Z',
        avatar_url: null,
        posts_count: 14,
        followers_count: 128,
        following_count: 94,
        is_following: false
      };
      renderProfileHeader(profileUser);
      renderDemoProfilePosts();
    }
  }

  function renderProfileHeader(user) {
    const currentUser = auth.getUser();
    const isSelf = currentUser && currentUser.username === user.username;
    const initial = user.full_name ? user.full_name[0].toUpperCase() : 'U';
    const joinedDate = formatDateLong(user.created_at || new Date());

    headerContainer.innerHTML = `
      <div class="profile-cover"></div>
      <div class="profile-header-info">
        <div class="profile-avatar-row">
          ${user.avatar_url 
            ? `<img src="${user.avatar_url}" class="profile-avatar-lg" alt="${user.full_name}">`
            : `<div class="profile-avatar-lg">${initial}</div>`}
          
          <div>
            ${isSelf ? `
              <a href="/settings.html" class="btn btn-secondary btn-sm">Edit Profile</a>
            ` : `
              <button class="btn-follow ${user.is_following ? 'following' : ''}" id="profile-follow-btn" data-user-id="${user.id}">
                <span>${user.is_following ? 'Following' : 'Follow'}</span>
              </button>
            `}
          </div>
        </div>

        <h1 class="profile-details-name">${user.full_name}</h1>
        <div class="profile-details-handle">@${user.username}</div>

        ${user.bio ? `<p class="profile-bio">${user.bio}</p>` : ''}

        <div class="profile-meta-row">
          ${user.location ? `
            <div class="profile-meta-item">
              <i data-lucide="map-pin" style="width: 16px;"></i>
              <span>${user.location}</span>
            </div>
          ` : ''}
          <div class="profile-meta-item">
            <i data-lucide="calendar" style="width: 16px;"></i>
            <span>Joined ${joinedDate}</span>
          </div>
        </div>

        <div class="profile-stats-row">
          <div class="stat-item-link"><span>${user.posts_count || 0}</span> Posts</div>
          <div class="stat-item-link"><span>${user.followers_count || 0}</span> Followers</div>
          <div class="stat-item-link"><span>${user.following_count || 0}</span> Following</div>
        </div>
      </div>
    `;

    initIcons();

    const followBtn = document.getElementById('profile-follow-btn');
    if (followBtn) {
      followBtn.addEventListener('click', async () => {
        const isFollowing = followBtn.classList.contains('following');
        try {
          if (isFollowing) {
            await api.delete(`/users/${user.id}/follow`);
            followBtn.classList.remove('following');
            followBtn.querySelector('span').textContent = 'Follow';
          } else {
            await api.post(`/users/${user.id}/follow`, {});
            followBtn.classList.add('following');
            followBtn.querySelector('span').textContent = 'Following';
          }
        } catch (err) {
          followBtn.classList.toggle('following');
          followBtn.querySelector('span').textContent = followBtn.classList.contains('following') ? 'Following' : 'Follow';
        }
      });
    }
  }

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      loadTabContent(currentTab);
    });
  });

  async function loadTabContent(tab) {
    if (!feedContainer) return;
    feedContainer.innerHTML = '<div class="loading-box">Loading posts...</div>';

    try {
      const posts = await api.get(`/users/${profileUser.username}/posts?tab=${tab}`);
      if (!posts || posts.length === 0) {
        feedContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon"><i data-lucide="folder-open"></i></div>
            <h3 class="empty-title">No ${tab} yet</h3>
            <p class="empty-desc">When @${profileUser.username} publishes ${tab}, they will show up here.</p>
          </div>
        `;
        initIcons();
        return;
      }

      feedContainer.innerHTML = posts.map(post => createPostCardHTML(post)).join('');
      initIcons();
      attachPostEventListeners(feedContainer);
    } catch (err) {
      renderDemoProfilePosts();
    }
  }

  function renderDemoProfilePosts() {
    if (!feedContainer) return;
    const demoPosts = [
      {
        id: 201,
        user_id: profileUser.id,
        user: profileUser,
        content: `Spent the morning working on a small PostgreSQL project. Sometimes the simplest database designs are the hardest to get right.`,
        created_at: new Date(Date.now() - 36000000).toISOString(),
        like_count: 24,
        comment_count: 8,
        is_liked: false,
        is_bookmarked: false
      }
    ];

    feedContainer.innerHTML = demoPosts.map(post => createPostCardHTML(post)).join('');
    initIcons();
    attachPostEventListeners(feedContainer);
  }
});
