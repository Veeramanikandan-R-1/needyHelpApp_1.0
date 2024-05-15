const express = require('express');
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { port = 3000 } = require('../config');
const UserRouter = require("./controllers/user");

app.use(cors());
app.use(morgan("tiny")); 
app.use(express.json()); 
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
})
app.use("/user", UserRouter) 

app.listen(port , () => {
    console.log(`App running on port ${port}`);
})