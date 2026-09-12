export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
      <span className="material-symbols-outlined animate-spin">progress_activity</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
