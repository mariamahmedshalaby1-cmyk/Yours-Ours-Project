const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────

// Person 1 - Auth routes (done)
app.use('/api/auth', require('./routes/auth'));

// Person 2 - Professionals routes (done)
 app.use('/api/professionals', require('./routes/professionals'));

// Person 3 - Bookings routes (not done yet)
// app.use('/api/bookings', require('./routes/bookings'));

// Person 4 - Reviews + Admin routes (done)
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin',   require('./routes/admin'));

// Person 5 - Payments (not done yet)
// app.use('/api/payments', require('./routes/payments'));

// ─────────────────────────────────────
// CONNECT TO MONGODB ATLAS
// ─────────────────────────────────────
mongoose.connect(process.env.MY_DATABASE, {
    serverSelectionTimeoutMS: 5000,
    family: 4
})
    .then(() => {
        console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
        console.log('❌ MongoDB connection failed:', err.message);
    });

// ─────────────────────────────────────
// START SERVER
// ─────────────────────────────────────
app.listen(3000, () => {
    console.log('✅ Server is running on port 3000');
});
