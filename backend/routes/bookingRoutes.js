const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getMyBookings, 
  getAllBookings, 
  updateBookingStatus,
  getDashboardStats
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Consumer & Admin routes
router.route('/')
  .post(protect, createBooking) // Anyone can request an asset
  .get(protect, admin, getAllBookings); // Only Admins can see ALL requests

router.get('/mybookings', protect, getMyBookings); // Users can see their own
router.get('/stats', protect, getDashboardStats);   // Dashboard stats (any authenticated user)

// Admin only routes for managing workflow
router.put('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;