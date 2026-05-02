import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const curriculumDir = path.join(root, "curriculum", "math");
const gradeFileRe = /^(\d+)\.json$/;

function fail(message) {
  console.error(`curriculum validation: ${message}`);
  process.exitCode = 1;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateTopicItem(file, item, seenIds, blockIndex, itemIndex) {
  const place = `${file} topics[${blockIndex}].items[${itemIndex}]`;
  if (!isPlainObject(item)) {
    fail(`${place} must be an object`);
    return;
  }
  if (!item.id || typeof item.id !== "string") {
    fail(`${place}.id must be a non-empty string`);
  } else if (seenIds.has(item.id)) {
    fail(`${file} contains duplicate item id "${item.id}"`);
  } else {
    seenIds.add(item.id);
  }
  if (!item.title || typeof item.title !== "string") {
    fail(`${place}.title must be a non-empty string`);
  }
  if (!Number.isInteger(item.pct) || item.pct < 0 || item.pct > 100) {
    fail(`${place}.pct must be an integer from 0 to 100`);
  }
}

function validateCurriculum(file, data) {
  if (!isPlainObject(data)) {
    fail(`${file} must contain a JSON object`);
    return;
  }
  if (!data.title || typeof data.title !== "string") {
    fail(`${file}.title must be a non-empty string`);
  }
  if (!Array.isArray(data.topics) || data.topics.length === 0) {
    fail(`${file}.topics must be a non-empty array`);
    return;
  }
  const seenIds = new Set();
  data.topics.forEach((block, blockIndex) => {
    const place = `${file} topics[${blockIndex}]`;
    if (!isPlainObject(block)) {
      fail(`${place} must be an object`);
      return;
    }
    if (!block.title || typeof block.title !== "string") {
      fail(`${place}.title must be a non-empty string`);
    }
    if (!Array.isArray(block.items) || block.items.length === 0) {
      fail(`${place}.items must be a non-empty array`);
      return;
    }
    block.items.forEach((item, itemIndex) =>
      validateTopicItem(file, item, seenIds, blockIndex, itemIndex)
    );
  });
}

const entries = await readdir(curriculumDir);
const files = entries.filter((name) => gradeFileRe.test(name)).sort();

if (files.length === 0) {
  fail("no grade JSON files found in curriculum/math");
}

for (const file of files) {
  const fullPath = path.join(curriculumDir, file);
  const raw = await readFile(fullPath, "utf8");
  try {
    validateCurriculum(file, JSON.parse(raw));
  } catch (error) {
    fail(`${file} is not valid JSON: ${error.message}`);
  }
}

if (!process.exitCode) {
  console.log(`curriculum validation: ${files.length} files ok`);
}
