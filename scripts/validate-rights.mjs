import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
let failures = 0;
const fail = (message) => {
  console.error(`rights validation: ${message}`);
  failures += 1;
};
const load = async (relative) => JSON.parse(await readFile(path.join(root, relative), "utf8"));

const registry = await load("content/rights/registry.json");
const catalog = await load("curriculum/catalog/textbook-lines.json");
const manifest = await load("content/manifest.json");
const entries = new Map();

if (registry.schemaVersion !== 1 || registry.status !== "beta") fail("registry metadata invalid");
for (const entry of registry.entries ?? []) {
  if (!entry.id || entries.has(entry.id)) fail(`duplicate or missing rights id ${entry.id}`);
  entries.set(entry.id, entry);
  for (const field of ["owner", "usage", "redistribution", "status"]) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) fail(`${entry.id}.${field} required`);
  }
}

const requireRef = (ref, place) => {
  if (!entries.has(ref)) fail(`${place}: unknown rightsRef ${ref}`);
};
for (const line of catalog.lines ?? []) {
  requireRef(line.rightsRef, `catalog ${line.id}`);
  if (line.metadataScope !== "bibliographic-identification-only") fail(`${line.id}: textbook metadata scope must remain identification-only`);
  if ("isbn" in line || "pages" in line || "pageRanges" in line) fail(`${line.id}: unverified edition metadata forbidden`);
}
requireRef(catalog.universal?.rightsRef, "catalog universal");

for (const [grade, relative] of Object.entries(manifest.grades ?? {})) {
  const collection = await load(relative);
  for (const packet of collection.packets ?? []) {
    requireRef(packet.provenance?.rightsRef, `packet ${packet.topicId}`);
    if (packet.provenance?.reviewStatus !== "ai-beta-unreviewed") fail(`${packet.topicId}: draft review status must be explicit`);
  }
  if (Number(grade) !== collection.grade) fail(`${relative}: manifest grade mismatch`);
}

if (!entries.has("bibliographic-metadata") || !entries.has("shanks-ai-beta") || !entries.has("shanks-original")) {
  fail("required rights entries missing");
}

if (failures) process.exitCode = 1;
else console.log(`rights validation: ${entries.size} registry entries; catalog and all content references ok`);
