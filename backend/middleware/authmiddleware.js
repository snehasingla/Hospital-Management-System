const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).send({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Expecting format "Bearer <token>"

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ error: 'Invalid or expired token' });
    }

    req.user = user; // Add decoded token data to request
    next();
  });
}

// Authorize based on role
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ error: 'Insufficient permissions. Required role: ' + allowedRoles.join(' or ') });
    }

    next();
  };
}

module.exports = { authenticateJWT, authorizeRole };
