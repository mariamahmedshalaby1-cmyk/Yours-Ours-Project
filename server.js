const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const app = express();

// ─────────────────────────────────────
// STATIC FILES
// ─────────────────────────────────────
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));
// ─────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ← ADDED

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/professionals', require('./routes/professionals'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/admin',         require('./routes/admin'));

// ─────────────────────────────────────
// CONNECT TO MONGODB
// ─────────────────────────────────────
mongoose.connect(process.env.MY_DATABASE, {
    serverSelectionTimeoutMS: 5000,
    family: 4
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.log('❌ MongoDB connection failed:', err.message));

// ─────────────────────────────────────
// START SERVER
// ─────────────────────────────────────
app.listen(3000, () => {
    console.log('✅ Server is running on port 3000');
});
