const jwt = require("jsonwebtoken");
const { config } = require("./config");

// Access Token: Short-lived (15 minutes) for API access
function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: "15m" }
  );
}

// Refresh Token: Long-lived (7 days) for generating new access tokens securely
function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "refresh",
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signToken, signRefreshToken, verifyToken };

