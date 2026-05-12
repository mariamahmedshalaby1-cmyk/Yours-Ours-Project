const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Step 1: Get the token from the request
    const token = req.headers['authorization'];

    // Step 2: If no token exists, block them
    if (!token) {
        return res.status(401).json({ 
            message: 'Access denied. Please log in first.' 
        });
    }

    // Step 3: Check if token is real and not expired
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ 
            message: 'Invalid or expired token. Please log in again.' 
        });
    }
};