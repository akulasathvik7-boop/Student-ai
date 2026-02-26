import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useApi } from "../../auth/ApiProvider";

export function RegisterPage() {
  const api = useApi();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      login(res.data.token, res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      // Safely extract the centralized backend error message
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Unable to create account. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12 text-slate-100">
      <div
        className="w-full max-w-md rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] backdrop-blur-xl transition-all duration-300 hover:border-primary-500/30"
        style={{ animation: "slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/30 text-xl font-bold tracking-wider">
            CP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Initialize Profile</h1>
          <p className="mt-2 text-sm text-slate-400">
            Join to access curated notes and AI mock interviews.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Alex Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
            />
          </div>
          <div className="group">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
              Email Address
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="group">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="group">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
              Role
            </label>
            <select
              className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student Account</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-center">
              <p className="text-xs font-medium text-rose-400" role="alert">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] hover:shadow-primary-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800/50 pt-6 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-400 transition-colors hover:text-primary-300"
            >
              Sign In
            </Link>
          </p>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes slide-up-fade {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}} />
      </div>
    </div>
  );
}

