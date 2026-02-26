import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { Card, CardTitle, CardDescription } from "../../components/Card";
import { formatScore, formatDate } from "../../utils/format";

export function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading, error } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Get ready for placements with curated notes and AI-powered mock
          interviews.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      )}
      {error && (
        <p className="text-sm text-rose-400">{error}</p>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardTitle>Total interviews</CardTitle>
              <CardDescription>Mock interviews completed</CardDescription>
              <p className="mt-2 text-2xl font-bold text-slate-50">
                {stats.totalInterviews ?? 0}
              </p>
            </Card>
            <Card>
              <CardTitle>Average score</CardTitle>
              <CardDescription>Across all completed interviews</CardDescription>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {formatScore(stats.averageScore)} / 10
              </p>
            </Card>
            <Card>
              <CardTitle>Bookmarked notes</CardTitle>
              <CardDescription>Saved for quick access</CardDescription>
              <p className="mt-2 text-2xl font-bold text-slate-50">
                {stats.bookmarkedNotesCount ?? 0}
              </p>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Start a session or browse notes</CardDescription>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/interviews/setup"
                  className="rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] hover:shadow-primary-500/40 active:scale-[0.98]"
                >
                  New interview
                </Link>
                <Link
                  to="/notes"
                  className="rounded-xl border border-slate-700/50 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-100 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-700"
                >
                  Browse notes
                </Link>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardTitle>Weak topics</CardTitle>
              <CardDescription>Topics to improve based on past feedback</CardDescription>
              {stats.weakTopics && stats.weakTopics.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {stats.weakTopics.map((topic) => (
                    <li
                      key={topic}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  Complete interviews to see weak topics here.
                </p>
              )}
            </Card>

            <Card>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest interviews</CardDescription>
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {stats.recentActivity.map((item) => (
                    <li key={item.id} className="group flex items-center justify-between rounded-lg border border-transparent p-2 text-xs transition-colors hover:border-slate-700/50 hover:bg-slate-800/30">
                      <span className="font-medium text-slate-200 group-hover:text-primary-300 transition-colors">{item.label}</span>
                      <span className="text-slate-500">
                        <span className="font-semibold text-emerald-400/90">{formatScore(item.score)}</span> · {formatDate(item.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  No recent activity yet.
                </p>
              )}
            </Card>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Link
              to="/notes"
              className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:bg-slate-800/60 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)]"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl transition-all group-hover:bg-primary-500/20"></div>
              <h2 className="relative z-10 text-base font-bold text-slate-50 transition-colors group-hover:text-primary-300">
                Browse Notes
              </h2>
              <p className="relative z-10 mt-2 text-xs leading-relaxed text-slate-400">
                Filter by branch, semester, subject, and download PDF notes.
              </p>
            </Link>
            <Link
              to="/interviews/setup"
              className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-slate-800/60 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)]"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20"></div>
              <h2 className="relative z-10 text-base font-bold text-slate-50 transition-colors group-hover:text-purple-300">
                Start Mock Interview
              </h2>
              <p className="relative z-10 mt-2 text-xs leading-relaxed text-slate-400">
                Choose technical, HR, or mixed interviews and get AI feedback.
              </p>
            </Link>
            <Link
              to="/interviews/history"
              className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-800/60 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20"></div>
              <h2 className="relative z-10 text-base font-bold text-slate-50 transition-colors group-hover:text-emerald-300">
                Review Performance
              </h2>
              <p className="relative z-10 mt-2 text-xs leading-relaxed text-slate-400">
                Track previous interviews, scores, and weak areas.
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
