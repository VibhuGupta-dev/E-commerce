const mongoose = require("mongoose");



const userSchema = mongoose.Schema({
    Fullname: String,
    email: String,
    password: String,
    cart: {
        type: Array,
        default: [],
    },
    isadmin: Boolean,
    orders: {
        type: Array,
        default: [],
    },
    contact: Number,
    picture: String,
});

modules.exports = mongoose.model("user", userSchema);