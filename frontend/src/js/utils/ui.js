const THEME_KEY = 'gather_theme';

/**
 * Initialize saved theme on document load
 */
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'warm';
  setTheme(savedTheme);
  return savedTheme;
}

/**
 * Set active theme and save preference
 * @param {'warm'|'dark'|'cyberpunk'|'ocean'} themeName 
 */
export function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(THEME_KEY, themeName);
}

/**
 * Get active saved theme
 */
export function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) || 'warm';
}

// Auto-apply theme immediately
initTheme();

/**
 * Render Lucide icons automatically if lucide global is loaded
 */
export function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Show toast notification
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  initIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Escape HTML string to prevent XSS
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format relative timestamp (e.g. 2h, 18m, 3d)
 * @param {string|Date} dateInput 
 */
export function formatTimeAgo(dateInput) {
  if (!dateInput) return 'just now';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format relative date long string
 */
export function formatDateLong(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Extract initial letters for avatar placeholder fallback
 */
export function getInitials(name) {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
