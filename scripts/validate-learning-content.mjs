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
    if (q.hints != null) {
      if (!Array.isArray(q.hints) || !q.hints.every((h) => typeof h === "string" && h.trim())) {
        fail(`${p}.hints must be an array of non-empty strings when present`);
      }
    }
    if (q.workedSolution != null) {
      if (!Array.isArray(q.workedSolution) || !q.workedSolution.every((l) => typeof l === "string")) {
        fail(`${p}.workedSolution must be an array of strings when present`);
      }
    }
    if (q.theoryRefs != null) {
      if (!Array.isArray(q.theoryRefs)) fail(`${p}.theoryRefs must be an array when present`);
      q.theoryRefs.forEach((ref, ri) => {
        const pr = `${p}.theoryRefs[${ri}]`;
        if (!isPlainObject(ref) || typeof ref.label !== "string") fail(`${pr} needs label string`);
        if (!Number.isInteger(ref.blockIndex) || ref.blockIndex < 0) fail(`${pr}.blockIndex must be integer ≥ 0`);
      });
    }
    if (q.misconceptionsByWrongIndex != null) {
      if (!isPlainObject(q.misconceptionsByWrongIndex)) fail(`${p}.misconceptionsByWrongIndex must be an object`);
      Object.entries(q.misconceptionsByWrongIndex).forEach(([k, v]) => {
        if (!/^\d+$/.test(k)) fail(`${p}.misconceptionsByWrongIndex key "${k}" must be numeric string`);
        if (typeof v !== "string") fail(`${p}.misconceptionsByWrongIndex[${k}] must be string`);
      });
    }
  });
}

/** blockIndex в theoryRefs должен указывать на существующий блок theory[]. */
function validateTheoryRefBlockIndices(topicId, theoryLen, label, arr) {
  if (!Array.isArray(arr) || !Number.isInteger(theoryLen) || theoryLen < 1) return;
  arr.forEach((q, i) => {
    if (!q?.theoryRefs) return;
    q.theoryRefs.forEach((ref, ri) => {
      const p = `${topicId} ${label}[${i}].theoryRefs[${ri}]`;
      if (!Number.isInteger(ref.blockIndex) || ref.blockIndex < 0 || ref.blockIndex >= theoryLen) {
        fail(`${p}.blockIndex must be in 0..${theoryLen - 1} (theory.length=${theoryLen})`);
      }
    });
  });
}

function validateTheoryRefsBlockId(topicId, theoryIds, label, arr) {
  if (!Array.isArray(arr)) return;
  arr.forEach((q, i) => {
    if (!q?.theoryRefs) return;
    q.theoryRefs.forEach((ref, ri) => {
      const p = `${topicId} ${label}[${i}].theoryRefs[${ri}]`;
      if (ref.blockId != null) {
        if (typeof ref.blockId !== "string" || !theoryIds.has(ref.blockId)) {
          fail(`${p}.blockId must match theory[].id`);
        }
      }
    });
  });
}

function validateMcqQuestion(topicId, label, q, i) {
  const p = `${topicId} ${label}[${i}]`;
  if (!isPlainObject(q)) fail(`${p} must be an object`);
  if (typeof q.id !== "string" || !q.id.trim()) fail(`${p}.id required`);
  if (!q.prompt || typeof q.prompt !== "string") fail(`${p}.prompt required`);
  if (!Array.isArray(q.options) || q.options.length === 0) fail(`${p}.options must be non-empty`);
  const ai = q.answerIndex;
  if (!Number.isInteger(ai) || ai < 0 || ai >= q.options.length) {
    fail(`${p}.answerIndex must be in range of options (0..${q.options.length - 1})`);
  }
  if (q.skillTags != null) {
    if (!Array.isArray(q.skillTags) || !q.skillTags.every((s) => typeof s === "string" && s.trim())) {
      fail(`${p}.skillTags must be array of non-empty strings when present`);
    }
  }
}

