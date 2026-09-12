import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar } from '../features/ui/uiSlice';
import { logoutUser } from '../features/auth/authSlice';
import { fetchNotifications } from '../features/notifications/notificationSlice';
import NotificationDrawer from './NotificationDrawer';

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate('/login');
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3 flex-1">
        <button
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-md hover:bg-slate-100"
          onClick={() => dispatch(toggleSidebar())}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="input pl-9 bg-slate-50"
            placeholder="Search leads, clients, projects… (Ctrl+K)"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative text-slate-500 hover:text-slate-800 p-2 rounded-md hover:bg-slate-100"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400 leading-tight">{user?.role}</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
