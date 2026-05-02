const fs = require('fs');
const http = require('http');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
// const {Strategy} = require("passport-google-oauth20");
const cookieParser = require("cookie-parser");
const {
    port = 3000,
    frontendOrigin,
    sslKeyPath,
    sslCertPath,
} = require('../config');
const router = require('./routes');

// function verifyCallback(accessToken, refreshToken, profile, done){
//     console.log('profile',profile);
//     done(null, profile);
// }
// const AUTH_OPTIONS = {
//     callbackURL: '/auth/google/callback',
//     clientID: clientId,
//     clientSecret
// };
// passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

const app = express();
const allowedOrigins = frontendOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(helmet());
app.use(passport.initialize());
app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : ['http://localhost:3000', 'https://localhost:3000'],
    credentials: true,
}));
app.use(morgan("tiny")); 
app.use(express.json()); 
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true });
});
app.use(router);

// app.get('/auth/google', passport.authenticate('google',{
//     scope: ['email','profile'],
// }, (req, res) => {
//     console.log('google called back 1');
// }));
// app.get('/auth/google/callback', passport.authenticate('google',{
//     failureRedirect:'/failure',
//     successRedirect:'/',
//     session: true,
// }, (req, res) => {
//     console.log('google called back 1WW');
// }));
// app.get('/failure', (req,res)=>{
//     res.send().json({error:'Failed to log in using google!'})
// })

const hasLocalCertificates = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);
const server = hasLocalCertificates
    ? https.createServer(
        {
            key: fs.readFileSync(sslKeyPath),
            cert: fs.readFileSync(sslCertPath),
        },
        app
    )
    : http.createServer(app);

server.listen(port, () => {
    const protocol = hasLocalCertificates ? 'https' : 'http';
    console.log(`App running on ${protocol}://localhost:${port}`);
});
