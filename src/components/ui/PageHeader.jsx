export default function PageHeader({ title, subtitle, action }) {
  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
