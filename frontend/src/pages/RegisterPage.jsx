import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser, clearAuthError } from '../features/auth/authSlice';
import AuroraBackground from '../components/AuroraBackground';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      errs.password = 'Must include an uppercase letter and a number';
    }
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    if (!validate()) return;

    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Check your email to verify.');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Registration failed');
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
          <h1 className="text-3xl font-bold gradient-text tracking-tight">Create your account</h1>
          <p className="text-white/50 text-sm mt-2">Join DevFlow CRM</p>
        </motion.div>

        <motion.form variants={item} onSubmit={handleSubmit} className="glass-card p-7 space-y-4">
          <motion.div variants={item}>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Full name</label>
            <input name="name" className="glass-input" value={form.name} onChange={handleChange} placeholder="Jane Doe" />
            {fieldErrors.name && <p className="text-xs text-coral-400 mt-1.5">{fieldErrors.name}</p>}
          </motion.div>
          <motion.div variants={item}>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Email</label>
            <input
              type="email"
              name="email"
              className="glass-input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
            />
            {fieldErrors.email && <p className="text-xs text-coral-400 mt-1.5">{fieldErrors.email}</p>}
          </motion.div>
          <motion.div variants={item}>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Password</label>
            <input
              type="password"
              name="password"
              className="glass-input"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
            />
            {fieldErrors.password && <p className="text-xs text-coral-400 mt-1.5">{fieldErrors.password}</p>}
          </motion.div>
          <motion.div variants={item}>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              className="glass-input"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {fieldErrors.confirmPassword && <p className="text-xs text-coral-400 mt-1.5">{fieldErrors.confirmPassword}</p>}
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
            {loading ? 'Creating account…' : 'Create account'}
          </motion.button>

          <motion.p variants={item} className="text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-medium hover:text-cyan-300">
              Sign in
            </Link>
          </motion.p>
        </motion.form>
      </motion.div>
    </div>
  );
}
