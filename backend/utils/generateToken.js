const jwt = require('jsonwebtoken');

// Generate JWT token for authenticated user
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload - data stored in token
    process.env.JWT_SECRET, // Secret key
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

module.exports = generateToken;


