const Booking = require('../models/Booking');
const Asset = require('../models/Asset');

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Consumers & Admins)
exports.createBooking = async (req, res) => {
  try {
    const { assetId, quantity, startDate, endDate, purpose } = req.body;

    // 1. Verify the asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    // 2. Prevent requests exceeding available inventory
    if (quantity > asset.quantity) {
      return res.status(400).json({ 
        message: `Request exceeds available inventory. Only ${asset.quantity} left.` 
      });
    }

    // 3. Create the booking request (Defaults to 'Pending')
    const booking = await Booking.create({
      user: req.user._id,
      asset: assetId,
      quantity,
      startDate,
      endDate,
      purpose
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking request', error: error.message });
  }
};

// @desc    Get logged-in user's bookings (For "My History")
// @route   GET /api/bookings/mybookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('asset', 'name category') // Pulls the asset name and category into the response
      .sort('-createdAt'); // Sorts by newest first
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your bookings' });
  }
};

// @desc    Get ALL bookings (For Admin Approvals & System History)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('asset', 'name category quantity')
      .sort('-createdAt');
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system bookings' });
  }
};

// @desc    Update booking status (Approve, Reject, Return)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const asset = await Asset.findById(booking.asset);

    // LOGIC: If Admin Approves, deduct from inventory
    if (status === 'Approved' && booking.status === 'Pending') {
      if (asset.quantity < booking.quantity) {
         return res.status(400).json({ message: 'Not enough inventory to approve this request' });
      }
      asset.quantity -= booking.quantity;
      
      // Update asset status to Out of Stock if it hits 0
      if (asset.quantity === 0) asset.status = 'Out of Stock';
      else if (asset.quantity <= 2) asset.status = 'Low Stock';
      
      await asset.save();
    }

    // LOGIC: If Asset is Returned, add back to inventory
    if (status === 'Returned' && booking.status === 'Approved') {
      asset.quantity += booking.quantity;
      
      // Reset asset status based on new quantity
      if (asset.quantity > 2) asset.status = 'Available';
      else if (asset.quantity > 0) asset.status = 'Low Stock';
      
      await asset.save();
      booking.actualReturnDate = Date.now();
    }

    // Update the booking status
    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

// @desc    Get aggregated dashboard stats (booking trend + summary counts)
// @route   GET /api/bookings/stats
// @access  Private (all authenticated users)
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // Build the last-6-months date boundary
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Fetch only bookings in the last 6 months to compute the trend
    const recentBookings = await Booking.find({
      createdAt: { $gte: sixMonthsAgo },
    }).select('status endDate createdAt');

    // Fetch all approved bookings to count active / overdue
    const allApproved = await Booking.find({ status: 'Approved' }).select('endDate');

    const activeBookings = allApproved.length;
    const overdueReturns = allApproved.filter(b => new Date(b.endDate) < now).length;

    // Group recent bookings by YYYY-M and status
    const trendMap = {};
    recentBookings.forEach(b => {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!trendMap[key]) trendMap[key] = { Approved: 0, Pending: 0, Returned: 0 };
      const s = ['Approved', 'Returned'].includes(b.status) ? b.status : 'Pending';
      trendMap[key][s]++;
    });

    // Build ordered array for the last 6 months
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      trend.push({
        name: MONTH_NAMES[d.getMonth()],
        Approved: trendMap[key]?.Approved || 0,
        Pending:  trendMap[key]?.Pending  || 0,
        Returned: trendMap[key]?.Returned || 0,
      });
    }

    res.json({ activeBookings, overdueReturns, trend });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};