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
    const avatarUrl = (isSelf && currentUser?.avatar_url) ? currentUser.avatar_url : user.avatar_url;
    const coverUrl = (isSelf && currentUser?.cover_url) ? currentUser.cover_url : user.cover_url;
    const initial = user.full_name ? user.full_name[0].toUpperCase() : 'U';
    const joinedDate = formatDateLong(user.created_at || new Date());

    headerContainer.innerHTML = `
      <div class="profile-cover" style="${coverUrl ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center;` : ''}">
        ${isSelf ? `
          <button type="button" class="btn btn-secondary btn-sm" id="profile-cover-clickable" style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.65); color: white; border: none; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: var(--radius-full); cursor: pointer; box-shadow: var(--shadow-sm);">
            <i data-lucide="camera" style="width: 14px; height: 14px;"></i>
            <span>Edit Cover</span>
          </button>
          <input type="file" id="direct-cover-upload" accept="image/*" style="display: none;">
        ` : ''}
      </div>
      <div class="profile-header-info">
        <div class="profile-avatar-row">
          ${isSelf ? `
            <div style="position: relative; cursor: pointer;" title="Upload profile photo" id="profile-avatar-clickable">
              ${avatarUrl 
                ? `<img src="${avatarUrl}" class="profile-avatar-lg" alt="${user.full_name}">`
                : `<div class="profile-avatar-lg">${initial}</div>`}
              <div style="position: absolute; bottom: 4px; right: 4px; background: var(--color-primary); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--color-surface); box-shadow: var(--shadow-sm);">
                <i data-lucide="camera" style="width: 14px; height: 14px;"></i>
              </div>
            </div>
            <input type="file" id="direct-avatar-upload" accept="image/*" style="display: none;">
          ` : (avatarUrl 
            ? `<img src="${avatarUrl}" class="profile-avatar-lg" alt="${user.full_name}">`
            : `<div class="profile-avatar-lg">${initial}</div>`)}
          
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

    // Direct Cover Banner Upload & Preset Picker Handler
    const coverClickable = document.getElementById('profile-cover-clickable');
    const directCoverInput = document.getElementById('direct-cover-upload');

    if (coverClickable) {
      coverClickable.addEventListener('click', () => {
        openCoverPickerModal();
      });
    }

    if (directCoverInput) {
      directCoverInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          showToast('Image file size must be less than 5MB', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64Url = ev.target.result;
          await saveCover(base64Url);
        };
        reader.readAsDataURL(file);
      });
    }

    function openCoverPickerModal() {
      let modal = document.getElementById('cover-picker-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cover-picker-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
      }

      const presets = [
        { title: 'Abstract Waves', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' },
        { title: 'Ocean Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80' },
        { title: 'Mountain Sunset', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80' },
        { title: 'Tech Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80' },
        { title: 'Night City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop&q=80' }
      ];

      modal.innerHTML = `
        <div class="modal-card" style="max-width: 520px;">
          <div class="modal-header">
            <h3 class="modal-title">Customize Cover Banner</h3>
            <button class="modal-close-btn" id="close-cover-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom: 20px;">
              <label class="form-label" style="margin-bottom: 8px;">1. Upload from your device</label>
              <button type="button" class="btn btn-primary btn-full" id="modal-upload-cover-btn">
                <i data-lucide="upload" style="width: 16px;"></i>
                <span>Choose Image File...</span>
              </button>
            </div>

            <div style="margin-bottom: 20px;">
              <label class="form-label" style="margin-bottom: 8px;">2. Or select a preset banner</label>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
                ${presets.map(p => `
                  <div class="cover-preset-card" data-url="${p.url}" style="height: 60px; border-radius: var(--radius-md); cursor: pointer; background-image: url('${p.url}'); background-size: cover; background-position: center; border: 2px solid var(--color-border); position: relative; overflow: hidden; transition: transform 0.2s;" title="${p.title}">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.55); color: white; font-size: 11px; padding: 2px 6px; text-align: center;">${p.title}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            ${coverUrl ? `
              <button type="button" class="btn btn-secondary btn-full" id="modal-remove-cover-btn" style="color: var(--color-danger); border-color: var(--color-danger);">
                Remove Cover Banner
              </button>
            ` : ''}
          </div>
        </div>
      `;

      initIcons();
      modal.style.display = 'flex';

      const closeBtn = document.getElementById('close-cover-modal');
      if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';

      modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
      };

      const uploadBtn = document.getElementById('modal-upload-cover-btn');
      if (uploadBtn && directCoverInput) {
        uploadBtn.onclick = () => {
          modal.style.display = 'none';
          directCoverInput.click();
        };
      }

      const removeBtn = document.getElementById('modal-remove-cover-btn');
      if (removeBtn) {
        removeBtn.onclick = async () => {
          modal.style.display = 'none';
          await saveCover('');
        };
      }

      const presetCards = modal.querySelectorAll('.cover-preset-card');
      presetCards.forEach(card => {
        card.onclick = async () => {
          const selectedUrl = card.getAttribute('data-url');
          modal.style.display = 'none';
          await saveCover(selectedUrl);
        };
      });
    }

    async function saveCover(url) {
      try {
        await api.patch('/users/profile', { cover_url: url });
      } catch (err) {
        console.warn('API profile cover patch fallback:', err);
      }
      auth.updateUser({ cover_url: url });
      showToast(url ? 'Cover banner updated successfully!' : 'Cover banner removed', 'success');
      loadUserProfile();
    }

    // Direct Avatar Photo Upload on Profile Click
    const avatarClickable = document.getElementById('profile-avatar-clickable');
    const directUploadInput = document.getElementById('direct-avatar-upload');
    if (avatarClickable && directUploadInput) {
      avatarClickable.addEventListener('click', () => directUploadInput.click());
      directUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          showToast('Image file size must be less than 5MB', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64Url = ev.target.result;
          try {
            await api.patch('/users/profile', { avatar_url: base64Url });
          } catch (err) {
            console.warn('API profile patch fallback:', err);
          }
          auth.updateUser({ avatar_url: base64Url });
          showToast('Profile photo updated successfully!', 'success');
          loadUserProfile();
          renderSidebar('profile');
        };
        reader.readAsDataURL(file);
      });
    }

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

  window.addEventListener('gather:user-updated', () => {
    loadUserProfile();
  });
});
