const mongoose = require("mongoose");


const productSchema = mongoose.Schema({
    Image: String,
    name: String,
    price: String,
    discount: {
        type: Number,
        default: 0,
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
});

modules.exports = mongoose.model("product", productSchema);