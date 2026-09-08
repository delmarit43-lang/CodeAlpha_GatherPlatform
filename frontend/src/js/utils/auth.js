/* Gather Platform - Auth Helper Utility */

const TOKEN_KEY = 'gather_jwt_token';
const USER_KEY = 'gather_user_data';

export const auth = {
  /**
   * Save auth session
   */
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Get JWT token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get logged in user object
   */
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  /**
   * Update active user stored local data
   */
  updateUser(updatedFields) {
    const user = this.getUser();
    if (user) {
      const newUser = { ...user, ...updatedFields };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      window.dispatchEvent(new CustomEvent('gather:user-updated', { detail: newUser }));
      return newUser;
    }
    return null;
  },

  /**
   * Is user authenticated
   */
  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  },

  /**
   * Clear auth session (Logout)
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login.html';
  },

  /**
   * Require login on protected pages
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
    }
  },

  /**
   * Redirect if already logged in (for login/register pages)
   */
  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = '/home.html';
    }
  }
};
