export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 text-slate-400">
      <span className="material-symbols-outlined text-4xl mb-3">{icon}</span>
      <p className="font-medium text-slate-600">{title}</p>
      {description && <p className="text-sm mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
