const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/mongoose-connection');
const productsRouter = require('./routes/productsRouter');
const ownerRouter = require('./routes/ownerRouter');
const userRouter = require('./routes/userRouter');
const cartRouter = require('./routes/cartRouter');
const indexRouter = require('./routes/index');

require('dotenv').config();
const ejs = require('ejs');
const expressSession = require('express-session');
const flash = require('connect-flash');
const IslogedIn = require('./middlewares/IslogedIn');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET || 'default-secret',
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    })
);
app.use(flash());

// Routes
app.use('/', indexRouter);
app.use('/owner', ownerRouter);
app.use('/users', userRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);

app.get('product', IslogedIn, function(req, res) {
    res.render('product')
})


app.listen(3000, () => {
    console.log('Server running on port 3000');
});