const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = Router();

const {
    accessSecretKey,
    refreshSecretKey,
    clientId,
    clientSecret,
    frontendOrigin,
    adminEmail,
} = require('../../config');
const { isPasswordValid, isEmailValid } = require("../utils/validator");
const verifyJWT = require("../utils/auth");
const { requireRole } = require("../utils/auth");
const { accessTokenExpiryTime, refreshTokenExpiryTime } = require("../utils/constants");
const passport = require("passport");
const {Strategy} = require("passport-google-oauth20");

const FRONTEND_ORIGIN = frontendOrigin;
const ADMIN_EMAIL = adminEmail.toLowerCase().trim();
const hasGoogleOAuth = Boolean(clientId && clientSecret);

// Auto-promote bootstrap admin: if a user signs up / logs in with the email in ADMIN_EMAIL,
// flip their role to 'admin' + verified=true. One-time per account.
async function ensureBootstrapAdmin(user) {
    if (!ADMIN_EMAIL) return user;
    if (user.emailId?.toLowerCase() !== ADMIN_EMAIL) return user;
    if (user.role === 'admin' && user.verified) return user;
    user.role = 'admin';
    user.verified = true;
    await user.save();
    return user;
}

async function verifyCallback(accessToken, refreshToken, profile, done) {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google account has no email'));
        let user = await User.findOne({ emailId: email });
        if (!user) {
            // Random unguessable password — Google accounts log in via OAuth, not bcrypt compare.
            const randomPwd = await bcrypt.hash(`google:${profile.id}:${Date.now()}`, 10);
            user = new User({
                username: profile.displayName || email.split('@')[0],
                emailId: email,
                password: randomPwd,
                refreshtoken: [],
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}

const AUTH_OPTIONS = {
    callbackURL: '/v1/user/auth/google/callback',
    clientID: clientId,
    clientSecret,
};
if (hasGoogleOAuth) {
    passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));
}

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
        await ensureBootstrapAdmin(newUser);
        const tokens = newUser.generateAuthToken();
        newUser.refreshtoken = [tokens.refreshtoken];
        await newUser.save();
        res.cookie("jwt", tokens.refreshtoken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
        });
        res.status(200).json({ accessToken: tokens.accesstoken, user: newUser.toPublicJSON() });
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

        await ensureBootstrapAdmin(user);

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
        return res
            .status(200)
            .cookie("jwt", token.refreshtoken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'lax',
            })
            .json({ accessToken: token.accesstoken, user: user.toPublicJSON() })
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
                    { _id: decoded._id, role: foundUser.role },
                    accessSecretKey,
                    { expiresIn: accessTokenExpiryTime }
                );

                const newRefreshToken = jwt.sign(
                    { _id: foundUser._id },
                    refreshSecretKey,
                    { expiresIn: refreshTokenExpiryTime }
                );
                foundUser.refreshtoken = [...newRefreshTokenArray, newRefreshToken];
                await foundUser.save();
                res.cookie("jwt", newRefreshToken, {
                    httpOnly: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    sameSite: 'lax',
                });
                res.status(200).json({ accessToken, user: foundUser.toPublicJSON() });
            }
        );
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});

