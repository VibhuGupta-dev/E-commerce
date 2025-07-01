const express = require('express');
const router = express.Router();
const IslogedIn = require('../middlewares/IslogedIn');
const productModel = require('../models/product-model');

router.get('/', function(req, res) {
    let error = req.flash('error');
    res.render('index', { error: error.length > 0 ? error[0] : '' });
});

module.exports = router;