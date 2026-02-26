export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:border-primary-500/50 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.2)] ${className}`}
      {...props}
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-sm font-semibold text-slate-50 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }) {
  return (
    <p className={`mt-1 text-xs text-slate-400 ${className}`}>{children}</p>
  );
}
