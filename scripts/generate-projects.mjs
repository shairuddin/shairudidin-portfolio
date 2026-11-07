// Regenerates src/data/projects.js from scripts/work-manifest.json
// (the manifest is produced when the original portfolio files are converted
// into web-sized copies in public/assets/work/).
//   node scripts/generate-projects.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(resolve(root, "scripts/work-manifest.json"), "utf8"));
const overrides = JSON.parse(readFileSync(resolve(root, "scripts/work-overrides.json"), "utf8"));

const CLIENTS = {
  "Gamlawala Pot Maker": "Gamlawala",
  "Hospital Desings": "Arogya & Yalamaddi Hospitals",
  "Hospital Edited Videos": "Hospitals",
  "International Work": "International clients",
  "Schools and Colleges": "Schools & Colleges",
  "School and College Reels": "Schools & Colleges",
  "Shaym Baba Company": "Shyam Baba Company",
  "Shyam Baba Company": "Shyam Baba Company",
  "Suvidha": "Suvidha Soft",
  "AI Videos Edited": "AI video production",
  "Wedding Invitaions": "Wedding invitations",
  "Ai Voiceovers": "AI voiceovers",
  "XFC Khamma Reels": "XFC Khammam",
  "Logo Designs": "Brand identity",
};

function category(parts, type) {
  const [top, sub] = parts;
  if (top === "Video Editing") return type === "image" ? "Graphic Design" : "Video & Reels";
  if (top === "Graphic Desinging") {
    if (sub === "Logo Designs") return "Logo Design";
    if (type === "video") return "Video & Reels";
    if (type === "pdf") return "Marketing Plans";
    return "Graphic Design";
  }
  if (top === "Content Writing And Marketing Plans") return "Marketing Plans";
  if (top === "Influncer Marketing and Social Media") return "Influencer & Social";
  if (top === "Ai Voiceovers") return "AI Voiceovers";
  return "Other";
}

const FIX = [
  [/Animantion/gi, "Animation"], [/Breif/gi, "Brief"], [/Insatgram/gi, "Instagram"], [/\bKds\b/g, "Kids"],
  [/\bAi\b/g, "AI"], [/\bDp\b/g, "DP"], [/\bOg\b/g, "OG"], [/Desings?/g, "Designs"], [/\bPpt\b/gi, "PPT"],
  [/Sliver/g, "Silver"], [/Ai-Brief|AI-Brief/g, "AI Brief"],
];
const generic = (name) => /^(lv_|VID_|IMG|Picsart|_storage|\d)/i.test(name);

function cleanTitle(name) {
  let t = name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/_0_\d{8,}$/, "")
    .replace(/_\d{8}_\d{6}_\d+$/, "")
    .replace(/\s*\d{14}$/, "")
    .replace(/\s*\((\d+)\)\s*$/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const [a, b] of FIX) t = t.replace(a, b);
  return t;
}

const counters = {};
const items = [];
for (const [rel, e] of Object.entries(manifest)) {
  if (e.dup || !["image", "video", "pdf", "audio"].includes(e.type)) continue;
  if (overrides[rel]?.exclude) continue;
  const parts = rel.split(/[\\/]/);
  const file = parts[parts.length - 1];
  const folder = parts.length > 2 ? parts[1] : parts[0];
  const cat = category(parts, e.type);
  let client = CLIENTS[folder] || (cat === "Marketing Plans" ? "Strategy & scripts" : cat === "AI Voiceovers" ? "Audio production" : cat === "Influencer & Social" ? "Influencer marketing" : folder);
  const kind = e.type === "video" ? "Reel" : e.type === "pdf" ? "Document" : e.type === "audio" ? "Voiceover" : cat === "Logo Design" ? "Logo" : cat === "Influencer & Social" ? "Photo" : "Design";
  let title = cleanTitle(file);
  if (generic(file)) {
    const key = `${client}|${kind}`;
    counters[key] = (counters[key] || 0) + 1;
    title = `${client} ${kind.toLowerCase()} ${String(counters[key]).padStart(2, "0")}`;
  }
  const o = overrides[rel] || {};
  items.push({
    id: e.file.replace(/\.[a-z0-9]+$/, ""),
    title: o.title || title,
    category: cat,
    client: o.client || client,
    type: e.type,
    kind: e.type === "video" && e.w > e.h ? "Video" : kind,
    src: `assets/work/${e.file}`,
    thumb: e.thumb ? `assets/work/${e.thumb}` : "",
    w: e.w || 1, h: e.h || 1,
    ...(e.dur ? { dur: e.dur } : {}),
    ...(e.pages ? { pages: e.pages } : {}),
    ...(o.featured ? { featured: o.featured } : {}),
  });
}

// ---- Client clean-up: give generic groups a real client where the title says who it is
const RENAME = { "Shyam Baba Company": "Sri Shyam Baba Electronics", "Hospitals": "Hospital & doctor videos",
  "Schools & Colleges": "Other schools", "AI video production": "AI video experiments" };
