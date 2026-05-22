const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const auth    = require('../middleware/auth'); 

router.post('/', auth, async (req, res) => {
    try {

        if (!req.body.clientId || !req.body.professionalId) {
            return res.status(400).json({ message: 'Client and professional are required' });
        }
        if (!req.body.description || req.body.description.trim() === '') {
            return res.status(400).json({ message: 'Please describe the issue' });
        }
        if (!req.body.scheduledTime) {
            return res.status(400).json({ message: 'Please select a time slot' });
        }
        if (!req.body.address || !req.body.address.neighborhood || !req.body.address.street) {
            return res.status(400).json({ message: 'Please enter your full address' });
        }

        const pin = Math.floor(1000 + Math.random() * 9000).toString();

        const newBooking = new Booking({
            client:        req.body.clientId,
            professional:  req.body.professionalId,
            service:       req.body.service,
            description:   req.body.description,
            isEmergency:   req.body.isEmergency,
            scheduledTime: req.body.scheduledTime,
            address:       req.body.address,
            photo:         req.file ? req.file.filename : '',
            pin:           pin,
            status:        'pending'
        });

        await newBooking.save();

        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/client/:clientId', auth, async (req, res) => {
    try {

        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const bookings = await Booking.find({ client: req.params.clientId })
            .populate('professional', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments({ client: req.params.clientId });

        res.status(200).json({
            bookings,
            currentPage: page,
            totalPages:  Math.ceil(total / limit)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {

        const booking = await Booking.findById(req.params.id)
            .populate('client',       'name email phone')
            .populate('professional', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json(booking);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {

        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const bookings = await Booking.find()
            .populate('client',       'name email')
            .populate('professional', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments();

        res.status(200).json({
            bookings,
            currentPage: page,
            totalPages:  Math.ceil(total / limit)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/status', auth, async (req, res) => {
    try {

        const allowed = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
        if (!allowed.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Status updated', booking });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {

        const booking = await Booking.findByIdAndDelete(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;