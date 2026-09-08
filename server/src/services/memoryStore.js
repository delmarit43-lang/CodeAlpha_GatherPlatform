/* Gather Platform - In-Memory Fallback Store */

const { getSeedData } = require('../utils/seedData');
const bcrypt = require('bcryptjs');

class MemoryStore {
  constructor() {
    this.initialized = false;
    this.users = [];
    this.posts = [];
    this.comments = [];
    this.likes = [];
    this.follows = [];
    this.bookmarks = [];
    this.notifications = [];
  }

  async init() {
    if (this.initialized) return;
    const seed = await getSeedData();
    this.users = seed.users;
    this.posts = seed.posts;
    this.comments = seed.comments;
    this.likes = seed.likes;
    this.follows = seed.follows;
    this.bookmarks = seed.bookmarks;
    this.notifications = seed.notifications;
    this.initialized = true;
  }
}

const memoryStore = new MemoryStore();
memoryStore.init();

module.exports = memoryStore;
