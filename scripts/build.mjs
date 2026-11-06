// Builds the static site into dist/.  Usage:
//   node scripts/build.mjs          -> production build
//   node scripts/build.mjs --serve  -> dev server on http://localhost:5173 with rebuilds
import * as esbuild from "esbuild";
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const serve = process.argv.includes("--serve");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(resolve(root, "public"), dist, { recursive: true });
cpSync(resolve(root, "index.html"), resolve(dist, "index.html"));

const options = {
  entryPoints: { app: resolve(root, "src/main.jsx"), styles: resolve(root, "src/styles.css") },
  outdir: dist,
  bundle: true,
  format: "iife",          // plain script: dist/index.html also works when opened directly from disk
  jsx: "automatic",
  target: ["es2020"],
  minify: !serve,
  sourcemap: serve,
  loader: { ".js": "jsx" },
  define: { "process.env.NODE_ENV": JSON.stringify(serve ? "development" : "production") },
  nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(":") : [],
  logLevel: "info",
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: dist, port: 5173 });
  console.log(`\n  Dev server: http://localhost:${port}\n  (edit src/ to rebuild; edit public/ or index.html then restart)\n`);
} else {
  await esbuild.build(options);
  if (!existsSync(resolve(dist, "app.js"))) throw new Error("Build failed: app.js missing");
  console.log("Built to dist/. Open dist/index.html or deploy the dist folder.");
}
