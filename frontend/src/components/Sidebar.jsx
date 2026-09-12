import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: 'dashboard', label: 'Dashboard', roles: null },
  { to: '/app/crm/leads', icon: 'contact_page', label: 'Leads', roles: ['Super Admin', 'Admin / Operations', 'Sales / Business Developer'] },
  { to: '/app/crm/pipeline', icon: 'view_kanban', label: 'Pipeline', roles: ['Super Admin', 'Admin / Operations', 'Sales / Business Developer'] },
  { to: '/app/projects', icon: 'work', label: 'Projects', roles: null },
  { to: '/app/my-work', icon: 'task_alt', label: 'My Work', roles: ['Developer / Team Member', 'Project Manager'] },
  { to: '/app/requirements', icon: 'description', label: 'Requirements', roles: null },
  { to: '/app/tickets', icon: 'support_agent', label: 'Support Tickets', roles: ['Super Admin', 'Admin / Operations', 'Support Agent'] },
  { to: '/app/invoices', icon: 'receipt_long', label: 'Invoices', roles: ['Super Admin', 'Admin / Operations', 'Accounts'] },
  { to: '/app/users', icon: 'people', label: 'Users & Roles', roles: ['Super Admin', 'Admin / Operations'] },
  { to: '/app/audit-log', icon: 'security', label: 'Audit Log', roles: ['Super Admin', 'Admin / Operations'] },
];

export default function Sidebar({ open }) {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <aside
      className={`bg-hero text-slate-300 flex flex-col shrink-0 transition-all duration-200 border-r border-white/5 ${
        open ? 'w-64' : 'w-[72px]'
      }`}
    >
      <div className="h-16 flex items-center gap-2 px-4 border-b border-white/5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined text-lg">hub</span>
        </div>
        {open && <span className="font-bold text-white tracking-tight">DevFlow CRM</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
            title={!open ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-600/90 to-brand-500/70"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="material-symbols-outlined shrink-0 relative z-10">{item.icon}</span>
                {open && <span className="truncate relative z-10">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {open && (
        <div className="px-4 py-3 border-t border-white/5 text-xs text-slate-500">
          DevFlow CRM — U Devs © 2026
        </div>
      )}
    </aside>
  );
}
