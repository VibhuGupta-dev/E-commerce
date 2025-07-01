const Joi = require('joi');
const userModel = require('../models/user-model');
const ownerModel = require('../models/owner-model');
const { createUser } = require('../utils/generateUser');
const { generateToken } = require('../utils/generateToken');

module.exports.Registeruser = async function(req, res) {
    try {
        console.log('req.body:', req.body);

        const schema = Joi.object({
            Fullname: Joi.string().required().messages({
                'string.empty': 'Fullname is required',
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Please enter a valid email address',
                'string.empty': 'Email is required',
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Password must be at least 6 characters',
                'string.empty': 'Password is required',
            }),
            contact: Joi.number().required().messages({
                'number.base': 'Contact must be a valid number',
                'any.required': 'Contact is required',
            }),
            cart: Joi.array().optional(),
            orders: Joi.array().optional()
        });

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message).join(', ');
            req.flash('error', errorMessages);
            return res.redirect('/');
        }

        const { Fullname, email, password, contact, cart, orders } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already exists');
            return res.redirect('/');
        }

        const user = await createUser({
            Fullname,
            email,
            password,
            contact,
            cart,
            orders
        });

        const token = generateToken(user);
        res.cookie('token', token);
        res.redirect('/products/shop');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Server error');
        res.redirect('/');
    }
};
module.exports.loginuser = async function(req, res) {
    try {
        console.log('loginuser req.body:', req.body);
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Please enter a valid email address',
                'string.empty': 'Email is required',
            }),
            password: Joi.string().required().messages({
                'string.empty': 'Password is required',
            }),
            role: Joi.string().valid('user', 'owner').optional(),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            console.log('Validation error:', error.details[0].message);
            req.flash('error', error.details[0].message);
            return res.redirect('/');
        }

        const { email, password } = req.body;

        const user = await userModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (!user) {
            console.log('User not found for email:', email);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Password invalid for email:', email);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/');
        }

        const token = generateToken(user);
        console.log('Generated userToken:', token);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        res.redirect('/products/shop'); // Fixed redirect
    } catch (err) {
        console.error('loginuser error:', err);
        req.flash('error', 'Server error');
        res.redirect('/');
    }
};
module.exports.logout = function(req, res) {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                req.flash('error', 'Failed to log out');
                return res.redirect('/');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};
module.exports.ownerLogin = async function(req, res) {
    try {
        console.log('ownerLogin req.body:', req.body); // Debug log
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Please enter a valid email address',
                'string.empty': 'Email is required',
            }),
            password: Joi.string().required().messages({
                'string.empty': 'Password is required',
            }),
            role: Joi.string().valid('user', 'owner').optional() // Allow role field
        });

        const { error } = schema.validate(req.body);
        if (error) {
            console.log('Validation error:', error.details[0].message);
            req.flash('error', error.details[0].message);
            return res.redirect('/');
        }

        const { email, password } = req.body;

        const owner = await ownerModel.findOne({ email });
        if (!owner) {
            console.log('Owner not found for email:', email);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/');
        }

        const isPasswordValid = await owner.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Password invalid for email:', email);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/');
        }

        const token = generateToken(owner);
        console.log('Generated ownerToken:', token);
        res.cookie('ownerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.redirect('/owner/admin');
    } catch (err) {
        console.error('ownerLogin error:', err);
        req.flash('error', 'Server error');
        res.redirect('/');
    }
};
module.exports.ownerLogout = function(req, res) {
    res.cookie('ownerToken', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                req.flash('error', 'Failed to log out');
                return res.redirect('/');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};