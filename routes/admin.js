const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Professional = require('../models/Professional');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// GET — dashboard stats, verification stats, bookingshistory stats (connects to admin/dashboard.html, admin/verification.html, admin/bookingshistory.html)
router.get('/stats', auth, async (req, res) => {
  try {
    const totalUsers        = await User.countDocuments();
    const totalBookings     = await Booking.countDocuments();
    const activePros        = await Professional.countDocuments({ verificationStatus: 'approved' });
    const pendingPros       = await Professional.countDocuments({ verificationStatus: 'pending' });
    const rejectedPros      = await Professional.countDocuments({ verificationStatus: 'rejected' });
    const totalPros         = await Professional.countDocuments();
    const bookingActive = await Booking.countDocuments({ status: 'active' });
    const bookingPending    = await Booking.countDocuments({ status: 'pending' });
    const bookingCompleted  = await Booking.countDocuments({ status: 'completed' });
    const bookingCancelled  = await Booking.countDocuments({ status: 'cancelled' });

    res.json({
      totalUsers,
      totalBookings,
      activePros,
      pendingPros,
      rejectedPros,
      totalPros,
      bookingActive,
      bookingPending,
      bookingCompleted,
      bookingCancelled
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET — pending verification queue (connects to admin/verification.html)
router.get('/pending-pros', auth, async (req, res) => {
  try {
    const pros = await Professional.find({ verificationStatus: 'pending' })
      .sort({ createdAt: 1 });

    res.json(pros);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH — approve or reject a professional
router.patch('/verify/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    await Professional.findByIdAndUpdate(req.params.id, {
      verificationStatus: status,
      isVerified: status === 'approved'
    });

    res.json({ message: `Professional ${status} successfully` });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET — all bookings (connects to admin/bookingshistory.html)
router.get('/bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('client', 'name')
      .populate('professional', 'fullName specialty')
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;