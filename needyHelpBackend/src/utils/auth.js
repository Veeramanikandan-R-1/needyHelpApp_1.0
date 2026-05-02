const jwt = require("jsonwebtoken");
const {accessSecretKey} = require('../../config');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split("Bearer ")[1];
  jwt.verify(token, accessSecretKey, (err, decoded) => {
    if (err) {
      // 401 = unauthenticated (token missing/expired/invalid). Client interceptor uses
      // this signal to attempt a silent refresh. 403 is reserved for role failures.
      return res.status(401).json({ error: "Unauthorized: JWT token invalid or expired" });
    }
    req.user = { _id: decoded._id, role: decoded.role };
    next();
  });
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden: insufficient role" });
  }
  next();
};

module.exports = verifyJWT;
module.exports.requireRole = requireRole;