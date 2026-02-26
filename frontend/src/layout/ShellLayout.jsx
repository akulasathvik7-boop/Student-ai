import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navLinkBase =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden group";

export function ShellLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-transparent text-slate-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-10">
        <div className="flex h-20 items-center gap-3 border-b border-slate-700/50 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/30 text-sm font-bold tracking-wider text-white">
            CP
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white">CampusPrep</p>
            <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400">AI Engine Active</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 p-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive
                ? "bg-slate-800/80 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] border border-primary-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-purple-600"></div>}
                Dashboard
              </>
            )}
          </NavLink>
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive
                ? "bg-slate-800/80 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] border border-primary-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-purple-600"></div>}
                Knowledge Base (Notes)
              </>
            )}
          </NavLink>
          <NavLink
            to="/interviews/setup"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive
                ? "bg-slate-800/80 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] border border-primary-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-purple-600"></div>}
                Mock Interviews
              </>
            )}
          </NavLink>
          <NavLink
            to="/interviews/history"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive
                ? "bg-slate-800/80 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] border border-primary-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-purple-600"></div>}
                Evaluation History
              </>
            )}
          </NavLink>
          <NavLink
            to="/bookmarks"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive
                ? "bg-slate-800/80 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] border border-primary-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-purple-600"></div>}
                Saved Resources
              </>
            )}
          </NavLink>
          {user?.role === "admin" && (
            <NavLink
              to="/admin/notes"
              className={({ isActive }) =>
                `${navLinkBase} mt-6 ${isActive
                  ? "bg-amber-500/10 text-amber-300 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)] border border-amber-500/30"
                  : "text-amber-500/70 hover:bg-amber-500/5 hover:text-amber-400 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                  Admin Control Panel
                </>
              )}
            </NavLink>
          )}
        </nav>
        <div className="border-t border-slate-700/50 bg-slate-900/60 p-5 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-bold text-white shadow-inner">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="truncate text-sm font-semibold text-white">
                {user?.name}
              </div>
              <div className="truncate text-[10px] font-semibold uppercase tracking-widest text-primary-400">
                {user?.role === 'admin' ? 'System Admin' : 'Student License'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 hover:shadow-[0_0_15px_-3px_rgba(243,113,113,0.2)] active:scale-[0.98]"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative z-0">
        <div className="mx-auto max-w-5xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
