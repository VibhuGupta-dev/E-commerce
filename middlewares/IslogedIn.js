const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');

module.exports = async function(req, res, next) {
    const token = req.cookies.token;
    console.log('Token in IslogedIn:', token); // Debug log
    if (!token) {
        req.flash('error', 'You need to log in first');
        return res.redirect('/');
    }

    try {
        let decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log('Decoded JWT:', decoded); // Debug log
        let user = await userModel
            .findOne({ email: decoded.email })
            .select('-password');
        console.log('User found:', user); // Debug log
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/');
        }
        req.user = user; // Attach user to request
        next();
    } catch (err) {
        console.error('IslogedIn error:', err.message);
        req.flash('error', 'Invalid or expired token. Please log in again.');
        res.redirect('/');
    }
};