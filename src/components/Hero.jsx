import { useEffect, useRef } from "react";
import { site } from "../config/site.js";
import { Counter, useMotion } from "../lib/motion.js";
import { ArrowDown, Download, MapPin } from "./Icons.jsx";
import Avatar3D from "./Avatar3D.jsx";

export default function Hero() {
  const { identity, heroStats } = site;
  const motion = useMotion();
  const portraitRef = useRef(null);

  useEffect(() => {
    if (!motion) { if (portraitRef.current) portraitRef.current.style.transform = ""; return; }
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        if (portraitRef.current) portraitRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [motion]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__top">
        <p className="hero__roles">
          <span className="accent">{identity.roleLine1}</span>
          <span>{identity.roleLine2}</span>
        </p>
        <p className="hero__status"><span className="dot" aria-hidden="true" />{identity.availability}</p>
      </div>

      <div className="hero__stage">
        <div className="hero__bigword" aria-hidden="true">{identity.headlineWord}</div>
        <div className="hero__portrait" ref={portraitRef}>
          <Avatar3D alt={identity.portraitAlt} />
        </div>

        <div className="hero__copy">
          <p className="hello script">Hello, I’m</p>
          <h1 id="hero-title" className="hero__name">
            {identity.firstName.toUpperCase()}<span className="accent">.</span>
            <span className="sr-only"> ({identity.fullName}), {identity.profession}</span>
          </h1>
          <p className="hero__role">{identity.shortRole}</p>
          <p className="hero__tagline">{identity.tagline}</p>
          <p className="hero__intro">{identity.intro}</p>
          <div className="hero__ctas">
            <a href="#work" className="btn btn--accent">See my work <ArrowDown width={16} height={16} /></a>
            <a href={identity.resume} className="btn btn--ghost" download>Download CV <Download width={16} height={16} /></a>
          </div>
          <p className="hero__loc"><MapPin width={14} height={14} /> {identity.location}</p>
        </div>

        <ul className="hero__stats" aria-label="Highlights">
          {heroStats.map((s) => (
            <li key={s.label.join(" ")}>
              <strong><Counter value={s.value} suffix={s.suffix} /></strong>
              <span>{s.label[0]}<br />{s.label[1]}</span>
            </li>
          ))}
        </ul>
      </div>

      <a href="#work" className="hero__scroll"><span className="line" aria-hidden="true" />Scroll to discover</a>
    </section>
  );
}
