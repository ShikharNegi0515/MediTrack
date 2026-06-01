import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-teal-600 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              Medi<span className="text-amber-300">Track</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-teal-100/90">
            Your personal medication companion
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
