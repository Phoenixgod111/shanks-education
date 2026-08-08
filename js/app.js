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
  const PREFS_SCHEMA_VERSION = Number(D.prefsSchemaVersion) || 3;

  const SHEET_BY_KIND = {
    "add-subjects": "sheet-add-subjects",
    grade: "sheet-grade",
    textbook: "sheet-textbook",
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
    /** null — оглавление теории; число — индекс в последовательности блоков (теория → разобранные → faded) для g8-u01 v2 */
    theoryNavSeq: null,
    /** dialog | toc | reader — для тем с lessonDialog */
    theoryPanel: "toc",
    lessonDialogCursor: null,
    theoryJumpBlockId: null,
    /** fullscreen разбор задачи из практики/теста */
    activityBreakdown: null,
    /** попытки по id шага lessonDialog: { wrong, solutionRevealed, aiReplied } */
    lessonStepAttempts: {},
    /** Реплики ученика, которыми он сам продвигает диалог: { [stepId]: text } */
    lessonStudentReplies: {},
  };

  let prefs = { favoritesByGrade: {}, initialized: false, topicProgress: {}, schemaVersion: PREFS_SCHEMA_VERSION };
  let toastTimer = null;
  let mainBound = false;
  let authHookBound = false;
  let cloudSyncTimer = null;
  let currentAuthUser = null;
  let cloudBootstrapUserId = null;
  let cloudBootstrapPromise = null;
  let cloudReadyUserId = null;
  let cloudPrefsSyncQueue = Promise.resolve();
  let cloudLessonSyncQueue = Promise.resolve();

  const onbState = {
    displayName: "",
    grade: null,
    subjects: ["math"],
    textbookId: null,
    topicId: null,
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

  function migratePrefs(input) {
    const next = input && typeof input === "object" ? { ...input } : {};
    const from = Number(next.schemaVersion) || 1;
    if (from < 3) {
      if (!next.displayName && typeof next.name === "string") next.displayName = next.name;
      if (!next.textbookId) next.textbookId = "universal";
      if (!next.lessonPosition || typeof next.lessonPosition !== "object") next.lessonPosition = null;
      /* topicProgress deliberately remains canonical and is never nested under a textbook. */
      delete next.studyGoal;
    }
    next.schemaVersion = PREFS_SCHEMA_VERSION;
    next.prefsSchemaVersion = PREFS_SCHEMA_VERSION;
    return next;
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {}
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(() => {
      const cloud = window.SHANKS_CLOUD;
      if (
        !currentAuthUser ||
        cloudReadyUserId !== String(currentAuthUser.id || "") ||
        typeof cloud?.syncPrefsProgress !== "function"
      ) return;
      const snapshot = JSON.parse(JSON.stringify(prefs));
      cloudPrefsSyncQueue = cloudPrefsSyncQueue
        .catch(() => {})
        .then(() => cloud.syncPrefsProgress({ prefs: snapshot }));
    }, 700);
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
    prefs = migratePrefs(loadPrefs());
    if (!prefs || typeof prefs !== "object") prefs = {};

    const legacy =
      prefs.initialized === true &&
      prefs.onboardingCompleted !== true &&
      prefs.grade != null &&
      prefs.grade !== "";

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
      prefs.displayName = "";
      prefs.textbookId = null;
      prefs.lessonPosition = null;
      prefs.topicProgress = {};
      savePrefs();
    } else {
      ensureGradeBuckets();
      ensureTopicProgressStore();
      savePrefs();
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
    if (!getTextbooks(n).some((book) => book.id === prefs.textbookId)) {
      prefs.textbookId = getTextbooks(n).find((book) => book.universal)?.id || getTextbooks(n)[0]?.id || null;
    }
    prefs.trajectoryVersion = trajectoryFor(prefs.textbookId)?.version || "1";
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
    const nameEl = $("#profile-name");
    if (nameEl) nameEl.textContent = prefs.displayName || "Ученик Shanks";
    const textbook = getTextbooks(state.grade).find((book) => book.id === prefs.textbookId);
    const textbookEl = $("#profile-textbook-value");
    if (textbookEl) textbookEl.textContent = textbook?.title || "Универсальная программа";
    renderAuthPanel();
  }

  function renderAuthPanel() {
    const panel = $("#auth-panel");
    if (!panel) return;
    const auth = window.SHANKS_AUTH;
    const cloud = window.SHANKS_CLOUD;
    const authAvailable = !!auth && (typeof cloud?.isConfigured !== "function" || cloud.isConfigured());
    const title = $("#auth-title");
    const status = $("#auth-status");
    const form = $("#auth-form");
    const signout = $("#btn-auth-signout");
    panel.classList.toggle("auth-panel--available", authAvailable);
    if (currentAuthUser) {
      if (title) title.textContent = currentAuthUser.email || prefs.displayName || "Аккаунт подключён";
      if (status) status.textContent = cloud ? "Облачная синхронизация доступна" : "Вход выполнен";
      form?.toggleAttribute("hidden", true);
      signout?.toggleAttribute("hidden", false);
    } else {
      if (title) title.textContent = authAvailable ? "Сохрани прогресс в облаке" : "Локальный профиль";
      if (status) status.textContent = authAvailable
        ? "Войди, чтобы продолжать на другом устройстве"
        : "Прогресс хранится на этом устройстве · облако ещё не настроено";
      form?.toggleAttribute("hidden", !authAvailable);
      signout?.toggleAttribute("hidden", true);
    }
  }

  function authCredentials() {
    return {
      email: String($("#auth-email")?.value || "").trim(),
      password: String($("#auth-password")?.value || ""),
    };
  }

  async function syncPendingCloudActions() {
    const cloud = window.SHANKS_CLOUD;
    if (!currentAuthUser || !cloud) return;
    if (prefs.subjectVote && typeof cloud.voteForSubject === "function") {
      await cloud.voteForSubject(prefs.subjectVote).catch(() => null);
    }
    const reports = Array.isArray(prefs.generatedContentReports) ? prefs.generatedContentReports : [];
    if (!reports.length || typeof cloud.trackEvent !== "function") return;
    const results = await Promise.all(reports.map((payload) => cloud.trackEvent("content.reported", payload).catch(() => null)));
    if (results.every((result) => result?.ok)) {
      prefs.generatedContentReports = [];
      savePrefs();
    }
  }

  async function finishCloudSignIn(user) {
    currentAuthUser = user || null;
    if (!currentAuthUser) return;
    const userId = String(currentAuthUser.id || "");
    if (cloudBootstrapUserId === userId) {
      if (cloudBootstrapPromise) await cloudBootstrapPromise;
      return;
    }
    cloudBootstrapUserId = userId;
    cloudReadyUserId = null;
    cloudBootstrapPromise = (async () => {
      const cloud = window.SHANKS_CLOUD;
      if (typeof cloud?.migrateLocalStorage === "function") {
        const migrated = await cloud.migrateLocalStorage();
        if (!migrated?.ok) throw new Error(migrated?.reason || "cloud_migration_failed");
        const canPull =
          migrated?.ok &&
          !migrated.migrated &&
          ["already_migrated", "no_local_data", "no_meaningful_local_data", "remote_data_exists"].includes(
            migrated.reason,
          );
        if (canPull && typeof cloud.syncPrefsProgress === "function") {
          const pulled = await cloud.syncPrefsProgress({ strategy: "remote-wins", writeLocal: true });
          if (!pulled?.ok || !pulled.prefs) throw new Error(pulled?.reason || "cloud_pull_failed");
          prefs = migratePrefs(pulled.prefs);
          initPrefs();
          applyPrefsGradeToState();
          renderHome();
          renderSubjects();
          renderProfile();
          iconsRefresh();
        }
      }
      await syncPendingCloudActions();
      cloudReadyUserId = userId;
      renderAuthPanel();
    })();
    try {
      await cloudBootstrapPromise;
    } catch (error) {
      cloudBootstrapUserId = null;
      cloudReadyUserId = null;
      throw error;
    } finally {
      cloudBootstrapPromise = null;
    }
  }

  async function runAuthAction(kind) {
    const auth = window.SHANKS_AUTH;
    const cloud = window.SHANKS_CLOUD;
    if (!auth || (typeof cloud?.isConfigured === "function" && !cloud.isConfigured())) {
      return toast("Облачный вход ещё не настроен.");
    }
    try {
      if (kind === "signout") {
        const result = await auth.signOut();
        if (!result?.ok) throw result?.error || new Error(result?.reason || "signout_failed");
        currentAuthUser = null;
        cloudBootstrapUserId = null;
        cloudBootstrapPromise = null;
        cloudReadyUserId = null;
        renderAuthPanel();
        toast("Вы вышли из аккаунта");
        return;
      }
      const { email, password } = authCredentials();
      if (!email || password.length < 8) {
        toast("Укажи email и пароль минимум из 8 символов");
        return;
      }
      const result = kind === "signup" ? await auth.signUp(email, password) : await auth.signIn(email, password);
      if (!result?.ok) throw result?.error || new Error(result?.reason || "auth_failed");
      if (result.confirmationRequired) {
        toast("Проверь почту и подтверди регистрацию");
        return;
      }
      await finishCloudSignIn(result.user);
      toast(kind === "signup" ? "Аккаунт создан" : "Прогресс синхронизирован");
      renderAuthPanel();
    } catch (error) {
      toast("Не удалось выполнить вход. Проверь данные.");
    }
  }

  async function bindAuthHook() {
    if (authHookBound || !window.SHANKS_AUTH) {
      if (cloudBootstrapPromise) await cloudBootstrapPromise;
      return;
    }
    authHookBound = true;
    const auth = window.SHANKS_AUTH;
    const refresh = (_event, session) => {
      currentAuthUser = session?.user || null;
      renderAuthPanel();
      if (currentAuthUser) finishCloudSignIn(currentAuthUser).catch(() => {});
      else {
        cloudBootstrapUserId = null;
        cloudBootstrapPromise = null;
        cloudReadyUserId = null;
      }
    };
    try {
      if (typeof auth.onAuthStateChange === "function") auth.onAuthStateChange(refresh);
      else if (typeof auth.subscribe === "function") auth.subscribe(refresh);
      else if (typeof auth.onChange === "function") auth.onChange(refresh);
    } catch (e) {}
    if (typeof auth.getUser !== "function") return;
    const result = await auth.getUser();
    currentAuthUser = result?.ok ? result.user : null;
    renderAuthPanel();
    if (currentAuthUser) await finishCloudSignIn(currentAuthUser);
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
    const catalog = getCatalog(onbState.grade).filter((r) => routeSubjectKey(r.id) === "math");
    onbState.subjects = ["math"];
    catalog.forEach((r) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "onb-subject-chip onb-subject-chip--on";
      btn.innerHTML = `
        <span class="onb-ico"><i data-lucide="${r.icon}"></i></span>
        <span>${r.name}</span>`;
      wrap.appendChild(btn);
    });
    iconsRefresh();
    const next = $("#onb-subjects-next");
    if (next) next.disabled = false;
  }

  function normalizeTextbooks(raw, grade) {
    let list = [];
    if (Array.isArray(raw)) list = raw;
    else if (Array.isArray(raw?.lines)) list = raw.lines.filter((book) => Number(book?.grade) === Number(grade));
    else if (Array.isArray(raw?.byGrade?.[grade])) list = raw.byGrade[grade];
    else if (Array.isArray(raw?.byGrade?.[String(grade)])) list = raw.byGrade[String(grade)];
    else if (Array.isArray(raw?.[grade])) list = raw[grade];
    else if (Array.isArray(raw?.[String(grade)])) list = raw[String(grade)];
    return list
      .map((book, index) => ({
        id: String(book?.id || book?.slug || `book-${grade}-${index}`),
        title: String(book?.title || book?.name || `Учебник ${index + 1}`),
        authors: Array.isArray(book?.authors)
          ? book.authors.join(", ")
          : String(book?.authors || book?.author || ""),
        beta: !!book?.beta || book?.status === "beta",
        universal: !!book?.universal,
      }))
      .filter((book) => book.id && book.title);
  }

  function getTextbooks(grade) {
    const embeddedCatalog = window.SHANKS_MATH_CONTENT_DATA?.catalog;
    const external = normalizeTextbooks(window.SHANKS_TEXTBOOKS || embeddedCatalog, grade);
    if (external.length) {
      return [
        ...external,
        { id: "universal", title: "Универсальная программа", authors: "", universal: true, beta: false },
      ];
    }
    return normalizeTextbooks(D.textbookFallbackByGrade, grade);
  }

  function textbookCardMarkup(book, grade, index) {
    const symbols = ["x²", "π", "Σ", "△"];
    const motif = symbols[index % symbols.length];
    const status = book.universal
      ? "Подходит для любой программы"
      : book.authors || (book.beta ? "AI-бета · соответствие уточняется" : "Маршрут учебника");
    return `
      <span class="textbook-cover textbook-cover--${(index % 4) + 1}" aria-hidden="true">
        <span class="textbook-cover-grade">${grade}</span>
        <span class="textbook-cover-symbol">${motif}</span>
        <span class="textbook-cover-brand">SHANKS MAP</span>
      </span>
      <span class="textbook-copy">
        <strong>${book.title}</strong>
        <span>${status}</span>
      </span>`;
  }

  function onbBuildTextbooksStep() {
    const wrap = $("#onb-textbook-list");
    if (!wrap) return;
    wrap.innerHTML = "";
    getTextbooks(onbState.grade).forEach((book, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "onb-goal-card textbook-card" + (onbState.textbookId === book.id ? " onb-goal-card--on" : "");
      btn.dataset.onChooseTextbook = book.id;
      btn.innerHTML = textbookCardMarkup(book, onbState.grade, index);
      wrap.appendChild(btn);
    });
    const next = $("#onb-textbook-next");
    if (next) next.disabled = !onbState.textbookId;
  }

  function flattenDetailTopics(detail) {
    const topics = [];
    (detail?.topics || []).forEach((block) => {
      if (Array.isArray(block.items)) topics.push(...block.items);
      else if (isCurriculumTopic(block)) topics.push(block);
    });
    return topics;
  }

  function trajectoryFor(textbookId) {
    const trajectories = window.SHANKS_MATH_CONTENT_DATA?.trajectories || {};
    const id = textbookId === "universal" || !textbookId ? "math-universal-5-11" : textbookId;
    return trajectories[id] || null;
  }

  function applyTextbookTrajectory(detail, grade, textbookId) {
    const trajectory = trajectoryFor(textbookId);
    if (!trajectory || !Array.isArray(trajectory.mapping)) return detail;
    const canonical = flattenDetailTopics(detail);
    const byId = new Map(canonical.map((topic) => [String(topic.id), topic]));
    const ordered = trajectory.mapping
      .slice()
      .sort((a, b) => Number(a.sourcePosition) - Number(b.sourcePosition))
      .map((entry) => byId.get(String(entry.canonicalTopicId)))
      .filter(Boolean);
    if (!ordered.length) return detail;
    const selected = getTextbooks(grade).find((book) => book.id === textbookId);
    return {
      ...detail,
      trajectoryId: trajectory.id,
      trajectoryVersion: trajectory.version,
      trajectoryStatus: trajectory.status,
      topics: [
        {
          title: selected?.universal ? "Общая программа" : `Маршрут · ${selected?.title || "учебник"}`,
          items: ordered,
        },
      ],
    };
  }

  function flattenMathTopics(grade, textbookId) {
    const raw = D.subjectDetailByGrade?.[Number(grade)]?.math || getSubjectDetail("math", grade);
    const selectedId = textbookId || (Number(grade) === Number(onbState.grade) ? onbState.textbookId : prefs.textbookId);
    return flattenDetailTopics(applyTextbookTrajectory(raw, grade, selectedId));
  }

  function onbBuildTopicStep() {
    const wrap = $("#onb-topic-list");
    if (!wrap) return;
    wrap.innerHTML = "";
    flattenMathTopics(onbState.grade).slice(0, 12).forEach((topic) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "onb-topic-btn" + (onbState.topicId === topic.id ? " onb-topic-btn--on" : "");
      btn.dataset.onChooseTopic = topic.id;
      btn.textContent = topic.title;
      wrap.appendChild(btn);
    });
  }

  function onbResetDraft() {
    onbState.displayName = "";
    onbState.grade = null;
    onbState.subjects = ["math"];
    onbState.textbookId = null;
    onbState.topicId = null;
  }

  function finishOnboarding() {
    if (!onbState.displayName.trim() || onbState.grade == null || !onbState.textbookId) return;
    prefs.displayName = onbState.displayName.trim();
    prefs.grade = onbState.grade;
    setFavoritesForGrade(onbState.grade, ["math"]);
    prefs.textbookId = onbState.textbookId;
    prefs.trajectoryVersion = trajectoryFor(onbState.textbookId)?.version || "1";
    const firstTopic = flattenMathTopics(onbState.grade)[0];
    const topicId = onbState.topicId || firstTopic?.id || null;
    prefs.lessonPosition = topicId
      ? { subjectKey: "math", grade: onbState.grade, topicId, mode: "theory", stepId: null, updatedAt: new Date().toISOString() }
      : null;
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
    bindAuthHook();
    if (!mainBound) {
      bind();
      mainBound = true;
    }
    setTab("home");
    iconsRefresh();
  }

  function bindOnboarding() {
    $("#onb-btn-start")?.addEventListener("click", () => {
      onbGoStep("identity");
      setTimeout(() => $("#onb-name")?.focus(), 50);
    });

    $("#onb-name")?.addEventListener("input", (e) => {
      onbState.displayName = e.target.value.slice(0, 32);
      const next = $("#onb-name-next");
      if (next) next.disabled = !onbState.displayName.trim();
    });

    $("#onb-name-next")?.addEventListener("click", () => {
      if (!onbState.displayName.trim()) return;
      onbGoStep("grade");
      onbBuildGradeStep();
    });

    $("#onb-grade-next")?.addEventListener("click", () => {
      if (onbState.grade == null) return;
      onbState.subjects = ["math"];
      onbGoStep("subjects");
      onbBuildSubjectsStep();
    });

    $("#onb-subjects-next")?.addEventListener("click", () => {
      onbGoStep("textbook");
      onbBuildTextbooksStep();
    });

    $("#onb-textbook-next")?.addEventListener("click", () => {
      if (!onbState.textbookId) return;
      onbGoStep("topic");
      onbBuildTopicStep();
    });

    $("#onb-finish")?.addEventListener("click", () => {
      finishOnboarding();
    });

    $("#onb-topic-unknown")?.addEventListener("click", () => {
      onbState.topicId = null;
      finishOnboarding();
    });

    $("#onboarding-root")?.addEventListener("click", (e) => {
      const gb = e.target.closest("[data-on-choose-grade]");
      if (gb) {
        onbState.grade = Number(gb.dataset.onChooseGrade);
        onbBuildGradeStep();
        return;
      }
      const textbookBtn = e.target.closest("[data-on-choose-textbook]");
      if (textbookBtn) {
        onbState.textbookId = textbookBtn.dataset.onChooseTextbook;
        onbBuildTextbooksStep();
        return;
      }
      const topicBtn = e.target.closest("[data-on-choose-topic]");
      if (topicBtn) {
        onbState.topicId = topicBtn.dataset.onChooseTopic;
        onbBuildTopicStep();
        return;
      }
      if (e.target.closest("[data-onb-back]")) {
        const step = $(".onb-step--active")?.getAttribute("data-onb-step");
        if (step === "identity") {
          onbGoStep("welcome");
        } else if (step === "grade") {
          onbGoStep("identity");
        } else if (step === "subjects") {
          onbGoStep("grade");
          onbBuildGradeStep();
        } else if (step === "textbook") {
          onbGoStep("subjects");
          onbBuildSubjectsStep();
        } else if (step === "topic") {
          onbGoStep("textbook");
          onbBuildTextbooksStep();
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
    if (kind === "textbook") renderTextbookSheet();
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

  function renderTextbookSheet() {
    const grid = $("#sheet-textbook-buttons");
    if (!grid) return;
    grid.innerHTML = "";
    getTextbooks(state.grade).forEach((book, index) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "onb-goal-card textbook-card" + (book.id === prefs.textbookId ? " onb-goal-card--on" : "");
      b.dataset.pickTextbookSheet = book.id;
      b.innerHTML = textbookCardMarkup(book, state.grade, index);
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
    return (D.catalogByGrade?.[grade] || []).filter((row) => routeSubjectKey(row.id) === "math");
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
    if (byGrade) {
      return key === "math" ? applyTextbookTrajectory(byGrade, g, prefs.textbookId) : byGrade;
    }
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
    (D.grades || [5, 6, 7, 8, 9, 10, 11]).forEach((g) => {
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
    if (!Number.isFinite(g) || g < 5 || g > 11) return;
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
    (D.grades || [5, 6, 7, 8, 9, 10, 11]).forEach((g) => {
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
    if (m && typeof m === "object") return m;
    const packet = window.SHANKS_MATH_CONTENT_DATA?.contentByTopicId?.[topic.id];
    if (!packet || typeof packet !== "object") return null;
    return {
      ...packet,
      schemaVersion: 2,
      generated: true,
      contentOrigin: "ai",
      theory: Array.isArray(packet.theory)
        ? packet.theory.map((block) => ({ ...block, id: block.id || block.stepId }))
        : [],
      practicePassRule: {
        required: Math.max(1, Math.min(1, Array.isArray(packet.practice) ? packet.practice.length : 1)),
        total: Math.max(1, Array.isArray(packet.practice) ? packet.practice.length : 1),
      },
    };
  }

  function usesStructuredTheory(lc) {
    return (
      lc &&
      Number(lc.schemaVersion) >= 2 &&
      Array.isArray(lc.theory) &&
      lc.theory.length > 0 &&
      typeof lc.theory[0]?.id === "string" &&
      lc.theory[0].id.trim().length > 0
    );
  }

  function theoryBlockById(lc, id) {
    return (lc.theory || []).find((b) => b && b.id === id) || null;
  }

  /** Порядок: блоки theory → workedExamples → fadedExamples */
  function getTheoryReaderSequence(lc) {
    const seq = [];
    (lc.theory || []).forEach((b, index) => {
      if (b && typeof b.id === "string" && b.id.trim()) seq.push({ kind: "theory", index });
    });
    (lc.workedExamples || []).forEach((_, index) => {
      seq.push({ kind: "worked", index });
    });
    (lc.fadedExamples || []).forEach((_, index) => {
      seq.push({ kind: "faded", index });
    });
    return seq;
  }

  function hasLessonDialog(lc) {
    return lc && Array.isArray(lc.lessonDialog) && lc.lessonDialog.length > 0;
  }

  function findLessonDialogStartIndex(lessonDialog, blockId) {
    if (!blockId || !Array.isArray(lessonDialog)) return 0;
    const i = lessonDialog.findIndex((s) => s && s.blockId === blockId);
    return i >= 0 ? i : 0;
  }

  function lessonDialogHasBlock(lessonDialog, blockId) {
    if (!blockId || !Array.isArray(lessonDialog)) return false;
    return lessonDialog.some((s) => s && s.blockId === blockId);
  }

  /** Индекс в getTheoryReaderSequence для блока theory с данным id (только kind === "theory"). */
  function theoryReaderSeqIndexForBlock(lc, blockId) {
    if (!blockId || !lc || !usesStructuredTheory(lc)) return null;
    const seq = getTheoryReaderSequence(lc);
    for (let si = 0; si < seq.length; si += 1) {
      const item = seq[si];
      if (item.kind !== "theory") continue;
      const b = lc.theory[item.index];
      if (b && b.id === blockId) return si;
    }
    return null;
  }

  function lessonDialogNormalizedKind(step) {
    if (!step || typeof step !== "object") return "message";
    if (step.kind === "checkpoint" && step.type === "mcq") return "multiple_choice";
    return typeof step.kind === "string" ? step.kind : "message";
  }

  function lessonDialogMentorBody(step) {
    const m = typeof step.mentorText === "string" ? step.mentorText.trim() : "";
    const t = typeof step.text === "string" ? step.text.trim() : "";
    return m || t;
  }

  function resetLessonStepAttempts() {
    state.lessonStepAttempts = {};
    state.lessonStudentReplies = {};
  }

  function getLessonStepAttempt(stepId) {
    const id = String(stepId || "");
    if (!state.lessonStepAttempts[id]) {
      state.lessonStepAttempts[id] = { wrong: 0, solutionRevealed: false, aiReplied: false };
    }
    return state.lessonStepAttempts[id];
  }

  function openLessonCatalogFromDialog() {
    state.theoryPanel = "toc";
    state.lessonDialogCursor = null;
    state.theoryNavSeq = null;
    state.theoryJumpBlockId = null;
    renderActivity();
  }

  function buildLessonAvatarAnya() {
    const el = document.createElement("span");
    el.className = "avatar-anya";
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("title", "Аня");
    const img = document.createElement("img");
    img.src = "assets/anya-mentor.jpg";
    img.alt = "";
    img.loading = "lazy";
    el.appendChild(img);
    return el;
  }

  function buildLessonAvatarGriffon() {
    const el = document.createElement("span");
    el.className = "avatar-griffon";
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("title", "Елиссей");
    const img = document.createElement("img");
    img.src = "assets/griffon-mentor.jpg";
    img.alt = "";
    img.loading = "lazy";
    el.appendChild(img);
    return el;
  }

  function lessonDialogAppendAnya(container, text, variant) {
    const row = document.createElement("div");
    row.className =
      "act-lesson-row-anya-v9" + (variant === "compact" ? " act-lesson-row-anya-v9--compact" : "");
    const avatar = buildLessonAvatarAnya();
    const col = document.createElement("div");
    col.className = "act-lesson-col-v9";
    const name = document.createElement("span");
    name.className = "act-lesson-name-v9";
    name.textContent = "Аня";
    const bubble = document.createElement("div");
    bubble.className = "act-lesson-bubble-anya-v9";
    bubble.textContent = text;
    col.appendChild(name);
    col.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(col);
    container.appendChild(row);
    return row;
  }

  function lessonDialogAppendStudent(container, text) {
    const row = document.createElement("div");
    row.className = "act-lesson-row-student-v9";
    const bubble = document.createElement("div");
    bubble.className = "act-lesson-bubble-student-v9";
    bubble.textContent = text;
    const lab = document.createElement("span");
    lab.className = "act-lesson-student-label-v9";
    lab.textContent = "Ты";
    row.appendChild(bubble);
    row.appendChild(lab);
    container.appendChild(row);
  }

  function lessonDialogAppendGriffon(container, text) {
    const row = document.createElement("div");
    row.className = "act-lesson-row-griffon-v9";
    const avatar = buildLessonAvatarGriffon();
    const col = document.createElement("div");
    col.className = "act-lesson-col-v9";
    const name = document.createElement("span");
    name.className = "act-lesson-name-v9 act-lesson-name-griffon-v9";
    name.textContent = "Елиссей";
    const breed = document.createElement("span");
    breed.className = "act-lesson-name-breed-v9";
    breed.textContent = "брюссельский гриффон";
    const bubble = document.createElement("div");
    bubble.className = "act-lesson-bubble-griffon-v9";
    bubble.textContent = text;
    col.appendChild(name);
    col.appendChild(breed);
    col.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(col);
    container.appendChild(row);
  }

  function lessonDialogAppendTurns(container, step, compact) {
    if (!Array.isArray(step?.turns) || step.turns.length === 0) return false;
    step.turns.forEach((turn) => {
      if (!turn || typeof turn.text !== "string" || !turn.text.trim()) return;
      const speaker = String(turn.speaker || "tutor").trim();
      if (speaker === "student" || speaker === "student_prompt") {
        lessonDialogAppendStudent(container, turn.text.trim());
      } else if (speaker === "griffon" || speaker === "coach") {
        lessonDialogAppendGriffon(container, turn.text.trim());
      } else {
        lessonDialogAppendAnya(container, turn.text.trim(), compact ? "compact" : false);
      }
    });
    return true;
  }

  function lessonDialogAppendSummary(container, summary) {
    if (!summary || typeof summary !== "object") return;
    const bullets = Array.isArray(summary.bullets)
      ? summary.bullets.filter((x) => typeof x === "string" && x.trim())
      : [];
    if (!bullets.length && typeof summary.text !== "string") return;
    const card = document.createElement("section");
    card.className = "act-lesson-summary-v10";
    const title = document.createElement("h3");
    title.textContent = typeof summary.title === "string" && summary.title.trim() ? summary.title.trim() : "Главное";
    card.appendChild(title);
    if (bullets.length) {
      const ul = document.createElement("ul");
      bullets.forEach((b) => {
        const li = document.createElement("li");
        li.textContent = b.trim();
        ul.appendChild(li);
      });
      card.appendChild(ul);
    } else {
      const p = document.createElement("p");
      p.textContent = summary.text.trim();
      card.appendChild(p);
    }
    container.appendChild(card);
  }

  function lessonDialogAppendMistake(container, mistake) {
    if (!mistake || typeof mistake !== "object") return;
    const card = document.createElement("section");
    card.className = "act-lesson-mistake-card-v10";
    const label = document.createElement("p");
    label.className = "act-lesson-mistake-label-v10";
    label.textContent = "Ловушка";
    const title = document.createElement("h3");
    title.textContent = typeof mistake.title === "string" && mistake.title.trim() ? mistake.title.trim() : "Типичная ошибка";
    card.appendChild(label);
    card.appendChild(title);
    if (typeof mistake.wrong === "string" && mistake.wrong.trim()) {
      const wrong = document.createElement("p");
      wrong.className = "act-lesson-mistake-wrong-v10";
      wrong.textContent = mistake.wrong.trim();
      card.appendChild(wrong);
    }
    if (typeof mistake.fix === "string" && mistake.fix.trim()) {
      const fix = document.createElement("p");
      fix.className = "act-lesson-mistake-fix-v10";
      fix.textContent = mistake.fix.trim();
      card.appendChild(fix);
    }
    container.appendChild(card);
  }

  function appendTextList(parent, className, items) {
    const list = document.createElement("div");
    list.className = className;
    (items || []).forEach((item) => {
      const el = document.createElement("div");
      el.textContent = String(item || "");
      list.appendChild(el);
    });
    parent.appendChild(list);
    return list;
  }

  function lessonDialogAppendVisual(container, visual) {
    if (!visual || typeof visual !== "object") return;
    const kind = String(visual.kind || visual.type || "note").trim();
    const card = document.createElement("figure");
    card.className = `act-lesson-visual-card-v10 act-lesson-visual-card-v10--${kind}`;
    if (typeof visual.title === "string" && visual.title.trim()) {
      const title = document.createElement("figcaption");
      title.className = "act-lesson-visual-title-v10";
      title.textContent = visual.title.trim();
      card.appendChild(title);
    }

    if (kind === "equation_parts") {
      const formula = document.createElement("div");
      formula.className = "act-lesson-equation-parts-v10";
      const parts = Array.isArray(visual.parts) ? visual.parts : [];
      parts.forEach((part) => {
        const node = document.createElement("div");
        node.className = "act-lesson-eq-part-v10" + (part.required ? " act-lesson-eq-part-v10--required" : "");
        const expr = document.createElement("strong");
        expr.textContent = part.expr || "";
        const lab = document.createElement("span");
        lab.textContent = part.label || "";
        node.appendChild(expr);
        node.appendChild(lab);
        formula.appendChild(node);
      });
      card.appendChild(formula);
    } else if (kind === "root_cases") {
      const cases = document.createElement("div");
      cases.className = "act-lesson-root-cases-v10";
      (visual.cases || []).forEach((c) => {
        const item = document.createElement("div");
        item.className = `act-lesson-root-case-v10 act-lesson-root-case-v10--${c.mood || "neutral"}`;
        const top = document.createElement("strong");
        top.textContent = c.label || "";
        const roots = document.createElement("span");
        roots.textContent = c.roots || "";
        const note = document.createElement("em");
        note.textContent = c.note || "";
        item.appendChild(top);
        item.appendChild(roots);
        item.appendChild(note);
        cases.appendChild(item);
      });
      card.appendChild(cases);
    } else if (kind === "number_line") {
      const axis = document.createElement("div");
      axis.className = "act-lesson-number-line-v10";
      (visual.points || []).forEach((p) => {
        const point = document.createElement("span");
        point.className = "act-lesson-number-point-v10";
        point.style.left = `${Number(p.pos) || 50}%`;
        point.textContent = p.label || "";
        axis.appendChild(point);
      });
      card.appendChild(axis);
      if (typeof visual.note === "string") {
        const note = document.createElement("p");
        note.className = "act-lesson-visual-note-v10";
        note.textContent = visual.note;
        card.appendChild(note);
      }
    } else if (kind === "factor_split") {
      const split = document.createElement("div");
      split.className = "act-lesson-factor-split-v10";
      const start = document.createElement("strong");
      start.textContent = visual.start || "";
      split.appendChild(start);
      appendTextList(split, "act-lesson-factor-branches-v10", visual.branches || []);
      card.appendChild(split);
    } else if (kind === "equation_flow") {
      appendTextList(card, "act-lesson-equation-flow-v10", visual.steps || []);
    } else {
      if (typeof visual.text === "string" && visual.text.trim()) {
        const p = document.createElement("p");
        p.className = "act-lesson-visual-note-v10";
        p.textContent = visual.text.trim();
        card.appendChild(p);
      }
    }

    if (typeof visual.caption === "string" && visual.caption.trim()) {
      const cap = document.createElement("p");
      cap.className = "act-lesson-visual-caption-v10";
      cap.textContent = visual.caption.trim();
      card.appendChild(cap);
    }
    container.appendChild(card);
  }

  function lessonDialogAppendRichAddons(container, step) {
    lessonDialogAppendVisual(container, step?.visual);
    lessonDialogAppendSummary(container, step?.summary);
    lessonDialogAppendMistake(container, step?.mistake);
  }

  function learningSliceTopicPosition(topicId, grade) {
    const g = String(grade ?? state.grade ?? "8");
    const slice = D.mathLearningKpiByGrade?.[g];
    if (!Array.isArray(slice) || !slice.length) return { index: 1, total: 1 };
    const i = slice.indexOf(topicId);
    return { index: i >= 0 ? i + 1 : 1, total: slice.length };
  }

  function lessonShellBreadcrumb(lc) {
    const topic = state.curriculumTopic;
    const tid = topic && topic.id ? String(topic.id) : "";
    const pos = learningSliceTopicPosition(tid, state.grade);
    const tTitle = isCurriculumTopic(topic) ? topic.title || "Тема" : "Тема";
    const n = (lc.lessonDialog && lc.lessonDialog.length) || 0;
    const c = state.lessonDialogCursor == null ? 0 : Math.min(Math.max(0, state.lessonDialogCursor), n);
    const lessonIx = Math.min(c + 1, Math.max(n, 1));
    return `Тема ${pos.index}/${pos.total}: ${tTitle} → Урок ${lessonIx}/${n || 1}`;
  }

  function canOpenQuestionBreakdown(q) {
    return !!(
      (Array.isArray(q.theoryRefs) && q.theoryRefs.length > 0) ||
      (Array.isArray(q.hints) && q.hints.length > 0) ||
      (Array.isArray(q.workedSolution) && q.workedSolution.length > 0) ||
      (Array.isArray(q.misconceptionsRefIds) && q.misconceptionsRefIds.length > 0)
    );
  }

  function theoryChipLabelFromQuestion(lc, q) {
    const ref = Array.isArray(q.theoryRefs) && q.theoryRefs[0] ? q.theoryRefs[0] : null;
    if (!ref) return "Теория";
    let b = null;
    if (ref.blockId) b = theoryBlockById(lc, ref.blockId);
    else if (Number.isInteger(ref.blockIndex)) b = (lc.theory || [])[ref.blockIndex];
    return ref.label || (b && b.title) || "Теория";
  }

  function getPracticeLaneList(lc, diff) {
    const d = diff === "easy" || diff === "med" || diff === "hard" ? diff : "med";
    if (lc && lc.schemaVersion >= 2 && lc.practiceByDifficulty) {
      const pack = lc.practiceByDifficulty[d];
      return Array.isArray(pack) ? pack : [];
    }
    return lc?.practice || [];
  }

  function getTestLaneList(lc, diff) {
    const d = diff === "easy" || diff === "med" || diff === "hard" ? diff : "easy";
    if (lc && lc.schemaVersion >= 2 && lc.testByDifficulty) {
      const pack = lc.testByDifficulty[d];
      return Array.isArray(pack) ? pack : [];
    }
    return lc?.test || [];
  }

  function mergeSkillTagsIntoMastery(cur, tags) {
    if (!Array.isArray(tags) || tags.length === 0) return {};
    const prev = cur.masteryBySkill && typeof cur.masteryBySkill === "object" ? cur.masteryBySkill : {};
    const next = { ...prev };
    tags.forEach((tag) => {
      if (typeof tag === "string" && tag.trim()) next[tag.trim()] = true;
    });
    return { masteryBySkill: next };
  }

  function persistLessonSkillMastery(topic, tags) {
    if (!isCurriculumTopic(topic) || !Array.isArray(tags) || tags.length === 0) return;
    const key = topicProgressKey(topic, state.grade, state.subjectKey);
    const current = getTopicProgress(topic, state.grade, state.subjectKey);
    const patch = mergeSkillTagsIntoMastery(current, tags);
    if (!patch.masteryBySkill) return;
    prefs.topicProgress[key] = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    savePrefs();
    updateTopicModeDescriptors();
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
    const n = Progress.practiceSolvedCount(prog, lc);
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
    const n = Progress.practiceSolvedCount(prog, lc);
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

  function stepIdAtCursor(lc, cursor) {
    if (!lc || !Array.isArray(lc.lessonDialog)) return null;
    if (cursor == null || !Number.isFinite(Number(cursor))) return null;
    const step = lc.lessonDialog[Math.max(0, Number(cursor))];
    return step?.id ? String(step.id) : null;
  }

  function cursorForStableStep(lc, stepId) {
    if (!stepId || !Array.isArray(lc?.lessonDialog)) return null;
    const index = lc.lessonDialog.findIndex((step) => String(step?.id || "") === String(stepId));
    return index >= 0 ? index : null;
  }

  function structuredTheoryIndexForStableStep(lc, stepId) {
    if (!stepId || !usesStructuredTheory(lc)) return null;
    return theoryReaderSeqIndexForBlock(lc, stepId);
  }

  function currentTheoryStepId(lc) {
    const dialogId = stepIdAtCursor(lc, state.lessonDialogCursor);
    if (dialogId) return dialogId;
    if (!usesStructuredTheory(lc) || state.theoryNavSeq == null) return null;
    const item = getTheoryReaderSequence(lc)[state.theoryNavSeq];
    if (!item || item.kind !== "theory") return null;
    return lc.theory?.[item.index]?.id || null;
  }

  function saveLessonPosition(mode) {
    const topic = state.curriculumTopic;
    if (!isCurriculumTopic(topic)) return;
    const lc = getLearningContent(topic);
    const activeMode = mode || state.activityView || state.topicMode || "theory";
    prefs.lessonPosition = {
      subjectKey: state.subjectKey,
      grade: state.grade,
      topicId: topic.id,
      mode: activeMode,
      difficulty:
        activeMode === "test" ? state.testDiff : activeMode === "practice" ? state.practiceDiff : null,
      stepId: activeMode === "theory" ? currentTheoryStepId(lc) : null,
      updatedAt: new Date().toISOString(),
    };
    prefs.currentTopicId = topic.id;
    prefs.trajectoryVersion = prefs.trajectoryVersion || "1";
    savePrefs();
    const cloud = window.SHANKS_CLOUD;
    if (
      currentAuthUser &&
      cloudReadyUserId === String(currentAuthUser.id || "") &&
      typeof cloud?.saveLessonPosition === "function"
    ) {
      const input = {
        subjectId: state.subjectKey,
        grade: state.grade,
        topicId: topic.id,
        lessonId: activeMode,
        position: { ...prefs.lessonPosition },
      };
      cloudLessonSyncQueue = cloudLessonSyncQueue
        .catch(() => {})
        .then(() => cloud.saveLessonPosition(input));
    }
  }

  function findMathTopicById(grade, topicId) {
    return flattenMathTopics(grade).find((topic) => String(topic.id) === String(topicId)) || null;
  }

  function isGeneratedLearningContent(lc) {
    return !!(
      lc &&
      (lc.generated === true ||
        lc.aiGenerated === true ||
        lc.source === "generated" ||
        lc.sourceType === "generated" ||
        lc.contentOrigin === "ai")
    );
  }

  function syncGeneratedContentNotice(lc) {
    const generated = isGeneratedLearningContent(lc);
    $("#topic-ai-note")?.toggleAttribute("hidden", !generated);
    $("#activity-ai-note")?.toggleAttribute("hidden", !generated);
  }

  function getTopicProgress(topic, grade, subjectKey) {
    ensureTopicProgressStore();
    return prefs.topicProgress[topicProgressKey(topic, grade, subjectKey)] || {};
  }

  function topicProgressPct(topic, grade, subjectKey) {
    if (!isCurriculumTopic(topic)) return clampPct(topic?.pct);
    const progress = getTopicProgress(topic, grade, subjectKey);
    const lc = getLearningContent(topic);
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

  function recordPracticeCorrect(solKey, questionMeta) {
    const topic = state.curriculumTopic;
    const lc = getLearningContent(topic);
    if (!lc) return;
    const key = String(solKey);
    const cur = getTopicProgress(topic, state.grade, state.subjectKey);
    const ps = { ...(cur.practiceSolved && typeof cur.practiceSolved === "object" ? cur.practiceSolved : {}) };
    ps[key] = true;
    const masteryPatch = questionMeta && questionMeta.skillTags ? mergeSkillTagsIntoMastery(cur, questionMeta.skillTags) : {};
    const next = { ...cur, practiceSolved: ps, ...masteryPatch };
    if (Progress.isPracticePassed(next, lc)) next.practiceDone = true;
    persistTopicProgress(topic, next);
    if (Progress.isPracticePassed(next, lc)) {
      toast("Практика зачтена — открыт тест.");
    }
  }

  function recordTestCorrect(solKey, questionMeta) {
    const topic = state.curriculumTopic;
    const lc = getLearningContent(topic);
    if (!lc) return;
    const key = String(solKey);
    const cur = getTopicProgress(topic, state.grade, state.subjectKey);
    const ts = { ...(cur.testSolved && typeof cur.testSolved === "object" ? cur.testSolved : {}) };
    ts[key] = true;
    const masteryPatch = questionMeta && questionMeta.skillTags ? mergeSkillTagsIntoMastery(cur, questionMeta.skillTags) : {};
    const next = { ...cur, testSolved: ts, ...masteryPatch };
    let allLegacy = false;
    if (lc.schemaVersion >= 2 && lc.testByDifficulty) {
      /* 100% темы — только средняя полоса (правило mastery) */
      if (Progress.isTestPassed(next, lc)) next.testDone = true;
    } else if (Array.isArray(lc.test)) {
      allLegacy = lc.test.every((_, i) => next.testSolved[String(i)]);
      if (allLegacy) next.testDone = true;
    }
    persistTopicProgress(topic, next);
    if (Progress.isTestPassed(next, lc)) {
      toast("Тест пройден — тема 100%.");
      return;
    }
    if (lc.schemaVersion >= 2 && lc.testByDifficulty) {
      const lane = state.testDiff || "easy";
      const letter = lane === "easy" ? "e" : lane === "hard" ? "h" : "m";
      const laneList = getTestLaneList(lc, lane);
      const laneDone = laneList.length > 0 && laneList.every((_, i) => next.testSolved[`ts-${letter}-${i}`]);
      if (laneDone) {
        toast(
          lane === "med"
            ? "Средний уровень теста пройден полностью."
            : "Все вопросы этой сложности решены. Для 100% темы пройди средний тест."
        );
      } else toast("Верно — ответ засчитан.");
      return;
    }
    if (allLegacy) toast("Тест пройден — тема 100%.");
    else toast("Верно — ответ засчитан.");
  }

  function subjectProgressPct(row, grade) {
    if (!row) return 0;
    if (routeSubjectKey(row.id) !== "math") return clampPct(row.pct);
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
    state.activityBreakdown = null;
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
    state.theoryNavSeq = null;
    state.theoryPanel = "toc";
    state.lessonDialogCursor = null;
    state.theoryJumpBlockId = null;
    state.activityBreakdown = null;
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

  function openActivity(view, diff, options) {
    const ct = state.curriculumTopic;
    if (isCurriculumTopic(ct) && getLearningContent(ct)) {
      if (view === "theory") state.topicMode = "theory";
      else if (view === "practice") state.topicMode = "practice";
      else if (view === "test") state.topicMode = "test";
      syncModeTiles();
    }
    state.activityView = view;
    state.activityBreakdown = null;
    if (view === "theory") {
      const ct2 = state.curriculumTopic;
      const lcc = isCurriculumTopic(ct2) ? getLearningContent(ct2) : null;
      const jump = state.theoryJumpBlockId;
      state.theoryJumpBlockId = null;
      state.theoryNavSeq = null;
      state.lessonDialogCursor = null;

      if (lcc && hasLessonDialog(lcc)) {
        if (jump && lessonDialogHasBlock(lcc.lessonDialog, jump)) {
          state.theoryPanel = "dialog";
          state.lessonDialogCursor = findLessonDialogStartIndex(lcc.lessonDialog, jump);
        } else if (jump && usesStructuredTheory(lcc)) {
          state.theoryPanel = "toc";
          const si = theoryReaderSeqIndexForBlock(lcc, jump);
          state.theoryNavSeq = si != null ? si : null;
        } else {
          state.theoryPanel = "dialog";
          state.lessonDialogCursor = 0;
        }
        resetLessonStepAttempts();
      } else {
        state.theoryPanel = "toc";
        if (jump && lcc && usesStructuredTheory(lcc)) {
          const si = theoryReaderSeqIndexForBlock(lcc, jump);
          state.theoryNavSeq = si != null ? si : null;
        }
      }
    } else {
      state.lessonDialogCursor = null;
    }
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
    if (!options?.skipPositionSave && isCurriculumTopic(state.curriculumTopic)) saveLessonPosition(view);
    iconsRefresh();
  }

  function appendLearningQuestionCard(body, q, qi, isPractice, progress, lc, solKeyOpt) {
    const solKey = solKeyOpt != null ? String(solKeyOpt) : String(qi);
    const cardSolved = isPractice
      ? !!progress.practiceSolved?.[solKey]
      : !!progress.testSolved?.[solKey];
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

    const stretchHtml = q.stretch
      ? `<p class="act-stretch-pill-v8" role="note">Расширение · за пределами базового определения темы</p>`
      : "";

    const canBd = canOpenQuestionBreakdown(q);

    function insertTheoryToolbar(targetCard) {
      if (!canBd) return;
      const row = document.createElement("div");
      row.className = "act-practice-theory-row-v8";
      const chip = document.createElement("span");
      chip.className = "act-theory-chip-v8";
      chip.textContent = `Теория: ${theoryChipLabelFromQuestion(lc, q)}`;
      const bd = document.createElement("button");
      bd.type = "button";
      bd.className = "act-cta-btn-v8 act-cta-btn-v8--ghost act-bd-open-btn-v8";
      bd.textContent = "Разобрать задачу";
      bd.dataset.openBreakdown = "1";
      bd.dataset.bdPractice = isPractice ? "1" : "0";
      bd.dataset.bdIdx = String(qi);
      bd.dataset.bdSol = solKey;
      row.appendChild(chip);
      row.appendChild(bd);
      const firstStrong = targetCard.querySelector("strong");
      if (firstStrong && firstStrong.parentNode) firstStrong.parentNode.insertBefore(row, firstStrong);
      else targetCard.prepend(row);
    }

    const card = document.createElement("div");
    card.className = "lesson-quiz-card" + (hasRich ? " lesson-quiz-card--rich" : "");

    if (!hasRich) {
      card.innerHTML = `
          ${stretchHtml}
          <strong>${q.title}</strong>
          <p>${q.prompt}</p>
          <div class="lesson-answer-list"></div>
          <span class="lesson-explain"></span>`;
      insertTheoryToolbar(card);
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
            if (isPractice) recordPracticeCorrect(solKey, q);
            else recordTestCorrect(solKey, q);
          } else {
            toast("Почти. Выбери вариант, который согласуется с условием.");
          }
        });
        answerList.appendChild(btn);
      });
      body.appendChild(card);
      return;
    }

    const misconceptionLines =
      Array.isArray(q.misconceptionsRefIds) &&
      q.misconceptionsRefIds.length &&
      Array.isArray(lc.misconceptions)
        ? q.misconceptionsRefIds
            .map((mid) => (lc.misconceptions || []).find((m) => m && m.id === mid))
            .filter(Boolean)
            .map((m) => `<li><em>${m.id}</em> — ${m.text}</li>`)
            .join("")
        : "";
    const misconceptionsHtml = misconceptionLines
      ? `<details class="act-lm-misconceptions-v8"><summary>Типичные заблуждения (AI-ready)</summary><ul>${misconceptionLines}</ul></details>`
      : "";

    card.innerHTML = `
          ${stretchHtml}
          <strong>${q.title}</strong>
          <p>${q.prompt}</p>
          ${misconceptionsHtml}
          <div class="lesson-answer-list"></div>
          <div class="act-lm-feedback-v8" role="status"></div>
          <div class="act-lm-solution-panel-v8" hidden></div>
          <div class="act-lm-actions-v8">
            <button type="button" class="act-lm-sec-btn-v8" data-lm-hint ${hasHints ? "" : "hidden"}>Подсказка</button>
            <button type="button" class="act-lm-sec-btn-v8 act-lm-sec-btn-v8--primary" data-lm-show-solution ${hasSol ? "" : "hidden"}>Разбор решения</button>
          </div>
          <p class="lesson-explain act-lm-explain-v8"></p>`;

    insertTheoryToolbar(card);

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
          if (isPractice) recordPracticeCorrect(solKey, q);
          else recordTestCorrect(solKey, q);
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

  function appendLearningStepPracticeCard(body, task, medIndex, progress, lc) {
    const solKey = `pr-m-${medIndex}`;
    const steps = task.steps || [];
    if (steps.length === 0) return;
    const solved = !!progress.practiceSolved?.[solKey];
    const allPracticeDone = Progress.isPracticePassed(progress, lc);

    const misconceptionLines =
      Array.isArray(task.misconceptionsRefIds) &&
      task.misconceptionsRefIds.length &&
      Array.isArray(lc.misconceptions)
        ? task.misconceptionsRefIds
            .map((mid) => (lc.misconceptions || []).find((m) => m && m.id === mid))
            .filter(Boolean)
            .map((m) => `<li><em>${m.id}</em> — ${m.text}</li>`)
            .join("")
        : "";
    const misconceptionsHtml = misconceptionLines
      ? `<details class="act-lm-misconceptions-v8"><summary>Типичные заблуждения (AI-ready)</summary><ul>${misconceptionLines}</ul></details>`
      : "";

    const selfExHtml =
      Array.isArray(task.selfExplanationPrompts) && task.selfExplanationPrompts.length
        ? `<div class="act-self-explain-v8"><strong>Самообъяснение</strong><ul>${task.selfExplanationPrompts
            .map((p) => `<li>${p}</li>`)
            .join("")}</ul></div>`
        : "";

    const canBdSteps = canOpenQuestionBreakdown(task);

    const card = document.createElement("div");
    card.className = "lesson-quiz-card lesson-quiz-card--rich lesson-quiz-card--steps";
    card.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.prompt}</p>
      ${selfExHtml}
      ${misconceptionsHtml}
      <p class="act-step-meta-v8" data-step-meta></p>
      <p class="act-step-prompt-v8" data-step-prompt></p>
      <div class="lesson-answer-list" data-step-choices></div>
      <div class="act-lm-feedback-v8" role="status" data-step-feedback></div>
      <div class="act-lm-solution-panel-v8" hidden data-step-solution></div>
      <div class="act-lm-actions-v8">
        <button type="button" class="act-lm-sec-btn-v8" data-step-hint hidden>Подсказка</button>
        <button type="button" class="act-lm-sec-btn-v8 act-lm-sec-btn-v8--primary" data-step-show-solution hidden>Разбор строк</button>
      </div>`;

    if (canBdSteps) {
      const row = document.createElement("div");
      row.className = "act-practice-theory-row-v8";
      const chip = document.createElement("span");
      chip.className = "act-theory-chip-v8";
      chip.textContent = `Теория: ${theoryChipLabelFromQuestion(lc, task)}`;
      const bd = document.createElement("button");
      bd.type = "button";
      bd.className = "act-cta-btn-v8 act-cta-btn-v8--ghost act-bd-open-btn-v8";
      bd.textContent = "Разобрать задачу";
      bd.dataset.openBreakdown = "1";
      bd.dataset.bdPractice = "1";
      bd.dataset.bdIdx = String(medIndex);
      bd.dataset.bdSol = solKey;
      bd.dataset.bdSteps = "1";
      row.appendChild(chip);
      row.appendChild(bd);
      const tStrong = card.querySelector("strong");
      if (tStrong && tStrong.parentNode) tStrong.parentNode.insertBefore(row, tStrong);
      else card.prepend(row);
    }

    const metaEl = card.querySelector("[data-step-meta]");
    const promptEl = card.querySelector("[data-step-prompt]");
    const choicesEl = card.querySelector("[data-step-choices]");
    const feedbackEl = card.querySelector("[data-step-feedback]");
    const solutionPanel = card.querySelector("[data-step-solution]");
    const hintBtn = card.querySelector("[data-step-hint]");
    const solBtn = card.querySelector("[data-step-show-solution]");
    const hasSol = Array.isArray(task.workedSolution) && task.workedSolution.length > 0;

    let stepIdx = 0;
    let hintStep = 0;

    function showSolutionLines() {
      if (!hasSol) return;
      solutionPanel.hidden = false;
      solutionPanel.innerHTML = `<strong>Пошаговый разбор</strong><ol>${task.workedSolution
        .map((line) => `<li>${line}</li>`)
        .join("")}</ol>`;
    }

    function renderCurrentStep() {
      const frozen = solved || allPracticeDone;
      const st = steps[stepIdx];
      if (!st) return;
      metaEl.textContent = `Шаг ${stepIdx + 1} из ${steps.length}`;
      promptEl.textContent = st.prompt || "";
      choicesEl.innerHTML = "";
      feedbackEl.textContent = "";
      const hints = st.hints;
      const hasHints = Array.isArray(hints) && hints.length > 0;
      if (hintBtn) {
        hintBtn.hidden = !hasHints || frozen;
        hintStep = 0;
      }
      if (solBtn) {
        solBtn.hidden = !hasSol || frozen;
      }
      (st.choices || []).forEach((option, oi) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lesson-answer-btn";
        btn.textContent = option;
        if (frozen) {
          btn.disabled = true;
          if (oi === st.correctIndex) btn.classList.add("lesson-answer-btn--ok");
        }
        btn.addEventListener("click", () => {
          if (frozen) return;
          if (oi === st.correctIndex) {
            if (stepIdx + 1 >= steps.length) {
              recordPracticeCorrect(solKey, task);
              feedbackEl.textContent = "Все шаги верно.";
              showSolutionLines();
              if (solBtn) solBtn.hidden = true;
              if (hintBtn) hintBtn.hidden = true;
              choicesEl.querySelectorAll("button").forEach((b) => {
                b.disabled = true;
                if (b === btn) b.classList.add("lesson-answer-btn--ok");
              });
            } else {
              stepIdx += 1;
              renderCurrentStep();
            }
          } else {
            feedbackEl.textContent = "Пока неверно — попробуй другой вариант или подсказку.";
          }
        });
        choicesEl.appendChild(btn);
      });
    }

    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        const st = steps[stepIdx];
        const hints = st?.hints;
        if (!Array.isArray(hints) || !hints.length) return;
        if (hintStep >= hints.length) {
          feedbackEl.textContent = "Подсказки для этого шага закончились.";
          return;
        }
        feedbackEl.textContent = hints[hintStep];
        hintStep += 1;
      });
    }
    if (solBtn) {
      solBtn.addEventListener("click", () => {
        showSolutionLines();
        solBtn.hidden = true;
      });
    }

    if (solved || allPracticeDone) {
      showSolutionLines();
      metaEl.textContent = `Шаги (${steps.length}) — зачтено`;
      promptEl.textContent = "Задание выполнено.";
      choicesEl.innerHTML = "";
      if (hintBtn) hintBtn.hidden = true;
      if (solBtn) solBtn.hidden = true;
    } else {
      renderCurrentStep();
    }
    body.appendChild(card);
  }

  function renderLessonDialog(body, foot, lc, progress) {
    const ld = lc.lessonDialog;
    let cursor = state.lessonDialogCursor;
    if (cursor == null || cursor < 0) cursor = 0;
    if (cursor > ld.length) cursor = ld.length;
    state.lessonDialogCursor = cursor;

    const nSteps = ld.length;

    const shell = document.createElement("div");
    shell.className = "act-lesson-shell-v9";

    const header = document.createElement("header");
    header.className = "act-lesson-header-v9";
    const headLeft = document.createElement("div");
    headLeft.className = "act-lesson-header-left-v9";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "act-lesson-back-v9";
    back.dataset.actBackLesson = "1";
    back.setAttribute("aria-label", "Назад к теме");
    back.innerHTML = '<i data-lucide="chevron-left"></i>';
    const crumb = document.createElement("p");
    crumb.className = "act-lesson-crumb-v9";
    crumb.textContent = lessonShellBreadcrumb(lc);
    headLeft.appendChild(back);
    headLeft.appendChild(crumb);
    const tocTop = document.createElement("button");
    tocTop.type = "button";
    tocTop.className = "act-lesson-toc-top-v9";
    tocTop.dataset.lessonToc = "1";
    tocTop.textContent = "Оглавление";
    header.appendChild(headLeft);
    header.appendChild(tocTop);
    shell.appendChild(header);

    const progWrap = document.createElement("div");
    progWrap.className = "act-lesson-progress-v9";
    progWrap.setAttribute("role", "progressbar");
    progWrap.setAttribute("aria-valuemin", "0");
    progWrap.setAttribute("aria-valuemax", String(nSteps));
    progWrap.setAttribute("aria-valuenow", String(Math.min(cursor, nSteps)));
    progWrap.setAttribute("aria-label", "Прогресс по шагам урока");
    for (let si = 0; si < nSteps; si += 1) {
      const seg = document.createElement("span");
      seg.className = "act-lesson-seg-v9";
      if (si < cursor) seg.classList.add("act-lesson-seg-v9--done");
      else if (si === cursor && cursor < nSteps) seg.classList.add("act-lesson-seg-v9--current");
      progWrap.appendChild(seg);
    }
    const progLab = document.createElement("div");
    progLab.className = "act-lesson-progress-meta-v9";
    progLab.textContent =
      cursor >= nSteps ? "Урок завершён" : `Шаг ${cursor + 1} из ${nSteps}`;
    progWrap.appendChild(progLab);
    shell.appendChild(progWrap);

    const content = document.createElement("div");
    content.className = "act-lesson-content-v9";

    const hist = document.createElement("div");
    hist.className = "act-lesson-hist-v9";

    const hero = lc.lessonHero;
    if (cursor === 0 && hero && typeof hero === "object") {
      const heroEl = document.createElement("div");
      heroEl.className = "act-lesson-hero-v9";
      if (typeof hero.eyebrow === "string" && hero.eyebrow.trim()) {
        const eb = document.createElement("p");
        eb.className = "act-lesson-hero-eyebrow-v9";
        eb.textContent = hero.eyebrow.trim();
        heroEl.appendChild(eb);
      }
      if (typeof hero.title === "string" && hero.title.trim()) {
        const ht = document.createElement("h1");
        ht.className = "act-lesson-hero-title-v9";
        ht.textContent = hero.title.trim();
        heroEl.appendChild(ht);
      }
      if (typeof hero.subtitle === "string" && hero.subtitle.trim()) {
        const st = document.createElement("p");
        st.className = "act-lesson-hero-subtitle-v9";
        st.textContent = hero.subtitle.trim();
        heroEl.appendChild(st);
      }
      if (typeof hero.lead === "string" && hero.lead.trim()) {
        const ldEl = document.createElement("p");
        ldEl.className = "act-lesson-hero-lead-v9";
        ldEl.textContent = hero.lead.trim();
        heroEl.appendChild(ldEl);
      }
      const cast = document.createElement("div");
      cast.className = "act-lesson-cast-v10";
      const anyaCard = document.createElement("div");
      anyaCard.className = "act-lesson-cast-card-v10 act-lesson-cast-card-v10--anya";
      anyaCard.appendChild(buildLessonAvatarAnya());
      const anyaText = document.createElement("div");
      anyaText.innerHTML =
        '<strong>Аня</strong><span>ведёт урок спокойно, но без занудства</span>';
      anyaCard.appendChild(anyaText);
      const griffonCard = document.createElement("div");
      griffonCard.className = "act-lesson-cast-card-v10 act-lesson-cast-card-v10--griffon";
      griffonCard.appendChild(buildLessonAvatarGriffon());
      const griffonText = document.createElement("div");
      griffonText.innerHTML =
        '<strong>Елиссей</strong><span>гав-гав, ловит типичные ошибки и подкидывает подсказки</span>';
      griffonCard.appendChild(griffonText);
      cast.appendChild(anyaCard);
      cast.appendChild(griffonCard);
      heroEl.appendChild(cast);
      hist.appendChild(heroEl);
    }

    function formatFullSolution(step) {
      const fs = step.fullSolution;
      if (Array.isArray(fs) && fs.length) return fs.map((x) => String(x)).filter(Boolean);
      if (typeof fs === "string" && fs.trim()) return [fs.trim()];
      const c = step.feedback && typeof step.feedback.correct === "string" ? step.feedback.correct.trim() : "";
      return c ? [c] : ["Разберём смысл на следующих шагах урока."];
    }

    function firstHint(step) {
      if (typeof step.hint === "string" && step.hint.trim()) return step.hint.trim();
      if (Array.isArray(step.hints) && step.hints.length && step.hints[0]) return String(step.hints[0]);
      return null;
    }

    function secondNudge(step) {
      if (Array.isArray(step.hints) && step.hints.length > 1 && step.hints[1]) return String(step.hints[1]);
      return "Можно нажать «Давай разберём» — это не ошибка, а опора.";
    }

    /** Индекс правильного варианта MCQ: всегда целое, чтобы не ломать сравнение с индексом forEach (строгое ===). */
    function lessonDialogMcqCorrectIndex(step) {
      const opts = step.options || [];
      const raw = step.answerIndex;
      let n =
        typeof raw === "number" && Number.isFinite(raw) ? Math.trunc(raw) : parseInt(String(raw ?? "").trim(), 10);
      if (!Number.isInteger(n) || n < 0 || n >= opts.length) n = 0;
      return n;
    }

    function appendPastStep(step) {
      const nk = lessonDialogNormalizedKind(step);
      if (nk === "message") {
        if (!lessonDialogAppendTurns(hist, step, true)) {
          lessonDialogAppendAnya(hist, lessonDialogMentorBody(step), "compact");
        }
        lessonDialogAppendRichAddons(hist, step);
        const reply = state.lessonStudentReplies?.[step.id];
        if (reply) lessonDialogAppendStudent(hist, reply);
        return;
      }
      if (nk === "multiple_choice") {
        const box = document.createElement("div");
        box.className = "act-lesson-past-pill-v9";
        const p = document.createElement("p");
        p.className = "act-lesson-past-prompt-v9";
        p.textContent = step.prompt || "";
        const ok = document.createElement("p");
        ok.className = "act-lesson-past-ok-v9";
        ok.textContent = `Готово · ${step.feedback && step.feedback.correct ? step.feedback.correct : "Верно"}`;
        box.appendChild(p);
        box.appendChild(ok);
        hist.appendChild(box);
        const reply = state.lessonStudentReplies?.[step.id];
        if (reply) lessonDialogAppendStudent(hist, reply);
        return;
      }
      if (nk === "worked_example") {
        lessonDialogAppendRichAddons(hist, step);
        const box = document.createElement("div");
        box.className = "act-lesson-past-pill-v9";
        const t = document.createElement("p");
        t.className = "act-lesson-past-title-v9";
        t.textContent = step.title || "Разобранный пример";
        box.appendChild(t);
        hist.appendChild(box);
        const reply = state.lessonStudentReplies?.[step.id];
        if (reply) lessonDialogAppendStudent(hist, reply);
        return;
      }
      if (nk === "faded_example") {
        lessonDialogAppendRichAddons(hist, step);
        const box = document.createElement("div");
        box.className = "act-lesson-past-pill-v9";
        const t = document.createElement("p");
        t.className = "act-lesson-past-title-v9";
        t.textContent = step.title || "Мини-практика с пропусками";
        box.appendChild(t);
        hist.appendChild(box);
        const reply = state.lessonStudentReplies?.[step.id];
        if (reply) lessonDialogAppendStudent(hist, reply);
        return;
      }
      if (nk === "ai_question") {
        lessonDialogAppendRichAddons(hist, step);
        const box = document.createElement("div");
        box.className = "act-lesson-past-pill-v9";
        box.textContent = "Вопрос по теме записан.";
        hist.appendChild(box);
        return;
      }
      lessonDialogAppendAnya(hist, lessonDialogMentorBody(step) || "Шаг", "compact");
    }

    for (let i = 0; i < cursor; i += 1) {
      appendPastStep(ld[i]);
    }

    function lessonDialogNextText(step, fallback) {
      if (step && typeof step.nextStudentText === "string" && step.nextStudentText.trim()) {
        return step.nextStudentText.trim();
      }
      return fallback || "Окей, что дальше?";
    }

    function appendNext(navEl, step, fallback) {
      const nx = document.createElement("button");
      nx.type = "button";
      nx.className = "act-lesson-student-next-v10";
      const nextText = lessonDialogNextText(step, fallback);
      nx.textContent = nextText;
      nx.addEventListener("click", () => {
        if (step?.id) state.lessonStudentReplies[step.id] = nextText;
        state.lessonDialogCursor = cursor + 1;
        renderActivity();
      });
      navEl.appendChild(nx);
    }

    if (cursor < ld.length) {
      const step = ld[cursor];
      const nk = lessonDialogNormalizedKind(step);

      if (nk === "message") {
        const body = lessonDialogMentorBody(step);
        if (!lessonDialogAppendTurns(hist, step, false) && body) lessonDialogAppendAnya(hist, body, false);
        lessonDialogAppendRichAddons(hist, step);
        const nav = document.createElement("div");
        nav.className = "act-lesson-nav-v9 act-lesson-nav-sticky-v9";
        appendNext(nav, step, "Понял. Что дальше?");
        hist.appendChild(nav);
      } else if (nk === "worked_example") {
        const lead = lessonDialogMentorBody(step);
        if (!lessonDialogAppendTurns(hist, step, false) && lead) lessonDialogAppendAnya(hist, lead, false);
        lessonDialogAppendRichAddons(hist, step);
        const card = document.createElement("div");
        card.className = "act-lesson-worked-wrap-v9";
        const h = document.createElement("h3");
        h.className = "act-lesson-worked-head-v9";
        h.textContent = step.title || "Разберём пример";
        card.appendChild(h);
        const track = document.createElement("div");
        track.className = "act-lesson-worked-track-v9";
        const lines = Array.isArray(step.lines)
          ? step.lines
          : Array.isArray(step.workedLines)
            ? step.workedLines
            : [];
        lines.forEach((raw, idx) => {
          const line = document.createElement("div");
          line.className = "act-lesson-worked-step-v9";
          const num = document.createElement("span");
          num.className = "act-lesson-worked-num-v9";
          num.textContent = String(idx + 1);
          const bodyCol = document.createElement("div");
          bodyCol.className = "act-lesson-worked-body-v9";
          const s = String(raw);
          const parts = s.split(" — ");
          const eq = document.createElement("p");
          eq.className = "act-lesson-worked-eq-v9";
          eq.textContent = parts[0].trim();
          bodyCol.appendChild(eq);
          if (parts.length > 1) {
            const rat = document.createElement("p");
            rat.className = "act-lesson-worked-rat-v9";
            rat.textContent = parts.slice(1).join(" — ").trim();
            bodyCol.appendChild(rat);
          }
          line.appendChild(num);
          line.appendChild(bodyCol);
          track.appendChild(line);
        });
        card.appendChild(track);
        hist.appendChild(card);
        const nav = document.createElement("div");
        nav.className = "act-lesson-nav-v9 act-lesson-nav-sticky-v9";
        appendNext(nav, step, "Окей, покажи следующий шаг");
        hist.appendChild(nav);
      } else if (nk === "faded_example") {
        const lead = lessonDialogMentorBody(step);
        if (!lessonDialogAppendTurns(hist, step, false) && lead) lessonDialogAppendAnya(hist, lead, false);
        lessonDialogAppendRichAddons(hist, step);
        const card = document.createElement("div");
        card.className = "act-lesson-faded-wrap-v9";
        const h = document.createElement("h3");
        h.className = "act-lesson-faded-head-v9";
        h.textContent = step.title || "Попробуй восстановить шаг";
        card.appendChild(h);
        const sub = document.createElement("p");
        sub.className = "act-lesson-faded-sub-v9";
        sub.textContent = "Сначала опора — затем сам. Образец можно раскрыть.";
        card.appendChild(sub);
        const fsteps = Array.isArray(step.fadedSteps) ? step.fadedSteps : Array.isArray(step.steps) ? step.steps : [];
        fsteps.forEach((st) => {
          const row = document.createElement("div");
          row.className = "act-lesson-faded-row-v9";
          if (st.mode === "faded") {
            const pr = document.createElement("p");
            pr.className = "act-lesson-faded-q-v9";
            pr.textContent = st.prompt || "";
            const ans = document.createElement("div");
            ans.className = "act-lesson-faded-answer-slot-v9";
            ans.hidden = true;
            ans.textContent = st.answer || "";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "act-lesson-faded-reveal-v9";
            btn.textContent = "Показать образец";
            btn.addEventListener("click", () => {
              ans.hidden = false;
              btn.hidden = true;
            });
            row.appendChild(pr);
            row.appendChild(ans);
            row.appendChild(btn);
          } else {
            const full = document.createElement("p");
            full.className = "act-lesson-faded-full-v9";
            full.textContent = st.text || "";
            row.appendChild(full);
          }
          card.appendChild(row);
        });
        hist.appendChild(card);
        lessonDialogAppendGriffon(hist, "Гав-гав: после образца сравни со своим ходом — так запоминается лучше.");
        const nav = document.createElement("div");
        nav.className = "act-lesson-nav-v9 act-lesson-nav-sticky-v9";
        appendNext(nav, step, "Я сравнил. Идём дальше");
        hist.appendChild(nav);
      } else if (nk === "ai_question") {
        lessonDialogAppendRichAddons(hist, step);
        const att = getLessonStepAttempt(step.id);
        const wrapAi = document.createElement("div");
        wrapAi.className = "act-lesson-ai-final-v9";
        const h2 = document.createElement("h2");
        h2.className = "act-lesson-ai-title-v9";
        h2.textContent = "Остались вопросы?";
        wrapAi.appendChild(h2);
        const intro = document.createElement("p");
        intro.className = "act-lesson-ai-intro-v9";
        intro.textContent =
          "Можешь написать, что осталось непонятно. Позже здесь ответит AI-наставник — а пока это помогает сформулировать мысль.";
        wrapAi.appendChild(intro);
        if (!att.aiReplied) {
          const mentorLine =
            (typeof step.mentorText === "string" && step.mentorText.trim()) ||
            (typeof step.text === "string" && step.text.trim()) ||
            "";
          if (mentorLine) {
            const mh = document.createElement("div");
            mh.className = "act-lesson-ai-mentor-host-v9";
            lessonDialogAppendAnya(mh, mentorLine, false);
            wrapAi.appendChild(mh);
          }
          const ta = document.createElement("textarea");
          ta.className = "act-lesson-ai-input-v9";
          ta.rows = 4;
          ta.placeholder =
            typeof step.placeholder === "string" && step.placeholder.trim()
              ? step.placeholder.trim()
              : "Задай вопрос по теме…";
          ta.setAttribute("aria-label", "Вопрос по теме");
          const row = document.createElement("div");
          row.className = "act-lesson-ai-actions-v9";
          const send = document.createElement("button");
          send.type = "button";
          send.className = "act-lesson-primary-nav-v9";
          send.textContent = "Задать вопрос";
          send.addEventListener("click", () => {
            att.aiReplied = true;
            renderActivity();
          });
          row.appendChild(send);
          wrapAi.appendChild(ta);
          wrapAi.appendChild(row);
        } else {
          lessonDialogAppendAnya(
            wrapAi,
            "Спасибо за вопрос! В будущем я смогу ответить точечно по твоей формулировке. Пока загляни в практику с разбором задачи — там закрепляется смысл.",
            false
          );
          const side = document.createElement("div");
          side.className = "act-lesson-ai-sidekick-v9";
          lessonDialogAppendGriffon(
            side,
            "Р-р-р, я бы ещё раз проверил знак и ноль — это частые ловушки в неполных квадратных."
          );
          wrapAi.appendChild(side);
          const nav = document.createElement("div");
          nav.className = "act-lesson-nav-v9 act-lesson-nav-sticky-v9";
          appendNext(nav, step, "Окей, к итогу");
          wrapAi.appendChild(nav);
        }
        hist.appendChild(wrapAi);
      } else if (nk === "multiple_choice") {
        const lead = lessonDialogMentorBody(step);
        if (!lessonDialogAppendTurns(hist, step, false)) {
          lessonDialogAppendAnya(hist, lead || "Короткая проверка — выбери вариант, который лучше всего подходит.", false);
        }
        lessonDialogAppendRichAddons(hist, step);
        const box = document.createElement("div");
        box.className = "act-lesson-mcq-wrap-v9";
        const head = document.createElement("p");
        head.className = "act-lesson-mcq-prompt-v9";
        head.textContent = step.prompt || "";
        box.appendChild(head);
        const list = document.createElement("div");
        list.className = "lesson-answer-list act-lesson-reply-list-v9";
        const stageZone = document.createElement("div");
        stageZone.className = "act-lesson-mcq-stage-v9";
        stageZone.setAttribute("role", "status");
        const navEl = document.createElement("div");
        navEl.className = "act-lesson-nav-v9 act-lesson-nav-sticky-v9";
        const solPanel = document.createElement("div");
        solPanel.className = "act-lesson-sol-break-v9";
        solPanel.hidden = true;
        box.appendChild(list);
        box.appendChild(stageZone);
        box.appendChild(solPanel);
        box.appendChild(navEl);

        const att = getLessonStepAttempt(step.id);
        let answered = false;
        const correctIdx = lessonDialogMcqCorrectIndex(step);

        function renderSolutionLines() {
          solPanel.innerHTML = "";
          const cap = document.createElement("p");
          cap.className = "act-lesson-sol-cap-v9";
          cap.textContent = "Разбор построчно";
          solPanel.appendChild(cap);
          lessonDialogAppendAnya(solPanel, "Смотри, тут важно не потерять смысл шагов — потом так же разберёшь свою задачу.", "compact");
          const lines = formatFullSolution(step);
          const ul = document.createElement("ul");
          ul.className = "act-lesson-sol-ul-v9";
          lines.forEach((ln) => {
            const li = document.createElement("li");
            li.textContent = ln;
            ul.appendChild(li);
          });
          solPanel.appendChild(ul);
          solPanel.hidden = false;
        }

        function onCorrect(btn) {
          answered = true;
          stageZone.innerHTML = "";
          lessonDialogAppendStudent(stageZone, btn.textContent);
          const nice =
            typeof step.supportiveCorrect === "string" && step.supportiveCorrect.trim()
              ? step.supportiveCorrect.trim()
              : step.feedback && step.feedback.correct
                ? step.feedback.correct
                : "Верно, так держать.";
          lessonDialogAppendAnya(stageZone, nice, "compact");
          list.querySelectorAll("button").forEach((x) => {
            x.disabled = true;
            if (x === btn) x.classList.add("lesson-answer-btn--ok");
          });
          if (Array.isArray(step.skillTags) && step.skillTags.length) {
            const topic = state.curriculumTopic;
            persistLessonSkillMastery(topic, step.skillTags);
          }
          const nx = document.createElement("button");
          nx.type = "button";
          nx.className = "act-lesson-student-next-v10";
          const nextText = lessonDialogNextText(step, "Понял, что дальше?");
          nx.textContent = nextText;
          nx.addEventListener("click", () => {
            if (step?.id) state.lessonStudentReplies[step.id] = nextText;
            state.lessonDialogCursor = cursor + 1;
            renderActivity();
          });
          navEl.appendChild(nx);
          const ms = Number(step.autoAdvanceMs);
          if (Number.isFinite(ms) && ms > 200) {
            setTimeout(() => {
              if (state.lessonDialogCursor === cursor && answered) {
                state.lessonDialogCursor = cursor + 1;
                renderActivity();
              }
            }, ms);
          }
        }

        (step.options || []).forEach((opt, oi) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "lesson-answer-btn act-lesson-reply-btn-v9";
          btn.textContent = opt;
          if (att.solutionRevealed) {
            btn.disabled = true;
            if (oi === correctIdx) btn.classList.add("lesson-answer-btn--ok");
          }
          btn.addEventListener("click", () => {
            if (answered || att.solutionRevealed) return;
            if (oi === correctIdx) {
              onCorrect(btn);
              return;
            }
            att.wrong += 1;
            if (att.wrong === 1) {
              stageZone.innerHTML = "";
              const h = firstHint(step);
              const wrongFb =
                step.feedback && typeof step.feedback.wrong === "string" ? step.feedback.wrong.trim() : "";
              const line = h || wrongFb || "Гав-гав, я бы тут проверил старшую степень и коэффициент при x².";
              lessonDialogAppendGriffon(stageZone, line);
              return;
            }
            if (att.wrong >= 2 && !att.solutionRevealed) {
              stageZone.innerHTML = "";
              lessonDialogAppendGriffon(stageZone, secondNudge(step));
              list.querySelectorAll("button").forEach((x) => {
                x.disabled = true;
              });
              const deb = document.createElement("button");
              deb.type = "button";
              deb.className = "act-lesson-primary-nav-v9 act-lesson-debrief-pulse-v8 act-lesson-debrief-v9";
              deb.textContent = "Давай разберём";
              deb.addEventListener("click", () => {
                att.solutionRevealed = true;
                renderSolutionLines();
                deb.remove();
                list.querySelectorAll("button").forEach((x) => {
                  x.disabled = true;
                  const idx = Array.prototype.indexOf.call(list.children, x);
                  if (idx === correctIdx) x.classList.add("lesson-answer-btn--ok");
                });
                const nx2 = document.createElement("button");
                nx2.type = "button";
                nx2.className = "act-lesson-student-next-v10";
                const nextText2 = lessonDialogNextText(step, "Окей, теперь понял");
                nx2.textContent = nextText2;
                nx2.addEventListener("click", () => {
                  if (step?.id) state.lessonStudentReplies[step.id] = nextText2;
                  state.lessonDialogCursor = cursor + 1;
                  renderActivity();
                });
                navEl.appendChild(nx2);
              });
              navEl.appendChild(deb);
            }
          });
          list.appendChild(btn);
        });

        if (att.solutionRevealed) {
          renderSolutionLines();
          const nx3 = document.createElement("button");
          nx3.type = "button";
          nx3.className = "act-lesson-student-next-v10";
          const nextText3 = lessonDialogNextText(step, "Окей, идём дальше");
          nx3.textContent = nextText3;
          nx3.addEventListener("click", () => {
            if (step?.id) state.lessonStudentReplies[step.id] = nextText3;
            state.lessonDialogCursor = cursor + 1;
            renderActivity();
          });
          navEl.appendChild(nx3);
        }

        hist.appendChild(box);
      } else {
        lessonDialogAppendAnya(hist, lessonDialogMentorBody(step) || "Шаг", false);
        const nav = document.createElement("div");
        nav.className = "act-lesson-nav-v9 act-lesson-nav-sticky-v9";
        appendNext(nav, step, "Продолжим?");
        hist.appendChild(nav);
      }
    } else {
      const sum = document.createElement("div");
      sum.className = "act-lesson-complete-v9";
      const p1 = document.createElement("h2");
      p1.className = "act-lesson-complete-title-v9";
      p1.textContent = "Урок пройден";
      const p2 = document.createElement("p");
      p2.className = "act-lesson-complete-lead-v9";
      p2.textContent = "Дальше — практика с разбором задач. Оглавление всегда под рукой, если захочешь повторить теорию.";
      sum.appendChild(p1);
      sum.appendChild(p2);
      hist.appendChild(sum);
    }

    content.appendChild(hist);
    shell.appendChild(content);
    body.appendChild(shell);

    requestAnimationFrame(() => {
      try {
        hist.scrollTo({ top: hist.scrollHeight, behavior: "smooth" });
      } catch {
        hist.scrollTop = hist.scrollHeight;
      }
    });

    if (cursor >= ld.length) {
      foot.innerHTML = `
        <div class="act-lesson-footer-end-v9">
          <button type="button" class="act-lesson-footer-primary-v9" id="act-theory-to-practice">К практике</button>
          <div class="act-lesson-footer-secondary-v9">
            <button type="button" class="act-lesson-footer-ghost-v9" data-lesson-toc="1">Оглавление</button>
            <button type="button" class="act-lesson-footer-quiet-v9" id="act-theory-mark"${
              progress.theoryDone ? ' disabled aria-disabled="true"' : ""
            }>${progress.theoryDone ? "Уже отмечено" : "Отметить как изучено"}</button>
          </div>
        </div>`;
    } else {
      foot.innerHTML = "";
    }
  }

  function renderActivityBreakdown(body, foot, lc, progress) {
    const bd = state.activityBreakdown;
    if (!bd || !bd.solKey) return;
    const topic = state.curriculumTopic;
    let q = null;
    if (bd.kind === "steps") {
      q = bd.task;
    } else if (bd.isPractice) {
      const lane = bd.diff || state.practiceDiff || "med";
      const arr = getPracticeLaneList(lc, lane);
      q = arr[bd.qi];
    } else {
      const lane = bd.diff || state.testDiff || "easy";
      const arr = getTestLaneList(lc, lane);
      q = arr[bd.qi];
    }
    if (!q) {
      state.activityBreakdown = null;
      renderActivity();
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "act-breakdown-v8";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "act-cta-btn-v8 act-cta-btn-v8--ghost act-breakdown-back-v8";
    back.id = "act-breakdown-back";
    back.textContent = "← К заданиям";
    wrap.appendChild(back);

    const head = document.createElement("div");
    head.className = "act-bd-head-v8";
    const optsPreview =
      bd.kind === "steps"
        ? Array.isArray(q.steps) && q.steps.length
          ? `<ol class="act-bd-steps-preview-v8">${q.steps
              .map(
                (st, si) =>
                  `<li><span class="act-bd-step-n-v8">${si + 1}.</span> ${st.prompt || ""}${
                    Array.isArray(st.choices) && st.choices.length
                      ? `<span class="act-bd-step-choices-v8">${st.choices.join(" · ")}</span>`
                      : ""
                  }</li>`
              )
              .join("")}</ol>`
          : ""
        : Array.isArray(q.options)
          ? `<ul class="act-bd-options-preview-v8">${q.options.map((o) => `<li>${o}</li>`).join("")}</ul>`
          : "";
    head.innerHTML = `
      <h3 class="act-bd-title-v8">${q.title || "Задание"}</h3>
      <p class="act-bd-prompt-v8"><strong>Условие:</strong> ${q.prompt || ""}</p>
      ${optsPreview}`;
    wrap.appendChild(head);

    const secAsk = document.createElement("section");
    secAsk.className = "act-bd-section-v8";
    secAsk.innerHTML = "<h4>Что спрашивают</h4>";
    const pAsk = document.createElement("p");
    pAsk.className = "act-bd-body-v8";
    pAsk.textContent = q.prompt || "";
    secAsk.appendChild(pAsk);
    wrap.appendChild(secAsk);

    if (Array.isArray(q.theoryRefs) && q.theoryRefs.length) {
      const secTh = document.createElement("section");
      secTh.className = "act-bd-section-v8";
      secTh.innerHTML = "<h4>Теория по теме</h4>";
      q.theoryRefs.forEach((r) => {
        let b = null;
        if (r && typeof r.blockId === "string" && r.blockId.trim()) b = theoryBlockById(lc, r.blockId);
        else if (Number.isInteger(r?.blockIndex)) b = (lc.theory || [])[r.blockIndex];
        if (!b) return;
        const lab = (r && r.label) || b.title;
        const ideas =
          Array.isArray(b.keyIdeas) && b.keyIdeas.length
            ? `<ul class="act-bd-ideas-v8">${b.keyIdeas.map((k) => `<li>${k}</li>`).join("")}</ul>`
            : "";
        const block = document.createElement("div");
        block.className = "act-bd-theory-block-v8";
        block.innerHTML = `<h5>${lab}</h5><p>${b.body}</p>${ideas}`;
        secTh.appendChild(block);
      });
      wrap.appendChild(secTh);
    }

    if (Array.isArray(q.hints) && q.hints.length) {
      const secH = document.createElement("section");
      secH.className = "act-bd-section-v8";
      secH.innerHTML = `<h4>Подсказки</h4><ol class="act-bd-hints-v8">${q.hints.map((h) => `<li>${h}</li>`).join("")}</ol>`;
      wrap.appendChild(secH);
    } else if (bd.kind === "steps" && Array.isArray(q.steps)) {
      const flatHints = q.steps.flatMap((st) => (Array.isArray(st.hints) ? st.hints : []));
      if (flatHints.length) {
        const secH = document.createElement("section");
        secH.className = "act-bd-section-v8";
        secH.innerHTML = `<h4>Подсказки по шагам</h4><ol class="act-bd-hints-v8">${flatHints.map((h) => `<li>${h}</li>`).join("")}</ol>`;
        wrap.appendChild(secH);
      }
    }

    if (Array.isArray(q.workedSolution) && q.workedSolution.length) {
      const secS = document.createElement("section");
      secS.className = "act-bd-section-v8";
      secS.innerHTML = `<h4>Пошаговый разбор</h4><ol class="act-bd-sol-v8">${q.workedSolution.map((l) => `<li>${l}</li>`).join("")}</ol>`;
      wrap.appendChild(secS);
    }

    if (Array.isArray(q.misconceptionsRefIds) && q.misconceptionsRefIds.length && Array.isArray(lc.misconceptions)) {
      const lines = q.misconceptionsRefIds
        .map((mid) => (lc.misconceptions || []).find((m) => m && m.id === mid))
        .filter(Boolean);
      if (lines.length) {
        const secM = document.createElement("section");
        secM.className = "act-bd-section-v8";
        secM.innerHTML = "<h4>Типичная ошибка</h4>";
        lines.forEach((m) => {
          const p = document.createElement("p");
          p.className = "act-bd-body-v8";
          p.textContent = m.text;
          secM.appendChild(p);
        });
        wrap.appendChild(secM);
      }
    }

    const stub = document.createElement("p");
    stub.className = "act-ai-stub-v8 act-ai-stub-v8--bd";
    stub.textContent = "Задать вопрос AI по этой задаче — скоро.";
    wrap.appendChild(stub);

    body.appendChild(wrap);
    foot.innerHTML = "";
  }

  function renderActivity() {
    const root = $("#stack-activity");
    if (!root) return;
    if (root.dataset) delete root.dataset.lessonShell;
    let view = state.activityView;
    const learningTopic = isCurriculumTopic(state.curriculumTopic);
    const lcLearn = learningTopic ? getLearningContent(state.curriculumTopic) : null;
    syncGeneratedContentNotice(lcLearn);
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
      if (!learningTopic) {
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
      } else {
        const triMode =
          (view === "practice" && lcLearn?.practiceByDifficulty) ||
          (view === "test" && lcLearn?.testByDifficulty);
        if (triMode) {
          row.innerHTML = keys
            .map((d) => {
              const on = d === diff;
              return `<button type="button" class="act-diff-pill-v8${on ? " act-diff-pill-v8--on" : ""}" data-act-diff="${d}">${L[d]}</button>`;
            })
            .join("");
        } else {
          row.innerHTML = `<button type="button" class="act-diff-pill-v8 act-diff-pill-v8--on" data-act-diff="med">Тренировка</button>`;
        }
      }
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
      const triPractice = !!(Number(lc.schemaVersion) >= 2 && lc.practiceByDifficulty);
      const triTest = !!(Number(lc.schemaVersion) >= 2 && lc.testByDifficulty);
      const practiceLane = getPracticeLaneList(lc, diff);
      const testLane = getTestLaneList(lc, diff);
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

      if (state.activityBreakdown && view !== "theory") {
        renderActivityBreakdown(body, foot, lc, progress);
        iconsRefresh();
        return;
      }

      if (view === "theory") {
        if (hasLessonDialog(lc) && state.theoryPanel === "dialog") {
          root.dataset.lessonShell = "1";
          renderLessonDialog(body, foot, lc, progress);
          iconsRefresh();
          return;
        }
        if (usesStructuredTheory(lc)) {
          const seq = getTheoryReaderSequence(lc);
          if (state.theoryNavSeq != null && (state.theoryNavSeq < 0 || state.theoryNavSeq >= seq.length)) {
            state.theoryNavSeq = null;
          }
          if (state.theoryNavSeq == null) {
            const wrap = document.createElement("div");
            wrap.className = "act-theory-lesson-v8";
            const obj = lc.objective
              ? `<p class="act-theory-objective-v8"><strong>Цель навыка.</strong> ${lc.objective}</p>`
              : "";
            const we = lc.workedExample;
            const weHtml =
              we && Array.isArray(we.lines) && we.lines.length
                ? `<aside class="act-worked-example-v8 act-worked-example-v8--compact"><h4 class="act-we-title-v8">${we.title}</h4><p>${we.lines.join(" ")}</p></aside>`
                : "";
            const tocList = seq
              .map((item, si) => {
                let title = "";
                if (item.kind === "theory") title = lc.theory[item.index]?.title || "";
                else if (item.kind === "worked") title = lc.workedExamples[item.index]?.title || "";
                else title = lc.fadedExamples[item.index]?.title || "";
                return `<li><button type="button" class="act-theory-toc-btn-v8" data-theory-nav="${si}">${title}</button></li>`;
              })
              .join("");
            const cat = Array.isArray(lc.skillTagCatalog)
              ? lc.skillTagCatalog
                  .map((tag) => {
                    const ok = !!progress.masteryBySkill?.[tag];
                    return `<li class="${ok ? "act-skill-done" : ""}">${ok ? "✓ " : ""}<span class="act-skill-tag">${tag}</span></li>`;
                  })
                  .join("")
              : "";
            const skillsHtml = cat
              ? `<section class="act-skill-panel-v8"><h4 class="act-we-title-v8">Навыки темы (mastery)</h4><ul class="act-skill-list-v8">${cat}</ul></section>`
              : "";
            wrap.innerHTML = `
              <p class="act-section-title-v8">Урок · оглавление</p>
              ${obj}
              <nav aria-label="Оглавление урока"><ul class="act-theory-toc-v8">${tocList}</ul></nav>
              ${weHtml}
              ${skillsHtml}`;
            body.appendChild(wrap);
            const lessonRestart = hasLessonDialog(lc)
              ? `<button type="button" class="act-cta-btn-v8 act-cta-btn-v8--ghost" id="act-lesson-restart">Интерактивный урок</button>`
              : "";
            foot.innerHTML = `
              ${lessonRestart}
              <button type="button" class="act-cta-btn-v8 act-cta-btn-v8--ghost" id="act-theory-mark"${
                progress.theoryDone ? ' disabled aria-disabled="true"' : ""
              }>${progress.theoryDone ? "Теория уже отмечена" : "Отметить как изучено"}</button>
              <button type="button" class="act-cta-btn-v8" id="act-theory-to-practice">К практике</button>`;
            iconsRefresh();
            return;
          }
          const item = seq[state.theoryNavSeq];
          const reader = document.createElement("div");
          reader.className = "act-theory-reader-v8";
          let title = "";
          let innerBody = "";
          if (item.kind === "theory") {
            const b = lc.theory[item.index];
            title = b.title;
            const ideas =
              Array.isArray(b.keyIdeas) && b.keyIdeas.length
                ? `<ul class="act-key-ideas-v8">${b.keyIdeas.map((k) => `<li>${k}</li>`).join("")}</ul>`
                : "";
            innerBody = `<p class="act-theory-body-v8">${b.body}</p>${ideas}`;
          } else if (item.kind === "worked") {
            const w = lc.workedExamples[item.index];
            title = w.title;
            const steps = (w.steps || [])
              .map(
                (s) =>
                  `<li><span class="act-we-step-text">${s.text}</span><span class="act-we-step-rationale">${s.rationale || ""}</span></li>`
              )
              .join("");
            const prompts =
              Array.isArray(w.selfExplanationPrompts) && w.selfExplanationPrompts.length
                ? `<div class="act-self-explain-v8"><strong>Самообъяснение</strong><ul>${w.selfExplanationPrompts
                    .map((p) => `<li>${p}</li>`)
                    .join("")}</ul></div>`
                : "";
            innerBody = `<ol class="act-worked-steps-v8">${steps}</ol>${prompts}`;
          } else {
            const f = lc.fadedExamples[item.index];
            title = f.title;
            innerBody = (f.steps || [])
              .map((st, j) => {
                if (st.mode === "full") {
                  return `<div class="act-faded-row-v8"><span class="act-faded-badge">Шаг</span><p>${st.text}</p></div>`;
                }
                return `<div class="act-faded-row-v8 act-faded-row-v8--faded" data-faded-idx="${j}">
                  <p><strong>${st.prompt || ""}</strong></p>
                  <button type="button" class="act-lm-sec-btn-v8 act-faded-reveal-v8" data-faded-show="${j}">Показать ответ</button>
                  <p class="act-faded-answer-v8" hidden data-faded-ans="${j}">${st.answer || ""}</p>
                </div>`;
              })
              .join("");
          }
          reader.innerHTML = `
            <p class="act-section-title-v8">Теория · экран чтения</p>
            <h3 class="act-theory-reader-title-v8">${title}</h3>
            ${innerBody}`;
          body.appendChild(reader);
          body.querySelectorAll("[data-faded-show]").forEach((btn) => {
            btn.addEventListener("click", () => {
              const j = btn.getAttribute("data-faded-show");
              const ans = body.querySelector(`[data-faded-ans="${j}"]`);
              if (ans) ans.hidden = false;
              btn.hidden = true;
            });
          });
          const last = state.theoryNavSeq >= seq.length - 1;
          foot.innerHTML = `
            <button type="button" class="act-cta-btn-v8 act-cta-btn-v8--ghost" id="act-theory-back-toc">Назад к списку</button>
            <button type="button" class="act-cta-btn-v8 act-cta-btn-v8--ghost" id="act-theory-next-block">${
              last ? "К практике" : "Следующий блок"
            }</button>
            <button type="button" class="act-cta-btn-v8" id="act-theory-to-practice">К практике</button>`;
          iconsRefresh();
          return;
        }
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
        const n = Progress.practiceSolvedCount(progress, lc);
        const req = rule ? rule.required : practice.length;
        const tot = rule ? rule.total : practice.length;
        banner.innerHTML = `<p><strong>Практика:</strong> зачтено <strong>${n}</strong> из <strong>${tot}</strong> по плану. Для допуска к тесту нужно минимум <strong>${req}</strong> верных ответов (лёгкая и средняя полосы; тяжёлая — для уверенности).</p>`;
      } else if (!Progress.isTestUnlocked(progress, lc)) {
        banner.innerHTML = `<p><strong>Тест закрыт,</strong> пока не зачтена практика: минимум <strong>${
          rule ? rule.required : "?"
        }</strong> из <strong>${rule ? rule.total : "?"}</strong> верных заданий. Урок по теории доступен в любой момент — он помогает на тесте, но для замка важна именно практика.</p>`;
      } else if (testPass) {
        banner.innerHTML = "<p><strong>Итоговый тест</strong> (средний уровень) пройден. Тема на 100% — можно вернуться к экрану темы.</p>";
      } else {
        const lane = state.testDiff || "easy";
        const tn = triTest ? Progress.testSolvedCount(progress, lc, lane) : Progress.testSolvedCount(progress, lc);
        const tlen = triTest ? testLane.length : tests.length;
        const suffix = triTest
          ? " Для 100% темы нужно верно ответить на все вопросы среднего уровня."
          : " Нужен верный ответ на каждый вопрос.";
        banner.innerHTML = `<p><strong>Тест:</strong> верно <strong>${tn}</strong> из <strong>${tlen}</strong> (текущая полоса).${suffix}</p>`;
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
      const diffLabel = { easy: "лёгкая", med: "средняя", hard: "тяжёлая" };
      const dl = diffLabel[diff] || diff;
      sec.textContent = isPractice
        ? triPractice
          ? `Практика · ${dl} полоса`
          : "Практика по теме"
        : triTest
          ? `Тест · ${dl} полоса`
          : "Итоговый тест";
      body.appendChild(sec);

      const questions = isPractice ? practiceLane : testLane;
      const pDiff = state.practiceDiff || "med";
      const tDiff = state.testDiff || "easy";
      const pLet = pDiff === "easy" ? "e" : pDiff === "hard" ? "h" : "m";
      const tLet = tDiff === "easy" ? "e" : tDiff === "hard" ? "h" : "m";
      questions.forEach((q, qi) => {
        if (isPractice && q.kind === "steps") {
          appendLearningStepPracticeCard(body, q, qi, progress, lc);
        } else {
          const solKey = isPractice ? `pr-${pLet}-${qi}` : `ts-${tLet}-${qi}`;
          appendLearningQuestionCard(body, q, qi, isPractice, progress, lc, solKey);
        }
      });

      if (!isPractice && testPass) {
        const ok = Progress.testSolvedCount(progress, lc, "med");
        const medLen = getTestLaneList(lc, "med").length;
        const sum = document.createElement("div");
        sum.className = "act-test-summary-v8";
        sum.innerHTML = `
          <h4 class="act-ts-head-v8">Итог</h4>
          <p>Средний тест: <strong>${ok}</strong> из <strong>${medLen}</strong>.</p>
          <p class="act-ts-muted-v8">Лёгкий и тяжёлый уровни — дополнительная тренировка; 100% темы считается по среднему.</p>
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

  function continuationTarget() {
    const saved = prefs.lessonPosition;
    if (saved && Number(saved.grade) === Number(state.grade) && saved.topicId) {
      const topic = findMathTopicById(state.grade, saved.topicId);
      if (topic) return { topic, position: saved };
    }
    const topic = flattenMathTopics(state.grade).find((item) => !!getLearningContent(item)) || flattenMathTopics(state.grade)[0];
    return topic
      ? { topic, position: { subjectKey: "math", grade: state.grade, topicId: topic.id, mode: "theory", stepId: null } }
      : null;
  }

  function renderContinueCard() {
    const target = continuationTarget();
    const card = $("#home-continue-card");
    if (!card) return;
    card.toggleAttribute("hidden", !target);
    if (!target) return;
    const lc = getLearningContent(target.topic);
    const mode = target.position.mode || "theory";
    const modeLabel = { theory: "теория", practice: "практика", test: "тест" }[mode] || "теория";
    const stepIndex =
      cursorForStableStep(lc, target.position.stepId) ??
      structuredTheoryIndexForStableStep(lc, target.position.stepId);
    const title = $("#home-continue-title");
    const meta = $("#home-continue-meta");
    const cta = $("#home-continue-cta");
    if (title) title.textContent = target.topic.title;
    if (meta) meta.textContent = `${state.grade} класс · ${modeLabel}${stepIndex != null ? ` · шаг ${stepIndex + 1}` : ""}`;
    if (cta) cta.textContent = prefs.lessonPosition ? "Продолжить" : "Начать тему";
  }

  function openContinuation() {
    const target = continuationTarget();
    if (!target) return toast("Программа для этого класса готовится.");
    state.subjectKey = "math";
    renderSubjectDetail();
    setTab("subjects");
    openStack("subject-detail");
    renderTopic(target.topic, getSubjectDetail("math", state.grade));
    openTopicOverDetail();
    const mode = target.position.mode || "theory";
    const lc = getLearningContent(target.topic);
    if (!lc) return;
    const diff = target.position.difficulty || (mode === "test" ? "easy" : "med");
    openActivity(mode, diff, { skipPositionSave: true });
    if (mode === "theory" && target.position.stepId) {
      const cursor = cursorForStableStep(lc, target.position.stepId);
      if (cursor != null) {
        state.lessonDialogCursor = cursor;
        state.theoryPanel = "dialog";
        renderActivity();
      } else {
        const theoryIndex = structuredTheoryIndexForStableStep(lc, target.position.stepId);
        if (theoryIndex != null) {
          state.theoryNavSeq = theoryIndex;
          state.theoryPanel = "reader";
          renderActivity();
        }
      }
    }
  }

  function renderSubjectVote() {
    const wrap = $("#subject-vote-options");
    const status = $("#subject-vote-status");
    if (!wrap) return;
    wrap.innerHTML = "";
    (D.subjectVoteOptions || []).forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "subject-vote-btn" + (prefs.subjectVote === option.id ? " subject-vote-btn--on" : "");
      button.dataset.subjectVote = option.id;
      button.innerHTML = `<i data-lucide="${option.icon || "book-open"}"></i><span>${option.title}</span>`;
      wrap.appendChild(button);
    });
    if (status) status.textContent = prefs.subjectVote ? "Голос сохранён. Спасибо!" : "Можно выбрать один вариант.";
  }

  async function submitSubjectVote(optionId) {
    const previous = prefs.subjectVote || null;
    prefs.subjectVote = optionId;
    prefs.subjectVoteUpdatedAt = new Date().toISOString();
    savePrefs();
    renderSubjectVote();
    iconsRefresh();
    const cloud = window.SHANKS_CLOUD;
    try {
      let result = null;
      if (typeof cloud?.voteForSubject === "function") result = await cloud.voteForSubject(optionId);
      else if (typeof cloud?.voteNextSubject === "function") result = await cloud.voteNextSubject(optionId, { previous, grade: state.grade });
      else if (typeof cloud?.submitSubjectVote === "function") result = await cloud.submitSubjectVote({ subjectId: optionId, grade: state.grade });
      else if (typeof cloud?.vote === "function") result = await cloud.vote("next-subject", optionId);
      toast(result?.ok ? "Голос отправлен" : "Голос сохранён локально и отправится после входа");
    } catch (error) {
      toast("Голос сохранён локально и отправится позже");
    }
  }

  async function reportGeneratedContent() {
    const topic = state.curriculumTopic;
    const payload = {
      topicId: topic?.id || null,
      grade: state.grade,
      subjectKey: state.subjectKey,
      mode: state.activityView || state.topicMode,
      textbookId: prefs.textbookId || null,
      createdAt: new Date().toISOString(),
    };
    const cloud = window.SHANKS_CLOUD;
    try {
      if (typeof cloud?.reportGeneratedContent === "function") {
        const result = await cloud.reportGeneratedContent(payload);
        if (result?.ok) {
          toast("Спасибо! Отчёт отправлен редакторам.");
          return;
        }
      }
      if (typeof cloud?.trackEvent === "function" && currentAuthUser) {
        const result = await cloud.trackEvent("content.reported", payload);
        if (result?.ok) {
          toast("Спасибо! Отчёт отправлен редакторам.");
          return;
        }
      }
      const reports = Array.isArray(prefs.generatedContentReports) ? prefs.generatedContentReports : [];
      prefs.generatedContentReports = [...reports.slice(-19), payload];
      savePrefs();
      toast("Отчёт сохранён и отправится при подключении облака.");
    } catch (error) {
      const reports = Array.isArray(prefs.generatedContentReports) ? prefs.generatedContentReports : [];
      prefs.generatedContentReports = [...reports.slice(-19), payload];
      savePrefs();
      toast("Отчёт сохранён и отправится при восстановлении связи.");
    }
  }

  function renderHome() {
    const h = D.home;
    if (!h) return;
    renderContinueCard();
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
        const mathKpi = routeSubjectKey(r.id) === "math" && getMathKpiIdSet(state.grade);
        const progressLabel = routeSubjectKey(r.id) === "math"
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
    renderSubjectVote();

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
    const learningContent = getLearningContent(t);
    const badge = hasPack
      ? isGeneratedLearningContent(learningContent)
        ? `<span class="topic-card-badge topic-card-badge--ai">AI · beta</span>`
        : `<span class="topic-card-badge topic-card-badge--live">Интерактив</span>`
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
    return "Продолжай с текущего шага: теория → практика → тест.";
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
        openLesson.textContent = "Приступить к уроку";
        list.appendChild(openLesson);

        if (usesStructuredTheory(lc)) {
          (lc.theory || []).forEach((block) => {
            if (!block || !block.id) return;
            const row = document.createElement("button");
            row.type = "button";
            row.className = "theory-item theory-featured act-topic-theory-block-v8";
            row.dataset.theoryBlockId = block.id;
            const preview =
              typeof block.body === "string" && block.body.length > 180
                ? `${block.body.slice(0, 180)}…`
                : block.body || "";
            row.innerHTML = `
            <div class="tf-top">
              <strong>${block.title}</strong>
              <span class="badge-read">Раздел</span>
            </div>
            <p class="theory-block-body">${preview}</p>`;
            row.addEventListener("click", () => {
              state.theoryJumpBlockId = block.id;
              state.topicMode = "theory";
              syncModeTiles();
              openActivity("theory", "easy");
            });
            list.appendChild(row);
          });
        } else {
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
        }
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
    state.theoryNavSeq = null;
    state.theoryPanel = "toc";
    state.lessonDialogCursor = null;
    state.theoryJumpBlockId = null;
    state.activityBreakdown = null;
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
    syncGeneratedContentNotice(getLearningContent(state.curriculumTopic));
    updateTopicModeDescriptors();
    syncModeTiles();
    syncTopicBody();
  }

  function renderNotes() {
    const grid = $("#notes-grid");
    grid.innerHTML = "";
    (D.notes?.bubbles || []).filter((b) => b.subject === "Математика").forEach((b) => {
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

    if (e.target.closest("#btn-home-continue")) {
      openContinuation();
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

    if (e.target.closest("#btn-profile-textbook")) {
      openSheet("textbook");
      return;
    }

    if (e.target.closest("#btn-auth-action")) {
      runAuthAction("signin");
      return;
    }

    if (e.target.closest("#btn-auth-signup")) {
      runAuthAction("signup");
      return;
    }

    if (e.target.closest("#btn-auth-signout")) {
      runAuthAction("signout");
      return;
    }

    const vote = e.target.closest("[data-subject-vote]");
    if (vote) {
      submitSubjectVote(vote.dataset.subjectVote);
      return;
    }

    if (e.target.closest("[data-report-generated]")) {
      reportGeneratedContent();
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

    const pickTextbook = e.target.closest("[data-pick-textbook-sheet]");
    if (pickTextbook && $("#sheet-textbook")?.contains(pickTextbook)) {
      prefs.textbookId = pickTextbook.getAttribute("data-pick-textbook-sheet") || null;
      prefs.trajectoryVersion = trajectoryFor(prefs.textbookId)?.version || "1";
      savePrefs();
      renderHome();
      renderProfile();
      closeSheet("textbook");
      toast("Учебник обновлён · прогресс сохранён");
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

    if (e.target.closest("#act-back") || e.target.closest("[data-act-back-lesson]")) {
      closeActivity();
      return;
    }

    const bdOpen = e.target.closest("[data-open-breakdown]");
    if (bdOpen && $("#stack-activity")?.classList.contains("is-open")) {
      const ct = state.curriculumTopic;
      const lc = getLearningContent(ct);
      if (!lc) return;
      const isSteps = bdOpen.dataset.bdSteps === "1";
      const isPractice = bdOpen.dataset.bdPractice === "1";
      const qi = Number(bdOpen.dataset.bdIdx);
      const solKey = String(bdOpen.dataset.bdSol || "");
      if (isSteps) {
        const laneDiff = state.practiceDiff || "med";
        const lane = getPracticeLaneList(lc, laneDiff);
        const task = lane[qi];
        if (!task || !canOpenQuestionBreakdown(task)) return;
        state.activityBreakdown = { kind: "steps", task, solKey, isPractice: true, qi };
      } else {
        const diff = isPractice ? state.practiceDiff || "med" : state.testDiff || "easy";
        const arr = isPractice ? getPracticeLaneList(lc, diff) : getTestLaneList(lc, diff);
        const q = arr[qi];
        if (!q || !canOpenQuestionBreakdown(q)) return;
        state.activityBreakdown = { qi, solKey, isPractice, diff };
      }
      renderActivity();
      return;
    }

    if (e.target.closest("#act-breakdown-back")) {
      state.activityBreakdown = null;
      renderActivity();
      return;
    }

    if (e.target.closest("#stack-activity.is-open [data-lesson-toc]")) {
      openLessonCatalogFromDialog();
      return;
    }

    if (e.target.closest("#act-lesson-restart")) {
      resetLessonStepAttempts();
      state.theoryPanel = "dialog";
      state.lessonDialogCursor = 0;
      state.theoryNavSeq = null;
      state.theoryJumpBlockId = null;
      renderActivity();
      return;
    }

    if (e.target.closest("#act-theory-to-practice")) {
      state.activityView = "practice";
      renderActivity();
      return;
    }
    if (e.target.closest("#act-theory-back-toc")) {
      state.theoryNavSeq = null;
      renderActivity();
      return;
    }
    if (e.target.closest("#act-theory-next-block")) {
      const ct = state.curriculumTopic;
      const lc = getLearningContent(ct);
      if (!lc || !usesStructuredTheory(lc)) return;
      const seq = getTheoryReaderSequence(lc);
      if (state.theoryNavSeq == null) return;
      const last = state.theoryNavSeq >= seq.length - 1;
      if (last) {
        state.activityView = "practice";
        renderActivity();
      } else {
        state.theoryNavSeq += 1;
        renderActivity();
      }
      return;
    }
    const theoryNavBtn = e.target.closest("[data-theory-nav]");
    if (theoryNavBtn && $("#stack-activity")?.classList.contains("is-open")) {
      const si = Number(theoryNavBtn.getAttribute("data-theory-nav"));
      if (Number.isFinite(si)) {
        state.theoryNavSeq = si;
        renderActivity();
      }
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
      const ct = state.curriculumTopic;
      const lc = isCurriculumTopic(ct) ? getLearningContent(ct) : null;
      state.activityBreakdown = null;
      state.activityView = "theory";
      state.theoryNavSeq = null;
      if (lc && hasLessonDialog(lc)) {
        state.theoryPanel = "dialog";
        state.lessonDialogCursor = 0;
        resetLessonStepAttempts();
      } else {
        state.theoryPanel = "toc";
        state.lessonDialogCursor = null;
      }
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
        const ct = state.curriculumTopic;
        const lc = isCurriculumTopic(ct) ? getLearningContent(ct) : null;
        state.theoryNavSeq = null;
        state.activityBreakdown = null;
        state.activityView = "theory";
        if (lc && hasLessonDialog(lc)) {
          state.theoryPanel = "dialog";
          state.lessonDialogCursor = 0;
          resetLessonStepAttempts();
        } else {
          state.theoryPanel = "toc";
          state.lessonDialogCursor = null;
        }
        renderActivity();
        return;
      }
      if (t === "practice") {
        state.activityBreakdown = null;
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
        state.activityBreakdown = null;
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
      state.activityBreakdown = null;
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
          const openTestDiff = lc.testByDifficulty ? "med" : "easy";
          openActivity("test", openTestDiff);
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
    $("#auth-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      runAuthAction("signin");
    });

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
    const grades = (D.grades || [5, 6, 7, 8, 9, 10, 11]).filter((grade) => grade >= 5 && grade <= 11);
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
      .finally(async () => {
        await bindAuthHook().catch(() => {});
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
