/* Gather Platform - Login & Register Form Logic */

import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { showToast } from '../utils/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  auth.redirectIfAuthenticated();

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authAlert = document.getElementById('auth-error-alert');

  function showError(msg) {
    if (authAlert) {
      authAlert.textContent = msg;
      authAlert.classList.remove('hidden');
    } else {
      showToast(msg, 'error');
    }
  }

  function hideError() {
    if (authAlert) {
      authAlert.classList.add('hidden');
    }
  }

  // Handle Login Form
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();

      const identity = document.getElementById('login-identity').value.trim();
      const password = document.getElementById('login-password').value;

      if (!identity || !password) {
        showError('Please enter your email or username and password.');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      try {
        const response = await api.post('/auth/login', { identity, password });
        auth.setSession(response.token, response.user);
        showToast('Welcome back to Gather!', 'success');
        window.location.href = '/home.html';
      } catch (err) {
        showError(err.message || 'Invalid email/username or password.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log in';
      }
    });
  }

  // Handle Register Form
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();

      const full_name = document.getElementById('reg-fullname').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm_password = document.getElementById('reg-confirm-password').value;

      if (!full_name || !username || !email || !password) {
        showError('All fields are required.');
        return;
      }

      if (password !== confirm_password) {
        showError('Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      try {
        const response = await api.post('/auth/register', {
          full_name,
          username,
          email,
          password
        });

        auth.setSession(response.token, response.user);
        showToast('Account created successfully!', 'success');
        window.location.href = '/home.html';
      } catch (err) {
        showError(err.message || 'Registration failed. Username or email may already be taken.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }
});
