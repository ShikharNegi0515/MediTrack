export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
        role="status"
        aria-label={label}
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
