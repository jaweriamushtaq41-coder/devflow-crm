import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';

const PORTAL_NAV = [
  { to: '/portal/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/portal/projects', icon: 'work', label: 'My Projects' },
  { to: '/portal/requirements', icon: 'description', label: 'Requirements' },
  { to: '/portal/tickets', icon: 'support_agent', label: 'Support' },
];

// The Client Portal is intentionally a separate layout/shell — clients
// never see internal navigation, other clients' data, or system-wide
// reports, per the official brief (section 8.1).
export default function ClientPortalLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg">hub</span>
          </div>
          <span className="font-bold text-slate-800">DevFlow — Client Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:block">{user?.name}</span>
          <button onClick={handleLogout} className="btn-secondary py-1.5">
            <span className="material-symbols-outlined text-lg">logout</span> Logout
          </button>
        </div>
      </header>

      <div className="flex">
        <nav className="w-56 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-3 space-y-1">
          {PORTAL_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
