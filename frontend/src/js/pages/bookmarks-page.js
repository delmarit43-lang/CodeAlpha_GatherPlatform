/* Gather Platform - Bookmarks Page Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { initIcons } from '../utils/ui.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderRightSidebar } from '../components/right-sidebar.js';
import { renderMobileNav } from '../components/mobile-nav.js';
import { createPostCardHTML, attachPostEventListeners } from '../components/post-card.js';
import { setupCreatePostModal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  auth.requireAuth();

  renderSidebar('bookmarks');
  renderRightSidebar();
  renderMobileNav('bookmarks');
  setupCreatePostModal();

  const container = document.getElementById('bookmarks-posts-container');

  await loadBookmarkedPosts();

  async function loadBookmarkedPosts() {
    if (!container) return;
    container.innerHTML = '<div class="loading-box">Loading saved posts...</div>';

    try {
      const posts = await api.get('/bookmarks');

      if (!posts || posts.length === 0) {
        renderEmptyBookmarks();
        return;
      }

      container.innerHTML = posts.map(post => createPostCardHTML({ ...post, is_bookmarked: true })).join('');
      initIcons();
      attachPostEventListeners(container);
    } catch (err) {
      renderEmptyBookmarks();
    }
  }

  function renderEmptyBookmarks() {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i data-lucide="bookmark"></i></div>
        <h3 class="empty-title">Save posts for later</h3>
        <p class="empty-desc">Your saved posts will appear here. Click the bookmark icon on any post to save it to your collection.</p>
      </div>
    `;
    initIcons();
  }
});
