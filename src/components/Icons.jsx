// Small inline icon set (stroke icons, 24px grid).
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const ArrowUpRight = (p) => (<svg {...base} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>);
export const ArrowDown = (p) => (<svg {...base} {...p}><path d="M12 5v14M6 13l6 6 6-6" /></svg>);
export const ArrowUp = (p) => (<svg {...base} {...p}><path d="M12 19V5M6 11l6-6 6 6" /></svg>);
export const Download = (p) => (<svg {...base} {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>);
export const Menu = (p) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const Close = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const Plus = (p) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const Minus = (p) => (<svg {...base} {...p}><path d="M5 12h14" /></svg>);
export const Search = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>);
export const Mail = (p) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
export const Phone = (p) => (<svg {...base} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>);
export const Linkedin = (p) => (<svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg>);
export const Folder = (p) => (<svg {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>);
export const MapPin = (p) => (<svg {...base} {...p}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
export const Whatsapp = (p) => (<svg {...base} {...p}><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z" /></svg>);
export const Pause = (p) => (<svg {...base} {...p}><path d="M9 6v12M15 6v12" /></svg>);
export const Play = (p) => (<svg {...base} {...p}><path d="M8 5l11 7-11 7z" /></svg>);
