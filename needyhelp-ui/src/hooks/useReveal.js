import { useEffect, useRef, useState } from 'react';

/**
 * Reveal-on-scroll hook. Adds `revealed=true` exactly once when the
 * referenced element first crosses the viewport threshold.
 *
 * Returns [ref, revealed]. Pair with the `.reveal` / `.reveal--in`
 * classes in App.scss for the actual visual transition.
 */
const useReveal = ({ threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) => {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // Honor reduced motion: just reveal immediately, no observer.
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return [ref, revealed];
};

export default useReveal;
