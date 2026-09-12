import { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';

// Animates a numeric value counting up from 0 — used as the one signature
// motion moment on dashboard KPI cards (per the restraint principle: one
// deliberate move, not motion scattered on every element).
export default function CountUp({ value = 0, prefix = '', duration = 1.1 }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => `${prefix}${Math.round(v).toLocaleString()}`);
  const ref = useRef(null);

  useEffect(() => {
    const controls = animate(motionValue, Number(value) || 0, { duration, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref}>{prefix}0</span>;
}
