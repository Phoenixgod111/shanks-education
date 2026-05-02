/**
 * Unit-тесты логики SHANKS_PROGRESS (без браузера): vm + IIFE из js/progress.js
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const code = await readFile(path.join(root, "js", "progress.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const P = sandbox.window.SHANKS_PROGRESS;

function assert(cond, msg) {
  if (!cond) {
    console.error(`progress test FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

const sampleContent = {
  practicePassRule: { required: 3, total: 4 },
  practice: [
    { options: ["a", "b"], answerIndex: 0, prompt: "p0" },
    { options: ["a", "b"], answerIndex: 0, prompt: "p1" },
    { options: ["a", "b"], answerIndex: 0, prompt: "p2" },
    { options: ["a", "b"], answerIndex: 0, prompt: "p3" },
  ],
  test: [
    { options: ["a", "b"], answerIndex: 0, prompt: "t0" },
    { options: ["a", "b"], answerIndex: 0, prompt: "t1" },
    { options: ["a", "b"], answerIndex: 0, prompt: "t2" },
    { options: ["a", "b"], answerIndex: 0, prompt: "t3" },
  ],
};

// topicPct: нет контента — 0
assert(P.topicPct({ theoryDone: true, practiceDone: true, testDone: true }, null) === 0, "topicPct null content => 0");

// topicPct: только теория
assert(P.topicPct({ theoryDone: true }, sampleContent) === 35, "theory only => 35");

// topicPct: практика зачтена, но без теории — не 70
assert(
  P.topicPct({ practiceSolved: { 0: true, 1: true, 2: true }, theoryDone: false }, sampleContent) === 0,
  "practice passed without theory => 0"
);

// topicPct: теория + практика 3/4
assert(
  P.topicPct({ theoryDone: true, practiceSolved: { 0: true, 1: true, 2: true } }, sampleContent) === 70,
  "theory + 3 practice => 70"
);

// topicPct: полный тест
const fullTest = {
  theoryDone: true,
  practiceSolved: { 0: true, 1: true, 2: true },
  testSolved: { 0: true, 1: true, 2: true, 3: true },
};
assert(P.topicPct(fullTest, sampleContent) === 100, "all test indices => 100");

// legacy practiceDone без solved-карт
assert(
  P.topicPct({ theoryDone: true, practiceDone: true, testSolved: {} }, sampleContent) === 70,
  "legacy practiceDone => practice passed"
);

// legacy testDone без testSolved
assert(
  P.topicPct({ theoryDone: true, practiceDone: true, testDone: true }, sampleContent) === 100,
  "legacy testDone => 100"
);

// isPracticePassed: частичная практика
assert(
  P.isPracticePassed({ practiceSolved: { 0: true, 1: true } }, sampleContent) === false,
  "2/4 practice not passed"
);
assert(P.isPracticePassed({ practiceSolved: { 0: true, 1: true, 2: true } }, sampleContent) === true, "3/4 passed");

// isTestUnlocked: нужна теория и практика
assert(P.isTestUnlocked({ theoryDone: false, practiceSolved: { 0: true, 1: true, 2: true } }, sampleContent) === false, "no theory => locked");
assert(P.isTestUnlocked({ theoryDone: true, practiceSolved: { 0: true } }, sampleContent) === false, "partial practice => locked");
assert(P.isTestUnlocked({ theoryDone: true, practiceSolved: { 0: true, 1: true, 2: true } }, sampleContent) === true, "unlocked");

// пустой progress / нет content для gating
assert(P.isPracticePassed({}, null) === false, "no content practice");
assert(P.isTestUnlocked({ theoryDone: true, practiceDone: true }, null) === false, "no content => test locked");

// practiceSolvedCount / testSolvedCount
assert(P.practiceSolvedCount({ practiceSolved: { 0: true, 1: false, 2: true } }) === 2, "practice count");
assert(P.testSolvedCount({ testSolved: { 0: true, 1: true } }) === 2, "test count");

// getPracticePassRule
const rule = P.getPracticePassRule(sampleContent);
assert(rule.required === 3 && rule.total === 4, "getPracticePassRule");

if (!process.exitCode) {
  console.log("progress tests: ok");
}
