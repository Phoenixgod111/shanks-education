/**
 * Pure helpers for local learning progress. App state stays in app.js, but
 * percentage/key rules live here so the monolith can keep shrinking safely.
 */
(function () {
  "use strict";

  function clampPct(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.min(100, Math.max(0, Math.round(n)));
  }

  function topicKey(subjectKey, grade, topicId) {
    return `${subjectKey}:${grade}:${topicId}`;
  }

  function isPlainObject(x) {
    return x !== null && typeof x === "object" && !Array.isArray(x);
  }

  /** Сколько заданий практики зачтено (уникальные ключи с верным ответом). */
  function practiceSolvedCount(progress, content) {
    if (!isPlainObject(progress?.practiceSolved)) return 0;
    const ps = progress.practiceSolved;
    if (content && Number(content.schemaVersion) >= 2 && content.practiceByDifficulty) {
      return Object.keys(ps).filter((k) => ps[k] && /^pr-[em]-\d+$/.test(k)).length;
    }
    return Object.keys(ps).filter((k) => ps[k]).length;
  }

  /** Сколько вопросов теста решено верно для полосы lane (или все ключи в legacy). */
  function testSolvedCount(progress, content, lane) {
    if (!isPlainObject(progress?.testSolved)) return 0;
    const ts = progress.testSolved;
    if (content && Number(content.schemaVersion) >= 2 && content.testByDifficulty) {
      const d = lane || "med";
      const letter = d === "easy" ? "e" : d === "hard" ? "h" : "m";
      const prefix = `ts-${letter}-`;
      return Object.keys(ts).filter((k) => ts[k] && k.startsWith(prefix)).length;
    }
    return Object.keys(ts).filter((k) => ts[k]).length;
  }

  function getPracticePassRule(content) {
    if (!content || !isPlainObject(content.practicePassRule)) return null;
    const r = Number(content.practicePassRule.required);
    const t = Number(content.practicePassRule.total);
    if (!Number.isFinite(r) || r < 1) return null;
    if (!Number.isFinite(t) || t < r) return null;
    return { required: Math.floor(r), total: Math.floor(t) };
  }

  /**
   * Практика зачтена: N из M (по content.practicePassRule) или legacy practiceDone.
   */
  function isPracticePassed(progress, content) {
    if (!content || (!Array.isArray(content.practice) && !content.practiceByDifficulty)) return !!progress?.practiceDone;
    const rule = getPracticePassRule(content);
    const n = practiceSolvedCount(progress, content);
    if (rule && n >= rule.required) return true;
    if (progress?.practiceDone) return true;
    return false;
  }

  /**
   * Тест пройден: для schema v2 — полоса medium в testByDifficulty; иначе legacy content.test.
   */
  function isTestPassed(progress, content) {
    if (!content) return !!progress?.testDone;
    if (Number(content.schemaVersion) >= 2 && content.testByDifficulty) {
      const lane = "med";
      const arr = content.testByDifficulty[lane] || [];
      if (!Array.isArray(arr) || arr.length === 0) return !!progress?.testDone;
      const letter = "m";
      let allMarked = true;
      for (let i = 0; i < arr.length; i += 1) {
        if (!progress?.testSolved?.[`ts-${letter}-${i}`]) allMarked = false;
      }
      if (allMarked) return true;
      return !!progress?.testDone;
    }
    if (!Array.isArray(content.test)) return !!progress?.testDone;
    const len = content.test.length;
    if (len === 0) return !!progress?.testDone;
    let allMarked = true;
    for (let i = 0; i < len; i += 1) {
      if (!progress?.testSolved?.[String(i)]) allMarked = false;
    }
    if (allMarked) return true;
    return !!progress?.testDone;
  }

  /**
   * @param {object} progress — prefs.topicProgress[key]
   * @param {object|null} content — запись из SHANKS_MATH_LEARNING.byTopicId или null
   */
  function topicPct(progress, content) {
    /** Тема без per-topic контента — не показываем фиктивный прогресс из старого общего демо-потока. */
    if (content == null) {
      return 0;
    }
    if (isTestPassed(progress, content)) return 100;
    if (isPracticePassed(progress, content)) return 70;
    if (progress?.theoryDone) return 35;
    return 0;
  }

  /** Допуск к тесту: практика зачтена по правилам (теорию можно пройти в любой момент). */
  function isTestUnlocked(progress, content) {
    if (!content) return false;
    return isPracticePassed(progress, content);
  }

  window.SHANKS_PROGRESS = {
    clampPct,
    topicKey,
    topicPct,
    practiceSolvedCount,
    testSolvedCount,
    getPracticePassRule,
    isPracticePassed,
    isTestPassed,
    isTestUnlocked,
  };
})();
