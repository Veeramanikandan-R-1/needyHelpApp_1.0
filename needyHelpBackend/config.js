const dotenv = require('dotenv');
dotenv.config();
const {port,mongoDbURI,accessSecretKey,refreshSecretKey} = process.env;
module.exports = {
  port,
  mongoDbURI,
  accessSecretKey,
  refreshSecretKey,
};