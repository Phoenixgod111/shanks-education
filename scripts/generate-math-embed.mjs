import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const curriculumDir = path.join(root, "curriculum", "math");
const outFile = path.join(root, "js", "math-curriculum-embed.js");
const gradeFileRe = /^(\d+)\.json$/;

const files = (await readdir(curriculumDir))
  .filter((name) => gradeFileRe.test(name))
  .sort((a, b) => Number(a.replace(".json", "")) - Number(b.replace(".json", "")));

const embed = {};

for (const file of files) {
  const grade = file.replace(".json", "");
  const raw = await readFile(path.join(curriculumDir, file), "utf8");
  embed[grade] = JSON.parse(raw);
}

const body = `// Generated from curriculum/math/*.json. Do not edit by hand.\nwindow.SHANKS_MATH_CURRICULUM_EMBED=${JSON.stringify(embed)};\n`;
await writeFile(outFile, body, "utf8");
console.log(`generated ${path.relative(root, outFile)} from ${files.length} curriculum files`);
