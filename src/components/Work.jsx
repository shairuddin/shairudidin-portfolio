import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { site } from "../config/site.js";
import { projects, categories, industries } from "../data/projects.js";
import { useRevealAll } from "../lib/motion.js";
import { ArrowUpRight, Close, Search, Play, Folder } from "./Icons.jsx";

const PAGE = 18;
const TYPE_LABEL = { "Video & Reels": "Videos", "Graphic Design": "Designs", "Logo Design": "Logos", "Marketing Plans": "Plans & scripts", "Influencer & Social": "Influencer", "AI Voiceovers": "Voiceovers" };
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const typeCounts = (list) => categories.map((c) => [c, list.filter((p) => p.category === c).length]).filter(([, n]) => n);

function badge(p) {
  if (p.type === "video") return `${p.kind} · ${fmtDur(p.dur || 0)}`;
  if (p.type === "pdf") return p.pages ? `PDF · ${p.pages} pages` : "PDF";
  if (p.type === "audio") return `Audio · ${fmtDur(p.dur || 0)}`;
  return p.kind;
}

/* ---------- routing: #work, #work/<industry>, #work/<industry>/<client>, #work/type/<category> ---------- */
function parseHash() {
  const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  const parts = h.split("/");
  if (parts[0] !== "work") return null;
  if (parts[1] === "type") {
    const cat = categories.find((c) => slug(c) === parts[2]);
    return { view: "type", industry: null, client: "all", type: cat || "All" };
  }
  const ind = industries.find((i) => i.id === parts[1]);
  if (!ind) return { view: "industry", industry: null, client: "all", type: "All" };
  const cl = ind.clients.find((c) => c.id === parts[2]);
  return { view: "industry", industry: ind.id, client: cl ? cl.id : "all", type: "All" };
}
function hashFor(s) {
  if (s.view === "type") return s.type === "All" ? "#work/type" : `#work/type/${slug(s.type)}`;
  if (!s.industry) return "#work";
  return s.client === "all" ? `#work/${s.industry}` : `#work/${s.industry}/${s.client}`;
}

/* ---------- cards & viewer ---------- */
function Card({ p, onOpen, showClient = true }) {
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
    <li className="work-item" data-reveal>
      <button className={`work-card work-card--${p.type}`} onClick={onOpen} onMouseEnter={start} onMouseLeave={stop} onFocus={start} onBlur={stop}>
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
        <span className="work-card__meta">{showClient ? `${p.client} / ` : ""}{TYPE_LABEL[p.category] || p.category}</span>
      </button>
    </li>
  );
}

