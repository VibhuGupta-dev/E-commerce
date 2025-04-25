const express = require('express');
const app = express();
const cookieparser = require('cookie-parser');
const path = require("path");
const db = require('./config/mongoose-connection');
const productsRouter = require('./routes/productsRouter');
const ownerRouter = require('./routes/ownerRouter');
const userRouter = require("./routes/userRouter")


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use("/owner", ownerRouter);
app.use("/users", userRouter);
app.use("/products", productsRouter);


app.listen(3000);