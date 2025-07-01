const express = require('express');
const router = express.Router();

const {
    Registeruser,
    loginuser,
    logout,
} = require("../controllers/authcontroller");
const IslogedIn = require('../middlewares/IslogedIn');


router.get("/", function(req, res) {
    res.send("hey");
});

router.post("/register", Registeruser);

router.post("/login", loginuser);

router.get("/logout", logout);


module.exports = router;