const express = require('express');
const router = express.Router();
const productModel = require('../models/product-model');
const addressModel = require('../models/address-model');
const IslogedIn = require('../middlewares/IslogedIn');
const orderModel = require('../models/order-model')
    // GET /cart - Render the cart page with items and address form
router.get('/', IslogedIn, async(req, res) => {
    try {
        if (!req.session.cart) {
            req.session.cart = [];
        }

        const cartItems = req.session.cart;
        const productIds = cartItems.map((item) => item.productId);
        const products = await productModel.find({ _id: { $in: productIds } });

        const cartWithDetails = cartItems.map((item) => {
            const product = products.find((p) => p._id.toString() === item.productId);
            return {
                productId: item.productId,
                quantity: item.quantity,
                name: product ? product.name : 'Unknown Product',
                price: product ? product.price : 0,
                image: product ? product.Image : null,
                mimeType: product ? product.mimeType : null,
                discount: product ? product.discount : 0,

            };
        });

        const total = cartWithDetails.reduce((sum, item) => {
            const discountedPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            return sum + discountedPrice * item.quantity;
        }, 0);

        res.render('cart', { cartItems: cartWithDetails, total, flash: req.flash() });
    } catch (error) {
        console.error('Error fetching cart:', error);
        req.flash('error', 'Unable to load cart. Please try again.');
        res.redirect('/products/shop');
    }
});

// POST /cart/add/:productId - Add or increment product in cart
router.post('/add/:productId', IslogedIn, async(req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const cartItem = req.session.cart.find((item) => item.productId === productId);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            req.session.cart.push({ productId, quantity: 1 });
        }

        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ message: 'Session save error' });
            }
            res.json({ message: 'Product added to cart', cart: req.session.cart });
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /cart/decrease/:productId - Decrease quantity or remove product
router.post('/decrease/:productId', IslogedIn, async(req, res) => {
    try {
        const productId = req.params.productId;
        if (!req.session.cart) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const cartItem = req.session.cart.find((item) => item.productId === productId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Product not in cart' });
        }

        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ message: 'Session save error' });
                }
                res.json({ message: 'Quantity decreased', cart: req.session.cart });
            });
        } else {
            req.session.cart = req.session.cart.filter((item) => item.productId !== productId);
            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ message: 'Session save error' });
                }
                res.json({ message: 'Product removed from cart', cart: req.session.cart });
            });
        }
    } catch (error) {
        console.error('Error decreasing quantity:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /cart/remove/:productId - Remove product from cart
router.post('/remove/:productId', IslogedIn, async(req, res) => {
    try {
        const productId = req.params.productId;
        if (req.session.cart) {
            req.session.cart = req.session.cart.filter((item) => item.productId !== productId);
            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.redirect('/cart');
                }
                res.redirect('/cart');
            });
        } else {
            res.redirect('/cart');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        req.flash('error', 'Unable to remove item. Please try again.');
        res.redirect('/cart');
    }
});

// POST /cart/checkout - Process checkout with address
router.post('/checkout', IslogedIn, async(req, res) => {
    try {
        const { cityname, statename, pincode, phone_number, full_address } = req.body;

        if (!req.session.cart || req.session.cart.length === 0) {
            req.flash('error', 'Your cart is empty.');
            return res.redirect('/cart');
        }

        // Save address
        await addressModel.create({
            cityname,
            statename,
            pincode,
            phone_number,
            full_address,
            createdAt: Date.now(),
        });

        // Clear cart after successful order
        req.session.cart = [];
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                req.flash('error', 'Failed to place order. Please try again.');
                return res.redirect('/cart');
            }
            req.flash('success', 'Order placed successfully!');
            res.redirect('/cart');
        });
    } catch (error) {
        console.error('Error processing checkout:', error);
        req.flash('error', 'Failed to place order. Please try again.');
        res.redirect('/cart');
    }
});

module.exports = router;