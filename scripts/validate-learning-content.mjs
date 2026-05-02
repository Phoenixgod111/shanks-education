import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const curriculumMathDir = path.join(root, "curriculum", "math");

function fail(message) {
  console.error(`learning content: ${message}`);
  process.exitCode = 1;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function collectCurriculumTopicIds(data) {
  const ids = new Set();
  if (!data?.topics) return ids;
  for (const block of data.topics) {
    if (!Array.isArray(block?.items)) continue;
    for (const item of block.items) {
      if (item?.id) ids.add(item.id);
    }
  }
  return ids;
}

function validateQuestionBlock(topicId, label, arr) {
  if (!Array.isArray(arr) || arr.length < 3) {
    fail(`${topicId}: ${label} must be an array with at least 3 entries`);
    return;
  }
  arr.forEach((q, i) => {
    const p = `${topicId} ${label}[${i}]`;
    if (!isPlainObject(q)) {
      fail(`${p} must be an object`);
      return;
    }
    if (!q.prompt || typeof q.prompt !== "string") fail(`${p}.prompt required`);
    if (!Array.isArray(q.options) || q.options.length === 0) fail(`${p}.options must be non-empty`);
    const ai = q.answerIndex;
    if (!Number.isInteger(ai) || ai < 0 || ai >= q.options.length) {
      fail(`${p}.answerIndex must be in range of options (0..${q.options.length - 1})`);
    }
  });
}

/**
 * Универсальная проверка manifest.byGrade: файл curriculum, id в программе, без дубликатов.
 */
async function validateManifestAllGrades(manifest) {
  if (!isPlainObject(manifest?.byGrade)) {
    fail('manifest.byGrade must be a non-empty object (e.g. { "8": ["g8-u01", ...] })');
    return;
  }

  const entries = Object.entries(manifest.byGrade);
  if (entries.length === 0) {
    fail("manifest.byGrade has no grades");
    return;
  }

  for (const [gradeKey, ids] of entries) {
    const gradeStr = String(gradeKey);
    const place = `[manifest] grade=${gradeStr}`;

    if (!Array.isArray(ids)) {
      fail(`${place}: value must be an array of topic id strings`);
      continue;
    }

    if (ids.length === 0) {
      fail(`${place}: id list is empty — remove key "${gradeStr}" from byGrade or add topic ids`);
      continue;
    }

    const seen = new Set();
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      if (typeof id !== "string" || id.trim() === "") {
        fail(`${place} id[${i}]: must be a non-empty string (got ${JSON.stringify(id)})`);
        continue;
      }
      if (seen.has(id)) {
        fail(`${place} id="${id}": duplicate in manifest list`);
      }
      seen.add(id);
    }

    const curriculumFile = path.join(curriculumMathDir, `${gradeStr}.json`);
    let raw;
    try {
      raw = await readFile(curriculumFile, "utf8");
    } catch (e) {
      if (e.code === "ENOENT") {
        fail(
          `${place}: curriculum file missing: curriculum/math/${gradeStr}.json — add the file or remove grade "${gradeStr}" from learning-slice-ids.json byGrade`
        );
      }
      fail(`${place}: cannot read curriculum/math/${gradeStr}.json: ${e.message}`);
      continue;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      fail(`${place}: curriculum/math/${gradeStr}.json is not valid JSON: ${e.message}`);
      continue;
    }

    const curriculumIds = collectCurriculumTopicIds(data);
    for (const id of ids) {
      if (!curriculumIds.has(id)) {
        fail(
          `${place} id="${id}": not found in curriculum/math/${gradeStr}.json (check spelling or curriculum)`
        );
      }
    }
  }
}

const learningPath = path.join(root, "js", "math-learning-content.js");
const manifestPath = path.join(root, "curriculum", "math", "learning-slice-ids.json");

const [code, rawManifest] = await Promise.all([
  readFile(learningPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);

let manifest;
try {
  manifest = JSON.parse(rawManifest);
} catch (e) {
  fail(`learning-slice-ids.json: ${e.message}`);
  process.exit(1);
}

await validateManifestAllGrades(manifest);

const manifestIds8 = manifest?.byGrade?.["8"] ?? manifest?.byGrade?.[8];
if (!Array.isArray(manifestIds8) || manifestIds8.length === 0) {
  fail('manifest.byGrade["8"] must be a non-empty array (pilot learning is tied to grade 8)');
}

const sandbox = { window: {} };
vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox);
} catch (e) {
  fail(`math-learning-content.js failed to execute: ${e.message}`);
  process.exit(1);
}

const LEARN = sandbox.window.SHANKS_MATH_LEARNING;
if (!isPlainObject(LEARN?.byTopicId)) {
  fail("window.SHANKS_MATH_LEARNING.byTopicId missing");
  process.exit(1);
}

const byTopicId = LEARN.byTopicId;
const contentKeys = Object.keys(byTopicId).sort();
const expectedKeys = [...manifestIds8].sort();

if (contentKeys.join(",") !== expectedKeys.join(",")) {
  fail(
    `byTopicId keys must exactly match manifest.byGrade["8"].\n  content: ${contentKeys.join(", ")}\n  manifest: ${expectedKeys.join(", ")}`
  );
}

const curriculum8Path = path.join(curriculumMathDir, "8.json");
const raw8 = await readFile(curriculum8Path, "utf8");
let data8;
try {
  data8 = JSON.parse(raw8);
} catch (e) {
  fail(`curriculum/math/8.json: ${e.message}`);
  process.exit(1);
}

const curriculumIds = collectCurriculumTopicIds(data8);

for (const topicId of contentKeys) {
  if (!curriculumIds.has(topicId)) {
    fail(`[grade=8] learning topic id="${topicId}" not found in curriculum/math/8.json`);
  }
  const t = byTopicId[topicId];
  if (!isPlainObject(t)) {
    fail(`${topicId}: value must be an object`);
    continue;
  }
  const theory = t.theory;
  if (!Array.isArray(theory) || theory.length < 2 || theory.length > 8) {
    fail(`${topicId}: theory must be an array of 2–8 blocks`);
  } else {
    theory.forEach((b, j) => {
      if (!b?.title || !b?.body) fail(`${topicId} theory[${j}] needs title and body`);
    });
  }

  validateQuestionBlock(topicId, "practice", t.practice);
  validateQuestionBlock(topicId, "test", t.test);

  const rule = t.practicePassRule;
  if (!isPlainObject(rule)) {
    fail(`${topicId}: practicePassRule object required`);
  } else {
    const req = rule.required;
    const tot = rule.total;
    if (!Number.isInteger(req) || req < 1) fail(`${topicId}: practicePassRule.required must be integer ≥ 1`);
    if (!Number.isInteger(tot) || tot < req) {
      fail(`${topicId}: practicePassRule.total must be integer ≥ required`);
    }
    const plen = t.practice.length;
    if (req > plen) {
      fail(`${topicId}: practicePassRule.required (${req}) must be ≤ practice.length (${plen})`);
    }
    if (tot > plen) {
      fail(`${topicId}: practicePassRule.total (${tot}) must not exceed practice.length (${plen})`);
    }
    if (tot !== plen) {
      fail(`${topicId}: practicePassRule.total (${tot}) must equal practice.length (${plen})`);
    }
  }
}

if (!process.exitCode) {
  console.log(`learning content: manifest ok; ${contentKeys.length} topic(s) slice ok (${contentKeys.join(", ")})`);
}
