export default function EmptyState({ icon = "📋", title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 px-6 text-center">
      <span className="mb-3 text-4xl" aria-hidden>
        {icon}
      </span>
      <p className="font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}
