const mongoose = require("mongoose");
const {mongoDbURI} = require('../../config');

mongoose.connect(mongoDbURI);
mongoose.connection
.on("open", () => console.log("DATABASE STATE", "Connection Open"))
.on("close", () => console.log("DATABASE STATE", "Connection Open"))
.on("error", (error) => console.log("DATABASE STATE", error));

module.exports = mongoose;
