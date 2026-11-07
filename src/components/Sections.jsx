import { useState } from "react";
import { site } from "../config/site.js";
import { skills } from "../data/skills.js";
import { toolLogos } from "../data/toolLogos.js";
import { experience } from "../data/experience.js";
import { Counter } from "../lib/motion.js";
import { ArrowUp, ArrowUpRight, Linkedin, Mail, Phone, Plus, Minus, Whatsapp, Folder, MapPin } from "./Icons.jsx";

const Head = ({ num, label, children }) => (
  <div className="section-head" data-reveal>
    <p className="eyebrow"><span className="mono">{num}</span> / {label}</p>
    <h2 className="display">{children}</h2>
  </div>
);

export function Metrics() {
  return (
    <section className="metrics" aria-label="Results">
      <div className="container">
        <ul className="metrics__grid">
          {site.metrics.map((m, i) => (
            <li key={m.label} data-reveal style={{ "--d": `${i * 50}ms` }}>
              <strong><Counter value={m.value} suffix={m.suffix} /></strong>
              <span>{m.label}</span>
            </li>
          ))}
        </ul>
        <p className="footnote">Figures from professional experience at CRM Enterprises and Flash Solutions.</p>
      </div>
    </section>
  );
}

function ToolLogo({ t }) {
  if (t.logo && toolLogos[t.logo]) {
    return <span className="tool__logo" style={{ color: t.color }} dangerouslySetInnerHTML={{ __html: toolLogos[t.logo] }} />;
  }
  if (t.logo) return <span className="tool__logo"><img src={t.logo} alt="" /></span>;
  const letters = t.name.replace(/[^A-Za-z ]/g, "").split(" ").map((w) => w[0]).join("").slice(0, 2);
  return <span className="tool__logo tool__logo--mono" aria-hidden="true">{letters}</span>;
}

