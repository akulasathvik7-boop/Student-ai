import { useEffect, useState } from "react";
import { useApi } from "../../auth/ApiProvider";

export function InterviewHistoryPage() {
  const api = useApi();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/interviews");
        setItems(res.data.interviews || []);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Failed to load interview history. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [api]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          Interview history
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Review previous AI mock interviews and track your progress over time.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading interviews...</p>
      ) : error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-400">
          You have not completed any mock interviews yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it._id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    {it.type.toUpperCase()} • {it.difficulty.toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {it.techStack && it.techStack.length > 0
                      ? it.techStack.join(", ")
                      : "General interview"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {new Date(it.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <p>
                    Score:{" "}
                    {it.score != null
                      ? (it.score.toFixed?.(1) ?? it.score)
                      : "—"}{" "}
                    / 10
                  </p>
                </div>
              </div>
              {it.feedback && (
                <p className="mt-2 text-xs text-slate-300">{it.feedback}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

