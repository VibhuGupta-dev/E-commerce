// utils/generateUser.js
const userModel = require('../models/user-model.js');

const createUser = async({ Fullname, email, password, contact, cart, orders }) => {
    try {
        const user = await userModel.create({
            Fullname,
            email,
            password,
            contact,
            cart: cart || [],
            orders: orders || []
        });
        return user;
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = { createUser };