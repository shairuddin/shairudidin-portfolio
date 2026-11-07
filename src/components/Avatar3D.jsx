import { useEffect, useRef } from "react";
import { useMotion } from "../lib/motion.js";

// 2.5D animated avatar:
//  - the character is drawn with WebGL and displaced by a depth map, so the head
//    and shoulders shift in perspective as the pointer moves (idle sway on touch)
//  - the floating UI cards are separate layers at different depths in a CSS 3D scene
const BASE = "assets/avatar/";
const CARDS = [
  { k: "bars",     x: 77.6, y: 5.8,  w: 16.8, z: 140, dur: 7.0, delay: -1.0, label: "Analytics bar chart" },
  { k: "growth",   x: 6.8,  y: 19.3, w: 13.7, z: 170, dur: 6.2, delay: -3.0, label: "Growth chart" },
  { k: "play",     x: 83.9, y: 31.6, w: 11.5, z: 110, dur: 5.4, delay: -2.0, label: "Video play button" },
  { k: "timeline", x: 6.0,  y: 49.8, w: 20.0, z: 200, dur: 7.6, delay: -4.5, label: "Video editing timeline" },
  { k: "ad",       x: 76.6, y: 51.3, w: 17.2, z: 180, dur: 6.6, delay: -0.5, label: "Ad campaign card" },
];

const VERT = `attribute vec2 p; varying vec2 v;
void main(){ v = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;
const FRAG = `precision mediump float; varying vec2 v;
uniform sampler2D img; uniform sampler2D dep; uniform vec2 m;
void main(){
  float d = texture2D(dep, v).r;
  vec2 off = m * (d - .42) * vec2(.03, .022);
  // two-step lookup reduces stretching at depth edges
  float d2 = texture2D(dep, v - off * .5).r;
  off = m * (d2 - .42) * vec2(.03, .022);
  gl_FragColor = texture2D(img, v - off);
}`;

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

function startGL(canvas, getM) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const tex = (unit, image) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };
  const uM = gl.getUniformLocation(prog, "m");
  gl.uniform1i(gl.getUniformLocation(prog, "img"), 0);
  gl.uniform1i(gl.getUniformLocation(prog, "dep"), 1);
  return {
    setImages(img, dep) { tex(0, img); tex(1, dep); },
    draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const [mx, my] = getM();
      gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

export default function Avatar3D({ alt }) {
  const motion = useMotion();
  const wrap = useRef(null);
  const canvas = useRef(null);
  const state = useRef({ tx: 0, ty: 0, x: 0, y: 0, lastMove: 0 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (!motion) {
      el.classList.remove("is-gl");
      el.style.setProperty("--mx", 0); el.style.setProperty("--my", 0);
      return;
    }
    let raf, gl, alive = true, visible = true;
    const s = state.current;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      s.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      s.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.4)) / (window.innerHeight / 2)));
      s.lastMove = performance.now();
    };
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }, { threshold: 0 });
    io.observe(el);

    const loop = () => {
      cancelAnimationFrame(raf);
      if (!alive || !visible) return;
      const t = performance.now();
      if (!fine || t - s.lastMove > 2500) {           // idle sway
        s.tx = Math.sin(t / 2600) * 0.45;
        s.ty = Math.cos(t / 3400) * 0.22;
      }
      s.x += (s.tx - s.x) * 0.06;
      s.y += (s.ty - s.y) * 0.06;
      el.style.setProperty("--mx", s.x.toFixed(4));
      el.style.setProperty("--my", s.y.toFixed(4));
      if (gl) gl.draw();
      raf = requestAnimationFrame(loop);
    };

    gl = startGL(canvas.current, () => [s.x, s.y]);
    if (gl) {
      Promise.all([loadImage(BASE + "avatar.webp"), loadImage(BASE + "depth.webp")])
        .then(([img, dep]) => { if (!alive) return; gl.setImages(img, dep); gl.draw(); el.classList.add("is-gl"); })
        .catch(() => { gl = null; });
    }
    loop();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [motion]);

  return (
    <div className="avatar3d" ref={wrap}>
      <div className="avatar3d__scene">
        <div className="avatar3d__glow" aria-hidden="true" />
        <div className="avatar3d__char">
          <img src={BASE + "avatar.webp"} alt={alt} width="1792" height="2400" fetchpriority="high" />
          <canvas ref={canvas} aria-hidden="true" />
        </div>
        {CARDS.map((c) => (
          <div key={c.k} className={`avatar3d__card avatar3d__card--${c.k}`}
            style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%`, "--z": `${c.z}px`, "--dur": `${c.dur}s`, "--delay": `${c.delay}s` }}>
            <div className="avatar3d__float">
              <img src={`${BASE}card-${c.k}.webp`} alt="" loading="eager" />
              <span className="avatar3d__shine" aria-hidden="true" />
              {c.k === "play" && <span className="avatar3d__pulse" aria-hidden="true" />}
              {c.k === "ad" && <span className="avatar3d__ping" aria-hidden="true" />}
              {c.k === "growth" && <span className="avatar3d__spark" aria-hidden="true" />}
              {c.k === "timeline" && <span className="avatar3d__head" aria-hidden="true" />}
              <span className="sr-only">{c.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
