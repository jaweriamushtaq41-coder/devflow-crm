const COLOR_MAP = {
  // Lead / Deal statuses
  new: 'bg-slate-100 text-slate-700',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-indigo-100 text-indigo-700',
  proposal: 'bg-amber-100 text-amber-700',
  negotiation: 'bg-orange-100 text-orange-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
  archived: 'bg-slate-100 text-slate-500',
  // Project statuses
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-amber-100 text-amber-700',
  in_review: 'bg-indigo-100 text-indigo-700',
  uat: 'bg-purple-100 text-purple-700',
  completed: 'bg-emerald-100 text-emerald-700',
  // Requirement statuses
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  clarification: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  implemented: 'bg-purple-100 text-purple-700',
  // Task statuses
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-emerald-100 text-emerald-700',
};

export default function StatusBadge({ status }) {
  const cls = COLOR_MAP[status] || 'bg-slate-100 text-slate-600';
  const label = (status || '').replace(/_/g, ' ');
  return <span className={`badge ${cls} capitalize`}>{label}</span>;
}
