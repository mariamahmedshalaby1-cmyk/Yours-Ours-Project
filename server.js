const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/professionals', require('./routes/professionals'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/admin',         require('./routes/admin'));

mongoose.connect(process.env.MY_DATABASE, {
    serverSelectionTimeoutMS: 5000,
    family: 4
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.log('❌ MongoDB connection failed:', err.message));

app.listen(3000, () => {
    console.log('✅ Server is running on port 3000');
});