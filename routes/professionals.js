const express      = require('express');
const router       = express.Router();
const Professional = require('../models/Professional');
const auth         = require('../middleware/auth');


// GET all professionals — public, no auth needed
router.get('/', async (req, res) => {
    try {
        const { specialty, minRating, search } = req.query;
        const filter = {};
        filter.verificationStatus = 'approved';
        if (specialty)  filter.specialty      = specialty;
        if (minRating)  filter.averageRating  = { $gte: parseFloat(minRating) };
        if (search)     filter.fullName       = { $regex: search, $options: 'i' };

        const professionals = await Professional.find(filter).select('-nationalId');
        res.status(200).json(professionals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all pending professionals — for admin
router.get('/pending', auth, async (req, res) => {
    try {
        const professionals = await Professional.find({ verificationStatus: 'pending' }).select('-nationalId');
        res.status(200).json(professionals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET professional by userId
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const professional = await Professional.findOne({ userId: req.params.userId }).select('-nationalId');
        if (!professional) return res.status(404).json({ error: 'Professional not found' });
        res.status(200).json(professional);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET one professional by ID — public, no auth needed
router.get('/:id', async (req, res) => {
    try {
        const professional = await Professional.findById(req.params.id).select('-nationalId');
        if (!professional) return res.status(404).json({ error: 'Professional not found' });
        res.status(200).json(professional);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// CREATE a professional profile — auth REQUIRED
router.post('/', auth, async (req, res) => {  // ← auth ADDED
    try {
        const { fullName, email, phone, specialty, experienceYears, services, bio } = req.body;

        const professional = new Professional({
            userId: req.user.id,  // ← ADDED — comes from token automatically
            fullName,
            email,
            phone,
            specialty,
            experienceYears,
            services,
            bio
        });

        const saved = await professional.save();
        res.status(201).json(saved);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Email already registered' });
        res.status(400).json({ error: err.message });
    }
});


// UPDATE profile
router.put('/:id', auth, async (req, res) => {
    try {
        const allowedFields = ['fullName', 'email', 'phone', 'profilePicture', 'specialty', 'experienceYears', 'services', 'bio', 'city', 'startingFee', 'promise1', 'promise2', 'promise3'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const updated = await Professional.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-nationalId');

        if (!updated) return res.status(404).json({ error: 'Professional not found' });
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// SUBMIT national ID for verification
router.put('/:id/verify', auth, async (req, res) => {
    try {
        const { nationalId } = req.body;

        const updated = await Professional.findByIdAndUpdate(
            req.params.id,
            { nationalId, verificationStatus: 'pending' },
            { new: true }
        ).select('-nationalId');

        if (!updated) return res.status(404).json({ error: 'Professional not found' });
        res.status(200).json({ message: 'National ID submitted. Awaiting admin review.', professional: updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// ADD a work session
router.post('/:id/sessions', auth, async (req, res) => {
    try {
        const { date, startTime, endTime, serviceType, location } = req.body;
        const professional = await Professional.findById(req.params.id);
        if (!professional) return res.status(404).json({ error: 'Professional not found' });

        professional.workSessions.push({ date, startTime, endTime, serviceType, location });
        await professional.save();
        res.status(201).json(professional.workSessions);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// GET all work sessions
router.get('/:id/sessions', async (req, res) => {
    try {
        const professional = await Professional.findById(req.params.id).select('workSessions');
        if (!professional) return res.status(404).json({ error: 'Professional not found' });
        res.status(200).json(professional.workSessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET dashboard analytics — auth REQUIRED
router.get('/:id/dashboard', auth, async (req, res) => {  // ← auth ADDED
    try {
        const professional = await Professional.findById(req.params.id)
            .select('fullName completedJobs averageRating totalEarnings avgResponseTime workSessions');
        if (!professional) return res.status(404).json({ error: 'Professional not found' });
        res.status(200).json(professional);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// DELETE a professional
router.delete('/:id', auth, async (req, res) => {
    try {
        const deleted = await Professional.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Professional not found' });
        res.status(200).json({ message: 'Professional deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
