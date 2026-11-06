import { useEffect, useState } from "react";
import { site } from "../config/site.js";
import { Menu, Close, Pause, Play } from "./Icons.jsx";

const links = [
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export default function Header({ motionOn, setMotionOn }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setScrolled(h.scrollTop > 20);
      setProgress(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight));
      let current = "";
      for (const l of links) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = l.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <div className="header__inner">
        <a href="#top" className="wordmark" aria-label={`${site.identity.displayName}, back to top`}>
          {site.identity.wordmark}<sup>®</sup>
        </a>
        <nav className="nav" aria-label="Main">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? "is-active" : ""} aria-current={active === l.id ? "true" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="header__actions">
          <button className="motion-toggle" onClick={() => setMotionOn(!motionOn)} aria-pressed={motionOn}>
            {motionOn ? <Pause width={14} height={14} /> : <Play width={14} height={14} />}
            <span>Motion {motionOn ? "on" : "off"}</span>
          </button>
          <a href="#contact" className="btn btn--small btn--accent hide-sm">Hire me</a>
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu">
            <Menu />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <button className="menu-btn mobile-menu__close" onClick={() => setOpen(false)} aria-label="Close menu"><Close /></button>
        <nav aria-label="Mobile">
          {links.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>
              <span className="mono">0{i + 1}</span>{l.label}
            </a>
          ))}
        </nav>
        <p className="mobile-menu__foot">{site.contact.email}</p>
      </div>
    </header>
  );
}
