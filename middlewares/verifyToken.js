const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');

dotEnv.config();
const secretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // expects "Bearer <token>"

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.vendorId = decoded.vendorId;
    next();
  });
};

module.exports = verifyToken;