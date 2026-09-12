import { motion } from 'framer-motion';
import CountUp from './CountUp';

const ACCENT_MAP = {
  brand: { icon: 'text-brand-600 bg-brand-100', ring: 'from-brand-500 to-cyan-400' },
  emerald: { icon: 'text-emerald-600 bg-emerald-100', ring: 'from-emerald-500 to-cyan-400' },
  indigo: { icon: 'text-indigo-600 bg-indigo-100', ring: 'from-indigo-500 to-brand-400' },
  amber: { icon: 'text-amber-600 bg-amber-100', ring: 'from-amber-500 to-coral-400' },
  red: { icon: 'text-coral-600 bg-coral-100', ring: 'from-coral-500 to-amber-400' },
  purple: { icon: 'text-purple-600 bg-purple-100', ring: 'from-purple-500 to-brand-400' },
};

// The one deliberate motion moment on the dashboard: a soft gradient ring
// on hover plus a count-up animation on numeric values. Everything else on
// this screen stays calm so this card keeps its impact.
export default function KpiCard({ icon, label, value, trend, accent = 'brand' }) {
  const colors = ACCENT_MAP[accent] || ACCENT_MAP.brand;
  const numericValue = typeof value === 'string' ? value.replace(/[^0-9.-]/g, '') : value;
  const prefix = typeof value === 'string' ? value.match(/^[^0-9-]*/)?.[0] || '' : '';
  const isNumeric = numericValue !== '' && !isNaN(Number(numericValue));

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative group rounded-xl p-[1px] bg-slate-100 hover:bg-none transition-colors"
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colors.ring} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative bg-white rounded-[11px] p-4 flex items-start justify-between h-full">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {isNumeric ? <CountUp value={Number(numericValue)} prefix={prefix} /> : value}
          </p>
          {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${colors.icon}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}
