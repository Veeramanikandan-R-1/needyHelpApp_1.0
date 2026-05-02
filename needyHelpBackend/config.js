const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
  port: process.env.PORT || process.env.port || 4000,
  mongoDbURI: process.env.MONGODB_URI || process.env.mongoDbURI || '',
  accessSecretKey: process.env.ACCESS_SECRET_KEY || process.env.accessSecretKey || '',
  refreshSecretKey: process.env.REFRESH_SECRET_KEY || process.env.refreshSecretKey || '',
  clientId: process.env.GOOGLE_CLIENT_ID || process.env.clientId || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.clientSecret || '',
  frontendOrigin: process.env.FRONTEND_ORIGIN || process.env.frontendOrigin || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL || process.env.adminEmail || '',
  sslKeyPath: process.env.SSL_KEY_PATH || process.env.sslKeyPath || './privatekey.key',
  sslCertPath: process.env.SSL_CERT_PATH || process.env.sslCertPath || './certificate.crt',
};

module.exports = config;
