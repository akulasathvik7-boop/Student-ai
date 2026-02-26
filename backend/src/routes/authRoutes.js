const express = require("express");
const {
  register,
  login,
  logout,
  refreshTokens,
  getMe,
  authRequired,
} = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshTokens);
router.get("/me", authRequired, getMe);

module.exports = router;

