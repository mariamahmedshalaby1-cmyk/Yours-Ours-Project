const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Professional = require('../models/Professional');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers        = await User.countDocuments();
    const totalBookings     = await Booking.countDocuments();
    const activePros        = await Professional.countDocuments({ verificationStatus: 'approved' });
    const pendingPros       = await Professional.countDocuments({ verificationStatus: 'pending' });
    const rejectedPros      = await Professional.countDocuments({ verificationStatus: 'rejected' });
    const totalPros         = await Professional.countDocuments();
    const bookingActive     = await Booking.countDocuments({ status: 'active' });
    const bookingPending    = await Booking.countDocuments({ status: 'pending' });
    const bookingCompleted  = await Booking.countDocuments({ status: 'completed' });
    const bookingCancelled  = await Booking.countDocuments({ status: 'cancelled' });

    res.json({ totalUsers, totalBookings, activePros, pendingPros, rejectedPros, totalPros, bookingActive, bookingPending, bookingCompleted, bookingCancelled });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/pending-pros', auth, adminOnly, async (req, res) => {
  try {
    const pros = await Professional.find({ verificationStatus: 'pending' }).sort({ createdAt: 1 });
    res.json(pros);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.patch('/verify/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const updated = await Professional.findByIdAndUpdate(req.params.id, {
      verificationStatus: status,
      isVerified: status === 'approved'
    }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Professional not found' });
    res.json({ message: `Professional ${status} successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/bookings', auth, adminOnly, async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const bookings = await Booking.find()
            .populate('client',       'name')
            .populate('professional', 'fullName specialty')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments();

        res.status(200).json({
            bookings,
            currentPage: page,
            totalPages:  Math.ceil(total / limit)
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;