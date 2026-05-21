const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Professional = require('../models/Professional');

// POST — save a new review (connects to write-review.html)
router.post('/', async (req, res) => {
  try {
    const { professionalId, clientId, clientName, rating, text } = req.body;

    const review = await Review.create({ professionalId, clientId, clientName, rating, text });

    // Recalculate the professional's average rating automatically
    const allReviews = await Review.find({ professionalId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Professional.findByIdAndUpdate(professionalId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: allReviews.length
    });

    res.status(201).json(review);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET — load all reviews for one professional (connects to profile.html)
router.get('/:professionalId', async (req, res) => {
  try {
    const reviews = await Review.find({ professionalId: req.params.professionalId })
      .sort({ createdAt: -1 }); // newest first

    res.json(reviews);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;