function validateStepTask(topicId, label, q, i) {
  const p = `${topicId} ${label}[${i}]`;
  if (q.kind !== "steps") fail(`${p}.kind must be "steps"`);
  if (!Array.isArray(q.steps) || q.steps.length < 1) fail(`${p}.steps must be non-empty array`);
  q.steps.forEach((st, si) => {
    const ps = `${p}.steps[${si}]`;
    if (!st?.prompt) fail(`${ps} needs prompt`);
    if (!Array.isArray(st.choices) || st.choices.length < 2) fail(`${ps}.choices must have ≥2 strings`);
    const ci = st.correctIndex;
    if (!Number.isInteger(ci) || ci < 0 || ci >= st.choices.length) fail(`${ps}.correctIndex invalid`);
  });
}

function lessonDialogNormalizedKind(step) {
  if (!step || typeof step !== "object") return "message";
  if (step.kind === "checkpoint" && step.type === "mcq") return "multiple_choice";
  return typeof step.kind === "string" ? step.kind : "message";
}

function validateLessonMcqFields(p, step) {
  if (typeof step.prompt !== "string" || !step.prompt.trim()) fail(`${p}.prompt required`);
  if (!Array.isArray(step.options) || step.options.length < 2) fail(`${p}.options must have ≥2 strings`);
  const ai = step.answerIndex;
  if (!Number.isInteger(ai) || ai < 0 || ai >= step.options.length) {
    fail(`${p}.answerIndex invalid`);
  }
  const fb = step.feedback;
  if (!isPlainObject(fb)) fail(`${p}.feedback object required`);
  if (typeof fb.correct !== "string" || !fb.correct.trim()) fail(`${p}.feedback.correct required`);
  if (typeof fb.wrong !== "string" || !fb.wrong.trim()) fail(`${p}.feedback.wrong required`);
  if (step.hint != null && typeof step.hint !== "string") fail(`${p}.hint must be string when present`);
  if (step.hints != null) {
    if (!Array.isArray(step.hints) || !step.hints.every((h) => typeof h === "string")) fail(`${p}.hints must be string[]`);
  }
  if (step.fullSolution != null) {
    if (typeof step.fullSolution === "string") {
      if (!step.fullSolution.trim()) fail(`${p}.fullSolution must be non-empty string`);
    } else if (!Array.isArray(step.fullSolution) || !step.fullSolution.every((x) => typeof x === "string" && x.trim())) {
      fail(`${p}.fullSolution must be string or non-empty string[]`);
    }
  }
  if (step.supportiveCorrect != null && typeof step.supportiveCorrect !== "string") fail(`${p}.supportiveCorrect must be string`);
  if (step.autoAdvanceMs != null && !Number.isFinite(step.autoAdvanceMs)) fail(`${p}.autoAdvanceMs must be number`);
}

function validateLessonAddons(p, step) {
  if (step.nextStudentText != null && typeof step.nextStudentText !== "string") fail(`${p}.nextStudentText must be string`);
  if (step.turns != null) {
    if (!Array.isArray(step.turns) || step.turns.length < 1) fail(`${p}.turns must be non-empty array when present`);
    step.turns.forEach((turn, i) => {
      const tp = `${p}.turns[${i}]`;
      if (!isPlainObject(turn)) fail(`${tp} must be object`);
      if (turn.speaker != null && !["tutor", "anya", "student", "student_prompt", "griffon", "coach"].includes(turn.speaker)) {
        fail(`${tp}.speaker unsupported`);
      }
      if (typeof turn.text !== "string" || !turn.text.trim()) fail(`${tp}.text required`);
    });
  }
  if (step.visual != null) {
    const v = step.visual;
    if (!isPlainObject(v)) fail(`${p}.visual must be object`);
    const kind = v.kind || v.type;
    if (typeof kind !== "string" || !kind.trim()) fail(`${p}.visual.kind required`);
    if (v.title != null && typeof v.title !== "string") fail(`${p}.visual.title must be string`);
    if (v.caption != null && typeof v.caption !== "string") fail(`${p}.visual.caption must be string`);
  }
  if (step.summary != null) {
    const s = step.summary;
    if (!isPlainObject(s)) fail(`${p}.summary must be object`);
    if (s.title != null && typeof s.title !== "string") fail(`${p}.summary.title must be string`);
    if (s.text != null && typeof s.text !== "string") fail(`${p}.summary.text must be string`);
    if (s.bullets != null) {
      if (!Array.isArray(s.bullets) || !s.bullets.every((x) => typeof x === "string" && x.trim())) {
        fail(`${p}.summary.bullets must be non-empty strings`);
      }
    }
  }
  if (step.mistake != null) {
    const m = step.mistake;
    if (!isPlainObject(m)) fail(`${p}.mistake must be object`);
    ["title", "wrong", "fix"].forEach((k) => {
      if (m[k] != null && typeof m[k] !== "string") fail(`${p}.mistake.${k} must be string`);
    });
  }
}

