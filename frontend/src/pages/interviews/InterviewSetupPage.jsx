import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../auth/ApiProvider";

const TECH_PRESETS = ["React", "Node.js", "MongoDB", "DSA", "OS", "DBMS"];

export function InterviewSetupPage() {
  const api = useApi();
  const navigate = useNavigate();

  const [type, setType] = useState("technical");
  const [difficulty, setDifficulty] = useState("easy");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addTech = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!techStack.includes(trimmed)) {
      setTechStack((prev) => [...prev, trimmed]);
    }
    setTechInput("");
  };

  const removeTech = (value) => {
    setTechStack((prev) => prev.filter((t) => t !== value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/interviews/start", {
        type,
        difficulty,
        techStack,
      });
      navigate(`/interviews/session/${res.data.interviewId}`, {
        state: {
          questionIndex: res.data.questionIndex,
          totalQuestions: res.data.totalQuestions,
          question: res.data.question,
        },
      });
    } catch (err) {
      // Check specific API error payload first
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to start interview. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 shadow-[0_0_40px_-10px_rgba(139,92,246,0.15)] backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/30 text-xl font-bold tracking-wider text-white">
            AI
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">
              Initialize Mock Interview
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Configure parameters to generate a customized AI-driven evaluation session.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="group">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
                Evaluation Type
              </label>
              <select
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="technical">Algorithm & System Design</option>
                <option value="hr">Behavioral & Leadership</option>
                <option value="mixed">Comprehensive Assessment</option>
              </select>
            </div>
            <div className="group">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
                Complexity Matrix
              </label>
              <select
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Junior Level (Foundational)</option>
                <option value="medium">Mid-Level (Intermediate)</option>
                <option value="hard">Senior Level (Advanced)</option>
              </select>
            </div>
          </div>

          <div className="group">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
              Target Frameworks (Optional)
            </label>
            <p className="mb-3 text-xs leading-relaxed text-slate-500">
              Select specific technologies for the AI engine to generate domain-specific vectors.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {TECH_PRESETS.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => addTech(tech)}
                  className="rounded-full border border-slate-700/50 bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition-all hover:border-primary-500/50 hover:text-primary-300"
                >
                  {tech}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Declare custom framework (e.g. Kotlin, Docker, GraphQL)"
                className="flex-1 rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => addTech(techInput)}
                className="rounded-xl border border-slate-700/50 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-100 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-[0.98]"
              >
                Inject
              </button>
            </div>

            {techStack.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {techStack.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 text-xs font-semibold text-primary-300 shadow-[0_0_15px_-3px_rgba(139,92,246,0.15)]"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTech(t)}
                      className="ml-1 text-primary-400 hover:text-rose-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-center">
              <p className="text-sm font-medium text-rose-400" role="alert">
                {error}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-4 text-sm font-bold tracking-wider text-white shadow-[0_0_20px_-3px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  INITIALIZING NEURAL NET VECTORS...
                </span>
              ) : (
                "ACTIVATE INTERVIEW PROTOCOL"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