export function Toolkit() {
  const doubled = [...site.toolkit, ...site.toolkit];
  return (
    <section className="toolkit" aria-labelledby="tk-title">
      <div className="container toolkit__head" data-reveal>
        <h2 className="display display--sm" id="tk-title">Built with<br />the tools I trust.</h2>
        <p className="muted">{site.toolkit.length} tools across ads, design, video and automation</p>
      </div>
      <div className="container">
        <ul className="tools">
          {site.toolkit.map((t, i) => (
            <li key={t.name} className="tool" data-reveal style={{ "--d": `${(i % 8) * 40}ms` }}>
              <ToolLogo t={t} />
              <span className="tool__name">{t.name}</span>
              <span className="tool__group">{t.group}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {doubled.map((t, i) => (<span key={i}>{t.name}<i>✦</i></span>))}
        </div>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section className="section" id="services" aria-labelledby="svc-title">
      <div className="container">
        <div id="svc-title"><Head num="02" label="What I do">Six ways I <span className="accent">grow brands.</span></Head></div>
        <ul className="services">
          {site.services.map((s, i) => (
            <li key={s.title} className="service" data-reveal style={{ "--d": `${(i % 3) * 70}ms` }}>
              <span className="mono service__num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function About() {
  const { identity, education } = site;
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="container">
        <div id="about-title"><Head num="03" label="Behind the work">More than posts. <br /><span className="accent">Building pipelines.</span></Head></div>
        <div className="about__grid">
          <div className="about__bio" data-reveal>
            {identity.about.map((p, i) => <p key={i} className={i === 0 ? "lead" : ""}>{p}</p>)}
            <div className="langs">
              <p className="label">Languages</p>
              <ul>{identity.languages.map((l) => <li key={l.name}><span>{l.name}</span><span className="mono">{l.level}</span></li>)}</ul>
            </div>
            <p className="muted small">Interests: {identity.interests.join(" · ")}</p>
          </div>
          <div className="about__side" data-reveal style={{ "--d": "100ms" }}>
            <p className="label">Education & learning</p>
            <ul className="edu">
              {education.map((e) => (
                <li key={e.title}><div><strong>{e.title}</strong><span className="mono">{e.period}</span></div><p>{e.text}</p></li>
              ))}
            </ul>
            <p className="label">Expertise & skills</p>
            <div className="skills">
              {skills.map((g) => (
                <details key={g.group}>
                  <summary>{g.group}<Plus className="i-plus" width={16} height={16} /><Minus className="i-minus" width={16} height={16} /></summary>
                  <ul className="chips chips--static">{g.items.map((it) => <li key={it} className="chip">{it}</li>)}</ul>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="section process" aria-labelledby="proc-title">
      <div className="container">
        <p className="eyebrow" data-reveal id="proc-title">From brief to results</p>
        <ol className="process__steps">
          {site.processSteps.map((s, i) => (
            <li key={s.title} data-reveal style={{ "--d": `${i * 80}ms` }}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <blockquote className="quote" data-reveal>
          <span className="quote__mark" aria-hidden="true">“</span>
          <p>{site.identity.quote[0]}<br /><span className="accent">{site.identity.quote[1]}</span></p>
          <cite className="script">{site.identity.firstName}</cite>
        </blockquote>
      </div>
    </section>
  );
}

const rich = (s) => s.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i} className="accent">{part}</strong> : part));

function Job({ job }) {
  return (
    <li className="job" data-reveal>
      <div className="job__period mono">{job.period}</div>
      <div className="job__body">
        <h3>{job.role}</h3>
        <p className="job__company">{job.company} <span className="muted">· {job.location}</span></p>
        <ul className="job__list">{job.highlights.map((h, i) => <li key={i}>{rich(h)}</li>)}</ul>
      </div>
    </li>
  );
}

export function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="exp-title">
      <div className="container">
        <div id="exp-title"><Head num="04" label="The journey">Keep creating. <span className="accent">Keep converting.</span></Head></div>
        <p className="label" data-reveal>Experience & milestones</p>
        <ol className="jobs">{experience.map((j) => <Job key={j.company} job={j} />)}</ol>
      </div>
    </section>
  );
}

export function Contact() {
  const { contact, identity } = site;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const wa = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage)}`;
  const submit = (e) => {
    e.preventDefault();
    const subject = `Portfolio enquiry from ${form.name || "a visitor"}`;
    const body = `${form.message}\n\n— ${form.name}\n${form.email}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const items = [
    { label: "Email", value: contact.email, href: `mailto:${contact.email}`, icon: <Mail width={18} height={18} /> },
    { label: "Phone / WhatsApp", value: contact.phone, href: wa, icon: <Whatsapp width={18} height={18} />, ext: true },
    { label: "LinkedIn", value: contact.linkedinLabel, href: contact.linkedin, icon: <Linkedin width={18} height={18} />, ext: true },
    { label: "Portfolio", value: "Google Drive folder", href: site.shortPortfolioLink, icon: <Folder width={18} height={18} />, ext: true },
    { label: "Based in", value: `${identity.location} · Open to roles & freelance`, icon: <MapPin width={18} height={18} /> },
  ];
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <p className="eyebrow" data-reveal><span className="mono">05</span> / Your next campaign</p>
        <h2 className="display display--xl" id="contact-title" data-reveal>Let’s grow<br />your <span className="accent">brand.</span></h2>
        <div className="contact__grid">
          <div data-reveal>
            <p className="lead">Got a launch, a campaign or a team to train?<br />Let’s make something people notice, and numbers that move.</p>
            <div className="contact__ctas">
              <a className="btn btn--accent" href={wa} target="_blank" rel="noopener noreferrer"><Whatsapp width={16} height={16} /> Chat on WhatsApp</a>
              <a className="btn btn--ghost" href={`mailto:${contact.email}`}><Mail width={16} height={16} /> Email me</a>
            </div>
            <ul className="contact__list">
              {items.map((it) => (
                <li key={it.label}>
                  <span className="label">{it.label}</span>
                  {it.href ? (
                    <a href={it.href} {...(it.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{it.icon}{it.value}<ArrowUpRight width={14} height={14} className="arrow" /></a>
                  ) : (<span>{it.icon}{it.value}</span>)}
                </li>
              ))}
            </ul>
          </div>
          <form className="form" onSubmit={submit} data-reveal style={{ "--d": "100ms" }}>
            <p className="form__title">Tell me about your project</p>
            <label><span>Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label>
            <label><span>Email</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
            <label><span>Message</span><textarea required rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            <button className="btn btn--accent btn--block" type="submit">Open in my email app <ArrowUpRight width={16} height={16} /></button>
            <p className="muted small">This opens your email app with the message ready to send.</p>
          </form>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { identity, contact } = site;
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__word">{identity.displayName.toUpperCase()}<span className="accent">.</span></p>
        <div className="footer__row">
          <p className="muted small">© {new Date().getFullYear()} {identity.fullName}</p>
          <nav className="footer__links" aria-label="Social">
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={`mailto:${contact.email}`}>Email</a>
            <a href={site.shortPortfolioLink} target="_blank" rel="noopener noreferrer">Portfolio</a>
          </nav>
          <a href="#top" className="to-top">Back to top <ArrowUp width={14} height={14} /></a>
        </div>
      </div>
    </footer>
  );
}
