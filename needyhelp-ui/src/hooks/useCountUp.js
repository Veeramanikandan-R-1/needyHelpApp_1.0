import { useEffect, useRef, useState } from 'react';

/**
 * Counts up from 0 to `target` over `duration` ms when the element
 * enters the viewport for the first time. Honors reduced-motion by
 * snapping to the final value.
 *
 * Usage:
 *   const [ref, value] = useCountUp(2500);
 *   <span ref={ref}>{value}</span>
 */
const useCountUp = (target, { duration = 1400 } = {}) => {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (typeof IntersectionObserver === 'undefined') {
      setValue(target);
      return undefined;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || startedRef.current) continue;
          startedRef.current = true;
          obs.disconnect();

          if (reduce || target === 0) {
            setValue(target);
            return;
          }

          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return [ref, value];
};

export default useCountUp;
