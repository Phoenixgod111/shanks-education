/**
 * Инварианты пилота: модуль «Квадратные уравнения» g8-u01..g8-u06 (curriculum, manifest, learning, progress).
 * Пошаговый UX по-прежнему проверяется вручную на g8-u01; здесь — агрегат по всем 6 id.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();

function assert(cond, msg) {
  if (!cond) {
    console.error(`qa pilot invariant FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

function isPlainObject(x) {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function assertPracticeRule(topicId, t) {
  const rule = t.practicePassRule;
  assert(isPlainObject(rule), `${topicId}: practicePassRule must be object`);
  const req = rule.required;
  const tot = rule.total;
  const plen = t.practice.length;
  assert(Number.isInteger(req) && req >= 1, `${topicId}: practicePassRule.required invalid`);
  assert(Number.isInteger(tot) && tot === plen && req <= tot, `${topicId}: practicePassRule must satisfy required≤total and total===practice.length`);
  const tlen = t.test.length;
  assert(tlen >= 3, `${topicId}: test must have ≥3 questions`);
  assert(Array.isArray(t.theory) && t.theory.length >= 2, `${topicId}: theory must have ≥2 blocks`);
}

const [dataJs, raw8, rawManifest, learningJs, progressJs] = await Promise.all([
  readFile(path.join(root, "js", "data.js"), "utf8"),
  readFile(path.join(root, "curriculum", "math", "8.json"), "utf8"),
  readFile(path.join(root, "curriculum", "math", "learning-slice-ids.json"), "utf8"),
  readFile(path.join(root, "js", "math-learning-content.js"), "utf8"),
  readFile(path.join(root, "js", "progress.js"), "utf8"),
]);

const storageKey = (dataJs.match(/storageKey:\s*"([^"]+)"/) || [])[1];
assert(storageKey === "shanks_prefs_v2", `storageKey must stay shanks_prefs_v2 (got ${storageKey})`);

const data8 = JSON.parse(raw8);
const idsInCurriculum = new Set();
for (const block of data8.topics || []) {
  for (const it of block.items || []) {
    if (it.id) idsInCurriculum.add(it.id);
  }
}

const manifest = JSON.parse(rawManifest);
const m8 = manifest.byGrade["8"] || manifest.byGrade[8];
assert(Array.isArray(m8) && m8.length > 0, 'manifest.byGrade["8"] must be non-empty');
const uniq = new Set(m8);
assert(uniq.size === m8.length, "manifest grade 8 must have no duplicate ids");

const expected = [...m8].map(String).sort();
const expectedQuad = ["g8-u01", "g8-u02", "g8-u03", "g8-u04", "g8-u05", "g8-u06"].sort();
assert(
  expected.join(",") === expectedQuad.join(","),
  `pilot module must be exactly g8-u01..g8-u06; got: ${expected.join(",")}`
);

for (const id of m8) {
  assert(idsInCurriculum.has(id), `curriculum/math/8.json must contain id="${id}"`);
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(learningJs, sandbox);
const byTopicId = sandbox.window.SHANKS_MATH_LEARNING?.byTopicId;
assert(isPlainObject(byTopicId), "SHANKS_MATH_LEARNING.byTopicId must exist");

for (const topicId of m8) {
  const t = byTopicId[topicId];
  assert(t && isPlainObject(t), `learning content missing for id="${topicId}"`);
  assert(Array.isArray(t.practice) && t.practice.length >= 3, `${topicId}: practice must exist`);
  assertPracticeRule(topicId, t);
  for (const block of ["theory", "practice", "test"]) {
    assert(Array.isArray(t[block]) && t[block].length > 0, `${topicId}: missing ${block}`);
  }
}

vm.runInContext(progressJs, sandbox);
const P = sandbox.window.SHANKS_PROGRESS;

for (const topicId of m8) {
  const t = byTopicId[topicId];
  const req = t.practicePassRule.required;
  const ps = {};
  for (let i = 0; i < req; i += 1) ps[String(i)] = true;
  const ts = {};
  for (let i = 0; i < t.test.length; i += 1) ts[String(i)] = true;
  const progFull = { theoryDone: true, practiceSolved: ps, testSolved: ts };
  assert(P.topicPct(progFull, t) === 100, `${topicId}: topicPct must reach 100% when theory+practice+test complete`);
  const progUnlocked = { theoryDone: false, practiceSolved: ps, testSolved: {} };
  assert(P.isTestUnlocked(progUnlocked, t) === true, `${topicId}: isTestUnlocked after practice pass (theory optional)`);
}

if (!process.exitCode) {
  console.log(`qa pilot invariants: ok (${m8.length} topics g8-u01..g8-u06)`);
}
