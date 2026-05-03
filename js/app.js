/**
 * Shanks — навигация, избранное по классам, «Мой прогресс» = среднее по избранным.
 * Консенсус 15 «агентов»: единый каталог, LS на класс, деталка тянет % из каталога,
 * главная синхронизируется с вкладкой класса, карточки одной ширины, кривизна — в CSS.
 */
(function () {
  "use strict";

  const D = window.SHANKS_DATA || {};
  const Progress = window.SHANKS_PROGRESS || {};
  const KPI = window.SHANKS_MATH_KPI || {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const PREFS_KEY = D.storageKey || "shanks_prefs_v2";

  const SHEET_BY_KIND = {
    "add-subjects": "sheet-add-subjects",
    grade: "sheet-grade",
    goal: "sheet-goal",
    "topic-search": "sheet-topic-search",
  };

  const state = {
    tab: "home",
    grade: D.defaultGrade || 5,
    stack: null,
    subjectKey: "math",
    topicMode: "theory",
    activityView: "practice",
    practiceDiff: "med",
    testDiff: "easy",
    topicTestUnlocked: true,
    /** id развёрнутого модуля тем (`subjectKey-grade-midx`); один открыт, без поиска */
    topicAccordionId: null,
    /** Выбранная подтема из curriculum (экран темы); null — демо-теория из data.js */
    curriculumTopic: null,
    /** Название модуля (блока) для выбранной подтемы */
    topicModuleTitle: null,
  };

  let prefs = { favoritesByGrade: {}, initialized: false, topicProgress: {} };
  let toastTimer = null;
  let mainBound = false;

  const onbState = {
    grade: null,
    subjects: [],
    goalId: null,
  };

  function iconsRefresh() {
    if (window.lucide) window.lucide.createIcons();
  }

  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { favoritesByGrade: {}, initialized: false, topicProgress: {} };
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  function ensureGradeBuckets() {
    if (!prefs.favoritesByGrade || typeof prefs.favoritesByGrade !== "object") {
      prefs.favoritesByGrade = {};
    }
    (D.grades || []).forEach((g) => {
      const k = String(g);
      if (!Array.isArray(prefs.favoritesByGrade[k])) prefs.favoritesByGrade[k] = [];
    });
  }

  function ensureTopicProgressStore() {
    if (!prefs.topicProgress || typeof prefs.topicProgress !== "object") {
      prefs.topicProgress = {};
    }
  }

  function initPrefs() {
    prefs = loadPrefs();
    if (!prefs || typeof prefs !== "object") prefs = {};

    const legacy =
      prefs.initialized === true && prefs.onboardingCompleted !== true;

    if (legacy) {
      prefs.onboardingCompleted = true;
      if (prefs.grade == null || prefs.grade === "") {
        prefs.grade = D.defaultGrade || 5;
      }
      ensureGradeBuckets();
      savePrefs();
    }

    if (!prefs.initialized) {
      prefs.favoritesByGrade = {};
      (D.grades || []).forEach((g) => {
        const seed = D.seedFavoritesByGrade?.[g] || D.seedFavoritesByGrade?.[String(g)] || [];
        prefs.favoritesByGrade[String(g)] = Array.isArray(seed) ? seed.slice() : [];
      });
      prefs.initialized = true;
      prefs.onboardingCompleted = false;
      prefs.grade = null;
      prefs.studyGoal = null;
      prefs.topicProgress = {};
      savePrefs();
    } else {
      ensureGradeBuckets();
      ensureTopicProgressStore();
    }
  }

  function applyPrefsGradeToState() {
    const g = Number(prefs.grade);
    state.grade = Number.isFinite(g) && g > 0 ? g : D.defaultGrade || 5;
  }

  function setUserGrade(g) {
    const n = Number(g);
    if (!Number.isFinite(n)) return;
    const prev = state.grade;
    state.grade = n;
    prefs.grade = n;
    savePrefs();
    renderHome();
    renderSubjects();
    renderProfile();
    const sd = getSubjectDetail(state.subjectKey, state.grade);
    if (sd) renderSubjectDetail();
    iconsRefresh();
    if (prev !== n) toast((D.copy && D.copy.classChanged) || "Класс обновлён");
  }

  function renderProfile() {
    const el = $("#profile-grade-value");
    if (el) el.textContent = `${state.grade} класс`;
    const goal = (D.onboardingGoals || []).find((g) => g.id === prefs.studyGoal);
    const goalEl = $("#profile-goal-value");
    if (goalEl) goalEl.textContent = goal?.title || "Не выбрана";
  }

  function showOnboardingUI() {
    const root = $("#onboarding-root");
    if (!root) return;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    onbGoStep("welcome");
  }

  function hideOnboardingUI() {
    const root = $("#onboarding-root");
    if (!root) return;
    root.setAttribute("hidden", "");
    root.setAttribute("aria-hidden", "true");
  }

  function onbGoStep(step) {
    $$(".onb-step").forEach((el) => {
      const on = el.getAttribute("data-onb-step") === step;
      el.toggleAttribute("hidden", !on);
      el.classList.toggle("onb-step--active", on);
    });
  }

  function onbBuildGradeStep() {
    const grid = $("#onb-grade-grid");
    if (!grid) return;
    grid.innerHTML = "";
    (D.grades || []).forEach((g) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "onb-grade-btn";
      b.textContent = String(g);
      b.dataset.onChooseGrade = String(g);
      if (onbState.grade === g) b.classList.add("onb-grade-btn--on");
      grid.appendChild(b);
    });
    const next = $("#onb-grade-next");
    if (next) next.disabled = onbState.grade == null;
  }

  function onbBuildSubjectsStep() {
    const wrap = $("#onb-subject-list");
    if (!wrap || onbState.grade == null) return;
    wrap.innerHTML = "";
    const catalog = getCatalog(onbState.grade);
    const sel = new Set(onbState.subjects);
    catalog.forEach((r) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "onb-subject-chip" + (sel.has(r.id) ? " onb-subject-chip--on" : "");
      btn.dataset.onToggleSubject = r.id;
      btn.innerHTML = `
        <span class="onb-ico"><i data-lucide="${r.icon}"></i></span>
        <span>${r.name}</span>`;
      wrap.appendChild(btn);
    });
    iconsRefresh();
    const next = $("#onb-subjects-next");
    if (next) next.disabled = onbState.subjects.length < 1;
  }

  function onbBuildGoalsStep() {
    const wrap = $("#onb-goal-list");
    if (!wrap) return;
    wrap.innerHTML = "";
    const goals = D.onboardingGoals || [
      { id: "grades", title: "Подтянуть оценки", sub: "Регулярно" },
      { id: "exam", title: "К экзамену", sub: "Структура" },
    ];
    goals.forEach((g) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "onb-goal-card" + (onbState.goalId === g.id ? " onb-goal-card--on" : "");
      btn.dataset.onChooseGoal = g.id;
      btn.innerHTML = `<strong>${g.title}</strong><span>${g.sub}</span>`;
      wrap.appendChild(btn);
    });
  }

  function onbResetDraft() {
    onbState.grade = null;
    onbState.subjects = [];
    onbState.goalId = null;
  }

  function finishOnboarding() {
    if (onbState.grade == null || onbState.subjects.length < 1) return;
    prefs.grade = onbState.grade;
    setFavoritesForGrade(onbState.grade, onbState.subjects.slice());
    prefs.studyGoal = onbState.goalId || null;
    prefs.onboardingCompleted = true;
    savePrefs();
    onbResetDraft();
    hideOnboardingUI();
    startMainApp();
  }

  function startMainApp() {
    $("#main-app")?.classList.remove("main-hidden");
    applyPrefsGradeToState();
    renderHome();
    renderSubjects();
    renderSubjectDetail();
    renderTopic(null, getSubjectDetail(state.subjectKey, state.grade));
    renderNotes();
    renderProfile();
    if (!mainBound) {
      bind();
      mainBound = true;
    }
    setTab("home");
    iconsRefresh();
  }

  function bindOnboarding() {
    $("#onb-btn-start")?.addEventListener("click", () => {
      onbGoStep("grade");
      onbBuildGradeStep();
    });

    $("#onb-grade-next")?.addEventListener("click", () => {
      if (onbState.grade == null) return;
      onbState.subjects = [];
      onbGoStep("subjects");
      onbBuildSubjectsStep();
    });

    $("#onb-subjects-next")?.addEventListener("click", () => {
      if (onbState.subjects.length < 1) {
        toast((D.copy && D.copy.noSubjectsOnboarding) || "Выбери предмет");
        return;
      }
      onbGoStep("goal");
      onbBuildGoalsStep();
    });

    $("#onb-finish")?.addEventListener("click", () => {
      finishOnboarding();
    });

    $("#onb-skip-goal")?.addEventListener("click", () => {
      onbState.goalId = null;
      finishOnboarding();
    });

    $("#onboarding-root")?.addEventListener("click", (e) => {
      const gb = e.target.closest("[data-on-choose-grade]");
      if (gb) {
        onbState.grade = Number(gb.dataset.onChooseGrade);
        onbBuildGradeStep();
        return;
      }
      const tb = e.target.closest("[data-on-toggle-subject]");
      if (tb) {
        const id = tb.dataset.onToggleSubject;
        const i = onbState.subjects.indexOf(id);
        if (i >= 0) onbState.subjects.splice(i, 1);
        else onbState.subjects.push(id);
        onbBuildSubjectsStep();
        return;
      }
      const goalBtn = e.target.closest("[data-on-choose-goal]");
      if (goalBtn) {
        onbState.goalId = goalBtn.dataset.onChooseGoal;
        onbBuildGoalsStep();
        return;
      }
      if (e.target.closest("[data-onb-back]")) {
        const step = $(".onb-step--active")?.getAttribute("data-onb-step");
        if (step === "grade") {
          onbGoStep("welcome");
        } else if (step === "subjects") {
          onbGoStep("grade");
          onbBuildGradeStep();
        } else if (step === "goal") {
          onbGoStep("subjects");
          onbBuildSubjectsStep();
        }
      }
    });
  }

  function openSheet(kind) {
    const sid = SHEET_BY_KIND[kind];
    if (!sid) return;
    const el = $(`#${sid}`);
    if (!el) return;
    el.removeAttribute("hidden");
    el.setAttribute("aria-hidden", "false");
    if (kind === "add-subjects") renderAddSubjectsSheet();
    if (kind === "grade") renderGradeSheet();
    if (kind === "goal") renderGoalSheet();
    if (kind === "topic-search") {
      $("#btn-sd-search")?.classList.add("is-active");
      setTimeout(() => $("#sd-search-input")?.focus(), 100);
    }
    iconsRefresh();
  }

  function closeSheet(kind) {
    if (!kind) return;
    if (kind === "topic-search") {
      const inp = $("#sd-search-input");
      if (inp) inp.value = "";
      filterTopics("");
      $("#btn-sd-search")?.classList.remove("is-active");
    }
    const sid = SHEET_BY_KIND[kind];
    if (!sid) return;
    const el = $(`#${sid}`);
    if (!el) return;
    el.setAttribute("hidden", "");
    el.setAttribute("aria-hidden", "true");
  }

  function renderAddSubjectsSheet() {
    const list = $("#sheet-subject-checklist");
    const lead = $("#sheet-subjects-lead");
    if (lead) lead.textContent = `${state.grade} класс · отметь предметы для главной`;
    if (!list) return;
    list.innerHTML = "";
    const catalog = getCatalog(state.grade);
    const fav = new Set(getFavoritesForGrade(state.grade));
    catalog.forEach((r) => {
      const row = document.createElement("label");
      row.className = "sheet-check-row";
      const cid = `sh-sub-${r.id}`;
      row.innerHTML = `
        <input type="checkbox" id="${cid}" data-sheet-id="${r.id}" ${fav.has(r.id) ? "checked" : ""} />
        <span class="sheet-check-ico"><i data-lucide="${r.icon}"></i></span>
        <span>${r.name}</span>`;
      const cb = row.querySelector("input");
      cb.addEventListener("change", () => {
        const sid = cb.getAttribute("data-sheet-id");
        const arr = getFavoritesForGrade(state.grade).slice();
        const ix = arr.indexOf(sid);
        if (cb.checked) {
          if (ix < 0) arr.push(sid);
        } else if (ix >= 0) arr.splice(ix, 1);
        setFavoritesForGrade(state.grade, arr);
        renderSubjects();
        renderHome();
        iconsRefresh();
      });
      list.appendChild(row);
    });
    iconsRefresh();
  }

  function renderGradeSheet() {
    const grid = $("#sheet-grade-buttons");
    if (!grid) return;
    grid.innerHTML = "";
    (D.grades || []).forEach((g) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "sheet-grade-btn" + (g === state.grade ? " sheet-grade-btn--on" : "");
      b.textContent = String(g);
      b.dataset.pickGradeSheet = String(g);
      grid.appendChild(b);
    });
  }

  function renderGoalSheet() {
    const grid = $("#sheet-goal-buttons");
    if (!grid) return;
    grid.innerHTML = "";
    (D.onboardingGoals || []).forEach((g) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "onb-goal-card" + (g.id === prefs.studyGoal ? " onb-goal-card--on" : "");
      b.dataset.pickGoalSheet = g.id;
      b.innerHTML = `<strong>${g.title}</strong><span>${g.sub}</span>`;
      grid.appendChild(b);
    });
  }

  function getFavoritesForGrade(g) {
    return prefs.favoritesByGrade[String(g)] || [];
  }

  function setFavoritesForGrade(g, ids) {
    prefs.favoritesByGrade[String(g)] = ids;
    savePrefs();
  }

  function toggleFavoriteId(g, rowId) {
    const arr = getFavoritesForGrade(g).slice();
    const i = arr.indexOf(rowId);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(rowId);
    setFavoritesForGrade(g, arr);
    toast(i >= 0 ? "Убрано из избранного" : "В избранном · видно на главной");
  }

  function getCatalog(grade) {
    return D.catalogByGrade?.[grade] || [];
  }

  function routeSubjectKey(id) {
    const R = D.subjectRoute || {};
    return R[id] || id;
  }

  function getSubjectDetail(key, grade) {
    let g = grade != null ? grade : state.grade;
    g = Number(g);
    if (!Number.isFinite(g)) g = Number(D.defaultGrade) || 5;
    const byGrade = D.subjectDetailByGrade?.[g]?.[key];
    if (byGrade) return byGrade;
    return D.subjectDetail?.[key] || D.subjectDetail?.math;
  }

  /** Блоки с массивом items — как в curriculum/math/*.json */
  function mathTopicsLookModular(topics) {
    return (
      Array.isArray(topics) &&
      topics.length > 0 &&
      topics.some(
        (b) =>
          b &&
          Array.isArray(b.items) &&
          b.items.length > 0
      )
    );
  }

  /** Пока грузим JSON с сервера — подставляем полный курс из встроенного бэкапа (file://, офлайн, 404). */
  function applyEmbeddedMathCurriculum() {
    const E = window.SHANKS_MATH_CURRICULUM_EMBED;
    if (!E || typeof E !== "object") return;
    if (!D.subjectDetailByGrade || typeof D.subjectDetailByGrade !== "object") {
      D.subjectDetailByGrade = {};
    }
    [5, 6, 7, 8, 9].forEach((g) => {
      const data = E[g] ?? E[String(g)];
      if (!data || !mathTopicsLookModular(data.topics)) return;
      if (!D.subjectDetailByGrade[g]) D.subjectDetailByGrade[g] = {};
      D.subjectDetailByGrade[g].math = {
        title: data.title || "Математика",
        topics: data.topics,
      };
    });
  }

  /** Если для класса нет модульной математики — снова заливаем из embed (после сбоя fetch и т. п.). */
  function ensureMathCurriculumForGrade(grade) {
    const g = Number(grade);
    if (!Number.isFinite(g) || g < 5 || g > 9) return;
    const cur = D.subjectDetailByGrade[g]?.math;
    if (mathTopicsLookModular(cur?.topics)) return;
    backfillMathFromEmbedForGaps();
  }

  /** Подставить embed только там, где нет модульных тем (не трогать удачный fetch). */
  function backfillMathFromEmbedForGaps() {
    const E = window.SHANKS_MATH_CURRICULUM_EMBED;
    if (!E || typeof E !== "object") return;
    if (!D.subjectDetailByGrade || typeof D.subjectDetailByGrade !== "object") {
      D.subjectDetailByGrade = {};
    }
    [5, 6, 7, 8, 9].forEach((g) => {
      if (mathTopicsLookModular(D.subjectDetailByGrade[g]?.math?.topics)) return;
      const data = E[g] ?? E[String(g)];
      if (!data || !mathTopicsLookModular(data.topics)) return;
      if (!D.subjectDetailByGrade[g]) D.subjectDetailByGrade[g] = {};
      D.subjectDetailByGrade[g].math = {
        title: data.title || "Математика",
        topics: data.topics,
      };
    });
  }

  function catalogRowForDetailKey(grade, detailKey) {
    return getCatalog(grade).find((r) => routeSubjectKey(r.id) === detailKey);
  }

  function clampPct(value) {
    if (Progress.clampPct) return Progress.clampPct(value);
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.min(100, Math.max(0, Math.round(n)));
  }

  function isCurriculumTopic(topic) {
    return topic && typeof topic.id === "string" && topic.id.length > 0;
  }

  function getLearningContent(topic) {
    if (!isCurriculumTopic(topic)) return null;
    const m = window.SHANKS_MATH_LEARNING?.byTopicId?.[topic.id];
    return m && typeof m === "object" ? m : null;
  }

  /** Id тем для KPI среднего по математике (см. SHANKS_MATH_KPI + D.mathLearningKpiByGrade). */
  function getMathKpiIdSet(grade) {
    return KPI.getMathKpiIdSet ? KPI.getMathKpiIdSet(grade, D.mathLearningKpiByGrade) : null;
  }

  function filterMathKpiTopicsIfConfigured(items, grade) {
    if (!KPI.filterMathKpiTopicsIfConfigured) return items;
    return KPI.filterMathKpiTopicsIfConfigured(items, grade, D.mathLearningKpiByGrade);
  }

  function refreshTopicTestLock() {
    const ct = state.curriculumTopic;
    if (!ct || !isCurriculumTopic(ct)) {
      state.topicTestUnlocked = true;
      return;
    }
    const lc = getLearningContent(ct);
    if (!lc) {
      state.topicTestUnlocked = false;
      return;
    }
    const prog = getTopicProgress(ct, state.grade, state.subjectKey);
    state.topicTestUnlocked = Progress.isTestUnlocked(prog, lc);
  }

  function updateTopicModeDescriptors() {
    const th = $("#tab-mode-theory .m-sub");
    const pr = $("#tab-mode-practice .m-sub");
    const te = $("#tab-mode-test .m-sub");
    const ct = state.curriculumTopic;
    if (!ct || !isCurriculumTopic(ct)) {
      if (th) th.textContent = "Урок · всегда доступна";
      if (pr) pr.textContent = "Тренировка";
      if (te) te.textContent = "Доступен";
      return;
    }
    const lc = getLearningContent(ct);
    const prog = getTopicProgress(ct, state.grade, state.subjectKey);
    if (!lc) {
      if (th) th.textContent = "Готовится";
      if (pr) pr.textContent = "—";
      if (te) te.textContent = "Готовится";
      return;
    }
    const rule = Progress.getPracticePassRule(lc);
    const n = Progress.practiceSolvedCount(prog);
    const req = rule ? rule.required : (lc.practice || []).length;
    const tot = rule ? rule.total : (lc.practice || []).length;
    if (th) th.textContent = prog.theoryDone ? "Изучено" : "Урок · всегда доступна";
    if (pr) pr.textContent = `${n}/${tot} к тесту`;
    const unlocked = Progress.isTestUnlocked(prog, lc);
    if (te) {
      te.textContent = unlocked
        ? "Доступен"
        : `Нужно ${req} из ${tot} в практике`;
    }
  }

  /** Текст тоста о закрытом тесте: реальные n/tot/req или человеческий fallback без «N/M». */
  function learningPracticeGateToastText(variant) {
    const ct = state.curriculumTopic;
    if (!isCurriculumTopic(ct)) {
      return variant === "tab"
        ? "Тест закрыт: сначала выполни практику по теме."
        : "Тест закрыт: сначала зачти практику по этой теме.";
    }
    const lc = getLearningContent(ct);
    if (!lc) return "Контент по теме готовится — тест пока недоступен.";
    const prog = getTopicProgress(ct, state.grade, state.subjectKey);
    const rule = Progress.getPracticePassRule(lc);
    const practiceLen = (lc.practice || []).length;
    const n = Progress.practiceSolvedCount(prog);
    const req = rule ? rule.required : practiceLen;
    const tot = rule ? rule.total : practiceLen;
    if (!rule && practiceLen === 0) {
      return variant === "tab"
        ? "Тест закрыт: сначала зачти практику по теме (счётчик на плитке «Практика»)."
        : "Тест закрыт: сначала зачти практику по теме. Урок по теории можно открыть во вкладке «Теория».";
    }
    if (variant === "tab") {
      return `Тест закрыт: верно решено ${n} из ${tot} по практике, нужно минимум ${req}. Смотри плитку «Практика» у темы.`;
    }
    return `Тест закрыт: в практике верно ${n} из ${tot} (нужно минимум ${req}). Урок по теории можно открыть во вкладке «Теория».`;
  }

  function topicProgressKey(topic, grade, subjectKey) {
    if (!isCurriculumTopic(topic)) return "";
    if (Progress.topicKey) {
      return Progress.topicKey(subjectKey || state.subjectKey, grade || state.grade, topic.id);
    }
    return `${subjectKey || state.subjectKey}:${grade || state.grade}:${topic.id}`;
  }

  function getTopicProgress(topic, grade, subjectKey) {
    ensureTopicProgressStore();
    return prefs.topicProgress[topicProgressKey(topic, grade, subjectKey)] || {};
  }

  function topicProgressPct(topic, grade, subjectKey) {
    if (!isCurriculumTopic(topic)) return clampPct(topic?.pct);
    const progress = getTopicProgress(topic, grade, subjectKey);
    const lc = window.SHANKS_MATH_LEARNING?.byTopicId?.[topic.id] ?? null;
    return Progress.topicPct ? Progress.topicPct(progress, lc) : 0;
  }

  function completeTopicStep(step) {
    const topic = state.curriculumTopic;
    if (!isCurriculumTopic(topic)) return;
    const key = topicProgressKey(topic, state.grade, state.subjectKey);
    const current = getTopicProgress(topic, state.grade, state.subjectKey);
    prefs.topicProgress[key] = {
      ...current,
      [`${step}Done`]: true,
      updatedAt: new Date().toISOString(),
    };
    savePrefs();
    refreshTopicTestLock();
    updateTopicModeDescriptors();
    syncTopicBody();
    syncModeTiles();
    renderActivity();
    renderSubjectDetail();
    renderSubjects();
    renderHome();
    renderProfile();
  }

  function persistTopicProgress(topic, patch) {
    if (!isCurriculumTopic(topic)) return;
    const key = topicProgressKey(topic, state.grade, state.subjectKey);
    const current = getTopicProgress(topic, state.grade, state.subjectKey);
    prefs.topicProgress[key] = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    savePrefs();
    refreshTopicTestLock();
    updateTopicModeDescriptors();
    syncTopicBody();
    syncModeTiles();
    renderActivity();
    renderSubjectDetail();
    renderSubjects();
    renderHome();
    renderProfile();
  }

  function recordPracticeCorrect(questionIndex) {
    const topic = state.curriculumTopic;
    const lc = getLearningContent(topic);
    if (!lc || !Array.isArray(lc.practice)) return;
    const cur = getTopicProgress(topic, state.grade, state.subjectKey);
    const ps = { ...(cur.practiceSolved && typeof cur.practiceSolved === "object" ? cur.practiceSolved : {}) };
    ps[String(questionIndex)] = true;
    const next = { ...cur, practiceSolved: ps };
    if (Progress.isPracticePassed(next, lc)) next.practiceDone = true;
    persistTopicProgress(topic, next);
    if (Progress.isPracticePassed(next, lc)) {
      toast("Практика зачтена — открыт тест.");
    }
  }

  function recordTestCorrect(questionIndex) {
    const topic = state.curriculumTopic;
    const lc = getLearningContent(topic);
    if (!lc || !Array.isArray(lc.test)) return;
    const cur = getTopicProgress(topic, state.grade, state.subjectKey);
    const ts = { ...(cur.testSolved && typeof cur.testSolved === "object" ? cur.testSolved : {}) };
    ts[String(questionIndex)] = true;
    const next = { ...cur, testSolved: ts };
    const allOk = (lc.test || []).every((_, i) => next.testSolved[String(i)]);
    if (allOk) next.testDone = true;
    persistTopicProgress(topic, next);
    if (allOk) toast("Тест пройден — тема 100%.");
    else toast("Верно — ответ засчитан.");
  }

  function subjectProgressPct(row, grade) {
    if (!row) return 0;
    if (routeSubjectKey(row.id) !== "math") return clampPct(row.pct);
    if (Number(grade) > 9) return 0;
    const sd = getSubjectDetail("math", grade);
    const items = [];
    (sd?.topics || []).forEach((block) => {
      if (Array.isArray(block.items)) items.push(...block.items);
      else if (isCurriculumTopic(block)) items.push(block);
    });
    if (items.length === 0) return clampPct(row.pct);
    const pool = filterMathKpiTopicsIfConfigured(items, grade);
    const sum = pool.reduce((acc, item) => acc + topicProgressPct(item, grade, "math"), 0);
    return Math.round(sum / pool.length);
  }

  function computeOverallAverage(grade) {
    const catalog = getCatalog(grade);
    const fav = new Set(getFavoritesForGrade(grade));
    const favRows = catalog.filter((r) => fav.has(r.id));
    if (favRows.length === 0) return { pct: 0, n: 0 };
    const sum = favRows.reduce((s, r) => s + subjectProgressPct(r, grade), 0);
    return { pct: Math.round(sum / favRows.length), n: favRows.length };
  }

  function refreshProgressAfterFav() {
    renderSubjects();
    renderHome();
    iconsRefresh();
  }

  function setTab(tab) {
    closeStack();
    state.tab = tab;
    $$(".view-main").forEach((el) => el.classList.toggle("is-active", el.dataset.tab === tab));
    $$(".nav-seg").forEach((btn) => {
      const on = btn.dataset.nav === tab;
      btn.classList.toggle("nav-seg--active", on);
      if (on) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    if (tab === "home") renderHome();
    if (tab === "subjects") renderSubjects();
    if (tab === "notes") renderNotes();
    if (tab === "profile") renderProfile();
    iconsRefresh();
  }

  function resetSearchUi() {
    closeSheet("topic-search");
  }

  function closeActivity() {
    $("#stack-activity")?.classList.remove("is-open");
    if (state.stack === "activity") state.stack = "topic";
    const ct = state.curriculumTopic;
    if (isCurriculumTopic(ct) && getLearningContent(ct)) {
      const v = state.activityView;
      if (v === "practice") state.topicMode = "practice";
      else if (v === "test") state.topicMode = "test";
      else state.topicMode = "theory";
      syncModeTiles();
    }
    iconsRefresh();
  }

  function openStack(name) {
    state.stack = name;
    $("#app").classList.add("stack-open");
    $("#stack-activity")?.classList.remove("is-open");
    if (name === "subject-detail") {
      $("#stack-topic").classList.remove("is-open");
      $("#stack-subject-detail").classList.add("is-open");
      resetSearchUi();
    }
    iconsRefresh();
  }

  function openTopicOverDetail() {
    closeActivity();
    state.stack = "topic";
    $("#app").classList.add("stack-open");
    $("#stack-subject-detail").classList.add("is-open");
    $("#stack-topic").classList.add("is-open");
    iconsRefresh();
  }

  function closeTopic() {
    closeActivity();
    state.curriculumTopic = null;
    state.topicModuleTitle = null;
    $("#stack-topic").classList.remove("is-open");
    state.stack = "subject-detail";
    iconsRefresh();
  }

  function getPracticePack(diff) {
    const m = D.activityPracticeByDiff || {};
    return m[diff] || m.med || {};
  }

  function getTestPack(diff) {
    const m = D.activityTestByDiff || {};
    return m[diff] || m.easy || {};
  }

  function openActivity(view, diff) {
    const ct = state.curriculumTopic;
    if (isCurriculumTopic(ct) && getLearningContent(ct)) {
      if (view === "theory") state.topicMode = "theory";
      else if (view === "practice") state.topicMode = "practice";
      else if (view === "test") state.topicMode = "test";
      syncModeTiles();
    }
    state.activityView = view;
    if (view === "practice") {
      if (diff) state.practiceDiff = diff;
    } else if (view === "test") {
      if (diff) state.testDiff = diff;
    }
    state.stack = "activity";
    $("#app").classList.add("stack-open");
    $("#stack-subject-detail").classList.add("is-open");
    $("#stack-topic").classList.add("is-open");
    $("#stack-activity").classList.add("is-open");
    renderActivity();
    iconsRefresh();
  }

  function appendLearningQuestionCard(body, q, qi, isPractice, progress, lc) {
    const cardSolved = isPractice
      ? !!progress.practiceSolved?.[String(qi)]
      : !!progress.testSolved?.[String(qi)];
    const allDone = isPractice
      ? Progress.isPracticePassed(progress, lc)
      : Progress.isTestPassed(progress, lc);
    const hasHints = Array.isArray(q.hints) && q.hints.length > 0;
    const hasSol = Array.isArray(q.workedSolution) && q.workedSolution.length > 0;
    const hasRich =
      hasHints ||
      hasSol ||
      (q.misconceptionsByWrongIndex && typeof q.misconceptionsByWrongIndex === "object") ||
      (Array.isArray(q.theoryRefs) && q.theoryRefs.length > 0);

    const card = document.createElement("div");
    card.className = "lesson-quiz-card" + (hasRich ? " lesson-quiz-card--rich" : "");

    if (!hasRich) {
      card.innerHTML = `
          <strong>${q.title}</strong>
          <p>${q.prompt}</p>
          <div class="lesson-answer-list"></div>
          <span class="lesson-explain"></span>`;
      const ex = card.querySelector(".lesson-explain");
      if (cardSolved || allDone) ex.textContent = q.explanation || "";
      const answerList = card.querySelector(".lesson-answer-list");
      (q.options || []).forEach((option, oi) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lesson-answer-btn";
        btn.textContent = option;
        const frozen = allDone || cardSolved;
        if (frozen) {
          btn.disabled = true;
          if (oi === q.answerIndex) btn.classList.add("lesson-answer-btn--ok");
        }
        btn.addEventListener("click", () => {
          if (frozen) return;
          if (oi === q.answerIndex) {
            if (isPractice) recordPracticeCorrect(qi);
            else recordTestCorrect(qi);
          } else {
            toast("Почти. Выбери вариант, который согласуется с условием.");
          }
        });
        answerList.appendChild(btn);
      });
      body.appendChild(card);
      return;
    }

    const theoryRefHtml =
      Array.isArray(q.theoryRefs) && q.theoryRefs.length
        ? `<p class="act-lm-theory-refs-v8">${q.theoryRefs
            .map((r) => {
              const b = (lc.theory || [])[r.blockIndex];
              const lab = (r && r.label) || (b && b.title) || "Теория";
              return b ? `<span>Связь с теорией: <strong>${lab}</strong> — «${b.title}»</span>` : "";
            })
            .filter(Boolean)
            .join(" ")}</p>`
        : "";

    card.innerHTML = `
          <strong>${q.title}</strong>
          <p>${q.prompt}</p>
          ${theoryRefHtml}
          <div class="lesson-answer-list"></div>
          <div class="act-lm-feedback-v8" role="status"></div>
          <div class="act-lm-solution-panel-v8" hidden></div>
          <div class="act-lm-actions-v8">
            <button type="button" class="act-lm-sec-btn-v8" data-lm-hint ${hasHints ? "" : "hidden"}>Подсказка</button>
            <button type="button" class="act-lm-sec-btn-v8 act-lm-sec-btn-v8--primary" data-lm-show-solution ${hasSol ? "" : "hidden"}>Разбор решения</button>
          </div>
          <p class="lesson-explain act-lm-explain-v8"></p>`;

    const feedbackEl = card.querySelector(".act-lm-feedback-v8");
    const solutionPanel = card.querySelector(".act-lm-solution-panel-v8");
    const hintBtn = card.querySelector("[data-lm-hint]");
    const solBtn = card.querySelector("[data-lm-show-solution]");
    const ex = card.querySelector(".act-lm-explain-v8");
    let hintStep = 0;

    function showSolutionLines() {
      if (!hasSol) return;
      solutionPanel.hidden = false;
      solutionPanel.innerHTML = `<strong>Пошаговый разбор</strong><ol>${q.workedSolution
        .map((line) => `<li>${line}</li>`)
        .join("")}</ol>`;
    }

    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        if (!hasHints) return;
        if (hintStep >= q.hints.length) {
          feedbackEl.textContent = "Подсказки закончились — посмотри разбор решения.";
          return;
        }
        feedbackEl.textContent = q.hints[hintStep];
        hintStep += 1;
      });
    }
    if (solBtn) {
      solBtn.addEventListener("click", () => {
        showSolutionLines();
        solBtn.hidden = true;
      });
    }

    if (cardSolved || allDone) {
      if (q.explanation) ex.textContent = q.explanation;
      showSolutionLines();
    }

    const answerList = card.querySelector(".lesson-answer-list");
    (q.options || []).forEach((option, oi) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lesson-answer-btn";
      btn.textContent = option;
      const frozen = allDone || cardSolved;
      if (frozen) {
        btn.disabled = true;
        if (oi === q.answerIndex) btn.classList.add("lesson-answer-btn--ok");
      }
      btn.addEventListener("click", () => {
        if (frozen) return;
        if (oi === q.answerIndex) {
          feedbackEl.textContent = "";
          if (q.explanation) ex.textContent = q.explanation;
          showSolutionLines();
          if (isPractice) recordPracticeCorrect(qi);
          else recordTestCorrect(qi);
        } else {
          const map = q.misconceptionsByWrongIndex;
          const msg =
            map && typeof map[String(oi)] === "string"
              ? map[String(oi)]
              : "Пока неверно. Используй подсказку или разбор — так связь с теорией станет яснее.";
          feedbackEl.textContent = msg;
        }
      });
      answerList.appendChild(btn);
    });
    body.appendChild(card);
  }

  function renderActivity() {
    const root = $("#stack-activity");
    if (!root) return;
    let view = state.activityView;
    const learningTopic = isCurriculumTopic(state.curriculumTopic);
    const lcLearn = learningTopic ? getLearningContent(state.curriculumTopic) : null;
    const progLearn = learningTopic ? getTopicProgress(state.curriculumTopic) : null;
    if (learningTopic && view === "test" && lcLearn && !Progress.isTestUnlocked(progLearn, lcLearn)) {
      state.activityView = "practice";
      view = "practice";
    }
    const diff =
      view === "practice" ? state.practiceDiff : view === "test" ? state.testDiff : state.practiceDiff;
    root.dataset.view = view;
    root.dataset.diff = diff;

    const tTitle = $("#tp-title");
    const tMeta = $("#tp-meta");
    const titleEl = $("#act-title");
    const metaEl = $("#act-meta");
    if (titleEl) titleEl.textContent = tTitle?.textContent || D.topic?.title || "Тема";
    if (metaEl) metaEl.textContent = tMeta?.textContent || D.topic?.subjectLine || "";

    const pack = learningTopic ? {} : view === "practice" ? getPracticePack(diff) : getTestPack(diff);
    const pctEl = $("#act-pct-label");
    const fillEl = $("#act-progress-fill");
    if (learningTopic) {
      const pct = topicProgressPct(state.curriculumTopic);
      if (pctEl) pctEl.textContent = `${pct}% · личный прогресс`;
      if (fillEl) fillEl.style.width = `${pct}%`;
    } else {
      if (pctEl) pctEl.textContent = pack.progressCaption || "";
      if (fillEl) fillEl.style.width = `${Number(pack.progressPct) || 0}%`;
    }

    $$("#act-main-tabs .act-tab-v8").forEach((btn) => {
      const t = btn.dataset.actTab;
      const on =
        (t === "theory" && view === "theory") ||
        (t === "practice" && view === "practice") ||
        (t === "test" && view === "test");
      btn.classList.toggle("act-tab-v8--on", on);
      const testLocked =
        learningTopic &&
        lcLearn &&
        progLearn &&
        !Progress.isTestUnlocked(progLearn, lcLearn);
      if (t === "test" && testLocked) {
        btn.classList.add("act-tab-v8--disabled");
        btn.setAttribute("aria-disabled", "true");
      } else {
        btn.classList.remove("act-tab-v8--disabled");
        btn.removeAttribute("aria-disabled");
      }
    });

    const kicker = $("#act-diff-kicker");
    if (kicker)
      kicker.textContent =
        view === "theory" ? "Полноэкранный урок" : view === "practice" ? "Сложность практики" : "Сложность теста";

    const row = $("#act-diff-row");
    if (row) {
      const keys = ["easy", "med", "hard"];
      const Lp = { easy: "Лёгкая", med: "Средняя", hard: "Тяжёлая" };
      const Lt = { easy: "Лёгкий", med: "Средний", hard: "Тяжёлый" };
      const L = view === "practice" ? Lp : Lt;
      row.innerHTML = learningTopic
        ? `<button type="button" class="act-diff-pill-v8 act-diff-pill-v8--on" data-act-diff="easy">Тренировка</button>`
        : keys
            .map((d) => {
              const on = d === diff;
              const isHard = d === "hard";
              const inner = isHard
                ? `<i data-lucide="lock" class="act-diff-lock"></i><span>${L[d]}</span>`
                : L[d];
              return `<button type="button" class="act-diff-pill-v8${on ? " act-diff-pill-v8--on" : ""}${isHard ? " act-diff-pill-v8--hard" : ""}" data-act-diff="${d}">${inner}</button>`;
            })
            .join("");
    }

    const diffWrap = root.querySelector(".act-diff-wrap-v8");
    if (diffWrap) diffWrap.style.display = view === "theory" ? "none" : "";

    const body = $("#act-body");
    const foot = $("#act-footer");
    if (body) body.innerHTML = "";
    if (foot) foot.innerHTML = "";

    if (learningTopic) {
      const lc = getLearningContent(state.curriculumTopic);
      const progress = getTopicProgress(state.curriculumTopic);
      const rule = lc ? Progress.getPracticePassRule(lc) : null;
      const practice = lc?.practice || [];
      const tests = lc?.test || [];
      const isPractice = view === "practice";
      const pass = lc ? Progress.isPracticePassed(progress, lc) : false;
      const testPass = lc ? Progress.isTestPassed(progress, lc) : false;

      if (!lc) {
        const sec = document.createElement("p");
        sec.className = "act-section-title-v8";
        sec.textContent = isPractice ? "Практика" : "Тест";
        body.appendChild(sec);
        const p = document.createElement("p");
        p.className = "act-learning-hint-v8";
        p.innerHTML =
          "<strong>Контент по теме готовится.</strong> Практика и тест по этой подтеме появятся позже — выбери тему из вертикального среза (например, квадратные уравнения в 8 классе).";
        body.appendChild(p);
        foot.innerHTML = `<button type="button" class="act-cta-btn-v8 act-cta-btn-v8--ghost" id="act-cta">Закрыть</button>`;
        iconsRefresh();
        return;
      }

      if (view === "theory") {
        const intro = document.createElement("div");
        intro.className = "act-theory-lesson-v8";
        const obj = lc.objective
          ? `<p class="act-theory-objective-v8"><strong>Цель навыка.</strong> ${lc.objective}</p>`
          : "";
        const we = lc.workedExample;
        const weHtml =
          we && Array.isArray(we.lines) && we.lines.length
            ? `<section class="act-worked-example-v8"><h4 class="act-we-title-v8">${we.title}</h4><ol>${we.lines
                .map((line) => `<li>${line}</li>`)
                .join("")}</ol></section>`
            : "";
        let blocksHtml = "";
        (lc.theory || []).forEach((b) => {
          blocksHtml += `<section class="act-theory-block-v8"><h4>${b.title}</h4><p>${b.body}</p></section>`;
        });
        intro.innerHTML = `
          <p class="act-section-title-v8">Урок</p>
          ${obj}
          ${blocksHtml}
          ${weHtml}`;
        body.appendChild(intro);
        foot.innerHTML = `
          <button type="button" class="act-cta-btn-v8 act-cta-btn-v8--ghost" id="act-theory-mark"${
            progress.theoryDone ? ' disabled aria-disabled="true"' : ""
          }>${progress.theoryDone ? "Теория уже отмечена" : "Отметить как изучено"}</button>
          <button type="button" class="act-cta-btn-v8" id="act-theory-to-practice">К практике</button>`;
        iconsRefresh();
        return;
      }

      if (view === "practice" && !progress.theoryDone) {
        const soft = document.createElement("div");
        soft.className = "act-learning-soft-v8";
        soft.innerHTML =
          "<p><strong>Совет:</strong> рекомендуем сначала открыть вкладку «Теория» и пройти урок целиком. Практику можно начать и без отметки — это не блокирует ответы.</p>";
        body.appendChild(soft);
      }

      const banner = document.createElement("div");
      banner.className = "act-learning-hint-v8";
      if (isPractice) {
        const n = Progress.practiceSolvedCount(progress);
        const req = rule ? rule.required : practice.length;
        const tot = rule ? rule.total : practice.length;
        banner.innerHTML = `<p><strong>Практика:</strong> зачтено <strong>${n}</strong> из <strong>${tot}</strong> по плану. Для допуска к тесту нужно минимум <strong>${req}</strong> верных ответов (разные карточки).</p>`;
      } else if (!Progress.isTestUnlocked(progress, lc)) {
        banner.innerHTML = `<p><strong>Тест закрыт,</strong> пока не зачтена практика: минимум <strong>${
          rule ? rule.required : "?"
        }</strong> из <strong>${rule ? rule.total : "?"}</strong> верных заданий. Урок по теории доступен в любой момент — он помогает на тесте, но для замка важна именно практика.</p>`;
      } else if (testPass) {
        banner.innerHTML = "<p><strong>Итоговый тест</strong> пройден. Тема на 100% — можно вернуться к экрану темы.</p>";
      } else {
        const tn = Progress.testSolvedCount(progress);
        banner.innerHTML = `<p><strong>Итоговый тест:</strong> верно <strong>${tn}</strong> из <strong>${tests.length}</strong>. Нужен верный ответ на каждый вопрос.</p>`;
      }
      body.appendChild(banner);

      if (!isPractice && !Progress.isTestUnlocked(progress, lc)) {
        const lockMsg = document.createElement("p");
        lockMsg.className = "act-section-title-v8";
        lockMsg.textContent = "Сначала практика";
        body.appendChild(lockMsg);
        foot.innerHTML = `<button type="button" class="act-cta-btn-v8" id="act-cta">К практике</button>`;
        iconsRefresh();
        return;
      }

      const sec = document.createElement("p");
      sec.className = "act-section-title-v8";
      sec.textContent = isPractice ? "Практика по теме" : "Итоговый тест";
      body.appendChild(sec);

      const questions = isPractice ? practice : tests;
      questions.forEach((q, qi) => {
        appendLearningQuestionCard(body, q, qi, isPractice, progress, lc);
      });

      if (!isPractice && testPass) {
        const ok = Progress.testSolvedCount(progress);
        const sum = document.createElement("div");
        sum.className = "act-test-summary-v8";
        sum.innerHTML = `
          <h4 class="act-ts-head-v8">Итог</h4>
          <p>Верно: <strong>${ok}</strong> из <strong>${tests.length}</strong>.</p>
          <p class="act-ts-muted-v8">Если что-то сомневалось — повтори урок и разборы в практике. Обрати внимание на корни вида x² = d и на знак.</p>
          <button type="button" class="act-cta-btn-v8 act-cta-btn-v8--ghost" id="act-test-to-theory">Вернуться к теории</button>`;
        body.appendChild(sum);
      }

      const nextText = isPractice
        ? pass
          ? "Перейти к тесту"
          : "Решай задания — см. счётчик выше"
        : testPass
          ? "Вернуться к теме"
          : "Ответь на все вопросы";
      foot.innerHTML = `<button type="button" class="act-cta-btn-v8" id="act-cta">${nextText}</button>`;
    } else if (view === "practice") {
      const tasks = pack.tasks || [];
      const doneN = tasks.filter((t) => t.done).length;
      const sec = document.createElement("p");
      sec.className = "act-section-title-v8";
      sec.textContent =
        tasks.length > 0 ? `Задачи (${doneN} из ${tasks.length})` : "Задачи";
      body.appendChild(sec);
      const curIdx = tasks.findIndex((t) => !t.done);

      tasks.forEach((task, i) => {
        const isCurrent = curIdx >= 0 && i === curIdx;
        if (isCurrent) {
          const card = document.createElement("button");
          card.type = "button";
          card.className = "act-task-card act-task-card--current";
          const preview = task.preview
            ? `<p class="act-task-preview">${task.preview}</p>`
            : "";
          card.innerHTML = `
            <div class="act-task-current-head">
              <strong>${task.title}</strong>
              <span class="act-task-pill">Решаем</span>
            </div>
            ${preview || `<p class="act-task-preview">${task.sub}</p>`}`;
          card.addEventListener("click", () =>
            toast("Решение задачи — в полной версии приложения.")
          );
          body.appendChild(card);
          return;
        }
        const card = document.createElement("button");
        card.type = "button";
        card.className =
          "act-task-card act-task-card--queue" +
          (task.done ? " act-task-card--done" : "");
        card.innerHTML = `
          <span class="act-task-queue-accent" aria-hidden="true"></span>
          <div class="act-task-queue-body">
            <strong>${task.title}</strong>
            <span>${task.preview ? task.preview : task.sub}</span>
          </div>`;
        card.addEventListener("click", () =>
          toast("Решение задачи — в полной версии приложения.")
        );
        body.appendChild(card);
      });
      if (pack.premium) {
        const pr = document.createElement("div");
        pr.className = "act-premium-v8";
        pr.innerHTML = `
          <div class="act-premium-copy">
            <strong>${pack.premium.title}</strong>
            <p>${pack.premium.subline}</p>
          </div>
          <button type="button" class="act-premium-cta" data-act-premium>${pack.premium.cta}</button>`;
        body.appendChild(pr);
      }
      foot.innerHTML = `<button type="button" class="act-cta-btn-v8" id="act-cta">${pack.cta || "Далее"}</button>`;
    } else {
      const sec = document.createElement("p");
      sec.className = "act-section-title-v8";
      sec.textContent = pack.sectionTitle || "Тесты";
      body.appendChild(sec);
      (pack.tests || []).forEach((te) => {
        const card = document.createElement("div");
        card.className = "act-test-card" + (te.locked ? " act-test-card--locked" : "");
        let badgeHtml = "";
        if (te.locked) {
          badgeHtml = `<span class="act-badge act-badge--lock"><i data-lucide="lock"></i> Закрыто</span>`;
        } else if (te.badge) {
          badgeHtml = `<span class="act-badge">${te.badge}</span>`;
        }
        card.innerHTML = `
          <div class="act-test-top">
            <div>
              <strong>${te.title}</strong>
              <span>${te.sub}</span>
            </div>
            ${badgeHtml}
          </div>
          <div class="act-test-track"><div class="act-test-fill" style="width:${te.locked ? 0 : te.pct}%"></div></div>
          ${
            !te.locked
              ? `<button type="button" class="act-test-go" data-test-open>Открыть</button>`
              : ""
          }`;
        const go = card.querySelector("[data-test-open]");
        go?.addEventListener("click", () => toast("Тест откроется в полной версии."));
        body.appendChild(card);
      });
      if (pack.ctaHint) {
        foot.innerHTML = `<p class="act-footer-hint-v8">${pack.ctaHint}</p><button type="button" class="act-cta-btn-v8 act-cta-btn-v8--ghost" id="act-cta">${pack.cta}</button>`;
      } else {
        foot.innerHTML = `<button type="button" class="act-cta-btn-v8" id="act-cta">${pack.cta || "Начать"}</button>`;
      }
    }

    iconsRefresh();
  }

  function closeStack() {
    state.stack = null;
    $("#app").classList.remove("stack-open");
    $$(".stack-layer").forEach((el) => el.classList.remove("is-open"));
    resetSearchUi();
    iconsRefresh();
  }

  function moduleItemsAvgPct(items) {
    if (!items || !items.length) return 0;
    const pool = filterMathKpiTopicsIfConfigured(items, state.grade);
    const sum = pool.reduce((s, x) => s + topicProgressPct(x, state.grade, state.subjectKey), 0);
    return Math.round(sum / pool.length);
  }

  function syncTopicAccordionDom() {
    const norm = ($("#sd-search-input")?.value || "").trim().toLowerCase();
    $$("#sd-topics .topic-module--accordion").forEach((mod) => {
      const panel = mod.querySelector(".topic-module-panel");
      const toggle = mod.querySelector(".topic-module-toggle");
      let expanded = false;
      if (norm) {
        const cards = mod.querySelectorAll(".topic-card");
        expanded =
          mod.style.display !== "none" &&
          Array.from(cards).some((c) => c.style.display !== "none");
      } else {
        expanded = mod.dataset.accordionId === state.topicAccordionId;
      }
      mod.classList.toggle("topic-module--expanded", expanded);
      if (panel) panel.hidden = !expanded;
      if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
    iconsRefresh();
  }

  function filterTopics(q) {
    const norm = (q || "").trim().toLowerCase();
    const modules = $$("#sd-topics .topic-module--accordion");
    if (modules.length) {
      modules.forEach((mod) => {
        const modTitle = (
          mod.querySelector(".topic-module-title")?.textContent || ""
        ).toLowerCase();
        let nVis = 0;
        mod.querySelectorAll(".topic-card").forEach((c) => {
          const t = c.textContent.toLowerCase();
          const show = !norm || t.includes(norm) || modTitle.includes(norm);
          c.style.display = show ? "" : "none";
          if (show) nVis += 1;
        });
        const showMod = !norm || nVis > 0 || modTitle.includes(norm);
        mod.style.display = showMod ? "" : "none";
      });
      syncTopicAccordionDom();
      return;
    }
    $$("#sd-topics .topic-card").forEach((c) => {
      const t = c.textContent.toLowerCase();
      c.style.display = !norm || t.includes(norm) ? "" : "none";
    });
  }

  function renderHome() {
    const h = D.home;
    if (!h) return;
    const { pct, n } = computeOverallAverage(state.grade);
    $("#home-big-pct").textContent = `${pct}%`;
    const cap = $("#home-progress-caption");
    if (cap) {
      if (n === 0) cap.textContent = "добавь избранные в «Предметах»";
      else cap.textContent = `среднее по ${n} избранным · ${state.grade} класс`;
    }

    $("#home-task-text").textContent = h.taskDay.title;
    $("#home-task-xp").textContent = h.taskDay.xp;
    $("#home-quiz-text").textContent = h.quiz.text;
    const span = $("#home-quiz-btn")?.querySelector("span");
    if (span) span.textContent = h.quiz.cta;

    const catalog = getCatalog(state.grade);
    const favSet = new Set(getFavoritesForGrade(state.grade));
    const favRows = catalog.filter((r) => favSet.has(r.id));

    const list = $("#home-subj-list");
    list.innerHTML = "";
    if (favRows.length === 0) {
      const p = document.createElement("p");
      p.className = "home-fav-empty";
      p.textContent = D.copy?.noFavorites || "Нет избранных для этого класса.";
      list.appendChild(p);
    } else {
      favRows.forEach((r) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "subj-row";
        row.dataset.homeSubject = r.id;
        row.dataset.subjectId = r.id;
        const effectivePct = subjectProgressPct(r, state.grade);
        const muted = !effectivePct;
        const isMathSoon = routeSubjectKey(r.id) === "math" && Number(state.grade) > 9;
        const mathKpi = routeSubjectKey(r.id) === "math" && getMathKpiIdSet(state.grade);
        const progressLabel = isMathSoon
          ? "программа скоро"
          : routeSubjectKey(r.id) === "math"
            ? mathKpi
              ? "интерактивные темы"
              : "личный прогресс"
            : "демо-прогресс";
        row.innerHTML = `
          <i data-lucide="${r.icon}" class="subj-ico"></i>
          <div class="subj-meta">
            <strong>${r.name}</strong>
            <span>${state.grade} класс · ${progressLabel}</span>
          </div>
          <div class="pb-track"><div class="pb-fill" style="width:${muted ? 0 : effectivePct}%"></div></div>
          <span class="heart-hit" data-heart-toggle tabindex="0" role="button" aria-label="Убрать из избранного">
            <i data-lucide="heart" class="ico-heart-fill"></i>
          </span>
          <span class="subj-pct ${muted ? "subj-pct--muted" : ""}">${effectivePct}%</span>`;
        list.appendChild(row);
      });
    }
  }

  function renderSubjects() {
    const k = $("#sub-grade-kicker");
    if (k) k.textContent = `${state.grade} класс`;

    const catalog = getCatalog(state.grade);
    const favIds = getFavoritesForGrade(state.grade);
    const favSet = new Set(favIds);
    const favRows = catalog.filter((r) => favSet.has(r.id));

    const fav = $("#fav-list");
    fav.innerHTML = "";
    if (favRows.length === 0) {
      const empty = document.createElement("p");
      empty.className = "fav-strip-empty";
      empty.textContent =
        (D.copy && D.copy.favStripEmpty) ||
        "Добавь предметы кнопкой ниже.";
      fav.appendChild(empty);
    } else {
      favRows.forEach((r, i) => {
        const wrap = document.createElement("div");
        wrap.className = "fav-card" + (i % 2 ? " fav-card--accent-b" : " fav-card--accent-a");
        wrap.dataset.subjectId = r.id;

        const accent = document.createElement("span");
        accent.className = "fav-card-accent";
        accent.setAttribute("aria-hidden", "true");

        const rowInner = document.createElement("div");
        rowInner.className = "fav-card-row";

        const open = document.createElement("button");
        open.type = "button";
        open.className = "fav-card-open";
        open.dataset.openSubject = routeSubjectKey(r.id);
        open.innerHTML = `
          <span class="fav-ico"><i data-lucide="${r.icon}"></i></span>
          <span class="fav-meta"><strong>${r.name}</strong></span>`;

        const stat = document.createElement("div");
        stat.className = "fav-stat";
        const effectivePct = subjectProgressPct(r, state.grade);
        stat.innerHTML = `
          <span class="heart-hit" data-heart-toggle tabindex="0" role="button" aria-label="Убрать из избранного">
            <i data-lucide="heart" class="ico-heart-fill"></i>
          </span>
          <span class="fav-pct">${effectivePct}%</span>`;

        rowInner.appendChild(open);
        rowInner.appendChild(stat);
        wrap.appendChild(accent);
        wrap.appendChild(rowInner);
        fav.appendChild(wrap);
      });
    }
    iconsRefresh();
  }

  function appendTopicCard(tl, t, sd, nested, moduleTitle) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "topic-card" + (nested ? " topic-card--nested" : "");
    const hasPack = !!getLearningContent(t);
    const badge = hasPack
      ? `<span class="topic-card-badge topic-card-badge--live">Интерактив</span>`
      : `<span class="topic-card-badge topic-card-badge--soon" title="Теория и задания готовятся">Скоро</span>`;
    card.innerHTML = `
        <div class="row-between">
          <h4>${t.title}</h4>
          <span class="topic-card-meta">
            ${badge}
            <span class="topic-pct">${topicProgressPct(t, state.grade, state.subjectKey)}%</span>
          </span>
        </div>
        <div class="tb-track"><div class="tb-fill" style="width:${topicProgressPct(t, state.grade, state.subjectKey)}%"></div></div>`;
    card.addEventListener("click", () => {
      renderTopic(t, sd, moduleTitle);
      openTopicOverDetail();
    });
    tl.appendChild(card);
  }

  function topicAccordionKey(blockIndex) {
    return `${state.subjectKey}-${state.grade}-m${blockIndex}`;
  }

  function renderSubjectDetail() {
    if (state.subjectKey === "math") ensureMathCurriculumForGrade(state.grade);
    const sd = getSubjectDetail(state.subjectKey, state.grade);
    if (!sd) return;
    $("#sd-class").textContent = `${state.grade} класс`;
    const row = catalogRowForDetailKey(state.grade, state.subjectKey);
    $("#sd-title").textContent = row?.name || sd.title;
    const heroPct = row ? subjectProgressPct(row, state.grade) : clampPct(sd.heroPct);
    const kpiOn = state.subjectKey === "math" && getMathKpiIdSet(state.grade);
    const label =
      state.subjectKey === "math"
        ? kpiOn
          ? "прогресс по интерактивным темам"
          : "личный прогресс"
        : "демо-прогресс";
    $("#sd-pct-label").textContent = `${heroPct}% · ${label}`;
    $("#sd-hero-fill").style.width = `${heroPct}%`;

    const tl = $("#sd-topics");
    tl.innerHTML = "";
    if (state.subjectKey === "math" && Number(state.grade) > 9) {
      const p = document.createElement("p");
      p.className = "topic-empty-note";
      p.textContent =
        "Полная программа математики для 10-11 классов готовится. Сейчас доступны реальные темы 5-9 классов.";
      tl.appendChild(p);
      return;
    }
    sd.topics.forEach((block, blockIndex) => {
      if (block.items && Array.isArray(block.items)) {
        const accId = topicAccordionKey(blockIndex);
        const wrap = document.createElement("div");
        wrap.className = "topic-module topic-module--accordion";
        wrap.dataset.accordionId = accId;
        const avg = moduleItemsAvgPct(block.items);
        const panelId = `topic-panel-${accId}`;
        const headId = `topic-head-${accId}`;

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "topic-module-toggle";
        toggle.id = headId;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", panelId);
        toggle.innerHTML = `
          <span class="topic-module-toggle-wrap">
            <span class="topic-module-title">${block.title}</span>
            <span class="topic-module-meta"><span class="topic-module-pct">${avg}%</span><span class="topic-module-n">${block.items.length} подтем</span></span>
          </span>
          <i data-lucide="chevron-down" class="topic-module-chevron" aria-hidden="true"></i>
          <span class="tb-track topic-module-track" aria-hidden="true"><span class="tb-fill" style="width:${avg}%"></span></span>`;

        const panel = document.createElement("div");
        panel.className = "topic-module-panel";
        panel.id = panelId;
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-labelledby", headId);
        panel.hidden = true;

        block.items.forEach((t) =>
          appendTopicCard(panel, t, sd, true, block.title)
        );

        toggle.addEventListener("click", () => {
          const isOpen = state.topicAccordionId === accId;
          state.topicAccordionId = isOpen ? null : accId;
          syncTopicAccordionDom();
        });

        wrap.appendChild(toggle);
        wrap.appendChild(panel);
        tl.appendChild(wrap);
      } else {
        appendTopicCard(tl, block, sd, false);
      }
    });
    const accIds = $$("#sd-topics .topic-module--accordion").map(
      (m) => m.dataset.accordionId
    );
    if (state.topicAccordionId && !accIds.includes(state.topicAccordionId)) {
      state.topicAccordionId = null;
    }
    if (!state.topicAccordionId && accIds.length > 0) {
      state.topicAccordionId = accIds[0];
    }
    filterTopics($("#sd-search-input")?.value || "");
  }

  function syncModeTiles() {
    const mode = state.topicMode;
    const unlocked = state.topicTestUnlocked;
    $$("#topic-mode-row .mode-tile").forEach((btn) => {
      const m = btn.dataset.mode;
      const isTest = m === "test";
      const on = m === mode;
      btn.classList.toggle("mode-tile--on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      if (isTest) {
        btn.classList.toggle("mode-tile--dim", !unlocked);
        const ico = btn.querySelector("[data-lucide]");
        if (ico) ico.setAttribute("data-lucide", unlocked ? "clipboard-check" : "lock");
      } else {
        btn.classList.remove("mode-tile--dim");
      }
    });
    iconsRefresh();
    updateTopicModeDescriptors();
  }

  function goalHintText() {
    const goal = (D.onboardingGoals || []).find((g) => g.id === prefs.studyGoal);
    if (!goal) return "Цель не выбрана: можешь задать её в профиле.";
    return `Цель: ${goal.title.toLowerCase()}. Держи короткий цикл без перегруза.`;
  }

  function appendTheoryItems(list, T) {
    (T.theory || []).forEach((item) => {
      if (item.kind === "done") {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "theory-item";
        row.innerHTML = `
          <i data-lucide="book-open"></i>
          <div class="theory-body">
            <strong>${item.title}</strong>
            <span>${item.sub}</span>
          </div>
          <i data-lucide="check" class="check"></i>`;
        row.addEventListener("click", () => toast("Урок откроется в полной версии."));
        list.appendChild(row);
      } else if (item.kind === "current") {
        const row = document.createElement("div");
        row.className = "theory-item theory-featured";
        row.innerHTML = `
          <div class="tf-top">
            <strong>${item.title}</strong>
            <span class="badge-read">${item.sub}</span>
          </div>
          <div class="tf-bar-track"><div class="tf-bar-fill" style="width:${item.readPct}%"></div></div>`;
        list.appendChild(row);
      } else {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "theory-item theory-muted";
        row.innerHTML = `
          <span class="accent-bar"></span>
          <div class="theory-body tm-body">
            <strong>${item.title}</strong>
            <span>${item.sub}</span>
          </div>`;
        row.addEventListener("click", () => toast("Скоро можно будет начать урок."));
        list.appendChild(row);
      }
    });
  }

  function syncTopicBody() {
    const T = D.topic;
    const label = $("#theory-section-label");
    const list = $("#theory-list-body");
    list.innerHTML = "";
    const ct = state.curriculumTopic;
    if (ct && ct.title) {
      if (label) label.textContent = state.topicModuleTitle || "Тема";
      const progress = getTopicProgress(ct);
      const pct = topicProgressPct(ct);
      const lc = getLearningContent(ct);
      const hero = document.createElement("div");
      hero.className = "lesson-card lesson-card--hero";
      hero.innerHTML = `
        <div class="tf-top">
          <strong>${ct.title}</strong>
          <span class="badge-read">${pct}% · личный прогресс</span>
        </div>
        <p>${goalHintText()}</p>
        <div class="tf-bar-track"><div class="tf-bar-fill" style="width:${pct}%"></div></div>`;
      list.appendChild(hero);

      if (lc) {
        const openLesson = document.createElement("button");
        openLesson.type = "button";
        openLesson.className = "lesson-action";
        openLesson.id = "btn-open-theory-lesson";
        openLesson.textContent = "Открыть полноэкранный урок";
        list.appendChild(openLesson);

        (lc.theory || []).forEach((block) => {
          const row = document.createElement("div");
          row.className = "theory-item theory-featured";
          row.innerHTML = `
            <div class="tf-top">
              <strong>${block.title}</strong>
              <span class="badge-read">Теория</span>
            </div>
            <p class="theory-block-body">${block.body}</p>`;
          list.appendChild(row);
        });
        const action = document.createElement("button");
        action.type = "button";
        action.className = "lesson-action";
        action.textContent = progress.theoryDone
          ? "Теория пройдена — перейти к практике"
          : "Отметить теорию прочитанной";
        action.addEventListener("click", () => {
          if (!progress.theoryDone) {
            completeTopicStep("theory");
            toast("Теория отмечена как пройденная");
          } else {
            openActivity("practice", "easy");
          }
        });
        list.appendChild(action);
      } else {
        const note = document.createElement("div");
        note.className = "lesson-card theory-muted";
        note.innerHTML =
          "<p><strong>Контент по теме готовится.</strong> Отдельная теория и задания для этой подтемы ещё не подключены — выбери другую тему или зайди позже.</p>";
        list.appendChild(note);
      }
      iconsRefresh();
      return;
    }
    if (label) label.textContent = "Теория";
    appendTheoryItems(list, T);
    iconsRefresh();
  }

  function renderTopic(topic, sd, moduleTitle) {
    closeActivity();
    const T = D.topic;
    state.curriculumTopic = topic && topic.title ? topic : null;
    state.topicModuleTitle =
      state.curriculumTopic && moduleTitle != null && String(moduleTitle).trim()
        ? String(moduleTitle).trim()
        : null;
    const detail = sd || getSubjectDetail(state.subjectKey, state.grade);
    $("#tp-title").textContent = topic?.title || T.title;
    const subjTitle = detail?.title || "Предмет";
    $("#tp-meta").textContent = `${subjTitle} · ${state.grade} класс`;
    const row = catalogRowForDetailKey(state.grade, state.subjectKey);
    const barPct = state.curriculumTopic
      ? topicProgressPct(state.curriculumTopic, state.grade, state.subjectKey)
      : row
        ? subjectProgressPct(row, state.grade)
        : clampPct(T.barWidthPct);
    $("#tp-bar").style.width = `${barPct}%`;
    state.topicMode = "theory";
    refreshTopicTestLock();
    updateTopicModeDescriptors();
    syncModeTiles();
    syncTopicBody();
  }

  function renderNotes() {
    const grid = $("#notes-grid");
    grid.innerHTML = "";
    (D.notes?.bubbles || []).forEach((b) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "bubble";
      tile.dataset.bubbleSubject = b.subject;
      tile.innerHTML = `
        <div class="bubble-ico"><i data-lucide="${b.icon}"></i></div>
        <strong>${b.subject}</strong>
        <span>${b.grade} · скоро</span>`;
      grid.appendChild(tile);
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "bubble bubble--cta";
    add.dataset.newDialog = "1";
    add.innerHTML = `<i data-lucide="plus"></i><strong>Новый диалог</strong><span>скоро</span>`;
    grid.appendChild(add);
    $("#dock-hint").textContent = D.notes?.dock || "";
  }

  function onAppClick(e) {
    const app = $("#app");
    if (!app?.contains(e.target)) return;

    const nav = e.target.closest(".nav-seg");
    if (nav && app.contains(nav)) {
      const t = nav.dataset.nav;
      if (t) {
        e.preventDefault();
        setTab(t);
      }
      return;
    }

    if (e.target.closest("#btn-home-challenge")) {
      state.subjectKey = "math";
      renderSubjectDetail();
      setTab("subjects");
      openStack("subject-detail");
      toast((D.copy && D.copy.challenge) || "Открываем задачи.");
      return;
    }

    if (e.target.closest("#home-quiz-btn")) {
      toast((D.copy && D.copy.quiz) || "QUIZ скоро.");
      state.subjectKey = "math";
      renderSubjectDetail();
      setTab("subjects");
      openStack("subject-detail");
      return;
    }

    const ht = e.target.closest("[data-heart-toggle]");
    if (ht) {
      e.preventDefault();
      e.stopPropagation();
      const row =
        ht.closest(".subject-row") ||
        ht.closest(".subj-row") ||
        ht.closest(".fav-card");
      if (row?.dataset.subjectId) {
        toggleFavoriteId(state.grade, row.dataset.subjectId);
        refreshProgressAfterFav();
      }
      return;
    }

    const hs = e.target.closest("[data-home-subject]");
    if (hs) {
      state.subjectKey = routeSubjectKey(hs.getAttribute("data-home-subject"));
      renderSubjectDetail();
      setTab("subjects");
      openStack("subject-detail");
      return;
    }

    const fav = e.target.closest(".fav-card-open[data-open-subject]");
    if (fav) {
      state.subjectKey = fav.dataset.openSubject;
      renderSubjectDetail();
      setTab("subjects");
      openStack("subject-detail");
      return;
    }

    const bub = e.target.closest("#notes-grid .bubble[data-bubble-subject]");
    if (bub) {
      toast(`${bub.dataset.bubbleSubject}: ${(D.copy && D.copy.aiChat) || "Чат с AI."}`);
      return;
    }

    if (e.target.closest(".bubble--cta[data-new-dialog]")) {
      toast((D.copy && D.copy.aiChat) || "Новый диалог.");
      return;
    }

    if (e.target.closest("#btn-add-subject")) {
      openSheet("add-subjects");
      return;
    }

    if (e.target.closest("#btn-profile-my-class")) {
      openSheet("grade");
      return;
    }

    if (e.target.closest("#btn-profile-goal")) {
      openSheet("goal");
      return;
    }

    const sheetX = e.target.closest("[data-sheet-close]");
    if (sheetX && $("#app")?.contains(sheetX)) {
      closeSheet(sheetX.getAttribute("data-sheet-close") || "");
      return;
    }

    const pickGr = e.target.closest("[data-pick-grade-sheet]");
    if (pickGr && $("#sheet-grade")?.contains(pickGr)) {
      setUserGrade(Number(pickGr.getAttribute("data-pick-grade-sheet")));
      closeSheet("grade");
      return;
    }

    const pickGoal = e.target.closest("[data-pick-goal-sheet]");
    if (pickGoal && $("#sheet-goal")?.contains(pickGoal)) {
      prefs.studyGoal = pickGoal.getAttribute("data-pick-goal-sheet") || null;
      savePrefs();
      renderHome();
      renderProfile();
      closeSheet("goal");
      toast("Цель обновлена");
      return;
    }

    if (e.target.closest("#btn-profile-settings")) {
      toast((D.copy && D.copy.settings) || "Настройки.");
      return;
    }

    if (e.target.closest("#btn-dock-camera")) {
      toast((D.copy && D.copy.camera) || "Камера.");
      return;
    }

    if (e.target.closest("#btn-sd-search")) {
      openSheet("topic-search");
      return;
    }

    const modeBtn = e.target.closest("#topic-mode-row .mode-tile[data-mode]");
    if (modeBtn) {
      const m = modeBtn.dataset.mode;
      if (m === "theory") {
        const ct = state.curriculumTopic;
        const lc = getLearningContent(ct);
        if (isCurriculumTopic(ct) && lc) {
          state.topicMode = "theory";
          syncModeTiles();
          openActivity("theory", "easy");
          return;
        }
        state.topicMode = "theory";
        syncModeTiles();
        syncTopicBody();
        return;
      }
      if (m === "practice") {
        state.topicMode = "practice";
        syncModeTiles();
        syncTopicBody();
        openActivity("practice", state.practiceDiff || "med");
        return;
      }
      if (m === "test") {
        if (!state.topicTestUnlocked) {
          const ct = state.curriculumTopic;
          const lc = getLearningContent(ct);
          if (isCurriculumTopic(ct) && !lc) {
            toast("Контент по теме готовится — тест пока недоступен.");
          } else {
            toast(learningPracticeGateToastText("mode"));
          }
          return;
        }
        state.topicMode = "test";
        syncModeTiles();
        syncTopicBody();
        openActivity("test", state.testDiff || "easy");
        return;
      }
    }

    if (e.target.closest("#act-back")) {
      closeActivity();
      return;
    }

    if (e.target.closest("#act-theory-to-practice")) {
      state.activityView = "practice";
      renderActivity();
      return;
    }
    if (e.target.closest("#act-theory-mark")) {
      const ct = state.curriculumTopic;
      if (!isCurriculumTopic(ct)) return;
      if (getTopicProgress(ct, state.grade, state.subjectKey).theoryDone) return;
      completeTopicStep("theory");
      toast("Урок отмечен как изученный.");
      state.activityView = "practice";
      renderActivity();
      return;
    }
    if (e.target.closest("#act-test-to-theory")) {
      state.activityView = "theory";
      renderActivity();
      return;
    }
    if (e.target.closest("#btn-open-theory-lesson")) {
      openActivity("theory", "easy");
      return;
    }

    const actTab = e.target.closest("#act-main-tabs [data-act-tab]");
    if (actTab) {
      const t = actTab.dataset.actTab;
      if (t === "theory") {
        state.activityView = "theory";
        renderActivity();
        return;
      }
      if (t === "practice") {
        state.activityView = "practice";
        renderActivity();
        return;
      }
      if (t === "test") {
        if (actTab.classList.contains("act-tab-v8--disabled")) {
          const lc = getLearningContent(state.curriculumTopic);
          const prog = getTopicProgress(state.curriculumTopic);
          if (lc && !Progress.isTestUnlocked(prog, lc)) {
            toast(learningPracticeGateToastText("tab"));
          } else if (isCurriculumTopic(state.curriculumTopic) && !lc) {
            toast("Контент по теме готовится.");
          }
          return;
        }
        state.activityView = "test";
        renderActivity();
        return;
      }
    }

    const diffBtn = e.target.closest("#act-diff-row [data-act-diff]");
    if (diffBtn) {
      const d = diffBtn.dataset.actDiff;
      if (state.activityView === "practice") state.practiceDiff = d;
      else state.testDiff = d;
      renderActivity();
      return;
    }

    if (e.target.closest("[data-act-premium]")) {
      toast("Premium: демо — расскажем о подписке позже.");
      return;
    }

    if (e.target.closest("#act-cta")) {
      if (isCurriculumTopic(state.curriculumTopic)) {
        const lc = getLearningContent(state.curriculumTopic);
        const progress = getTopicProgress(state.curriculumTopic);
        if (!lc) {
          closeActivity();
          return;
        }
        if (state.activityView === "practice" && Progress.isPracticePassed(progress, lc)) {
          openActivity("test", "easy");
          return;
        }
        if (state.activityView === "test" && !Progress.isTestUnlocked(progress, lc)) {
          openActivity("practice", "easy");
          return;
        }
        if (state.activityView === "test" && Progress.isTestPassed(progress, lc)) {
          closeActivity();
          return;
        }
        toast(
          state.activityView === "practice"
            ? "Решай задания практики — подсказки в блоке выше."
            : "Ответь на все вопросы теста."
        );
        return;
      }
      toast(
        state.activityView === "practice"
          ? "Открываем задачу…"
          : "Тест в этом режиме — выбери тему из программы с интерактивом."
      );
      return;
    }
  }

  function bind() {
    $("#app").addEventListener("click", onAppClick);

    $("#sd-search-input")?.addEventListener("input", (ev) => filterTopics(ev.target.value));
    $("#sd-search-clear")?.addEventListener("click", (ev) => {
      ev.preventDefault();
      const i = $("#sd-search-input");
      if (i) i.value = "";
      filterTopics("");
      i?.focus();
    });

    $("#sd-back").addEventListener("click", closeStack);
    $("#tp-back").addEventListener("click", closeTopic);

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const ht = document.activeElement?.closest?.("[data-heart-toggle]");
      if (ht) {
        const row =
          ht.closest(".subject-row") ||
          ht.closest(".subj-row") ||
          ht.closest(".fav-card");
        if (row?.dataset.subjectId) {
          toggleFavoriteId(state.grade, row.dataset.subjectId);
          refreshProgressAfterFav();
        }
      }
    });
  }

  function loadMathCurriculumIntoD() {
    applyEmbeddedMathCurriculum();
    const ver = encodeURIComponent(D.curriculumMathVersion || "1");
    const grades = [5, 6, 7, 8, 9];
    if (!D.subjectDetailByGrade || typeof D.subjectDetailByGrade !== "object") {
      D.subjectDetailByGrade = {};
    }
    return Promise.all([
      ...grades.map((g) =>
        fetch(`curriculum/math/${g}.json?v=${ver}`)
          .then((res) => {
            if (!res.ok) throw new Error("not ok");
            return res.json();
          })
          .catch((error) => {
            console.warn(`Не удалось загрузить curriculum/math/${g}.json`, error);
            return null;
          })
      ),
      fetch(`curriculum/math/learning-slice-ids.json?v=${ver}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]).then((bundle) => {
      const sliceJson = bundle[bundle.length - 1];
      const results = bundle.slice(0, -1);
      if (
        sliceJson &&
        sliceJson.byGrade &&
        typeof sliceJson.byGrade === "object" &&
        !Array.isArray(sliceJson.byGrade)
      ) {
        D.mathLearningKpiByGrade = { ...(D.mathLearningKpiByGrade || {}), ...sliceJson.byGrade };
      }
      results.forEach((data, i) => {
        if (!data || !mathTopicsLookModular(data.topics)) return;
        const g = grades[i];
        if (!D.subjectDetailByGrade[g]) D.subjectDetailByGrade[g] = {};
        D.subjectDetailByGrade[g].math = {
          title: data.title || "Математика",
          topics: data.topics,
        };
      });
      backfillMathFromEmbedForGaps();
    });
  }

  /** QA: только localhost / 127.0.0.1 — сброс topicProgress без смены storageKey (не включать на публичном хосте). */
  function exposeQaPilotTools() {
    const allow = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (!allow) return;
    window.__SHANKS_QA__ = {
      storageKey: PREFS_KEY,
      resetPilotTopicProgress() {
        try {
          const raw = localStorage.getItem(PREFS_KEY);
          if (!raw) return { ok: false, reason: "no prefs" };
          const p = JSON.parse(raw);
          if (!p || typeof p !== "object") return { ok: false, reason: "bad prefs" };
          p.topicProgress = {};
          localStorage.setItem(PREFS_KEY, JSON.stringify(p));
          return { ok: true };
        } catch (e) {
          return { ok: false, reason: String(e.message || e) };
        }
      },
      reload() {
        location.reload();
      },
    };
  }

  function init() {
    initPrefs();
    loadMathCurriculumIntoD()
      .catch((error) => console.warn("Не удалось подготовить curriculum", error))
      .finally(() => {
        $("#loading")?.classList.add("is-hidden");
        exposeQaPilotTools();

        if (!prefs.onboardingCompleted) {
          $("#main-app")?.classList.add("main-hidden");
          showOnboardingUI();
          bindOnboarding();
          iconsRefresh();
          return;
        }

        startMainApp();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
