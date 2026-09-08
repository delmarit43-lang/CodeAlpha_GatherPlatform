/* Gather Platform - Bookmark Controller */

const bookmarkService = require('../services/bookmarkService');

class BookmarkController {
  async addBookmark(req, res, next) {
    try {
      const result = await bookmarkService.addBookmark(req.user.id, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async removeBookmark(req, res, next) {
    try {
      const result = await bookmarkService.removeBookmark(req.user.id, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getBookmarks(req, res, next) {
    try {
      const bookmarks = await bookmarkService.getBookmarks(req.user.id);
      res.json(bookmarks);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookmarkController();
