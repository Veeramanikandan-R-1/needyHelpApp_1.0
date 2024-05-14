const express = require('express');
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const { port = 3000 } = require('../config');

const UserRouter = require("./controllers/user");

// GLOBAL MIDDLEWARE
app.use(cors()) // add cors headers
app.use(morgan("tiny")) // log the request for debugging
app.use(express.json()) // parse json bodies

app.get('/', (req, res) => {
    res.send('Hello World!');
})
app.use("/user", UserRouter) 

app.listen(port , () => {
    console.log(`Example app listening on port ${port}`);
})