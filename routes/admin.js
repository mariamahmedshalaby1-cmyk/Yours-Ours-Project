const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Professional = require('../models/Professional');
const Booking = require('../models/Booking');

// GET — dashboard stats (connects to admin/dashboard.html)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activePros    = await Professional.countDocuments({ verificationStatus: 'approved' });
    const pendingPros   = await Professional.countDocuments({ verificationStatus: 'pending' });

    res.json({ totalUsers, totalBookings, activePros, pendingPros });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET — pending verification queue (connects to admin/verification.html)
router.get('/pending-pros', async (req, res) => {
  try {
    const pros = await Professional.find({ verificationStatus: 'pending' })
      .sort({ createdAt: 1 }); // oldest requests first (fairest order)

    res.json(pros);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH — approve or reject a professional (connects to Approve/Reject buttons)
router.patch('/verify/:id', async (req, res) => {
  try {
    const { status } = req.body; // expects 'approved' or 'rejected'

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
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('clientId', 'name')
      .populate('professionalId', 'name specialty')
      .sort({ createdAt: -1 }); // newest first

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;