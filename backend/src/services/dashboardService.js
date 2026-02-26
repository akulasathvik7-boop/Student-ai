const { Interview } = require("../models/Interview");
const { User } = require("../models/User");

/**
 * Aggregate dashboard stats for a user: total interviews, average score,
 * weak topics, bookmarked notes count, recent activity.
 */
async function getDashboardStats(userId) {
  const [interviews, user] = await Promise.all([
    Interview.find({ userId }).sort({ createdAt: -1 }).lean(),
    User.findById(userId).populate("bookmarkedNotes").lean(),
  ]);

  const totalInterviews = interviews.length;
  const completed = interviews.filter((i) => i.score != null);
  const sumScores = completed.reduce((acc, i) => acc + (i.score || 0), 0);
  const averageScore =
    completed.length > 0
      ? Math.round((sumScores / completed.length) * 10) / 10
      : null;

  const weakTopicsMap = new Map();
  completed.forEach((i) => {
    const weaks = (i.answers || [])
      .flatMap((a) => a.weakAreas || [])
      .filter(Boolean);
    weaks.forEach((w) => weakTopicsMap.set(w, (weakTopicsMap.get(w) || 0) + 1));
  });
  const weakTopics = Array.from(weakTopicsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic]) => topic);

  const bookmarkedNotes = (user && user.bookmarkedNotes) || [];
  const bookmarkedNotesCount = Array.isArray(bookmarkedNotes)
    ? bookmarkedNotes.length
    : 0;

  const recentActivity = interviews.slice(0, 5).map((inv) => ({
    type: "interview",
    id: inv._id.toString(),
    label: `${inv.type} • ${inv.difficulty}`,
    score: inv.score,
    createdAt: inv.createdAt,
  }));

  return {
    totalInterviews,
    averageScore,
    weakTopics,
    bookmarkedNotesCount,
    recentActivity,
  };
}

module.exports = { getDashboardStats };
