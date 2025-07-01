const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owner-model');

module.exports = async function(req, res, next) {
    const token = req.cookies.ownerToken;
    console.log('ownerToken:', token); // Debug log
    if (!token) {
        req.flash('error', 'You need to login as owner first');
        return res.redirect('/');
    }

    try {
        let decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log('Decoded JWT:', decoded); // Debug log
        let owner = await ownerModel
            .findOne({ email: decoded.email })
            .select('-password');
        console.log('Owner found:', owner); // Debug log
        if (!owner) {
            req.flash('error', 'Owner not found');
            return res.redirect('/');
        }
        req.owner = owner;
        next();
    } catch (err) {
        console.error('IsOwnerLoggedIn error:', err.message);
        req.flash('error', 'Something went wrong');
        res.redirect('/');
    }
};