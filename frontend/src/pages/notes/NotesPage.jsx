import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../auth/ApiProvider";

const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export function NotesPage() {
  const api = useApi();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadBranch, setUploadBranch] = useState("");
  const [uploadSemester, setUploadSemester] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [q, setQ] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes", {
        params: {
          branch: branch || undefined,
          semester: semester || undefined,
          subject: subject || undefined,
          q: q || undefined,
        },
      });
      setNotes(res.data.notes || []);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load notes. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!uploadFile) {
      setUploadError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", uploadTitle);
    formData.append("subject", uploadSubject);
    formData.append("branch", uploadBranch);
    formData.append("semester", uploadSemester);
    formData.append("file", uploadFile);

    setUploading(true);
    try {
      await api.post("/notes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadSuccess(
        "Note uploaded successfully. It will be visible once approved by an admin."
      );
      setUploadTitle("");
      setUploadSubject("");
      setUploadBranch("");
      setUploadSemester("");
      setUploadFile(null);
      fetchNotes();
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to upload note. Please try again.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 shadow-[0_0_40px_-10px_rgba(56,189,248,0.15)] backdrop-blur-xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-sky-500 shadow-lg shadow-primary-500/30 text-xl font-bold tracking-wider text-white">
              KB
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Knowledge Base</h1>
              <p className="mt-1 text-sm text-slate-400">
                Search, filter, and contribute to the centralized academic data repository.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleUpload}
          className="space-y-5 rounded-2xl border border-primary-500/20 bg-slate-950/40 p-6 shadow-inner"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-400">
              Upload Data Module (PDF)
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="group">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
                Document Title
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                required
              />
            </div>
            <div className="group">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
                Subject Sphere
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="group">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
                Branch Target
              </label>
              <select
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
                value={uploadBranch}
                onChange={(e) => setUploadBranch(e.target.value)}
                required
              >
                <option value="">Select branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="group">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
                Semester Timeline
              </label>
              <select
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-primary-500 focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20"
                value={uploadSemester}
                onChange={(e) => setUploadSemester(e.target.value)}
                required
              >
                <option value="">Select semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>Phase {s}</option>
                ))}
              </select>
            </div>
            <div className="group">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors group-focus-within:text-primary-400">
                Encrypted File Segment
              </label>
              <input
                type="file"
                accept="application/pdf"
                className="w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-slate-100 file:uppercase tracking-widest hover:file:bg-primary-600 transition-all cursor-pointer"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          </div>

          {uploadError && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-center">
              <p className="text-sm font-medium text-rose-400" role="alert">{uploadError}</p>
            </div>
          )}
          {uploadSuccess && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
              <p className="text-sm font-medium text-emerald-400" role="alert">{uploadSuccess}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="w-auto min-w-[200px] rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_-3px_rgba(56,189,248,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  UPLOADING DATA...
                </span>
              ) : (
                "UPLOAD DATA MODULE"
              )}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleSearch}
          className="mt-8 grid gap-4 rounded-2xl border border-slate-700/50 bg-slate-950/20 p-4 md:grid-cols-5 backdrop-blur-sm"
        >
          <select
            className="rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-2.5 text-xs font-medium text-slate-100 outline-none transition-all focus:border-primary-500 focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            className="rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-2.5 text-xs font-medium text-slate-100 outline-none transition-all focus:border-primary-500 focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Phases</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Phase {s}</option>)}
          </select>

          <input
            type="text"
            placeholder="Target Subject"
            className="rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-2.5 text-xs font-medium text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-primary-500 focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <input
            type="text"
            placeholder="Search Matrix..."
            className="rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-2.5 text-xs font-medium text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-primary-500 focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
          >
            Apply Query
          </button>
        </form>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center p-8">
              <span className="flex items-center gap-3 text-sm font-bold text-primary-400 uppercase tracking-widest">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Retrieving Database...
              </span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
              <p className="text-sm font-medium text-rose-400">{error}</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/20 p-12 text-center backdrop-blur-sm">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">No matching records found in database.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Link
                  to={`/notes/${note.id}`}
                  key={note.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/60 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:bg-slate-900/80 hover:shadow-[0_10px_40px_-10px_rgba(56,189,248,0.2)] flex flex-col justify-between min-h-[160px]"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-500/5 blur-2xl transition-all group-hover:bg-primary-500/15"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-slate-700">
                        {note.branch}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-primary-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-300 border border-primary-500/20">
                        Phase {note.semester}
                      </span>
                    </div>
                    <h2 className="text-base font-bold tracking-tight text-white mb-1 group-hover:text-primary-300 transition-colors line-clamp-2">
                      {note.title}
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {note.subject}
                    </p>
                  </div>

                  <div className="relative z-10 mt-4 flex items-end justify-between border-t border-slate-800/50 pt-4">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "—"}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      <p className="flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                        ⭐ {note.averageRating?.toFixed?.(1) ?? note.averageRating ?? 0}
                      </p>
                      <p className="flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                        ⬇ {note.downloads ?? 0}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

