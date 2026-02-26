const bcrypt = require("bcryptjs");
const { User, ROLES } = require("../models/User");
const { verifyToken, signToken, signRefreshToken } = require("../utils/jwt");

// Helper to set refresh token cookie
function setRefreshTokenCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevents XSS reading the token
    secure: process.env.NODE_ENV === "production", // requires HTTPS in prod
    sameSite: "strict", // prevents CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearRefreshTokenCookie(res) {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Basic Input Validation
    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: { message: "Name must be at least 2 characters long." } });
    }

    if (!email || !/.+\@.+\..+/.test(email)) {
      return res.status(400).json({ success: false, error: { message: "A valid email is required." } });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: { message: "Password must be at least 6 characters long." } });
    }

    const emailLower = email.toLowerCase().trim();

    // Check existing User
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(409).json({ success: false, error: { message: "Email is already registered." } });
    }

    // Hash with salt rounds 12 (OWASP recommended minimum)
    const passwordHash = await bcrypt.hash(password, 12);

    const userRole = role && Object.values(ROLES).includes(role) ? role : ROLES.STUDENT;

    // Create User (catches any missed unique index violations)
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      passwordHash,
      role: userRole,
    });

    const accessToken = signToken(user);
    const refreshToken = signRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      token: accessToken,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: { message: "Email is already registered." } });
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: "Email and password are required." } });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      // Use generic error for security (don't reveal if user exists)
      return res.status(401).json({ success: false, error: { message: "Invalid credentials." } });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { message: "Invalid credentials." } });
    }

    const accessToken = signToken(user);
    const refreshToken = signRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      success: true,
      token: accessToken,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(_req, res) {
  clearRefreshTokenCookie(res);
  return res.json({ success: true, message: "Logged out successfully." });
}

// Token Refresh Route
async function refreshTokens(req, res, next) {
  try {
    // Requires cookie-parser to easily read req.cookies, but we can parse it manually
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return res.status(401).json({ success: false, error: { message: "Please log in again." } });
    }

    // Manual extraction to avoid adding huge cookie-parser dependency
    const match = cookieHeader.match(/(^|;\s*)refreshToken=([^;]+)/);
    const refreshToken = match ? match[2] : null;

    if (!refreshToken) {
      return res.status(401).json({ success: false, error: { message: "Refresh token missing. Please log in again." } });
    }

    const payload = verifyToken(refreshToken);
    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(404).json({ success: false, error: { message: "User not found." } });
    }

    const newAccessToken = signToken(user);
    const newRefreshToken = signRefreshToken(user);

    setRefreshTokenCookie(res, newRefreshToken);

    return res.json({
      success: true,
      token: newAccessToken,
    });
  } catch (err) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({ success: false, error: { message: "Invalid or expired session. Please log in again." } });
  }
}

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden." });
    }
    return next();
  };
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ user: user.toSafeJSON() });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  getMe,
  authRequired,
  requireRole,
  ROLES,
};

