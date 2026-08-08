import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../js/cloud-sync.js", import.meta.url), "utf8");
const context = {
  window: {},
  URL,
  atob: (value) => Buffer.from(value, "base64").toString("binary"),
  console,
};
vm.createContext(context);
vm.runInContext(source, context);

const cloud = context.window.SHANKS_CLOUD;
assert.ok(cloud, "SHANKS_CLOUD must be exported");
assert.equal(
  JSON.stringify(cloud.parseTopicKey("math:8:g8-u01")),
  JSON.stringify({ subject_id: "math", grade: 8, topic_id: "g8-u01" }),
);
assert.equal(cloud.parseTopicKey("math:3:bad"), null);

const prefs = cloud.normalizePrefs({
  initialized: true,
  onboardingCompleted: true,
  prefsSchemaVersion: 3,
  displayName: "  Лена  ",
  grade: 8,
  favoritesByGrade: { 8: ["math"] },
  textbookId: "g8-line-1",
  trajectoryVersion: "2026.1",
  currentTopicId: "g8-u01",
  topicProgress: { "math:8:g8-u01": { theoryDone: true } },
});

assert.equal(prefs.displayName, "Лена");
assert.equal(prefs.textbookId, "g8-line-1");
assert.equal(prefs.currentTopicId, "g8-u01");
assert.equal(cloud.hasMeaningfulPrefs(prefs), true);
assert.equal(
  cloud.hasMeaningfulPrefs({
    initialized: true,
    onboardingCompleted: false,
    favoritesByGrade: { 8: ["math"] },
    topicProgress: {},
  }),
  false,
);

const rows = cloud.prefsToRows(prefs, "00000000-0000-0000-0000-000000000001");
assert.equal(rows.profile.display_name, "Лена");
assert.equal(rows.selections.length, 7);
const selectedMath = rows.selections.find((row) => row.grade === 8 && row.subject_id === "math");
assert.equal(selectedMath.selected, true);
assert.equal(selectedMath.textbook_id, "g8-line-1");
assert.equal(selectedMath.current_topic_id, "g8-u01");
assert.equal(rows.selections.find((row) => row.grade === 9 && row.subject_id === "math").selected, false);
assert.equal(rows.progress.length, 1);

console.log("cloud sync tests: ok");
