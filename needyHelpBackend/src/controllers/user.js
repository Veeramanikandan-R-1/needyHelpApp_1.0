const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = Router();

const { accessSecretKey, refreshSecretKey } = require('../../config');
const { isPasswordValid, isEmailValid } = require("../utils/validator");
const verifyJWT = require("../utils/auth");
const { accessTokenExpiryTime, refreshTokenExpiryTime } = require("../utils/constants");

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
        if (error) return res.status(403).json({ error });
        const salt = await bcrypt.genSalt(10);
        const passwordEncrypted = await bcrypt.hash(password, salt);
        const isUserExist = await User.findOne({ emailId });
        if (isUserExist) {
            return res.status(409).json({ error: 'User with email ID already exists' })
        }
        const newUser = new User({
            username, password: passwordEncrypted, emailId
        });
        const tokens = newUser.generateAuthToken();
        newUser.refreshtoken = tokens.refreshtoken;
        await newUser.save();
        res.cookie("jwt", tokens.refreshtoken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ accessToken: tokens.accesstoken });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});

// POST: Login route to verify a user and get a token
router.post("/login", async (req, res) => {
    try {
        const cookies = req.cookies;
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).json({ error: "Email address not found. Please check your email and try again." });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: "Incorrect password. Please double-check your password and try again." });
        }

        let refreshToken = "";

        // Check if user has an existing refresh token
        if (!cookies?.jwt) {
            refreshToken = user.refreshtoken;
        } else {
            refreshToken = cookies.jwt;
            const foundToken = await User.findOne({ refreshToken }).exec();

            if (!foundToken) {
                // If the token is not found in the database, clear out the cookie
                res.clearCookie("jwt", { httpOnly: true });
                refreshToken = "";
            }
        }
        const token = user.generateAuthToken();
        user.refreshtoken = [token.refreshtoken];
        await user.save();
        res.cookie("jwt", token.refreshtoken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res
            .status(200)
            .cookie("jwt", token.refreshtoken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
            })
            .json({ accessToken: token.accesstoken })
            .end();
    } catch (error) {
        res.status(400).json({ error });
    }
});

// GET: logout user
router.get("/logout", async (req, res) => {
    try {
        //on client, also delete the accessToken
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204);
        const refreshToken = cookies.jwt;
        //is refresh token in db?
        const foundUser = await User.findOne({ refreshtoken: refreshToken });
        if (!foundUser) {
            res.clearCookie("jwt", { httpOnly: true });
            return res.sendStatus(204);
        }

        //Delete refreshToken in db
        foundUser.refreshtoken = foundUser.refreshtoken.filter(
            (rt) => rt !== refreshToken
        );
        await foundUser.save();

        res.clearCookie("jwt", { httpOnly: true });
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});

// GET: refresh token when the user access key is expired
router.get("/refresh", async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);
        const refreshToken = cookies.jwt;
        res.clearCookie("jwt", { httpOnly: true });
        const foundUser = await User.findOne({ refreshtoken: refreshToken });

        if (!foundUser) {
            jwt.verify(
                refreshToken,
                refreshSecretKey,
                async (err, decoded) => {
                    if (err) return res.sendStatus(403); //Forbidden
                    const hackedUser = await User.findOne({ username: decoded._id });
                    hackedUser.refreshtoken = [];
                    const result = await hackedUser.save();
                }
            );
            return res.sendStatus(403);
        }

        const newRefreshTokenArray = foundUser.refreshtoken.filter(
            (rt) => rt !== refreshToken
        );

        //evaluate jwt
        jwt.verify(
            refreshToken,
            refreshSecretKey,
            async (err, decoded) => {
                if (err) {
                    foundUser.refreshtoken = [...newRefreshTokenArray];
                    const result = await foundUser.save();
                }
                if (err || foundUser._id.toString() !== decoded._id) {
                    return res.sendStatus(403);
                }
                //refreshtoken still valid
                const accessToken = jwt.sign(
                    { _id: decoded._id },
                    accessSecretKey,
                    { expiresIn: accessTokenExpiryTime }
                );

                const newRefreshToken = jwt.sign(
                    { _id: foundUser._id },
                    refreshSecretKey,
                    { expiresIn: refreshTokenExpiryTime }
                );
                foundUser.refreshtoken = [...newRefreshTokenArray, newRefreshToken];
                const result = await foundUser.save();
                res.cookie("jwt", newRefreshToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.status(200).json({ accessToken });
            }
        );
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});

// GET: returns user data 
router.get("/:id", verifyJWT, async (req, res) => {
    try {
        const userId = req.params.id;
        const foundUser = await User.findOne({ _id: userId });

        const data = {
            userEmail: foundUser.emailId,
            userName: foundUser.username,
        };

        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});

module.exports = router