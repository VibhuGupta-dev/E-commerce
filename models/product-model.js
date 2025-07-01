const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    Image: { type: Buffer },
    mimeType: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('product', productSchema);