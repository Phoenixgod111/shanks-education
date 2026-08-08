import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const expectedGrades = [5, 6, 7, 8, 9, 10, 11];
const globalIds = new Set();
const curriculumTopics = [];

function fail(message) {
  console.error(`curriculum validation: ${message}`);
  process.exitCode = 1;
}

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function loadJson(relative) {
  try {
    return JSON.parse(await readFile(path.join(root, relative), "utf8"));
  } catch (error) {
    fail(`${relative}: ${error.message}`);
    return null;
  }
}

for (const grade of expectedGrades) {
  const relative = `curriculum/math/${grade}.json`;
  const data = await loadJson(relative);
  if (!object(data)) continue;
  if (typeof data.title !== "string" || !data.title.trim()) fail(`${relative}.title required`);
  if (!Array.isArray(data.topics) || data.topics.length === 0) {
    fail(`${relative}.topics must be non-empty`);
    continue;
  }
  data.topics.forEach((unit, unitIndex) => {
    const place = `${relative}.topics[${unitIndex}]`;
    if (!object(unit) || typeof unit.title !== "string" || !unit.title.trim()) fail(`${place}.title required`);
    if (!Array.isArray(unit?.items) || unit.items.length === 0) {
      fail(`${place}.items must be non-empty`);
      return;
    }
    unit.items.forEach((item, itemIndex) => {
      const itemPlace = `${place}.items[${itemIndex}]`;
      if (!object(item)) {
        fail(`${itemPlace} must be an object`);
        return;
      }
      if (typeof item.id !== "string" || !new RegExp(`^g${grade}-[a-z][a-z0-9]*\\d{2}$`).test(item.id)) {
        fail(`${itemPlace}.id must be a grade ${grade} canonical id`);
      } else if (globalIds.has(item.id)) {
        fail(`duplicate topic id ${item.id}`);
      } else {
        globalIds.add(item.id);
      }
      if (typeof item.title !== "string" || !item.title.trim()) fail(`${itemPlace}.title required`);
      if (!Number.isInteger(item.pct) || item.pct < 0 || item.pct > 100) fail(`${itemPlace}.pct must be 0..100`);
      curriculumTopics.push({ id: item.id, grade, unitTitle: unit.title, title: item.title });
    });
  });
}

const registry = await loadJson("curriculum/canonical/topics.json");
if (registry) {
  if (registry.schemaVersion !== 1 || registry.status !== "beta" || typeof registry.version !== "string") {
    fail("canonical registry metadata invalid");
  }
  if (!Array.isArray(registry.topics)) {
    fail("canonical registry topics missing");
  } else {
    const canonicalIds = new Set();
    registry.topics.forEach((topic, index) => {
      const place = `canonical.topics[${index}]`;
      if (!object(topic) || topic.status !== "beta") fail(`${place} must be a beta object`);
      if (canonicalIds.has(topic?.id)) fail(`${place} duplicate id ${topic.id}`);
      canonicalIds.add(topic?.id);
      const source = curriculumTopics.find((item) => item.id === topic?.id);
      if (!source) fail(`${place} id ${topic?.id} not found in curriculum`);
      if (source && (source.grade !== topic.grade || source.title !== topic.title || source.unitTitle !== topic.unitTitle)) {
        fail(`${place} does not match curriculum source`);
      }
    });
    if (canonicalIds.size !== globalIds.size) fail(`canonical count ${canonicalIds.size} != curriculum count ${globalIds.size}`);
    for (const id of globalIds) if (!canonicalIds.has(id)) fail(`canonical registry missing ${id}`);
  }
}

const catalog = await loadJson("curriculum/catalog/textbook-lines.json");
if (catalog) {
  if (catalog.schemaVersion !== 1 || catalog.status !== "beta") fail("catalog metadata invalid");
  if (!Array.isArray(catalog.lines) || catalog.lines.length !== 21) fail("catalog must contain exactly 21 textbook lines");
  const countByGrade = new Map();
  const catalogIds = new Set();
  for (const line of catalog.lines ?? []) {
    if (catalogIds.has(line.id)) fail(`duplicate catalog id ${line.id}`);
    catalogIds.add(line.id);
    countByGrade.set(line.grade, (countByGrade.get(line.grade) ?? 0) + 1);
    if (line.status !== "beta" || line.kind !== "textbook-line") fail(`${line.id}: invalid status or kind`);
    if (!Array.isArray(line.authors) || line.authors.length === 0 || !line.publisher) fail(`${line.id}: honest bibliographic fields required`);
    if (!Array.isArray(line.omittedMetadata) || !line.omittedMetadata.includes("isbn") || !line.omittedMetadata.includes("pageRanges")) {
      fail(`${line.id}: omitted ISBN/page metadata must be explicit`);
    }
    if ("isbn" in line || "pages" in line || "pageRanges" in line) fail(`${line.id}: unverified ISBN/pages are forbidden`);
  }
  for (const grade of expectedGrades) if (countByGrade.get(grade) !== 3) fail(`grade ${grade}: expected 3 textbook lines`);
  if (catalog.universal?.id !== "math-universal-5-11" || catalog.universal?.status !== "beta") fail("universal catalog entry invalid");
}

if (!process.exitCode) {
  console.log(`curriculum validation: grades 5-11, ${globalIds.size} canonical topics, 21 textbook lines + universal ok`);
}