const BY_TITLE = [
  [/^Arogya/i, "Arogya Hospitals"], [/^Agrani/i, "Agrani College"], [/^Cedar Valley/i, "Cedar Valley School"],
  [/^Mathrushree/i, "Mathrushree Fertility"], [/^Oxford High School/i, "Oxford High School"], [/Conroy/i, "The Conroy School"],
  [/^Sri Shyam Baba/i, "Sri Shyam Baba Electronics"], [/^Ignexa/i, "Ignexa Solutions"], [/^Mindx/i, "Mindx"], [/^RAJ/i, "RAJ"],
  [/^Campus App/i, "Campus App"], [/^Vintrix/i, "Vintrix"], [/^SRS Silvers/i, "SRS Silvers"], [/^The Pottery Co/i, "The Pottery Co"],
  [/^24\/7 emergency/i, "Hospital & doctor videos"],
];
for (const it of items) {
  if (RENAME[it.client]) it.client = RENAME[it.client];
  if (it.client === "Brand identity" || it.client === "Other schools") {
    const hit = BY_TITLE.find(([re]) => re.test(it.title));
    if (hit) it.client = hit[1];
  }
}

// ---- Industries ("folders"). Every client must belong to exactly one.
const INDUSTRIES = [
  { id: "healthcare", name: "Healthcare", blurb: "Hospitals, clinics and doctors: patient stories, awareness videos, branding and content plans.",
    clients: ["Arogya Hospitals", "Yalamaddi Hospitals", "Hospital & doctor videos", "Dr. Rajitha's Clinic", "Mathrushree Fertility", "Oncology"] },
  { id: "education", name: "Education", blurb: "Schools, colleges and tuition centres: admissions campaigns, events, reels and identity.",
    clients: ["The Conroy School", "Cedar Valley School", "Sri CV Raman Junior College", "Oxford High School", "Agrani College", "Harvest Public School", "Excellent Tuition Point", "Other schools"] },
  { id: "retail", name: "Retail & Consumer", blurb: "Electronics, lifestyle and home brands: launches, festive campaigns, offers and product creatives.",
    clients: ["Sri Shyam Baba Electronics", "Gamlawala", "The Pottery Co", "SRS Silvers", "Rainbow World", "JF Men's Store", "Golden Source"] },
  { id: "tech", name: "Tech, AI & Creators", blurb: "AI brands, software companies and creators: channel branding, intros, thumbnails and marketing plans.",
    clients: ["AI Brief", "AI video experiments", "Suvidha Soft", "WOTG", "Mahesh Devalla", "Gully Guide", "Ignexa Solutions", "Mindx", "Campus App", "Vintrix", "Personal brand"] },
  { id: "services", name: "Real Estate & Services", blurb: "Property, construction, legal and consumer services: ads, sliders and launch creatives.",
    clients: ["Madanvasu Real Estate", "VS Eco Blocks", "Legal firm, Dubai", "Pellillaperayya", "RAJ"] },
  { id: "community", name: "Events & Community", blurb: "Fan communities, influencer campaigns and celebrations: event recaps, reels and invitations.",
    clients: ["XFC Khammam", "Influencer marketing", "Wedding invitations"] },
];
const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const industryOf = {};
for (const ind of INDUSTRIES) for (const c of ind.clients) industryOf[c] = ind.id;
const unknown = [...new Set(items.map((i) => i.client))].filter((c) => !industryOf[c]);
if (unknown.length) { console.error("Clients without an industry:", unknown); process.exit(1); }
for (const it of items) { it.industry = industryOf[it.client]; it.clientId = slug(it.client); }

const order = ["Video & Reels", "Graphic Design", "Logo Design", "Marketing Plans", "Influencer & Social", "AI Voiceovers"];
items.sort((a, b) => (b.featured || 0) - (a.featured || 0) || order.indexOf(a.category) - order.indexOf(b.category) || a.client.localeCompare(b.client) || a.title.localeCompare(b.title));

const counts = Object.fromEntries(order.map((c) => [c, items.filter((i) => i.category === c).length]).filter(([, n]) => n));
const industriesOut = INDUSTRIES.map((ind) => ({
  id: ind.id, name: ind.name, blurb: ind.blurb,
  clients: ind.clients.map((c) => ({ id: slug(c), name: c, count: items.filter((i) => i.client === c).length })).filter((c) => c.count),
}));
const out = `// Generated by scripts/generate-projects.mjs. Edit scripts/work-overrides.json
// to change titles, clients or featured items, then run: node scripts/generate-projects.mjs
export const categories = ${JSON.stringify(Object.keys(counts))};
export const industries = ${JSON.stringify(industriesOut, null, 1)};
export const projects = ${JSON.stringify(items, null, 1)};
`;
writeFileSync(resolve(root, "src/data/projects.js"), out);
console.log(`Wrote ${items.length} items`, counts);
