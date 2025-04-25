const mongoose = require("mongoose");



const ownerSchema = mongoose.Schema({
    Fullname: String,
    email: String,
    password: String,
    products: {
        type: Array,
        default: [],
    },

    picture: String,
    gstin: String,
});

modules.exports = mongoose.model("owner", ownerSchema);