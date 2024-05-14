const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = Router();

const { SECRET_KEY = "secret" } = require('../../config');
const { isPasswordValid, isEmailValid } = require("../utils/validator");

// POST: register new user 
router.post("/signup", async (req, res) => {
    try {
        const { username, password, emailId } = req.body;
        let error = '';
        if (!username || !password || !emailId) {
            error = 'Username, Password, Email Id is required';
            return res.status(403).json({ error: 'Username, Password, Email Id is required' });
        } else if (!emailId || !isEmailValid(emailId)) {
            error = 'Invalid email address';
        } else if (!password || !isPasswordValid(password)) {
            error = 'Password must contain min 8 letters with at least a symbol, upper and lower case letters and a number';
        }
        if(error) return res.status(403).json({ error }); 
        req.body.password = await bcrypt.hash(password, 10);
        const isUserExist = await User.findOne({ emailId });
        if (isUserExist) {
            return res.status(403).json({ error: 'User with email ID already exists' })
        }
        const user = await User.create(req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error });
    }
});

// Login route to verify a user and get a token
router.post("/login", async (req, res) => {
    try {
        // check if the user exists
        const user = await User.findOne({ username: req.body.username });
        if (user) {
            //check if password matches
            const result = await bcrypt.compare(req.body.password, user.password);
            if (result) {
                // sign token and send it in response
                const token = await jwt.sign({ username: user.username }, SECRET_KEY);
                res.json({ token });
            } else {
                res.status(400).json({ error: "password doesn't match" });
            }
        } else {
            res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

module.exports = router