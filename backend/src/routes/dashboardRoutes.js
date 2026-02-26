const { authRequired } = require("../middleware/auth");
const { getDashboardStats } = require("../services/dashboardService");

const router = require("express").Router();

router.get("/stats", authRequired, async (req, res, next) => {
  try {
    const stats = await getDashboardStats(req.user.id);
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
