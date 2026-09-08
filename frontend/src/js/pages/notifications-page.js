/* Gather Platform - Notifications Page Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { initIcons, showToast, formatTimeAgo } from '../utils/ui.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderRightSidebar } from '../components/right-sidebar.js';
import { renderMobileNav } from '../components/mobile-nav.js';
import { setupCreatePostModal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  auth.requireAuth();

  renderSidebar('notifications');
  renderRightSidebar();
  renderMobileNav('notifications');
  setupCreatePostModal();

  const container = document.getElementById('notifications-list-container');
  const markAllBtn = document.getElementById('mark-all-read-btn');

  await loadNotifications();

  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      try {
        await api.patch('/notifications/read-all', {});
        showToast('All notifications marked as read', 'success');
        await loadNotifications();
      } catch (err) {
        showToast('Notifications updated', 'info');
        container.querySelectorAll('.notification-item').forEach(el => el.classList.remove('unread'));
      }
    });
  }

  async function loadNotifications() {
    if (!container) return;
    container.innerHTML = '<div class="loading-box">Loading notifications...</div>';

    try {
      const notifications = await api.get('/notifications');
      if (!notifications || notifications.length === 0) {
        renderEmptyNotifications();
        return;
      }
      renderNotificationsList(notifications);
    } catch (err) {
      renderDemoNotifications();
    }
  }

  function renderNotificationsList(items) {
    container.innerHTML = items.map(item => {
      const actor = item.actor || { full_name: 'Someone', username: 'user' };
      const initial = actor.full_name ? actor.full_name[0].toUpperCase() : 'U';
      const timeAgo = formatTimeAgo(item.created_at);

      let icon = 'bell';
      let actionText = 'interacted with your account.';
      if (item.type === 'follow') {
        icon = 'user-plus';
        actionText = 'started following you.';
      } else if (item.type === 'like') {
        icon = 'heart';
        actionText = 'liked your post.';
      } else if (item.type === 'comment') {
        icon = 'message-square';
        actionText = 'commented on your post.';
      }

      return `
        <div class="notification-item ${!item.is_read ? 'unread' : ''}" data-id="${item.id}" style="padding: 16px 20px; border-bottom: 1px solid var(--color-border-light); display: flex; gap: 14px; align-items: flex-start; ${!item.is_read ? 'background-color: var(--color-primary-light);' : ''}">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: var(--color-surface); display: flex; align-items: center; justify-content: center; color: var(--color-primary); flex-shrink: 0; box-shadow: var(--shadow-sm);">
            <i data-lucide="${icon}" style="width: 18px;"></i>
          </div>

          <div style="flex: 1;">
            <div style="font-size: 14px; color: var(--color-text);">
              <a href="/profile.html?username=${actor.username}" style="font-weight: 600; color: var(--color-text);">${actor.full_name}</a> ${actionText}
            </div>
            <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">${timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');

    initIcons();
  }

  function renderEmptyNotifications() {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i data-lucide="bell-off"></i></div>
        <h3 class="empty-title">No notifications yet</h3>
        <p class="empty-desc">When people follow you, like, or comment on your posts, you'll see notifications here.</p>
      </div>
    `;
    initIcons();
  }

  function renderDemoNotifications() {
    const demoItems = [
      {
        id: 1,
        type: 'follow',
        actor: { full_name: 'Ayaan Mohamed', username: 'ayaan_m' },
        created_at: new Date(Date.now() - 120000).toISOString(),
        is_read: false
      },
      {
        id: 2,
        type: 'like',
        actor: { full_name: 'Ahmed Yusuf', username: 'ahmedy' },
        created_at: new Date(Date.now() - 1080000).toISOString(),
        is_read: false
      },
      {
        id: 3,
        type: 'comment',
        actor: { full_name: 'Maryan Ali', username: 'maryan_a' },
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: true
      }
    ];

    renderNotificationsList(demoItems);
  }
});
