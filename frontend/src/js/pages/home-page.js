/* Gather Platform - Home Page Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { initIcons, showToast } from '../utils/ui.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderRightSidebar } from '../components/right-sidebar.js';
import { renderMobileNav } from '../components/mobile-nav.js';
import { createPostCardHTML, attachPostEventListeners } from '../components/post-card.js';
import { setupCreatePostModal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  auth.requireAuth();

  renderSidebar('home');
  renderRightSidebar();
  renderMobileNav('home');
  setupCreatePostModal(handleNewPostCreated);

  const feedContainer = document.getElementById('feed-posts-container');
  const inlineForm = document.getElementById('inline-create-post-form');
  const inlineTextarea = document.getElementById('inline-post-textarea');
  const inlineAvatar = document.getElementById('inline-user-avatar');

  function updateInlineAvatar() {
    const user = auth.getUser();
    if (inlineAvatar && user) {
      const initial = user.full_name ? user.full_name[0].toUpperCase() : 'U';
      inlineAvatar.innerHTML = user.avatar_url 
        ? `<img src="${user.avatar_url}" class="user-avatar" alt="${user.full_name}">`
        : `<div class="user-avatar">${initial}</div>`;
    }
  }

  updateInlineAvatar();

  window.addEventListener('gather:user-updated', () => {
    updateInlineAvatar();
  });

  // Handle inline create post submission
  if (inlineForm) {
    inlineForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = inlineTextarea.value.trim();
      if (!content) return;

      const submitBtn = inlineForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';

      try {
        const newPost = await api.post('/posts', { content });
        inlineTextarea.value = '';
        showToast('Post published!', 'success');
        handleNewPostCreated(newPost);
      } catch (err) {
        showToast(err.message || 'Failed to post', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    });
  }

  // Load Feed Posts
  await loadFeedPosts();

  async function loadFeedPosts() {
    if (!feedContainer) return;
    feedContainer.innerHTML = '<div class="loading-box">Loading your feed...</div>';

    try {
      const posts = await api.get('/posts/feed');

      if (!posts || posts.length === 0) {
        feedContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon"><i data-lucide="rss"></i></div>
            <h3 class="empty-title">Your feed is quiet</h3>
            <p class="empty-desc">Follow people or create your first post to see updates in your feed!</p>
          </div>
        `;
        initIcons();
        return;
      }

      feedContainer.innerHTML = posts.map(post => createPostCardHTML(post)).join('');
      initIcons();
      attachPostEventListeners(feedContainer, (deletedPostId) => {
        if (feedContainer.querySelectorAll('article').length === 0) {
          loadFeedPosts();
        }
      });
    } catch (err) {
      console.warn('Failed to fetch feed, rendering sample content:', err);
      // Fallback demo posts if server database is empty/connecting
      renderFallbackDemoPosts();
    }
  }

  function handleNewPostCreated(newPost) {
    if (!feedContainer) return;
    const emptyState = feedContainer.querySelector('.empty-state');
    if (emptyState) feedContainer.innerHTML = '';

    const postHTML = createPostCardHTML(newPost);
    feedContainer.insertAdjacentHTML('afterbegin', postHTML);
    initIcons();
    attachPostEventListeners(feedContainer);
  }

  function renderFallbackDemoPosts() {
    const demoPosts = [
      {
        id: 101,
        user_id: 2,
        user: { full_name: 'Ahmed Yusuf', username: 'ahmedy', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
        content: 'Spent the morning working on a small PostgreSQL project. Sometimes the simplest database designs are the hardest to get right.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        like_count: 24,
        comment_count: 8,
        is_liked: false,
        is_bookmarked: false
      },
      {
        id: 102,
        user_id: 3,
        user: { full_name: 'Ayaan Mohamed', username: 'ayaan_m', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80' },
        content: 'Excited to announce our upcoming community tech meetup in Hargeisa! We will be discussing modern full-stack development with #WebDevelopment and #SomalilandTech.',
        created_at: new Date(Date.now() - 14400000).toISOString(),
        like_count: 42,
        comment_count: 15,
        is_liked: true,
        is_bookmarked: true
      },
      {
        id: 103,
        user_id: 4,
        user: { full_name: 'Maryan Ali', username: 'maryan_a', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80' },
        content: 'Reading "Clean Code" by Robert C. Martin again this weekend. A timeless reminder that readable code is writing for humans first, machines second. #Books',
        created_at: new Date(Date.now() - 28800000).toISOString(),
        like_count: 19,
        comment_count: 4,
        is_liked: false,
        is_bookmarked: false
      }
    ];

    feedContainer.innerHTML = demoPosts.map(post => createPostCardHTML(post)).join('');
    initIcons();
    attachPostEventListeners(feedContainer);
  }
});
