import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const code = await readFile(path.join(root, "js", "math-learning-kpi.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const K = sandbox.window.SHANKS_MATH_KPI;

function assert(cond, msg) {
  if (!cond) {
    console.error(`math-kpi test FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

const items = [{ id: "g8-u01", title: "A" }, { id: "g8-n01", title: "B" }];

// Класс без KPI — все темы в пуле
assert(
  K.filterMathKpiTopicsIfConfigured(items, 8, undefined).length === 2,
  "missing kpiByGrade => all items"
);
assert(
  K.filterMathKpiTopicsIfConfigured(items, 8, {}).length === 2,
  "empty kpi object => all items"
);

// KPI только g8-u01 — в пуле одна тема с контентом
const pool = K.filterMathKpiTopicsIfConfigured(items, 8, { 8: ["g8-u01"] });
assert(pool.length === 1 && pool[0].id === "g8-u01", "KPI filters to interactive ids only");

// Тема без learning id не входит в KPI-пул (нет пересечения) — fallback на все items
const poolFallback = K.filterMathKpiTopicsIfConfigured([{ id: "g8-n01" }], 8, { 8: ["g8-u01"] });
assert(poolFallback.length === 1 && poolFallback[0].id === "g8-n01", "no overlap => fallback all items in module");

// manifestIdsMatchContentKeys
assert(
  K.manifestIdsMatchContentKeys(["g8-u02", "g8-u01"], ["g8-u01", "g8-u02"]) === true,
  "same set different order => match"
);
assert(
  K.manifestIdsMatchContentKeys(["g8-u01"], ["g8-u01", "g8-u02"]) === false,
  "extra key in content => no match"
);
assert(
  K.manifestIdsMatchContentKeys(["g8-u01", "g8-u02"], ["g8-u01"]) === false,
  "missing key in content => no match"
);

// getMathKpiIdSet (Set из vm-контекста может не проходить instanceof глобального Set)
const set = K.getMathKpiIdSet(8, { 8: ["g8-u01"] });
assert(set && typeof set.has === "function" && set.has("g8-u01"), "getMathKpiIdSet");

if (!process.exitCode) {
  console.log("math-kpi tests: ok");
}
