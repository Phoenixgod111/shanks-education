/**
 * Shanks — навигация, избранное по классам, «Мой прогресс» = среднее по избранным.
 * Консенсус 15 «агентов»: единый каталог, LS на класс, деталка тянет % из каталога,
 * главная синхронизируется с вкладкой класса, карточки одной ширины, кривизна — в CSS.
 */
(function () {
  "use strict";

  const D = window.SHANKS_DATA || {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const PREFS_KEY = D.storageKey || "shanks_prefs_v2";

  const SHEET_BY_KIND = {
    "add-subjects": "sheet-add-subjects",
    grade: "sheet-grade",
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
  };

  let prefs = { favoritesByGrade: {}, initialized: false };
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
    return { favoritesByGrade: {}, initialized: false };
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
        prefs.favoritesByGrade[String(g)] = [];
      });
      prefs.initialized = true;
      prefs.onboardingCompleted = false;
      prefs.grade = null;
      prefs.studyGoal = null;
      savePrefs();
    } else {
      ensureGradeBuckets();
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
      if (!onbState.goalId) {
        toast("Выбери цель — так мы лучше подскажем по приложению.");
        return;
      }
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
    const g = grade != null ? grade : state.grade;
    const byGrade = D.subjectDetailByGrade?.[g]?.[key];
    if (byGrade) return byGrade;
    return D.subjectDetail?.[key] || D.subjectDetail?.math;
  }

  function catalogRowForDetailKey(grade, detailKey) {
    return getCatalog(grade).find((r) => routeSubjectKey(r.id) === detailKey);
  }

  function computeOverallAverage(grade) {
    const catalog = getCatalog(grade);
    const fav = new Set(getFavoritesForGrade(grade));
    const favRows = catalog.filter((r) => fav.has(r.id));
    if (favRows.length === 0) return { pct: 0, n: 0 };
    const sum = favRows.reduce((s, r) => s + (Number(r.pct) || 0), 0);
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
    state.activityView = view;
    if (view === "practice") {
      if (diff) state.practiceDiff = diff;
    } else {
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

  function renderActivity() {
    const root = $("#stack-activity");
    if (!root) return;
    const view = state.activityView;
    const diff = view === "practice" ? state.practiceDiff : state.testDiff;
    root.dataset.view = view;
    root.dataset.diff = diff;

    const tTitle = $("#tp-title");
    const tMeta = $("#tp-meta");
    const titleEl = $("#act-title");
    const metaEl = $("#act-meta");
    if (titleEl) titleEl.textContent = tTitle?.textContent || D.topic?.title || "Тема";
    if (metaEl) metaEl.textContent = tMeta?.textContent || D.topic?.subjectLine || "";

    const pack = view === "practice" ? getPracticePack(diff) : getTestPack(diff);
    const pctEl = $("#act-pct-label");
    const fillEl = $("#act-progress-fill");
    if (pctEl) pctEl.textContent = pack.progressCaption || "";
    if (fillEl) fillEl.style.width = `${Number(pack.progressPct) || 0}%`;

    $$("#act-main-tabs .act-tab-v8").forEach((btn) => {
      const t = btn.dataset.actTab;
      const on =
        (t === "practice" && view === "practice") || (t === "test" && view === "test");
      btn.classList.toggle("act-tab-v8--on", on);
    });

    const kicker = $("#act-diff-kicker");
    if (kicker)
      kicker.textContent =
        view === "practice" ? "Сложность практики" : "Сложность теста";

    const row = $("#act-diff-row");
    if (row) {
      const keys = ["easy", "med", "hard"];
      const Lp = { easy: "Лёгкая", med: "Средняя", hard: "Тяжёлая" };
      const Lt = { easy: "Лёгкий", med: "Средний", hard: "Тяжёлый" };
      const L = view === "practice" ? Lp : Lt;
      row.innerHTML = keys
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

    const body = $("#act-body");
    const foot = $("#act-footer");
    if (body) body.innerHTML = "";
    if (foot) foot.innerHTML = "";

    if (view === "practice") {
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
    const sum = items.reduce((s, x) => s + (Number(x.pct) || 0), 0);
    return Math.round(sum / items.length);
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
        const muted = !r.pct;
        row.innerHTML = `
          <i data-lucide="${r.icon}" class="subj-ico"></i>
          <div class="subj-meta">
            <strong>${r.name}</strong>
            <span>${state.grade} класс</span>
          </div>
          <div class="pb-track"><div class="pb-fill" style="width:${muted ? 0 : r.pct}%"></div></div>
          <span class="heart-hit" data-heart-toggle tabindex="0" role="button" aria-label="Убрать из избранного">
            <i data-lucide="heart" class="ico-heart-fill"></i>
          </span>
          <span class="subj-pct ${muted ? "subj-pct--muted" : ""}">${r.pct}%</span>`;
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
        stat.innerHTML = `
          <span class="heart-hit" data-heart-toggle tabindex="0" role="button" aria-label="Убрать из избранного">
            <i data-lucide="heart" class="ico-heart-fill"></i>
          </span>
          <span class="fav-pct">${r.pct}%</span>`;

        rowInner.appendChild(open);
        rowInner.appendChild(stat);
        wrap.appendChild(accent);
        wrap.appendChild(rowInner);
        fav.appendChild(wrap);
      });
    }
    iconsRefresh();
  }

  function appendTopicCard(tl, t, sd, nested) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "topic-card" + (nested ? " topic-card--nested" : "");
    card.innerHTML = `
        <div class="row-between">
          <h4>${t.title}</h4>
          <span class="topic-pct">${t.pct}%</span>
        </div>
        <div class="tb-track"><div class="tb-fill" style="width:${t.pct}%"></div></div>`;
    card.addEventListener("click", () => {
      renderTopic(t, sd);
      openTopicOverDetail();
    });
    tl.appendChild(card);
  }

  function topicAccordionKey(blockIndex) {
    return `${state.subjectKey}-${state.grade}-m${blockIndex}`;
  }

  function renderSubjectDetail() {
    const sd = getSubjectDetail(state.subjectKey, state.grade);
    if (!sd) return;
    $("#sd-class").textContent = `${state.grade} класс`;
    const row = catalogRowForDetailKey(state.grade, state.subjectKey);
    $("#sd-title").textContent = row?.name || sd.title;
    const heroPct = row ? row.pct : sd.heroPct;
    $("#sd-pct-label").textContent = `${heroPct}% изучено`;
    $("#sd-hero-fill").style.width = `${heroPct}%`;

    const tl = $("#sd-topics");
    tl.innerHTML = "";
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

        block.items.forEach((t) => appendTopicCard(panel, t, sd, true));

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
    filterTopics($("#sd-search-input")?.value || "");
  }

  function syncModeTiles() {
    const mode = state.topicMode;
    const unlocked = state.topicTestUnlocked;
    $$("#topic-mode-row .mode-tile").forEach((btn) => {
      const m = btn.dataset.mode;
      const isTest = m === "test";
      const on = !isTest && m === mode;
      btn.classList.toggle("mode-tile--on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      if (isTest) {
        btn.classList.toggle("mode-tile--dim", !unlocked);
        const ico = btn.querySelector("[data-lucide]");
        if (ico) ico.setAttribute("data-lucide", unlocked ? "clipboard-check" : "lock");
        const sub = btn.querySelector(".m-sub");
        if (sub) sub.textContent = unlocked ? "Доступен" : "Закрыт";
      } else {
        btn.classList.remove("mode-tile--dim");
      }
    });
    iconsRefresh();
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
    if (label) label.textContent = "Теория";
    appendTheoryItems(list, T);
    iconsRefresh();
  }

  function renderTopic(topic, sd) {
    closeActivity();
    const T = D.topic;
    const detail = sd || getSubjectDetail(state.subjectKey, state.grade);
    $("#tp-title").textContent = topic?.title || T.title;
    const subjTitle = detail?.title || "Предмет";
    $("#tp-meta").textContent = `${subjTitle} · ${state.grade} класс`;
    const row = catalogRowForDetailKey(state.grade, state.subjectKey);
    const barPct = row ? Math.min(100, Math.max(0, row.pct)) : T.barWidthPct;
    $("#tp-bar").style.width = `${barPct}%`;
    state.topicMode = "theory";
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
        <span>${b.grade}</span>`;
      grid.appendChild(tile);
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "bubble bubble--cta";
    add.dataset.newDialog = "1";
    add.innerHTML = `<i data-lucide="plus"></i><strong>Новый диалог</strong>`;
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
      setTab("subjects");
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
        state.topicMode = "theory";
        syncModeTiles();
        syncTopicBody();
        return;
      }
      if (m === "practice") {
        state.topicMode = "theory";
        syncModeTiles();
        syncTopicBody();
        openActivity("practice", state.practiceDiff || "med");
        return;
      }
      if (m === "test") {
        if (!state.topicTestUnlocked) {
          toast("Тест закрыт: пройди практику по теме.");
          return;
        }
        state.topicMode = "theory";
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

    const actTab = e.target.closest("#act-main-tabs [data-act-tab]");
    if (actTab) {
      const t = actTab.dataset.actTab;
      if (t === "theory") {
        closeActivity();
        return;
      }
      if (t === "practice") {
        state.activityView = "practice";
        renderActivity();
        return;
      }
      if (t === "test") {
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
      toast(
        state.activityView === "practice"
          ? "Открываем задачу…"
          : "Доступ к тестам (демо)."
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

  function init() {
    initPrefs();
    $("#loading")?.classList.add("is-hidden");

    if (!prefs.onboardingCompleted) {
      $("#main-app")?.classList.add("main-hidden");
      showOnboardingUI();
      bindOnboarding();
      iconsRefresh();
      return;
    }

    startMainApp();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
