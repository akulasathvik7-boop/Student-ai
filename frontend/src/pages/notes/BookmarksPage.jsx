import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../auth/ApiProvider";

export function BookmarksPage() {
  const api = useApi();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/notes/me/bookmarks/list");
        setNotes(res.data.notes || []);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Failed to load bookmarked notes. Please try again.";
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
        <h1 className="text-xl font-semibold text-slate-50">Bookmarked notes</h1>
        <p className="mt-1 text-xs text-slate-400">
          Quickly access notes you have bookmarked.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading bookmarks...</p>
      ) : error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : notes.length === 0 ? (
        <p className="text-xs text-slate-400">
          You have not bookmarked any notes yet.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <Link
              to={`/notes/${note.id}`}
              key={note.id}
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary-500 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    {note.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {note.subject} • {note.branch} • Sem {note.semester}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p>
                    ⭐ {note.averageRating?.toFixed?.(1) ?? note.averageRating ?? 0} (
                    {note.ratingCount ?? 0})
                  </p>
                  <p className="mt-1">⬇ {note.downloads ?? 0}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

