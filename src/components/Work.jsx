import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { site } from "../config/site.js";
import { projects, categories } from "../data/projects.js";
import { useRevealAll } from "../lib/motion.js";
import { ArrowUpRight, Close, Search, Play } from "./Icons.jsx";

const PAGE = 18;
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function badge(p) {
  if (p.type === "video") return `${p.kind} · ${fmtDur(p.dur || 0)}`;
  if (p.type === "pdf") return p.pages ? `PDF · ${p.pages} pages` : "PDF";
  if (p.type === "audio") return `Audio · ${fmtDur(p.dur || 0)}`;
  return p.kind;
}

function Card({ p, index, onOpen }) {
  const vidRef = useRef(null);
  const start = () => {
    if (p.type !== "video" || !canHover() || document.documentElement.classList.contains("no-motion")) return;
    const v = vidRef.current;
    if (!v) return;
    if (!v.src) v.src = p.src;
    v.play().catch(() => {});
  };
  const stop = () => { const v = vidRef.current; if (v && !v.paused) v.pause(); };
  return (
    <li className="work-item" data-reveal style={{ "--d": `${(index % 6) * 50}ms` }}>
      <button className={`work-card work-card--${p.type}`} onClick={() => onOpen(index)} onMouseEnter={start} onMouseLeave={stop} onFocus={start} onBlur={stop}>
        <span className="work-card__media" style={p.type === "audio" ? undefined : { aspectRatio: `${p.w} / ${p.h}` }}>
          {p.type === "audio" ? (
            <span className="wave" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ "--i": i }} />)}</span>
          ) : (
            <img src={p.thumb} alt="" loading="lazy" decoding="async" width={p.w} height={p.h} />
          )}
          {p.type === "video" && <video ref={vidRef} muted loop playsInline preload="none" aria-hidden="true" />}
          {(p.type === "video" || p.type === "audio") && <span className="play" aria-hidden="true"><Play width={18} height={18} /></span>}
          <span className="tag">{badge(p)}</span>
        </span>
        <span className="work-card__title">{p.title}</span>
        <span className="work-card__meta">{p.client} / {p.category}</span>
      </button>
    </li>
  );
}

function Viewer({ list, index, setIndex, onClose }) {
  const p = list[index];
  const ref = useRef(null);
  const lastFocus = useRef(null);
  const go = useCallback((d) => setIndex((i) => (i + d + list.length) % list.length), [list.length, setIndex]);

  useEffect(() => {
    lastFocus.current = document.activeElement;
    ref.current?.querySelector(".viewer__close")?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; lastFocus.current?.focus?.(); };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const f = ref.current.querySelectorAll("a[href], button, video, audio");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title" ref={ref} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="viewer__bar">
        <p className="mono muted">{String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</p>
        <button className="viewer__close" onClick={onClose} aria-label="Close viewer"><Close /></button>
      </div>
      <div className="viewer__stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <button className="viewer__nav viewer__nav--prev" onClick={() => go(-1)} aria-label="Previous piece">‹</button>
        <div className="viewer__media" key={p.id}>
          {p.type === "image" && <img src={p.src} alt={p.title} />}
          {p.type === "video" && <video src={p.src} poster={p.thumb} controls autoPlay playsInline />}
          {p.type === "audio" && (
            <div className="viewer__audio">
              <span className="wave wave--big" aria-hidden="true">{Array.from({ length: 40 }, (_, i) => <i key={i} style={{ "--i": i }} />)}</span>
              <audio src={p.src} controls autoPlay />
            </div>
          )}
          {p.type === "pdf" && (
            <a className="viewer__pdf" href={p.src} target="_blank" rel="noopener noreferrer">
              <img src={p.thumb} alt={`First page of ${p.title}`} />
              <span className="btn btn--accent">Open full document <ArrowUpRight width={16} height={16} /></span>
            </a>
          )}
        </div>
        <button className="viewer__nav viewer__nav--next" onClick={() => go(1)} aria-label="Next piece">›</button>
      </div>
      <div className="viewer__info">
        <div>
          <p className="eyebrow">{p.client} · {badge(p)}</p>
          <h3 id="viewer-title" className="viewer__title">{p.title}</h3>
        </div>
        <a className="btn btn--ghost btn--small" href={p.src} target="_blank" rel="noopener noreferrer">Open original size <ArrowUpRight width={14} height={14} /></a>
      </div>
    </div>
  );
}

export default function Work() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState(-1);

  const counts = useMemo(() => Object.fromEntries(categories.map((c) => [c, projects.filter((p) => p.category === c).length])), []);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => filter === "All" || p.category === filter)
      .filter((p) => !q || `${p.title} ${p.client} ${p.category} ${p.kind}`.toLowerCase().includes(q));
  }, [filter, query]);

  useRevealAll([filter, query, shown]);
  const pick = (f) => { setFilter(f); setShown(PAGE); };

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="work-head">
          <div className="section-head" data-reveal>
            <p className="eyebrow"><span className="mono">01</span> / Selected work · {projects.length} pieces</p>
            <h2 className="display" id="work-title">Work that <span className="accent">performs.</span></h2>
          </div>
          <label className="search" data-reveal>
            <Search width={16} height={16} />
            <span className="sr-only">Search work</span>
            <input type="search" placeholder="Search client or title" value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }} />
          </label>
        </div>

        <div className="chips work-filters" role="group" aria-label="Filter work by category" data-reveal>
          {["All", ...categories].map((f) => (
            <button key={f} className={`chip ${filter === f ? "is-on" : ""}`} aria-pressed={filter === f} onClick={() => pick(f)}>
              {f}<span className="chip__n">{f === "All" ? projects.length : counts[f]}</span>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="muted">Nothing matches “{query}”. Try a client name like “Arogya” or “Conroy”.</p>
        ) : (
          <ul className="work-grid">
            {list.slice(0, shown).map((p, i) => <Card key={p.id} p={p} index={i} onOpen={setOpen} />)}
          </ul>
        )}

        <div className="work-more">
          <p className="mono muted" aria-live="polite">Showing {Math.min(shown, list.length)} of {list.length}</p>
          {shown < list.length && <button className="btn btn--ghost" onClick={() => setShown(shown + PAGE)}>Load more</button>}
          <a className="btn btn--accent" href={site.shortPortfolioLink} target="_blank" rel="noopener noreferrer">Full portfolio on Drive <ArrowUpRight width={16} height={16} /></a>
        </div>
      </div>
      {open >= 0 && list[open] && <Viewer list={list} index={open} setIndex={setOpen} onClose={() => setOpen(-1)} />}
    </section>
  );
}