/** Опциональный интерактивный урок (g8-u01+); id не должны пересекаться с вопросами темы. */
function validateLessonDialog(topicId, t, theoryIds, outSet) {
  const ld = t.lessonDialog;
  if (ld == null) return;
  if (!Array.isArray(ld)) {
    fail(`${topicId}: lessonDialog must be an array when present`);
    return;
  }
  ld.forEach((step, i) => {
    const p = `${topicId} lessonDialog[${i}]`;
    if (!isPlainObject(step)) fail(`${p} must be object`);
    if (typeof step.id !== "string" || !step.id.trim()) fail(`${p}.id required`);
    if (outSet.has(step.id)) fail(`${topicId}: duplicate id "${step.id}"`);
    outSet.add(step.id);
    if (typeof step.blockId !== "string" || !theoryIds.has(step.blockId)) {
      fail(`${p}.blockId must match theory[].id`);
    }
    validateLessonAddons(p, step);
    const nk = lessonDialogNormalizedKind(step);
    if (nk === "message") {
      if (step.speaker !== "tutor") fail(`${p}.speaker must be "tutor"`);
      const body =
        (typeof step.text === "string" && step.text.trim()) ||
        (typeof step.mentorText === "string" && step.mentorText.trim());
      if (!body) fail(`${p}.text or mentorText required`);
    } else if (nk === "multiple_choice") {
      validateLessonMcqFields(p, step);
    } else if (nk === "worked_example") {
      const lines = Array.isArray(step.lines) ? step.lines : Array.isArray(step.workedLines) ? step.workedLines : null;
      if (!lines || !lines.length || !lines.every((ln) => typeof ln === "string" && ln.trim())) {
        fail(`${p}.lines (or workedLines) must be non-empty array of strings`);
      }
    } else if (nk === "faded_example") {
      if (typeof step.title !== "string" || !step.title.trim()) fail(`${p}.title required for faded_example`);
      const fsteps = Array.isArray(step.fadedSteps) ? step.fadedSteps : Array.isArray(step.steps) ? step.steps : null;
      if (!fsteps || !fsteps.length) fail(`${p}.fadedSteps or steps required`);
      fsteps.forEach((st, j) => {
        const ps = `${p}.step[${j}]`;
        if (!isPlainObject(st)) fail(`${ps} object`);
        if (st.mode === "faded") {
          if (typeof st.prompt !== "string" || !st.prompt.trim()) fail(`${ps}.prompt required`);
          if (typeof st.answer !== "string" || !st.answer.trim()) fail(`${ps}.answer required`);
        } else if (st.mode === "full" || st.mode == null) {
          if (typeof st.text !== "string" || !st.text.trim()) fail(`${ps}.text required for full line`);
        } else {
          fail(`${ps}.mode must be "full" or "faded"`);
        }
      });
    } else if (nk === "ai_question") {
      if (step.speaker != null && step.speaker !== "tutor") fail(`${p}.speaker must be "tutor" when present`);
      const body =
        (typeof step.text === "string" && step.text.trim()) ||
        (typeof step.mentorText === "string" && step.mentorText.trim());
      if (!body) fail(`${p}.text or mentorText required for ai_question`);
      if (step.placeholder != null && typeof step.placeholder !== "string") fail(`${p}.placeholder must be string`);
    } else if (nk === "checkpoint") {
      fail(`${p}: checkpoint must have type "mcq" (use multiple_choice schema)`);
    } else {
      fail(`${p}.kind unsupported: ${String(step.kind)}`);
    }
  });
}

