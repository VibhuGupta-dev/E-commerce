// config/mongoose-connection.js
const mongoose = require('mongoose');
const dbgr = require('debug')('development:mongoose');
const config = require('./development');

mongoose
    .connect(config.MONGODB_URI)
    .then(async() => {
        dbgr('Connected to MongoDB');
        console.log(`Mongo db connected`);
    })
    .catch((err) => {
        dbgr('MongoDB connection error:', err);
        console.error('MongoDB connection error:', err);
    });

module.exports = mongoose.connection;