const express = require('express');
const router = express.Router();
const Professional = require('../models/Professional');
const auth = require('../middleware/auth');

// Get all professionals
router.get('/', async (req, res) => {
    try {
        const { specialty, minRating, search } = req.query;
        const filter = {};
        if (specialty) filter.specialty = specialty;
        if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };
        if (search) filter.fullName = { $regex: search, $options: 'i' };

        const professionals = await Professional.find(filter).select('-nationalId');
        res.json(professionals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get one professional by ID
router.get('/:id', async (req, res) => {
    try {
        const professional = await Professional.findById(req.params.id).select('-nationalId');
        if (!professional) return res.status(404).json({ error: 'Professional not found' });
        res.json(professional);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new professional
router.post('/', async (req, res) => {
    try {
        const { fullName, email, phone, specialty, experienceYears, services, bio } = req.body;
        const professional = new Professional({ fullName, email, phone, specialty, experienceYears, services, bio });
        const saved = await professional.save();
        res.status(201).json(saved);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Email already registered' });
        res.status(400).json({ error: err.message });
    }
});

// Update profile (Edit Profile page)
router.put('/:id', auth, async (req, res) => {
    try {
        const allowedFields = ['fullName', 'email', 'phone', 'profilePicture', 'specialty', 'experienceYears', 'services', 'bio'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        const updated = await Professional.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-nationalId');
        if (!updated) return res.status(404).json({ error: 'Professional not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Upload National ID and verify
router.put('/:id/verify', auth, async (req, res) => {
    try {
        const { nationalId } = req.body;
       const updated = await Professional.findByIdAndUpdate(
            req.params.id,
            { nationalId, verificationStatus: 'pending' },
            { new: true }
        ).select('-nationalId');
        if (!updated) return res.status(404).json({ error: 'Professional not found' });
        res.json({ message: 'National ID submitted. Awaiting admin review.', professional: updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add a work session (Requests page)
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

// Get all work sessions (Requests page)
router.get('/:id/sessions', async (req, res) => {
    try {
        const professional = await Professional.findById(req.params.id).select('workSessions');
        if (!professional) return res.status(404).json({ error: 'Professional not found' });
        res.json(professional.workSessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get dashboard analytics
router.get('/:id/dashboard', async (req, res) => {
    try {
        const professional = await Professional.findById(req.params.id).select('fullName completedJobs averageRating totalEarnings avgResponseTime workSessions');
        if (!professional) return res.status(404).json({ error: 'Professional not found' });
        res.json(professional);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a professional
router.delete('/:id', auth, async (req, res) => {
    try {
        const deleted = await Professional.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Professional not found' });
        res.json({ message: 'Professional deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
