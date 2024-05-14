const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  port: process.env.PORT,
  mongoDbURI: process.env.MONGODB_URI,
};