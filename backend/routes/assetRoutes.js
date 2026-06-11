const express = require('express');
const router = express.Router();
const { getAssets, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route mapping
// .get() is protected for all users. .post() requires admin.
router.route('/')
  .get(protect, getAssets)
  .post(protect, admin, createAsset);

// Operations on specific IDs require admin
router.route('/:id')
  .put(protect, admin, updateAsset)
  .delete(protect, admin, deleteAsset);

module.exports = router;