// onOpen receives the clicked item itself, so the viewer always opens exactly that piece
function Grid({ list, onOpen, showClient }) {
  return (
    <ul className="work-grid">
      {list.map((p) => <Card key={p.id} p={p} showClient={showClient} onOpen={() => onOpen(p)} />)}
    </ul>
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

/* ---------- landing: highlights + industry folders ---------- */
function Mosaic({ items }) {
  return (
    <span className="folder__mosaic" aria-hidden="true">
      {items.map((p) => <span key={p.id} className="folder__tile"><img src={p.thumb} alt="" loading="lazy" /></span>)}
    </span>
  );
}

function pickCovers(list, n = 3) {
  const visual = list.filter((p) => p.type === "image" || p.type === "video");
  const sorted = [...visual].sort((a, b) => (b.featured || 0) - (a.featured || 0));
  const out = [], seen = new Set();
  for (const p of sorted) { if (out.length < n && !seen.has(p.client)) { out.push(p); seen.add(p.client); } }
  for (const p of sorted) { if (out.length < n && !out.includes(p)) out.push(p); }
  return out;
}

function Folders({ go }) {
  return (
    <ul className="folders">
      {industries.map((ind, i) => {
        const list = projects.filter((p) => p.industry === ind.id);
        return (
          <li key={ind.id} data-reveal style={{ "--d": `${(i % 3) * 70}ms` }}>
            <a className="folder" href={`#work/${ind.id}`} onClick={(e) => { e.preventDefault(); go({ view: "industry", industry: ind.id, client: "all", type: "All" }); }}>
              <Mosaic items={pickCovers(list)} />
              <span className="folder__body">
                <span className="folder__top">
                  <span className="folder__num mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="folder__count mono">{ind.clients.length} {ind.clients.length === 1 ? "client" : "clients"} · {list.length} pieces</span>
                </span>
                <span className="folder__name">{ind.name}</span>
                <span className="folder__clients">{ind.clients.slice(0, 4).map((c) => c.name).join(" · ")}{ind.clients.length > 4 ? ` +${ind.clients.length - 4}` : ""}</span>
                <span className="folder__types">
                  {typeCounts(list).map(([c, n]) => <span key={c} className="mini-chip">{TYPE_LABEL[c]} <b>{n}</b></span>)}
                </span>
              </span>
              <span className="folder__go"><ArrowUpRight /></span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- main ---------- */
export default function Work() {
  const [nav, setNav] = useState(() => (typeof window !== "undefined" && parseHash()) || { view: "industry", industry: null, client: "all", type: "All" });
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [viewer, setViewer] = useState(null); // { list, index }
  const sectionRef = useRef(null);
  const first = useRef(true);

  // keep the URL in sync so folders can be shared and Back works
  useEffect(() => {
    const onPop = () => { const s = parseHash(); if (s) { setNav(s); setQuery(""); } };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("hashchange", onPop); };
  }, []);

  useEffect(() => {
    // deep link on first load: bring the section into view
    if (first.current) { first.current = false; if (parseHash() && window.location.hash !== "#work") setTimeout(() => sectionRef.current?.scrollIntoView(), 50); }
  }, []);

  const go = (next) => {
    const s = { ...nav, ...next };
    setNav(s);
    setShown(PAGE);
    setQuery("");
    const h = hashFor(s);
    if (window.location.hash !== h) history.pushState(null, "", h);
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
    if (top < -40 || top > window.innerHeight * 0.5) sectionRef.current?.scrollIntoView({ behavior: document.documentElement.classList.contains("no-motion") ? "auto" : "smooth" });
  };

  const ind = industries.find((i) => i.id === nav.industry);
  const q = query.trim().toLowerCase();

  // lists for each mode
  const searchList = useMemo(() => !q ? [] : projects.filter((p) => `${p.title} ${p.client} ${p.category} ${p.kind} ${industries.find((i) => i.id === p.industry)?.name}`.toLowerCase().includes(q)), [q]);
  const typeList = useMemo(() => projects.filter((p) => nav.type === "All" || p.category === nav.type), [nav.type]);
  const indList = useMemo(() => ind ? projects.filter((p) => p.industry === ind.id) : [], [ind]);
  const indFiltered = useMemo(() => indList.filter((p) => (nav.client === "all" || p.clientId === nav.client) && (nav.type === "All" || p.category === nav.type)), [indList, nav.client, nav.type]);
  const groups = useMemo(() => ind ? ind.clients.map((c) => ({ ...c, items: indFiltered.filter((p) => p.clientId === c.id) })).filter((g) => g.items.length) : [], [ind, indFiltered]);
  const highlights = useMemo(() => [...projects].filter((p) => p.featured).sort((a, b) => b.featured - a.featured).slice(0, 8), []);

  useRevealAll([nav, q, shown]);
  // open the clicked piece by id; next/previous then walks `list` in the order it is shown on screen
  const openFrom = (list) => (p) => {
    const index = list.findIndex((x) => x.id === p.id);
    setViewer({ list, index: index < 0 ? 0 : index });
  };
  const groupedList = groups.flatMap((g) => g.items);   // same order as the grouped grids

  const typesHere = ind ? typeCounts(nav.client === "all" ? indList : indList.filter((p) => p.clientId === nav.client)) : [];
  const nextInd = ind ? industries[(industries.indexOf(ind) + 1) % industries.length] : null;

  return (
    <section className="section" id="work" aria-labelledby="work-title" ref={sectionRef}>
      <div className="container">
        <div className="work-head">
          <div className="section-head" data-reveal>
            <p className="eyebrow"><span className="mono">01</span> / Selected work · {projects.length} pieces · {industries.reduce((n, i) => n + i.clients.length, 0)} clients</p>
            <h2 className="display" id="work-title">Work that <span className="accent">performs.</span></h2>
          </div>
          <div className="work-controls" data-reveal>
            <div className="seg" role="tablist" aria-label="Browse work">
              <button role="tab" aria-selected={nav.view === "industry"} className={nav.view === "industry" ? "is-on" : ""} onClick={() => go({ view: "industry", industry: null, client: "all", type: "All" })}>By industry</button>
              <button role="tab" aria-selected={nav.view === "type"} className={nav.view === "type" ? "is-on" : ""} onClick={() => go({ view: "type", industry: null, client: "all", type: "All" })}>By type</button>
            </div>
            <label className="search">
              <Search width={16} height={16} />
              <span className="sr-only">Search all work</span>
              <input type="search" placeholder="Search client or title" value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }} />
            </label>
          </div>
        </div>

        {q ? (
          /* ---------- search results ---------- */
          <div className="work-panel">
            <div className="crumbs">
              <p className="mono muted" aria-live="polite">{searchList.length} result{searchList.length === 1 ? "" : "s"} for “{query}”</p>
              <button className="link-btn" onClick={() => setQuery("")}>Clear search</button>
            </div>
            {searchList.length ? <Grid list={searchList.slice(0, shown)} onOpen={openFrom(searchList)} /> : <p className="muted">Nothing matches. Try a client like “Arogya” or “Conroy”.</p>}
            {shown < searchList.length && <div className="work-more"><button className="btn btn--ghost" onClick={() => setShown(shown + PAGE)}>Load more</button></div>}
          </div>
        ) : nav.view === "type" ? (
          /* ---------- by type ---------- */
          <div className="work-panel">
            <div className="chips work-filters" role="group" aria-label="Filter by type of work">
              {["All", ...categories].map((f) => (
                <button key={f} className={`chip ${nav.type === f ? "is-on" : ""}`} aria-pressed={nav.type === f} onClick={() => go({ type: f })}>
                  {f === "All" ? "All work" : f}<span className="chip__n">{f === "All" ? projects.length : projects.filter((p) => p.category === f).length}</span>
                </button>
              ))}
            </div>
            <Grid list={typeList.slice(0, shown)} onOpen={openFrom(typeList)} />
            <div className="work-more">
              <p className="mono muted" aria-live="polite">Showing {Math.min(shown, typeList.length)} of {typeList.length}</p>
              {shown < typeList.length && <button className="btn btn--ghost" onClick={() => setShown(shown + PAGE)}>Load more</button>}
            </div>
          </div>
        ) : !ind ? (
          /* ---------- landing: highlights + folders ---------- */
          <div className="work-panel">
            <div className="sub-head" data-reveal>
              <h3 className="sub-title">Highlights</h3>
              <p className="muted small">Hand-picked pieces across all clients</p>
            </div>
            <ul className="highlights">
              {highlights.map((p) => <Card key={p.id} p={p} onOpen={() => openFrom(highlights)(p)} />)}
            </ul>
            <div className="sub-head" data-reveal>
              <h3 className="sub-title">Browse by industry</h3>
              <p className="muted small">Open a folder to see every client’s work, grouped and filterable by type</p>
            </div>
            <Folders go={go} />
            <div className="work-more">
              <a className="btn btn--ghost" href={site.shortPortfolioLink} target="_blank" rel="noopener noreferrer">Full portfolio on Drive <ArrowUpRight width={16} height={16} /></a>
            </div>
          </div>
        ) : (
          /* ---------- inside an industry folder ---------- */
          <div className="work-panel">
            <nav className="crumbs" aria-label="Breadcrumb">
              <ol>
                <li><a href="#work" onClick={(e) => { e.preventDefault(); go({ industry: null, client: "all", type: "All" }); }}><Folder width={14} height={14} /> All industries</a></li>
                <li aria-current={nav.client === "all" ? "page" : undefined}>
                  {nav.client === "all" ? ind.name : <a href={`#work/${ind.id}`} onClick={(e) => { e.preventDefault(); go({ client: "all", type: "All" }); }}>{ind.name}</a>}
                </li>
                {nav.client !== "all" && <li aria-current="page">{ind.clients.find((c) => c.id === nav.client)?.name}</li>}
              </ol>
            </nav>

            <div className="ind-head" data-reveal>
              <h3 className="display display--sm">{nav.client === "all" ? ind.name : ind.clients.find((c) => c.id === nav.client)?.name}</h3>
              <p className="muted">{nav.client === "all" ? ind.blurb : `${ind.name} · ${indFiltered.length} pieces`}</p>
            </div>

            <div className="filter-row">
              <span className="label">Client</span>
              <div className="chips chips--scroll" role="group" aria-label="Filter by client">
                <button className={`chip ${nav.client === "all" ? "is-on" : ""}`} aria-pressed={nav.client === "all"} onClick={() => go({ client: "all", type: "All" })}>All clients<span className="chip__n">{indList.length}</span></button>
                {ind.clients.map((c) => (
                  <button key={c.id} className={`chip ${nav.client === c.id ? "is-on" : ""}`} aria-pressed={nav.client === c.id} onClick={() => go({ client: c.id, type: "All" })}>{c.name}<span className="chip__n">{c.count}</span></button>
                ))}
              </div>
            </div>
            {typesHere.length > 1 && (
              <div className="filter-row">
                <span className="label">Type</span>
                <div className="chips chips--scroll" role="group" aria-label="Filter by type of work">
                  <button className={`chip chip--sm ${nav.type === "All" ? "is-on" : ""}`} aria-pressed={nav.type === "All"} onClick={() => go({ type: "All" })}>All types</button>
                  {typesHere.map(([c, n]) => (
                    <button key={c} className={`chip chip--sm ${nav.type === c ? "is-on" : ""}`} aria-pressed={nav.type === c} onClick={() => go({ type: c })}>{TYPE_LABEL[c]}<span className="chip__n">{n}</span></button>
                  ))}
                </div>
              </div>
            )}

            {nav.client === "all" ? (
              groups.map((g) => (
                    <div className="client-group" key={g.id}>
                      <div className="client-group__head">
                        <h4>{g.name}</h4>
                        <span className="mono muted">{g.items.length} {g.items.length === 1 ? "piece" : "pieces"}</span>
                        <button className="link-btn" onClick={() => go({ client: g.id, type: "All" })}>Open client <ArrowUpRight width={14} height={14} /></button>
                      </div>
                      <Grid list={g.items} onOpen={openFrom(groupedList)} showClient={false} />
                    </div>
              ))
            ) : (
              <Grid list={indFiltered} onOpen={openFrom(indFiltered)} showClient={false} />
            )}

            <div className="folder-foot">
              <button className="btn btn--ghost" onClick={() => go({ industry: null, client: "all", type: "All" })}>← All industries</button>
              <button className="btn btn--accent" onClick={() => go({ industry: nextInd.id, client: "all", type: "All" })}>Next: {nextInd.name} <ArrowUpRight width={16} height={16} /></button>
            </div>
          </div>
        )}
      </div>
      {viewer && <Viewer list={viewer.list} index={viewer.index} setIndex={(f) => setViewer((v) => ({ ...v, index: typeof f === "function" ? f(v.index) : f }))} onClose={() => setViewer(null)} />}
    </section>
  );
}
