const fs = require('fs');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
// const {Strategy} = require("passport-google-oauth20");
const cookieParser = require("cookie-parser");
const { port = 3000, clientId, clientSecret } = require('../config');
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
app.use(helmet());
app.use(passport.initialize());
app.use(cors());
app.use(morgan("tiny")); 
app.use(express.json()); 
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
})
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

https.createServer({
    key: fs.readFileSync('./privatekey.key'),
    cert: fs.readFileSync('./certificate.crt'),
},app).listen(port , () => {
    console.log(`App running on port ${port}`);
})