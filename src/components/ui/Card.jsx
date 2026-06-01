export default function Card({ children, className = "", padding = true }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${padding ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
