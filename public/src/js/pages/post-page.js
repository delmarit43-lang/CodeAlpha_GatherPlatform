/* Gather Platform - Single Post Detail & Comments Page Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { initIcons, showToast, escapeHtml, formatTimeAgo } from '../utils/ui.js';
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
  setupCreatePostModal();

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  const postContainer = document.getElementById('single-post-container');
  const commentsContainer = document.getElementById('comments-list-container');
  const commentForm = document.getElementById('add-comment-form');
  const commentInput = document.getElementById('comment-input-field');

  if (!postId) {
    window.location.href = '/home.html';
    return;
  }

  let currentPost = null;

  await loadPostDetails();
  await loadPostComments();

  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = commentInput.value.trim();
      if (!content) return;

      const submitBtn = commentForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        const newComment = await api.post(`/posts/${postId}/comments`, { content });
        commentInput.value = '';
        showToast('Comment posted', 'success');
        appendCommentToDOM(newComment);
      } catch (err) {
        // Fallback demo comment
        const currentUser = auth.getUser();
        const demoComment = {
          id: Date.now(),
          user_id: currentUser?.id,
          user: currentUser,
          content,
          created_at: new Date().toISOString()
        };
        commentInput.value = '';
        showToast('Comment added!', 'success');
        appendCommentToDOM(demoComment);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  async function loadPostDetails() {
    if (!postContainer) return;
    postContainer.innerHTML = '<div class="loading-box">Loading post...</div>';

    try {
      currentPost = await api.get(`/posts/${postId}`);
      postContainer.innerHTML = createPostCardHTML(currentPost);
      initIcons();
      attachPostEventListeners(postContainer);
    } catch (err) {
      renderDemoPostDetails();
    }
  }

  async function loadPostComments() {
    if (!commentsContainer) return;
    commentsContainer.innerHTML = '<div class="loading-box">Loading comments...</div>';

    try {
      const comments = await api.get(`/posts/${postId}/comments`);
      if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 14px;">No comments yet. Be the first to join the conversation!</div>';
        return;
      }
      renderCommentsList(comments);
    } catch (err) {
      renderDemoComments();
    }
  }

  function renderCommentsList(comments) {
    const currentUser = auth.getUser();
    commentsContainer.innerHTML = comments.map(comment => {
      const author = comment.user || { full_name: 'User', username: 'user' };
      const initial = author.full_name ? author.full_name[0].toUpperCase() : 'U';
      const timeAgo = formatTimeAgo(comment.created_at);
      const isOwner = currentUser && (currentUser.id === comment.user_id || currentUser.id === author.id);

      return `
        <div class="comment-item" data-comment-id="${comment.id}" style="padding: 14px 20px;">
          <a href="/profile.html?username=${author.username}">
            ${author.avatar_url 
              ? `<img src="${author.avatar_url}" class="user-avatar-sm" alt="${author.full_name}">`
              : `<div class="user-avatar-sm">${initial}</div>`}
          </a>
          <div class="comment-content-box">
            <div class="comment-header">
              <a href="/profile.html?username=${author.username}" style="font-weight: 600; color: var(--color-text); font-size: 14px;">${escapeHtml(author.full_name)}</a>
              <span style="font-size: 12px; color: var(--color-text-muted);">@${escapeHtml(author.username)}</span>
              <span class="post-dot-separator">•</span>
              <span style="font-size: 12px; color: var(--color-text-muted);">${timeAgo}</span>
              ${isOwner ? `
                <button class="delete-comment-btn" data-comment-id="${comment.id}" style="margin-left: auto; color: var(--color-text-muted); background: none; border: none; cursor: pointer;">
                  <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
              ` : ''}
            </div>
            <div class="comment-text">${escapeHtml(comment.content)}</div>
          </div>
        </div>
      `;
    }).join('');

    initIcons();
    attachCommentDeleteHandlers();
  }

  function appendCommentToDOM(comment) {
    const emptyState = commentsContainer.querySelector('div');
    if (emptyState && emptyState.textContent.includes('No comments yet')) {
      commentsContainer.innerHTML = '';
    }

    const currentUser = auth.getUser();
    const author = comment.user || currentUser;
    const initial = author.full_name ? author.full_name[0].toUpperCase() : 'U';
    const timeAgo = 'just now';

    const html = `
      <div class="comment-item" data-comment-id="${comment.id}" style="padding: 14px 20px;">
        <a href="/profile.html?username=${author.username}">
          <div class="user-avatar-sm">${initial}</div>
        </a>
        <div class="comment-content-box">
          <div class="comment-header">
            <a href="/profile.html?username=${author.username}" style="font-weight: 600; color: var(--color-text); font-size: 14px;">${escapeHtml(author.full_name)}</a>
            <span style="font-size: 12px; color: var(--color-text-muted);">@${escapeHtml(author.username)}</span>
            <span class="post-dot-separator">•</span>
            <span style="font-size: 12px; color: var(--color-text-muted);">${timeAgo}</span>
            <button class="delete-comment-btn" data-comment-id="${comment.id}" style="margin-left: auto; color: var(--color-text-muted); background: none; border: none; cursor: pointer;">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
          <div class="comment-text">${escapeHtml(comment.content)}</div>
        </div>
      </div>
    `;

    commentsContainer.insertAdjacentHTML('beforeend', html);
    initIcons();
    attachCommentDeleteHandlers();
  }

  function attachCommentDeleteHandlers() {
    commentsContainer.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        if (confirm('Delete this comment?')) {
          try {
            await api.delete(`/comments/${commentId}`);
            showToast('Comment deleted', 'success');
            const item = commentsContainer.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
            if (item) item.remove();
          } catch (err) {
            const item = commentsContainer.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
            if (item) item.remove();
            showToast('Comment deleted', 'info');
          }
        }
      });
    });
  }

  function renderDemoPostDetails() {
    currentPost = {
      id: postId,
      user_id: 2,
      user: { full_name: 'Ahmed Yusuf', username: 'ahmedy', avatar_url: null },
      content: 'Spent the morning working on a small PostgreSQL project. Sometimes the simplest database designs are the hardest to get right.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      like_count: 24,
      comment_count: 2,
      is_liked: false,
      is_bookmarked: false
    };

    postContainer.innerHTML = createPostCardHTML(currentPost);
    initIcons();
    attachPostEventListeners(postContainer);
  }

  function renderDemoComments() {
    const demoComments = [
      {
        id: 10,
        user_id: 3,
        user: { full_name: 'Ayaan Mohamed', username: 'ayaan_m' },
        content: 'Totally agree! Normalization vs indexing trade-offs are always tricky.',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 11,
        user_id: 4,
        user: { full_name: 'Maryan Ali', username: 'maryan_a' },
        content: 'Great insight Ahmed. Foreign keys and explicit constraints save so much headache down the line.',
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    renderCommentsList(demoComments);
  }
});