function collectQuestionIds(topicId, t, outSet) {
  function addArr(label, arr) {
    if (!Array.isArray(arr)) return;
    arr.forEach((q, i) => {
      if (q?.id) {
        if (outSet.has(q.id)) fail(`${topicId}: duplicate question id "${q.id}"`);
        outSet.add(q.id);
      }
    });
  }
  addArr("practice", t.practice);
  addArr("test", t.test);
  const pd = t.practiceByDifficulty;
  if (pd && isPlainObject(pd)) {
    ["easy", "med", "hard"].forEach((k) => addArr(`practiceByDifficulty.${k}`, pd[k]));
  }
  const td = t.testByDifficulty;
  if (td && isPlainObject(td)) {
    ["easy", "med", "hard"].forEach((k) => addArr(`testByDifficulty.${k}`, td[k]));
  }
}

/** Строгая схема эталона g8-u01 (schemaVersion ≥ 2). */
function validateG8U01Reference(topicId, t) {
  if (topicId !== "g8-u01") fail("internal: validateG8U01Reference only for g8-u01");
  if (!Number.isInteger(t.schemaVersion) || t.schemaVersion < 2) fail(`${topicId}: schemaVersion must be integer ≥ 2`);
  const theory = t.theory;
  const theoryIds = new Set();
  theory.forEach((b, j) => {
    if (typeof b.id !== "string" || !b.id.trim()) fail(`${topicId} theory[${j}].id required`);
    if (theoryIds.has(b.id)) fail(`${topicId}: duplicate theory id "${b.id}"`);
    theoryIds.add(b.id);
    if (b.keyIdeas != null) {
      if (!Array.isArray(b.keyIdeas) || !b.keyIdeas.every((x) => typeof x === "string" && x.trim())) {
        fail(`${topicId} theory[${j}].keyIdeas must be array of strings`);
      }
    }
  });
  if (!Array.isArray(t.skillTagCatalog) || t.skillTagCatalog.length < 1) fail(`${topicId}: skillTagCatalog required`);
  if (!Array.isArray(t.misconceptions)) fail(`${topicId}: misconceptions array required`);
  t.misconceptions.forEach((m, mi) => {
    const p = `${topicId} misconceptions[${mi}]`;
    if (!m?.id || !m?.text) fail(`${p} needs id and text`);
    if (!theoryIds.has(m.theoryBlockId)) fail(`${p}.theoryBlockId must match theory[].id`);
  });
  if (!Array.isArray(t.workedExamples) || t.workedExamples.length < 1) fail(`${topicId}: workedExamples required`);
  if (!Array.isArray(t.fadedExamples) || t.fadedExamples.length < 1) fail(`${topicId}: fadedExamples required`);

  if (!Array.isArray(t.lessonDialog) || t.lessonDialog.length < 1) {
    fail(`${topicId}: lessonDialog required (non-empty array)`);
  }

  if (t.lessonHero != null) {
    const h = t.lessonHero;
    if (!isPlainObject(h)) fail(`${topicId}: lessonHero must be an object when present`);
    else {
      ["eyebrow", "subtitle", "lead"].forEach((k) => {
        if (h[k] != null && typeof h[k] !== "string") fail(`${topicId}.lessonHero.${k} must be string`);
      });
      if (typeof h.title !== "string" || !h.title.trim()) fail(`${topicId}.lessonHero.title required string`);
    }
  }

  const pd = t.practiceByDifficulty;
  if (!isPlainObject(pd)) fail(`${topicId}: practiceByDifficulty required`);
  const easy = pd.easy;
  const med = pd.med;
  const hard = pd.hard;
  if (!Array.isArray(easy) || easy.length < 6) fail(`${topicId}: practiceByDifficulty.easy must have ≥6 items`);
  if (!Array.isArray(med) || med.length < 4) fail(`${topicId}: practiceByDifficulty.med must have ≥4 items`);
  if (!Array.isArray(hard) || hard.length < 3) fail(`${topicId}: practiceByDifficulty.hard must have ≥3 items`);
  easy.forEach((q, i) => validateMcqQuestion(topicId, "practiceByDifficulty.easy", q, i));
  med.forEach((q, i) => {
    if (q.kind === "steps") validateStepTask(topicId, "practiceByDifficulty.med", q, i);
    else validateMcqQuestion(topicId, "practiceByDifficulty.med", q, i);
  });
  hard.forEach((q, i) => validateMcqQuestion(topicId, "practiceByDifficulty.hard", q, i));

  const td = t.testByDifficulty;
  if (!isPlainObject(td)) fail(`${topicId}: testByDifficulty required`);
  ["easy", "med", "hard"].forEach((lane) => {
    const arr = td[lane];
    if (!Array.isArray(arr) || arr.length < 3) fail(`${topicId}: testByDifficulty.${lane} must have ≥3 items`);
    arr.forEach((q, i) => validateMcqQuestion(topicId, `testByDifficulty.${lane}`, q, i));
  });

  validateQuestionBlock(topicId, "practice", t.practice);
  validateQuestionBlock(topicId, "test", t.test);
  validateTheoryRefBlockIndices(topicId, theory.length, "practice", t.practice);
  validateTheoryRefBlockIndices(topicId, theory.length, "test", t.test);
  validateTheoryRefsBlockId(topicId, theoryIds, "practice", t.practice);
  validateTheoryRefsBlockId(topicId, theoryIds, "test", t.test);
  validateTheoryRefsBlockId(topicId, theoryIds, "practiceByDifficulty.easy", easy);
  validateTheoryRefsBlockId(topicId, theoryIds, "practiceByDifficulty.med", med);
  validateTheoryRefsBlockId(topicId, theoryIds, "practiceByDifficulty.hard", hard);
  ["easy", "med", "hard"].forEach((lane) => {
    validateTheoryRefsBlockId(topicId, theoryIds, `testByDifficulty.${lane}`, td[lane]);
  });

  const idSet = new Set();
  validateLessonDialog(topicId, t, theoryIds, idSet);
  collectQuestionIds(topicId, t, idSet);

  const rule = t.practicePassRule;
  if (!isPlainObject(rule)) fail(`${topicId}: practicePassRule required`);
  const gateTotal = easy.length + med.length;
  if (rule.total !== gateTotal) fail(`${topicId}: practicePassRule.total must equal easy+med count (${gateTotal})`);
  if (rule.required > rule.total || rule.required < 1) fail(`${topicId}: practicePassRule.required invalid`);
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

  if (t.objective != null && typeof t.objective !== "string") {
    fail(`${topicId}: objective must be a string when present`);
  }
  if (t.workedExample != null) {
    const w = t.workedExample;
    if (!isPlainObject(w)) fail(`${topicId}: workedExample must be an object`);
    if (typeof w.title !== "string" || !w.title.trim()) fail(`${topicId}: workedExample.title required`);
    if (!Array.isArray(w.lines) || !w.lines.every((ln) => typeof ln === "string")) {
      fail(`${topicId}: workedExample.lines must be an array of strings`);
    }
  }

  if (topicId === "g8-u01" && Number(t.schemaVersion) >= 2) {
    validateG8U01Reference(topicId, t);
    continue;
  }

  validateQuestionBlock(topicId, "practice", t.practice);
  validateQuestionBlock(topicId, "test", t.test);
  validateTheoryRefBlockIndices(topicId, theory.length, "practice", t.practice);
  validateTheoryRefBlockIndices(topicId, theory.length, "test", t.test);

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
