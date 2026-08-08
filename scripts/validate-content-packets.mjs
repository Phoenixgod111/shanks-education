import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
let failures = 0;
const fail = (message) => {
  console.error(`content packet validation: ${message}`);
  failures += 1;
};
const load = async (relative) => JSON.parse(await readFile(path.join(root, relative), "utf8"));

const canonical = await load("curriculum/canonical/topics.json");
const manifest = await load("content/manifest.json");
const canonicalById = new Map(canonical.topics.map((topic) => [topic.id, topic]));
const packetIds = new Set();
const stepIds = new Set();
let packetCount = 0;

if (manifest.schemaVersion !== 1 || manifest.status !== "beta") fail("manifest metadata invalid");
const richIds = manifest.legacyRichContent?.topicIds ?? [];
if (richIds.join(",") !== ["g8-u01", "g8-u02", "g8-u03", "g8-u04", "g8-u05", "g8-u06"].join(",")) {
  fail("legacy rich content g8-u01..g8-u06 must remain declared");
}
if (manifest.legacyRichContent?.precedence !== "legacy-over-generated-fallback") fail("legacy overlay precedence missing");

for (let grade = 5; grade <= 11; grade += 1) {
  const relative = manifest.grades?.[String(grade)];
  if (typeof relative !== "string") {
    fail(`manifest missing grade ${grade}`);
    continue;
  }
  const collection = await load(relative);
  if (collection.schemaVersion !== 1 || collection.status !== "beta" || collection.grade !== grade) {
    fail(`${relative}: collection metadata invalid`);
  }
  for (const packet of collection.packets ?? []) {
    packetCount += 1;
    const topic = canonicalById.get(packet.topicId);
    if (!topic) fail(`${relative}: unknown topicId ${packet.topicId}`);
    if (packetIds.has(packet.topicId)) fail(`${relative}: duplicate packet ${packet.topicId}`);
    packetIds.add(packet.topicId);
    if (packet.grade !== grade || topic?.grade !== grade) fail(`${packet.topicId}: grade mismatch`);
    if (packet.schemaVersion !== 1 || packet.status !== "beta" || typeof packet.version !== "string") {
      fail(`${packet.topicId}: metadata invalid`);
    }
    if (packet.provenance?.method !== "deterministic-template" || packet.provenance?.reviewStatus !== "ai-beta-unreviewed") {
      fail(`${packet.topicId}: AI-beta provenance missing`);
    }
    if (richIds.includes(packet.topicId) && packet.provenance?.legacyOverlay !== "js/math-learning-content.js") {
      fail(`${packet.topicId}: legacy rich overlay not preserved`);
    }
    for (const lane of ["theory", "practice", "test"]) {
      const steps = packet[lane];
      const minimum = lane === "theory" ? 6 : 2;
      if (!Array.isArray(steps) || steps.length < minimum) {
        fail(`${packet.topicId}.${lane} must contain at least ${minimum} steps`);
        continue;
      }
      steps.forEach((step, index) => {
        const expected = `${packet.topicId}-${lane}-${String(index + 1).padStart(2, "0")}`;
        if (step.stepId !== expected) fail(`${packet.topicId}.${lane}[${index}] unstable stepId; expected ${expected}`);
        if (stepIds.has(step.stepId)) fail(`duplicate stepId ${step.stepId}`);
        stepIds.add(step.stepId);
        if (lane === "theory") {
          if (!step.title || !step.body) fail(`${step.stepId}: title/body required`);
        } else {
          if (step.type !== "single-choice" || !step.prompt || !Array.isArray(step.options) || step.options.length < 2) {
            fail(`${step.stepId}: single-choice fields invalid`);
          }
          if (!Number.isInteger(step.answerIndex) || step.answerIndex < 0 || step.answerIndex >= (step.options?.length ?? 0)) {
            fail(`${step.stepId}: answerIndex invalid`);
          }
          if (!step.explanation) fail(`${step.stepId}: explanation required`);
        }
      });
    }
  }
}

for (const topicId of canonicalById.keys()) if (!packetIds.has(topicId)) fail(`missing content packet ${topicId}`);
if (packetIds.size !== canonicalById.size) fail(`packet coverage ${packetIds.size}/${canonicalById.size}`);

if (failures) process.exitCode = 1;
else console.log(`content packet validation: ${packetCount} AI-beta packets, all canonical topics covered; ${stepIds.size} stable steps`);