// GET: current user profile
router.get("/me", verifyJWT, async (req, res) => {
    try {
        const foundUser = await User.findById(req.user._id);
        if (!foundUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ user: foundUser.toPublicJSON() });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// PATCH: update profile (whitelisted fields only)
router.patch("/me", verifyJWT, async (req, res) => {
    try {
        const allowed = ['username', 'avatarUrl', 'bio', 'phone', 'district', 'pincode', 'language', 'role'];
        const updates = {};
        for (const k of allowed) if (k in req.body) updates[k] = req.body[k];

        // Validation
        if (updates.role) {
            if (!['donor','student','teacher','admin'].includes(updates.role)) {
                return res.status(400).json({ error: "Invalid role" });
            }
            // Anti-escalation: only an existing admin can keep / set 'admin'.
            if (updates.role === 'admin' && req.user.role !== 'admin') {
                return res.status(403).json({ error: "Cannot self-promote to admin" });
            }
        }
        if (updates.pincode && !/^\d{6}$/.test(updates.pincode)) {
            return res.status(400).json({ error: "Pincode must be 6 digits" });
        }
        if (updates.phone && !/^[+]?[\d\s-]{8,15}$/.test(updates.phone)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }
        if (updates.bio && updates.bio.length > 500) {
            return res.status(400).json({ error: "Bio must be 500 chars or less" });
        }

        // Switching to teacher resets verified flag → admin must re-approve
        if (updates.role === 'teacher') updates.verified = false;

        const foundUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
        if (!foundUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ user: foundUser.toPublicJSON() });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// POST: change password
router.post("/change-password", verifyJWT, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current and new password required" });
        }
        if (!isPasswordValid(newPassword)) {
            return res.status(400).json({ error: "New password must be min 8 chars with upper, lower, number & symbol" });
        }
        const foundUser = await User.findById(req.user._id);
        if (!foundUser) return res.status(404).json({ error: "User not found" });
        const ok = await bcrypt.compare(currentPassword, foundUser.password);
        if (!ok) return res.status(401).json({ error: "Current password is incorrect" });
        const salt = await bcrypt.genSalt(10);
        foundUser.password = await bcrypt.hash(newPassword, salt);
        // Invalidate all refresh tokens — force re-login on other devices
        foundUser.refreshtoken = [];
        await foundUser.save();
        res.clearCookie("jwt", { httpOnly: true });
        res.status(200).json({ message: "Password updated. Please sign in again." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// OAUTH signin google
router.get('/auth/google', (req, res, next) => {
    if (!hasGoogleOAuth) {
        return res.status(503).json({ error: 'Google OAuth is not configured.' });
    }
    return passport.authenticate('google', { scope: ['email', 'profile'], session: false })(req, res, next);
});

router.get('/auth/google/callback', (req, res, next) => {
    if (!hasGoogleOAuth) {
        return res.redirect(`${FRONTEND_ORIGIN}/login?error=google`);
    }
    return passport.authenticate('google', {
        failureRedirect: `${FRONTEND_ORIGIN}/login?error=google`,
        session: false,
    })(req, res, next);
}, async (req, res) => {
    try {
        const user = req.user;
        const tokens = user.generateAuthToken();
        user.refreshtoken = [...(user.refreshtoken || []), tokens.refreshtoken];
        await user.save();
        res.cookie('jwt', tokens.refreshtoken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
        });
        // Redirect to frontend; AccessToken in URL hash so it never hits server logs.
        res.redirect(`${FRONTEND_ORIGIN}/oauth/callback#token=${tokens.accesstoken}`);
    } catch (err) {
        console.error('Google callback error', err);
        res.redirect(`${FRONTEND_ORIGIN}/login?error=google`);
    }
});

router.get('/failure', (req, res) => {
    res.status(401).json({ error: 'Failed to log in using Google.' });
});

// ----- Admin endpoints (role: 'admin' only) -----

// GET /v1/user/admin/users  ?q=&role=&verified=&page=&limit=
router.get('/admin/users', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const filter = {};
        const q = (req.query.q || '').trim();
        if (q) {
            const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ username: rx }, { emailId: rx }, { phone: rx }, { district: rx }];
        }
        if (req.query.role && ['donor','student','teacher','admin'].includes(req.query.role)) {
            filter.role = req.query.role;
        }
        if (req.query.verified === 'true')  filter.verified = true;
        if (req.query.verified === 'false') filter.verified = false;

        const [total, items] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        ]);
        res.status(200).json({
            page, limit, total,
            users: items.map((u) => u.toPublicJSON()),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /v1/user/admin/users/:id  { role?, verified? }
router.patch('/admin/users/:id', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        if (id === String(req.user._id) && req.body.role && req.body.role !== 'admin') {
            return res.status(400).json({ error: "Admins can't demote themselves." });
        }
        const updates = {};
        if ('role' in req.body) {
            if (!['donor','student','teacher','admin'].includes(req.body.role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }
            updates.role = req.body.role;
        }
        if ('verified' in req.body) updates.verified = !!req.body.verified;

        const user = await User.findByIdAndUpdate(id, updates, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ user: user.toPublicJSON() });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router
