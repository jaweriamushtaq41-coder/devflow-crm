import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import AuroraBackground from '../components/AuroraBackground';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    if (!validate()) return;

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/app/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
      <AuroraBackground />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 w-full max-w-md">
        <motion.div variants={item} className="text-center mb-7">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/[0.08] border border-white/10 text-white mb-4">
            <span className="material-symbols-outlined">hub</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text tracking-tight">DevFlow CRM</h1>
          <p className="text-white/50 text-sm mt-2">Built specifically for software houses — by U Devs</p>
        </motion.div>

        <motion.form variants={item} onSubmit={handleSubmit} className="glass-card p-7 space-y-4">
          <motion.div variants={item}>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Email</label>
            <input
              type="email"
              name="email"
              className="glass-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {fieldErrors.email && <p className="text-xs text-coral-400 mt-1.5">{fieldErrors.email}</p>}
          </motion.div>

          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white/60">Password</label>
              <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              className="glass-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            {fieldErrors.password && <p className="text-xs text-coral-400 mt-1.5">{fieldErrors.password}</p>}
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-coral-200 bg-coral-500/10 border border-coral-500/20 rounded-xl px-3.5 py-2.5"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            variants={item}
            type="submit"
            disabled={loading}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:shadow-glow transition-shadow disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </motion.button>

          <motion.p variants={item} className="text-center text-sm text-white/50">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-medium hover:text-cyan-300">
              Register
            </Link>
          </motion.p>
        </motion.form>

        <motion.p variants={item} className="text-center text-xs text-white/30 mt-6 leading-relaxed">
          Demo: admin@demo.local · sales@demo.local · pm@demo.local · developer@demo.local · client@demo.local
          <br />
          Password: <span className="font-mono text-white/50">Demo@1234</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
