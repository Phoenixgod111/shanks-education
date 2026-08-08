import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "curriculum", "trajectories");
let failures = 0;

const fail = (message) => {
  console.error(`trajectory validation: ${message}`);
  failures += 1;
};
const load = async (relative) => JSON.parse(await readFile(path.join(root, relative), "utf8"));

const canonical = await load("curriculum/canonical/topics.json");
const catalog = await load("curriculum/catalog/textbook-lines.json");
const canonicalById = new Map(canonical.topics.map((topic) => [topic.id, topic]));
const expectedCatalogIds = new Set([...catalog.lines.map((line) => line.id), catalog.universal.id]);
const seenCatalogIds = new Set();
const files = (await readdir(dir)).filter((file) => file.endsWith(".json")).sort();

for (const file of files) {
  let trajectory;
  try {
    trajectory = JSON.parse(await readFile(path.join(dir, file), "utf8"));
  } catch (error) {
    fail(`${file}: ${error.message}`);
    continue;
  }
  if (trajectory.schemaVersion !== 1 || trajectory.status !== "beta" || typeof trajectory.version !== "string") {
    fail(`${file}: metadata invalid`);
  }
  if (!expectedCatalogIds.has(trajectory.catalogId)) fail(`${file}: unknown catalogId ${trajectory.catalogId}`);
  if (seenCatalogIds.has(trajectory.catalogId)) fail(`${file}: duplicate catalog trajectory ${trajectory.catalogId}`);
  seenCatalogIds.add(trajectory.catalogId);
  if (!Array.isArray(trajectory.mapping) || trajectory.mapping.length === 0) {
    fail(`${file}: mapping must be non-empty`);
    continue;
  }
  const mappedIds = new Set();
  trajectory.mapping.forEach((entry, index) => {
    if (!Number.isInteger(entry.sourcePosition) || entry.sourcePosition !== index + 1) {
      fail(`${file}: mapping[${index}].sourcePosition must be sequential`);
    }
    const topic = canonicalById.get(entry.canonicalTopicId);
    if (!topic) fail(`${file}: unknown canonical topic ${entry.canonicalTopicId}`);
    if (mappedIds.has(entry.canonicalTopicId)) fail(`${file}: duplicate mapping ${entry.canonicalTopicId}`);
    mappedIds.add(entry.canonicalTopicId);
    if (trajectory.grade && topic?.grade !== trajectory.grade) fail(`${file}: ${topic.id} belongs to grade ${topic.grade}`);
    if (!["canonical", "editorial-beta"].includes(entry.confidence)) fail(`${file}: unsupported confidence`);
  });
  const expectedCount = trajectory.grade
    ? canonical.topics.filter((topic) => topic.grade === trajectory.grade).length
    : canonical.topics.length;
  if (trajectory.mapping.length !== expectedCount) fail(`${file}: mapping coverage ${trajectory.mapping.length}/${expectedCount}`);
}

for (const catalogId of expectedCatalogIds) {
  if (!seenCatalogIds.has(catalogId)) fail(`missing trajectory for ${catalogId}`);
}
if (files.length !== 22) fail(`expected 22 trajectory files, found ${files.length}`);

if (failures) process.exitCode = 1;
else console.log(`trajectory validation: ${files.length} versioned beta trajectories, full canonical coverage ok`);
