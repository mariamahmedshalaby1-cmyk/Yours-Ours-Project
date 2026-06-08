const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
// ─────────────────────────────────────
// SIGNUP — connects to your signup.html
// ─────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const allowedRoles = ['client', 'professional'];
        if (!role || !allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

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

        if (!email || !password) {
           return res.status(400).json({ message: 'Email and password are required' });
        }

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
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'If this email exists, a reset link has been sent.' });
        }

        // Create a reset token
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set up email transporter
       const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

        // Build the reset link
        const resetLink = `http://localhost:3000/html/landing-page/reset-password.html?token=${resetToken}`;

        // Send the email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Yours & Ours — Password Reset',
            html: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                <a href="${resetLink}">Reset My Password</a>
            `
        });

        res.json({ message: 'If this email exists, a reset link has been sent.' });

    } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error' });
}
});
// ─────────────────────────────────────
// RESET PASSWORD — connects to reset-password.html
// ─────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Hash the new password
        const hashed = await bcrypt.hash(password, 10);

        // Update the user's password
        await User.findByIdAndUpdate(decoded.id, { password: hashed });

        res.json({ message: 'Password reset successful' });

    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(400).json({ message: 'Invalid or expired reset link' });
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
