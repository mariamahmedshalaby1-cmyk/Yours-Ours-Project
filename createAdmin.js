//wont run this file again i'll just keep it to remember how we made the admin acc we only run this file once 
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MY_DATABASE).then(async () => {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
        name: 'Admin',
        email: 'admin@yoursandours.com',
        phone: '01000000000',
        password: hashed,
        role: 'admin'
    });
    console.log('✅ Admin created successfully');
    process.exit();
}).catch(err => {
    console.log('❌ Error:', err.message);
    process.exit();
});