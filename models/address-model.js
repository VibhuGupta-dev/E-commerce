const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    cityname: String,
    statename: String,
    pincode: Number,
    phone_number: Number,
    full_address: { type: String, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('address', addressSchema);