import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { markAllNotificationsRead } from '../features/notifications/notificationSlice';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.notifications);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Notifications</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(markAllNotificationsRead())} className="text-xs text-brand-600 hover:underline">
              Mark all read
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <p className="p-4 text-sm text-slate-400">Loading…</p>}
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-6 text-center">
              <span className="material-symbols-outlined text-3xl">notifications_off</span>
              <p className="text-sm">You&apos;re all caught up. No notifications yet.</p>
            </div>
          )}
          {items.map((n) => (
            <Link
              to={n.link || '#'}
              key={n.id}
              onClick={onClose}
              className={`block px-4 py-3 border-b border-slate-50 hover:bg-slate-50 ${!n.readAt ? 'bg-brand-50/40' : ''}`}
            >
              <p className="text-sm font-medium text-slate-700">{n.title}</p>
              {n.body && <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>}
              <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
