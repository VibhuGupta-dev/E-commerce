const express = require('express');
const router = express.Router();
const productModel = require('../models/product-model');
const upload = require('../config/multer-config');
const IsOwnerLoggedIn = require('../middlewares/IsOwnerLoggedIn');
const IslogedIn = require('../middlewares/IslogedIn')

router.post('/create', IsOwnerLoggedIn, upload.single('Image'), async(req, res) => {
    try {
        console.log('POST /products/create - User:', req.user);
        console.log('Request Body:', req.body);
        console.log('Uploaded File:', req.file ? { size: req.file.size, mimetype: req.file.mimetype } : 'No file');

        const { name, price, description, quantity, discount } = req.body;
        if (!req.file) {
            console.warn('Validation failed: Missing image');
            req.flash('error', 'Product image is required');
            return res.redirect('/owner/admin');
        }
        if (!name || !price || !description || !quantity) {
            console.warn('Validation failed: Missing fields', { name, price, description, quantity });
            req.flash('error', 'Name, price, description, and quantity are required');
            return res.redirect('/owner/admin');
        }

        const parsedPrice = parseFloat(price);
        const parsedDiscount = parseFloat(discount) || 0;
        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            console.warn('Validation failed: Invalid price', { price });
            req.flash('error', 'Price must be a positive number');
            return res.redirect('/owner/admin');
        }
        if (parsedDiscount < 0 || parsedDiscount > 100) {
            console.warn('Validation failed: Invalid discount', { discount });
            req.flash('error', 'Discount must be between 0 and 100');
            return res.redirect('/owner/admin');
        }
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            console.warn('Validation failed: Invalid quantity', { quantity });
            req.flash('error', 'Quantity must be a positive number');
            return res.redirect('/owner/admin');
        }

        const createdProduct = await productModel.create({
            Image: req.file.buffer,
            mimeType: req.file.mimetype,
            name: name.trim(),
            price: parsedPrice,
            discount: parsedDiscount,
            description: description.trim(),
            quantity: parsedQuantity,
            createdAt: new Date(),
        });

        console.log('Product created:', createdProduct);
        req.flash('success', 'Product created successfully');
        res.redirect('/owner/admin');
    } catch (error) {
        console.error('Error creating product:', {
            message: error.message,
            stack: error.stack,
            body: req.body,
            file: req.file ? { size: req.file.size, mimetype: req.file.mimetype } : 'No file',
        });
        req.flash('error', `Failed to create product: ${error.message}`);
        res.redirect('/owner/admin');
    }
});

router.get('/shop', async(req, res) => {
    try {
        const sortby = req.query.sortby || 'popular';
        let sortOption = {};
        if (sortby === 'newest') {
            sortOption = { createdAt: -1 };
        } else if (sortby === 'price-low') {
            sortOption = { price: 1 };
        } else if (sortby === 'price-high') {
            sortOption = { price: -1 };
        }
        const products = await productModel.find().sort(sortOption);
        const cartCount = req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
        res.render('shop', {
            product: products,
            cartCount,
            flash: req.flash(),
            sortby,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        req.flash('error', 'Unable to load products. Please try again.');
        res.redirect('/');
    }
});

router.get('/', function(req, res) {
    res.send('hey');
});

module.exports = router;