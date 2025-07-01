const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ownerSchema = mongoose.Schema({
    Fullname: { type: String, minlength: 3, trim: true },
    email: String,
    password: String,
    products: { type: Array, default: [] },
    picture: String,
    gstin: String,
});

ownerSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

ownerSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('owner', ownerSchema);