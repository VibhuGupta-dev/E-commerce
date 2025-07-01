const express = require('express');
const ownerModel = require('../models/owner-model');
const IsOwnerLoggedIn = require('../middlewares/IsOwnerLoggedIn');
const { ownerLogout, ownerLogin } = require("../controllers/authcontroller");
const router = express.Router();
const productModel = require('../models/product-model');
const upload = require('../config/multer-config');
const orderModel = require('../models/order-model');



if (process.env.NODE_ENV === "development") {
    router.post("/create", async function(req, res) {
        try {
            let owners = await ownerModel.find();
            if (owners.length > 0) {
                req.flash('error', "You don't have permission to create an owner");
                return res.redirect('/');
            }

            const { Fullname, email, password, products } = req.body;

            if (!Fullname || !email || !password) {
                req.flash('error', 'Fullname, email, and password are required');
                return res.redirect('/');
            }

            let createdOwner = await ownerModel.create({
                Fullname,
                email,
                password,
                products: products || [],
            });

            console.log('req.body:', req.body);
            res.redirect('/owner/admin');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Server error');
            res.redirect('/');
        }
    });
}

router.post("/login", ownerLogin);

router.get("/admin", IsOwnerLoggedIn, function(req, res) {
    res.render("createproduct", {
        flash: {
            success: req.flash("success"),
            error: req.flash("error"),
        },
    });
});

router.get("/admin/editwindow", IsOwnerLoggedIn, async(req, res) => {
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
        res.render('chooseproduct', {
            product: products,
            cartCount,
            flash: req.flash(),
            sortby,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        req.flash('error', 'Unable to load products. Please try again.');
        res.render('createproduct');
    }
});

// Render edit form
router.get('/edit/:id', IsOwnerLoggedIn, async(req, res) => {
    try {
        const productId = req.params.id;
        console.log('GET /edit/:id - Product ID:', productId);
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            console.warn('Invalid product ID:', productId);
            req.flash('error', 'Invalid product ID');
            return res.redirect('/owner/admin/editwindow');
        }
        const product = await productModel.findById(productId);
        if (!product) {
            console.warn('Product not found:', productId);
            req.flash('error', 'Product not found');
            return res.redirect('/owner/admin/editwindow');
        }
        res.render('editproducts', {
            product,
            flash: {
                success: req.flash('success'),
                error: req.flash('error'),
            },
        });
    } catch (err) {
        console.error('Error loading product:', err.message);
        req.flash('error', 'Error loading product');
        res.redirect('/owner/admin/editwindow');
    }
});

router.post('/delete/:productId', IsOwnerLoggedIn, async(req, res) => {
    try {
        console.log('Delete route hit with method:', req.method, 'URL:', req.url);
        const productId = req.params.productId;
        console.log('Attempting to delete productId:', productId);

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Invalid product ID:', productId);
            req.flash('error', 'Invalid product ID');
            return res.redirect('/owner/admin/editwindow');
        }

        const deletedProduct = await productModel.findByIdAndDelete(productId);
        console.log('Delete result:', deletedProduct);

        if (!deletedProduct) {
            console.log('Product not found for ID:', productId);
            req.flash('error', 'Product not found');
            return res.redirect('/owner/admin/editwindow');
        }

        req.flash('success', 'Product deleted successfully');
        console.log('Product deleted successfully, redirecting to /owner/admin/editwindow');
        res.redirect('/owner/admin/editwindow');
    } catch (error) {
        console.error('Error deleting product:', error.message, error.stack);
        req.flash('error', 'Unable to delete product. Please try again.');
        res.redirect('/owner/admin/editwindow');
    }
});



// Handle form submission
router.post('/edit/:id', IsOwnerLoggedIn, upload.single('image'), async(req, res) => {
    try {
        const productId = req.params.id;
        console.log('POST /edit/:id - Product ID:', productId);
        console.log('Request Body:', req.body);
        console.log('Uploaded File:', req.file);

        // Validate product ID
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            console.warn('Invalid product ID:', productId);
            req.flash('error', 'Invalid product ID');
            return res.redirect('/owner/admin/editwindow');
        }

        // Validate required fields
        const { name, price, discount, description, bgcolor } = req.body;
        if (!name || !price) {
            console.warn('Missing required fields:', { name, price });
            req.flash('error', 'Name and price are required');
            return res.redirect(`/owner/edit/${productId}`);
        }

        // Prepare update data
        const updateData = {
            name: name.trim(),
            price: parseFloat(price),
            discount: parseFloat(discount) || 0,
            description: description ? description.trim() : '',
            bgcolor: bgcolor || '#f5f5f5',
        };

        // Validate numeric fields
        if (isNaN(updateData.price) || updateData.price < 0) {
            console.warn('Invalid price:', price);
            req.flash('error', 'Price must be a positive number');
            return res.redirect(`/owner/edit/${productId}`);
        }
        if (updateData.discount < 0 || updateData.discount > 100) {
            console.warn('Invalid discount:', discount);
            req.flash('error', 'Discount must be 0-100');
            return res.redirect(`/owner/edit/${productId}`);
        }

        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            console.warn('Product not found:', { productId });
            req.flash('error', 'Product not found');
            return res.redirect('/owner/admin/editwindow');
        }

        // Handle image
        if (req.file) {
            console.log('New image:', { size: req.file.size, mimetype: req.file.mimetype });
            updateData.Image = req.file.buffer;
            updateData.mimeType = req.file.mimetype;
        } else {
            updateData.Image = product.Image;
            updateData.mimeType = product.mimeType;
            console.log('Keeping existing image');
        }

        // Update product
        console.log('Updating product with:', updateData);
        const updatedProduct = await productModel.findByIdAndUpdate(
            productId, { $set: updateData }, { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            console.error('Update failed for:', productId);
            req.flash('error', 'Failed to update product');
            return res.redirect(`/owner/edit/${productId}`);
        }

        console.log('Updated product:', updatedProduct);
        req.flash('success', 'Product updated successfully');
        res.redirect('/owner/admin/editwindow');
    } catch (err) {
        console.error('Error updating product:', {
            message: err.message,
            stack: err.stack,
            body: req.body,
            file: req.file ? req.file.mimetype : 'No file',
        });
        req.flash('error', 'Error updating product');
        res.redirect(`/owner/edit/${productId}`);
    }
});

router.get("/logout", ownerLogout);

module.exports = router;