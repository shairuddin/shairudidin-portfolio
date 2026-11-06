import { createContext, useContext, useEffect, useRef, useState } from "react";

const KEY = "siruddin-portfolio-motion";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useMotionSetting() {
  const [on, setOn] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved !== null) return saved === "on";
    } catch {}
    return !prefersReduced();
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
    document.documentElement.classList.toggle("no-motion", !on);
  }, [on]);
  return [on, setOn];
}

export const MotionContext = createContext(true);
export const useMotion = () => useContext(MotionContext);

// Adds `is-in` to elements with [data-reveal] once they scroll into view.
export function useRevealAll(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export function Counter({ value, suffix = "", duration = 1600 }) {
  const motion = useMotion();
  const [ref, inView] = useInView(0.4);
  const [n, setN] = useState(motion ? 0 : value);
  useEffect(() => {
    if (!inView) return;
    if (!motion) { setN(value); return; }
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, motion, value, duration]);
  return (
    <span ref={ref} aria-label={`${value.toLocaleString("en-US")}${suffix}`}>
      <span aria-hidden="true">{n.toLocaleString("en-US")}{suffix}</span>
    </span>
  );
}
