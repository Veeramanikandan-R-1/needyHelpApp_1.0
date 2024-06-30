const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  port,
  mongoDbURI,
  accessSecretKey,
  refreshSecretKey,
  clientId,
  clientSecret,
} = process.env;