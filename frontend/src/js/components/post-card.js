/* Gather Platform - Post Card Component */

import { escapeHtml, formatTimeAgo } from '../utils/ui.js';
import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { showToast } from '../utils/ui.js';

/**
 * Format hashtags inside post text to clickable links
 */
function formatPostContent(content) {
  const safe = escapeHtml(content);
  return safe.replace(/#(\w+)/g, '<a href="/explore.html?q=%23$1" style="color: var(--color-primary); font-weight: 500;">#$1</a>');
}

/**
 * Generate Post HTML String
 * @param {Object} post 
 * @returns {string} HTML String
 */
export function createPostCardHTML(post) {
  const currentUser = auth.getUser();
  const isOwner = currentUser && (currentUser.id === post.user_id || currentUser.id === post.user?.id);
  const author = post.user || {
    full_name: post.full_name || 'Anonymous User',
    username: post.username || 'user',
    avatar_url: post.avatar_url || null
  };

  const avatarUrl = author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name || 'User')}&background=6366f1&color=ffffff&bold=true&size=128`;
  const formattedTime = formatTimeAgo(post.created_at);

  const isLiked = !!post.is_liked;
  const isBookmarked = !!post.is_bookmarked;
  const likeCount = post.like_count || post.likes_count || 0;
  const commentCount = post.comment_count || post.comments_count || 0;

  return `
    <article class="post-card" data-post-id="${post.id}">
      <div class="post-avatar-col">
        <a href="/profile.html?username=${author.username}">
          <img src="${avatarUrl}" class="user-avatar" alt="${author.full_name}">
        </a>
      </div>

      <div class="post-main-col">
        <div class="post-header">
          <div class="post-user-meta">
            <a href="/profile.html?username=${author.username}" class="post-user-name">${escapeHtml(author.full_name)}</a>
            <span class="post-user-handle">@${escapeHtml(author.username)}</span>
            <span class="post-dot-separator">•</span>
            <span class="post-time">${formattedTime}</span>
          </div>

          ${isOwner ? `
            <div style="position: relative;">
              <button class="post-more-btn" data-post-id="${post.id}" title="Options">
                <i data-lucide="more-horizontal" style="width: 18px; height: 18px;"></i>
              </button>
              <div class="user-dropdown hidden post-dropdown-${post.id}" style="right: 0; left: auto; top: 28px; width: 140px;">
                <button class="dropdown-item danger delete-post-btn" data-post-id="${post.id}">
                  <i data-lucide="trash-2" style="width: 14px;"></i>
                  <span>Delete Post</span>
                </button>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="post-content">
          ${formatPostContent(post.content)}
        </div>

        ${post.image_url ? `
          <div class="post-image-box">
            <img src="${post.image_url}" alt="Post attachment" loading="lazy">
          </div>
        ` : ''}

        <div class="post-actions">
          <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}" data-liked="${isLiked}">
            <i data-lucide="heart" style="width: 18px; height: 18px;"></i>
            <span class="like-count">${likeCount}</span>
          </button>

          <a href="/post.html?id=${post.id}" class="action-btn comment-btn">
            <i data-lucide="message-square" style="width: 18px; height: 18px;"></i>
            <span>${commentCount}</span>
          </a>

          <button class="action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-post-id="${post.id}" data-bookmarked="${isBookmarked}">
            <i data-lucide="bookmark" style="width: 18px; height: 18px;"></i>
            <span>Save</span>
          </button>

          <button class="action-btn share-btn" data-post-id="${post.id}">
            <i data-lucide="share-2" style="width: 18px; height: 18px;"></i>
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Attach dynamic event listeners to post cards inside container
 * @param {HTMLElement} container 
 * @param {Function} onDeleteCallback 
 */
export function attachPostEventListeners(container, onDeleteCallback) {
  if (!container) return;

  // Like Toggle
  container.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      const isLiked = btn.getAttribute('data-liked') === 'true';
      const countSpan = btn.querySelector('.like-count');
      let currentCount = parseInt(countSpan.textContent, 10) || 0;

      // Optimistic UI Update
      if (isLiked) {
        btn.classList.remove('liked');
        btn.setAttribute('data-liked', 'false');
        currentCount = Math.max(0, currentCount - 1);
      } else {
        btn.classList.add('liked');
        btn.setAttribute('data-liked', 'true');
        currentCount += 1;
      }
      countSpan.textContent = currentCount;

      try {
        if (isLiked) {
          await api.delete(`/posts/${postId}/like`);
        } else {
          await api.post(`/posts/${postId}/like`, {});
        }
      } catch (err) {
        console.warn('Like action handled with optimistic UI update.');
      }
    });
  });

  // Bookmark Toggle
  container.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      const isBookmarked = btn.getAttribute('data-bookmarked') === 'true';

      if (isBookmarked) {
        btn.classList.remove('bookmarked');
        btn.setAttribute('data-bookmarked', 'false');
        showToast('Removed from Bookmarks', 'info');
      } else {
        btn.classList.add('bookmarked');
        btn.setAttribute('data-bookmarked', 'true');
        showToast('Saved to Bookmarks', 'success');
      }

      try {
        if (isBookmarked) {
          await api.delete(`/posts/${postId}/bookmark`);
        } else {
          await api.post(`/posts/${postId}/bookmark`, {});
        }
      } catch (err) {
        console.warn('Bookmark action handled optimistically.');
      }
    });
  });

  // Share button
  container.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      const shareUrl = `${window.location.origin}/post.html?id=${postId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Post link copied to clipboard!', 'success');
      }).catch(() => {
        showToast(`Post link: ${shareUrl}`, 'info');
      });
    });
  });

  // Options Dropdown Toggle
  container.querySelectorAll('.post-more-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      const dropdown = container.querySelector(`.post-dropdown-${postId}`);
      if (dropdown) {
        dropdown.classList.toggle('hidden');
      }
    });
  });

  // Delete Post
  container.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          await api.delete(`/posts/${postId}`);
          showToast('Post deleted', 'success');
          const postArticle = container.querySelector(`article[data-post-id="${postId}"]`);
          if (postArticle) postArticle.remove();
          if (onDeleteCallback) onDeleteCallback(postId);
        } catch (err) {
          showToast(err.message || 'Failed to delete post', 'error');
        }
      }
    });
  });
}
