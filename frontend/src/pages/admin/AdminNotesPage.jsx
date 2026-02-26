import { useEffect, useState } from "react";
import { useApi } from "../../auth/ApiProvider";

export function AdminNotesPage() {
  const api = useApi();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes/admin/pending");
      setNotes(res.data.notes || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to load pending notes. Make sure you are logged in as admin.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (id, action) => {
    setBusyId(id);
    setError("");
    try {
      if (action === "approve") {
        await api.post(`/notes/${id}/approve`);
      } else if (action === "reject") {
        await api.post(`/notes/${id}/reject`);
      } else if (action === "delete") {
        await api.delete(`/notes/${id}`);
      }
      await load();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to perform action on note. Please try again.";
      setError(message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          Admin · Pending notes
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Review uploaded notes, approve good content, or remove inappropriate
          material.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading pending notes...</p>
      ) : error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : notes.length === 0 ? (
        <p className="text-xs text-slate-400">
          No pending notes. Great job keeping the content clean!
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    {note.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {note.subject} • {note.branch} • Sem {note.semester}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Uploaded by: {note.uploadedBy?.name} (
                    {note.uploadedBy?.email})
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary-400 hover:text-primary-300"
                  >
                    View PDF
                  </a>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === note.id}
                      onClick={() => handleAction(note.id, "approve")}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === note.id}
                      onClick={() => handleAction(note.id, "reject")}
                      className="rounded-md bg-amber-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-amber-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyId === note.id}
                      onClick={() => handleAction(note.id, "delete")}
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

