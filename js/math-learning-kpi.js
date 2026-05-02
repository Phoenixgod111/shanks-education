/**
 * Чистые хелперы KPI по математике (allowlist из manifest → фильтр тем для среднего).
 * Без зависимости от SHANKS_DATA: kpiByGrade передаётся снаружи.
 */
(function () {
  "use strict";

  function isCurriculumTopicLike(topic) {
    return topic && typeof topic.id === "string" && topic.id.length > 0;
  }

  function getMathKpiIdSet(grade, kpiByGrade) {
    if (!kpiByGrade || typeof kpiByGrade !== "object") return null;
    const g = Number(grade);
    const raw = kpiByGrade[g] ?? kpiByGrade[String(g)];
    if (!Array.isArray(raw) || raw.length === 0) return null;
    return new Set(raw.map(String));
  }

  /**
   * Если для класса задан KPI и среди items есть пересечение — усредняем только по ним.
   * Иначе возвращаем исходный список (старое поведение).
   */
  function filterMathKpiTopicsIfConfigured(items, grade, kpiByGrade) {
    const kpi = getMathKpiIdSet(grade, kpiByGrade);
    if (!kpi || !items?.length) return items;
    const filtered = items.filter((it) => isCurriculumTopicLike(it) && kpi.has(String(it.id)));
    return filtered.length > 0 ? filtered : items;
  }

  function sortedJoin(ids) {
    return [...ids].map(String).sort().join(",");
  }

  /** Совпадение множеств id манифеста и ключей learning.byTopicId (порядок не важен). */
  function manifestIdsMatchContentKeys(manifestIds, contentTopicIds) {
    if (!Array.isArray(manifestIds) || !Array.isArray(contentTopicIds)) return false;
    return sortedJoin(manifestIds) === sortedJoin(contentTopicIds);
  }

  window.SHANKS_MATH_KPI = {
    isCurriculumTopicLike,
    getMathKpiIdSet,
    filterMathKpiTopicsIfConfigured,
    manifestIdsMatchContentKeys,
  };
})();
