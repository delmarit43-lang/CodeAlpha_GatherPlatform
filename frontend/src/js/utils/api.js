/* Gather Platform - Reusable Fetch API Utility */

import { auth } from './auth.js';

const API_BASE_URL = '/api';

/**
 * Custom Error class for API responses
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Standard HTTP Request Wrapper using Fetch API
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = auth.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = (data && data.message) ? data.message : `Request failed with status ${response.status}`;
      if (response.status === 401) {
        // Token invalid or expired
        auth.logout();
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or server offline error
    console.warn(`API call failed to ${url}, checking offline mode:`, error);
    throw new ApiError(error.message || 'Network error, please check connection', 500);
  }
}

export const api = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Upload file multipart request
   */
  async upload(endpoint, formData) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = auth.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data);
    }
    return data;
  }
};
