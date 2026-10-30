import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolDirectory, "..");
const releaseMode = process.argv.includes("--release");
const htmlFiles = ["index.html", "privacy.html", "support.html"];
const requiredFiles = [
  ...htmlFiles,
  "site-config.js",
  "assets/site.js",
  "assets/styles.css",
  ".nojekyll",
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

for (const relativePath of htmlFiles) {
  const html = read(relativePath);

  if (!/^<!doctype html>/i.test(html.trimStart())) fail(`${relativePath}: missing HTML5 doctype`);
  if (!/<html lang="en" dir="ltr">/.test(html)) fail(`${relativePath}: missing default language/direction`);
  if (!/data-lang-panel="en"/.test(html) || !/data-lang-panel="he"/.test(html)) {
    fail(`${relativePath}: both English and Hebrew panels are required`);
  }
  if (/http:\/\//i.test(html)) fail(`${relativePath}: insecure HTTP link found`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) fail(`${relativePath}: duplicate IDs: ${[...new Set(duplicateIds)].join(", ")}`);

  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (
      reference === "#" ||
      reference.startsWith("#") ||
      reference.startsWith("mailto:") ||
      reference.startsWith("https://") ||
      reference.startsWith("data:")
    ) {
      continue;
    }

    const localPath = reference.split(/[?#]/, 1)[0];
    const resolved = path.resolve(path.dirname(path.join(root, relativePath)), localPath);
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
      fail(`${relativePath}: link escapes site root: ${reference}`);
    } else if (!fs.existsSync(resolved)) {
      fail(`${relativePath}: broken local reference: ${reference}`);
    }
  }
}

const config = read("site-config.js");
const configuredEmail = config.match(/supportEmail:\s*"([^"]+)"/)?.[1] ?? "";
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail)) {
  fail("site-config.js: supportEmail is not a valid email address");
}
if (releaseMode && configuredEmail.endsWith("@example.com")) {
  fail("site-config.js: replace the example support email before release");
}

const script = read("assets/site.js");
if (/fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/.test(script)) {
  fail("assets/site.js: unexpected network API found");
}

if (failures.length) {
  console.error(`Public site validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Public site validation passed (${releaseMode ? "release" : "development"} mode).`);
console.log(`Checked ${htmlFiles.length} bilingual pages and ${requiredFiles.length} required files.`);
