import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../auth/ApiProvider";
import { Card } from "../../components/Card";

export function InterviewSessionPage() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = location.state || {};

  const [questionIndex, setQuestionIndex] = useState(
    initialState.questionIndex ?? 0
  );
  const [totalQuestions, setTotalQuestions] = useState(
    initialState.totalQuestions ?? 5
  );
  const [question, setQuestion] = useState(initialState.question || null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [complete, setComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [finalFeedback, setFinalFeedback] = useState("");

  useEffect(() => {
    if (!question && !complete) {
      const run = async () => {
        try {
          const res = await api.get(`/interviews/${id}`);
          const inv = res.data.interview;
          setTotalQuestions(inv.questions.length);
          const nextIdx = inv.answers.length;
          setQuestionIndex(nextIdx);
          setHistory(
            inv.answers.map((a) => ({
              question: inv.questions[a.questionIndex]?.prompt || "",
              answer: a.text,
              score: a.score,
              correctness: a.correctness,
              clarity: a.clarity,
              depth: a.depth,
              communication: a.communication,
              feedback: a.feedback,
            }))
          );
          if (nextIdx < inv.questions.length) {
            setQuestion(inv.questions[nextIdx]);
          } else {
            setComplete(true);
            setFinalScore(inv.score);
            setFinalFeedback(inv.feedback);
          }
        } catch (err) {
          setError(
            err.response?.data?.message || "Failed to restore interview session."
          );
        }
      };
      run();
    }
  }, [api, id, question, complete]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post(`/interviews/${id}/answer`, {
        questionIndex,
        answer,
      });
      const ans = res.data.answer;
      setHistory((prev) => [
        ...prev,
        {
          question: res.data.question.prompt,
          answer: ans.text,
          score: ans.score,
          correctness: ans.correctness,
          clarity: ans.clarity,
          depth: ans.depth,
          communication: ans.communication,
          feedback: ans.feedback,
        },
      ]);
      setAnswer("");

      if (res.data.isComplete) {
        setComplete(true);
        setFinalScore(res.data.finalScore);
        setFinalFeedback(res.data.finalFeedback);
        setQuestion(null);
      } else {
        setQuestionIndex(res.data.nextIndex);
        setQuestion(res.data.nextQuestion);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (error && !question && !complete) {
    return (
      <Card className="max-w-md">
        <p className="text-sm text-rose-400">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/interviews/setup")}
          className="mt-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700"
        >
          Back to setup
        </button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between rounded-2xl border border-primary-500/30 bg-slate-900/60 p-5 shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">
            Active Neural Assessment
          </h1>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-950/80 px-4 py-2 border border-slate-700/50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Matrix Scope</span>
          <span className="text-sm font-bold text-primary-400">
            {Math.min(questionIndex + 1, totalQuestions)} <span className="text-slate-600">/</span> {totalQuestions}
          </span>
        </div>
      </div>

      {/* Chat-style thread */}
      <div className="space-y-6">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex justify-start">
              <div className="relative max-w-[85%] rounded-2xl rounded-tl-sm border border-primary-500/20 bg-slate-900/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md">
                <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-sky-500 shadow-lg shadow-primary-500/40 text-[10px] font-bold text-white uppercase tracking-tighter">AI</div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary-400 ml-4">System Query</p>
                <p className="text-sm font-medium leading-relaxed text-slate-200">{item.question}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="relative max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-slate-800 to-slate-900 p-5 border border-slate-700 shadow-lg">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Candidate Response</p>
                <p className="text-sm text-slate-300 leading-relaxed">{item.answer}</p>
              </div>
            </div>

            <div className="flex justify-start pl-6 border-l-2 border-primary-500/20 ml-2">
              <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 backdrop-blur-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Evaluation Score</span>
                    <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-sm font-bold text-emerald-400 border border-emerald-500/30">
                      {(item.score ?? 0).toFixed(1)} <span className="text-[10px] text-emerald-600">/ 10</span>
                    </span>
                  </div>
                  {(item.correctness != null || item.clarity != null) && (
                    <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span className="flex items-center gap-1"><span className="text-primary-500">C:</span>{item.correctness ?? "—"}</span>
                      <span className="flex items-center gap-1"><span className="text-primary-500">Cl:</span>{item.clarity ?? "—"}</span>
                      <span className="flex items-center gap-1"><span className="text-primary-500">D:</span>{item.depth ?? "—"}</span>
                      <span className="flex items-center gap-1"><span className="text-primary-500">Com:</span>{item.communication ?? "—"}</span>
                    </div>
                  )}
                </div>
                {item.feedback && (
                  <p className="text-xs font-medium leading-relaxed text-emerald-100/70">{item.feedback}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {!complete && question && (
          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex justify-start mb-6">
              <div className="relative max-w-[85%] rounded-2xl rounded-tl-sm border border-primary-500/30 bg-primary-950/20 p-5 shadow-[0_4px_20px_rgba(139,92,246,0.1)] backdrop-blur-md animate-pulse">
                <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-sky-500 shadow-lg shadow-primary-500/40 text-[10px] font-bold text-white uppercase tracking-tighter">AI</div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary-400 ml-4 animate-bounce">Awaiting Response</p>
                <p className="text-sm font-medium leading-relaxed text-slate-100">{question.prompt}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex justify-end">
              <div className="w-full max-w-[85%] space-y-3">
                <div className="group relative">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary-600 to-sky-500 opacity-20 blur transition duration-500 group-focus-within:opacity-50"></div>
                  <textarea
                    className="relative min-h-[140px] w-full resize-none rounded-2xl border border-slate-700/50 bg-slate-900/80 p-5 text-sm text-slate-100 placeholder:text-slate-600 outline-none backdrop-blur-md transition-all focus:border-primary-500 focus:bg-slate-950 focus:ring-1 focus:ring-primary-500/50"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Input your response to the neural network..."
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-rose-400" role="alert">{error}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !answer.trim()}
                    className="rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_-3px_rgba(56,189,248,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        EVALUATING...
                      </span>
                    ) : (
                      "TRANSMIT RESPONSE"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {complete && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-emerald-950/30 p-8 shadow-[0_0_40px_-5px_rgba(16,185,129,0.15)] backdrop-blur-xl text-center">
          <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>

            <h2 className="mb-2 text-xl font-extrabold uppercase tracking-widest text-emerald-400">
              Assessment Concluded
            </h2>

            <div className="mx-auto my-6 w-max rounded-2xl border border-emerald-400/30 bg-emerald-950/50 px-8 py-4 shadow-inner">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Final Composite Score</p>
              <p className="text-4xl font-extrabold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                {(finalScore ?? 0).toFixed(1)} <span className="text-xl text-emerald-600">/ 10</span>
              </p>
            </div>

            {finalFeedback && (
              <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-emerald-100/80">
                {finalFeedback}
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate("/interviews/history")}
              className="mt-8 rounded-xl bg-slate-800 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all hover:bg-slate-700 hover:text-white active:scale-[0.98] border border-slate-700"
            >
              Access Evaluation Archives
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
