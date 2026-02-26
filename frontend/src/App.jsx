import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ApiProvider } from "./auth/ApiProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { NotesPage } from "./pages/notes/NotesPage";
import { NoteDetailPage } from "./pages/notes/NoteDetailPage";
import { BookmarksPage } from "./pages/notes/BookmarksPage";
import { AdminNotesPage } from "./pages/admin/AdminNotesPage";
import { InterviewSetupPage } from "./pages/interviews/InterviewSetupPage";
import { InterviewSessionPage } from "./pages/interviews/InterviewSessionPage";
import { InterviewHistoryPage } from "./pages/interviews/InterviewHistoryPage";
import { ShellLayout } from "./layout/ShellLayout";

function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ShellLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="notes/:id" element={<NoteDetailPage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="admin/notes" element={<AdminNotesPage />} />
              <Route path="interviews/setup" element={<InterviewSetupPage />} />
              <Route
                path="interviews/session/:id"
                element={<InterviewSessionPage />}
              />
              <Route
                path="interviews/history"
                element={<InterviewHistoryPage />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ApiProvider>
    </AuthProvider>
  );
}

export default App;
