const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User').default;
const auth = require('../middleware/auth');
// ─────────────────────────────────────
// SIGNUP — connects to your signup.html
// ─────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password before saving
        const hashed = await bcrypt.hash(password, 10);

        // Save new user to database
        await User.create({ 
            name, 
            email, 
            phone, 
            password: hashed, 
            role 
        });

        res.status(201).json({ message: 'Account created successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────
// LOGIN — connects to your login.html
// ─────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create a token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send token + user info back to frontend
       res.status(200).json({
        token,
        role:   user.role,
        name:   user.name,
        userId: user._id
   }); 
        
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────
// GET USER — connects to your account.html
// ─────────────────────────────────────
router.get('/user/:id', auth, async (req, res) => {
    try {
        // Find user by ID but don't return the password
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────
// FORGOT PASSWORD — connects to forgot-password.html
// ─────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        await User.findOne({ email: req.body.email });
        // We don't tell them if email exists or not for security
        res.json({ message: 'If this email exists, a reset link has been sent.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
/*Someone fills signup form
→ POST /signup runs
→ checks email not taken
→ hashes password
→ saves to database
→ sends success message

Someone fills login form  
→ POST /login runs
→ finds user by email
→ checks password
→ creates token
→ sends token + info back

account.html loads
→ GET /user/:id runs
→ finds user by id
→ sends user info back (no password)

forgot-password form submitted
→ POST /forgot-password runs
→ sends success message*/