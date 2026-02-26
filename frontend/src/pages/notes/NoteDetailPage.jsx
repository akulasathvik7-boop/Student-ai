import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../auth/ApiProvider";

export function NoteDetailPage() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [bookmarking, setBookmarking] = useState(false);
  const [ratedMessage, setRatedMessage] = useState("");

  const fetchNote = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/notes/${id}`);
      setNote(res.data.note);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load note details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/notes/${id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note?.title || "notes"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      fetchNote();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to download PDF.";
      setError(message);
    }
  };

  const handleBookmark = async () => {
    setBookmarking(true);
    setError("");
    try {
      await api.post(`/notes/${id}/bookmark`);
      // we don't know full bookmark state from server here; just show toast
      setRatedMessage("Bookmark updated.");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update bookmark.";
      setError(message);
    } finally {
      setBookmarking(false);
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    setError("");
    setRatedMessage("");
    try {
      await api.post(`/notes/${id}/rate`, { rating: Number(rating) });
      setRatedMessage("Thanks for rating this note.");
      fetchNote();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to submit rating.";
      setError(message);
    }
  };

  if (loading) {
    return <p className="text-xs text-slate-400">Loading note...</p>;
  }

  if (error) {
    return (
      <div>
        <p className="text-xs text-rose-400 mb-3">{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!note) {
    return <p className="text-xs text-slate-400">Note not found.</p>;
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-primary-400"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span> Return to Database
      </button>

      <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary-500/5 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-300 border border-slate-700">
              {note.branch}
            </span>
            <span className="inline-flex items-center rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-300 border border-primary-500/20">
              Phase {note.semester}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">{note.title}</h1>

          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400 mb-6">
            Module: {note.subject}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-700/50 pt-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Upload Chronology</p>
              <p className="text-sm text-slate-300">
                {note.createdAt
                  ? new Date(note.createdAt).toLocaleString()
                  : "Unknown Data Point"}
              </p>
            </div>

            <div className="flex items-center gap-6 rounded-2xl bg-slate-950/50 px-6 py-3 border border-slate-800/80">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Aesthetic Rating</p>
                <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-amber-400">
                  <span>⭐</span>
                  <span>{note.averageRating?.toFixed?.(1) ?? note.averageRating ?? 0}</span>
                  <span className="text-xs text-slate-500">({note.ratingCount ?? 0})</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Extraction Count</p>
                <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-emerald-400">
                  <span>⬇</span>
                  <span>{note.downloads ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_-3px_rgba(56,189,248,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.6)] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Extract PDF Payload
            </button>
            <button
              type="button"
              onClick={handleBookmark}
              disabled={bookmarking}
              className="group flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/80 px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-200 transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400 active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
            >
              <svg className={`w-5 h-5 transition-colors ${bookmarking ? 'animate-pulse text-amber-500' : 'group-hover:text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
              {bookmarking ? "Tagging..." : "Tag Reference"}
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleRate}
        className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-tight text-white uppercase tracking-widest">
              Evaluate Module Quality
            </p>
            <p className="mt-1 text-xs text-slate-400">Assign a semantic score between 1 and 5</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="rounded-xl border border-slate-700/50 bg-slate-950/80 px-4 py-2.5 text-sm font-bold text-slate-100 outline-none transition-all focus:border-amber-500/50 focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/20"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} {r === 1 ? 'Star' : 'Stars'}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all hover:bg-slate-700 hover:text-white active:scale-[0.98]"
            >
              Submit Evaluation
            </button>
          </div>
        </div>
        {ratedMessage && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{ratedMessage}</p>
          </div>
        )}
      </form>
    </div>
  );
}

