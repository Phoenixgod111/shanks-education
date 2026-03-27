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

  const state = {
    tab: "home",
    grade: D.defaultGrade || 5,
    stack: null,
    subjectKey: "math",
    topicMode: "theory",
  };

  let prefs = { favoritesByGrade: {}, initialized: false };
  let toastTimer = null;

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

  function initPrefs() {
    prefs = loadPrefs();
    if (!prefs.initialized) {
      prefs.favoritesByGrade = {};
      const seed = D.seedFavoritesByGrade || {};
      Object.keys(seed).forEach((g) => {
        prefs.favoritesByGrade[g] = seed[g].slice();
      });
      prefs.initialized = true;
      savePrefs();
    }
    (D.grades || []).forEach((g) => {
      const k = String(g);
      if (!Array.isArray(prefs.favoritesByGrade[k])) prefs.favoritesByGrade[k] = [];
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

  function getSubjectDetail(key) {
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
    iconsRefresh();
  }

  function resetSearchUi() {
    const sp = $("#sd-search-panel");
    const inp = $("#sd-search-input");
    const btn = $("#btn-sd-search");
    if (sp) sp.hidden = true;
    if (inp) inp.value = "";
    if (btn) btn.classList.remove("is-active");
    filterTopics("");
  }

  function openStack(name) {
    state.stack = name;
    $("#app").classList.add("stack-open");
    if (name === "subject-detail") {
      $("#stack-topic").classList.remove("is-open");
      $("#stack-subject-detail").classList.add("is-open");
      resetSearchUi();
    }
    iconsRefresh();
  }

  function openTopicOverDetail() {
    state.stack = "topic";
    $("#app").classList.add("stack-open");
    $("#stack-subject-detail").classList.add("is-open");
    $("#stack-topic").classList.add("is-open");
    iconsRefresh();
  }

  function closeTopic() {
    $("#stack-topic").classList.remove("is-open");
    state.stack = "subject-detail";
    iconsRefresh();
  }

  function closeStack() {
    state.stack = null;
    $("#app").classList.remove("stack-open");
    $$(".stack-layer").forEach((el) => el.classList.remove("is-open"));
    resetSearchUi();
    iconsRefresh();
  }

  function toggleSearchPanel() {
    const sp = $("#sd-search-panel");
    const btn = $("#btn-sd-search");
    if (!sp) return;
    const next = sp.hidden;
    sp.hidden = !next;
    btn?.classList.toggle("is-active", next);
    if (next) {
      setTimeout(() => $("#sd-search-input")?.focus(), 80);
    } else {
      $("#sd-search-input").value = "";
      filterTopics("");
    }
    iconsRefresh();
  }

  function filterTopics(q) {
    const norm = (q || "").trim().toLowerCase();
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
        const muted = !r.pct;
        row.innerHTML = `
          <i data-lucide="${r.icon}" class="subj-ico"></i>
          <div class="subj-meta">
            <strong>${r.name}</strong>
            <span>${state.grade} класс</span>
          </div>
          <div class="pb-track"><div class="pb-fill" style="width:${muted ? 0 : r.pct}%"></div></div>
          <span class="subj-pct ${muted ? "subj-pct--muted" : ""}">${r.pct}%</span>`;
        list.appendChild(row);
      });
    }
  }

  function renderSubjects() {
    $("#sub-grade-kicker").textContent = `★ КЛАСС ${state.grade}`;
    $$(".pill").forEach((p) => {
      const g = +p.dataset.grade;
      p.classList.toggle("pill--on", g === state.grade);
    });

    const catalog = getCatalog(state.grade);
    const favIds = getFavoritesForGrade(state.grade);
    const favSet = new Set(favIds);
    const favRows = catalog.filter((r) => favSet.has(r.id));

    const fav = $("#fav-list");
    fav.innerHTML = "";
    if (favRows.length === 0) {
      const empty = document.createElement("p");
      empty.className = "fav-strip-empty";
      empty.textContent = "Нет избранных — нажми ❤ на предмете ниже";
      fav.appendChild(empty);
    } else {
      favRows.forEach((r) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "fav-card is-button";
        card.dataset.openSubject = routeSubjectKey(r.id);
        card.innerHTML = `
          <div class="fav-inner">
            <div class="fav-left">
              <div class="fav-ico"><i data-lucide="${r.icon}"></i></div>
              <div class="fav-meta"><strong>${r.name}</strong></div>
            </div>
            <div class="fav-stat">
              <i data-lucide="heart" class="ico-heart-fill"></i>
              <span class="fav-pct">${r.pct}%</span>
            </div>
          </div>`;
        fav.appendChild(card);
      });
    }

    const rows = $("#sub-rows");
    rows.innerHTML = "";
    catalog.forEach((r) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "subject-row";
      el.dataset.subjectId = r.id;
      const isFav = favSet.has(r.id);
      el.innerHTML = `
        <div class="sr-left">
          <span class="sr-dot" style="background:${r.dot}"></span>
          <span class="sr-title">${r.name}</span>
        </div>
        <div class="sr-right">
          <span class="heart-hit" data-heart-toggle tabindex="0" role="button" aria-label="В избранное">
            <i data-lucide="heart" class="${isFav ? "ico-heart-fill" : "ico-heart"}"></i>
          </span>
          <span class="sr-pct">${r.pct}%</span>
        </div>`;
      el.addEventListener("click", (ev) => {
        if (ev.target.closest("[data-heart-toggle]")) return;
        state.subjectKey = routeSubjectKey(r.id);
        renderSubjectDetail();
        openStack("subject-detail");
      });
      rows.appendChild(el);
    });
  }

  function renderSubjectDetail() {
    const sd = getSubjectDetail(state.subjectKey);
    if (!sd) return;
    $("#sd-class").textContent = `★ КЛАСС ${state.grade}`;
    const row = catalogRowForDetailKey(state.grade, state.subjectKey);
    $("#sd-title").textContent = row?.name || sd.title;
    const heroPct = row ? row.pct : sd.heroPct;
    $("#sd-pct-label").textContent = `${heroPct}% изучено`;
    $("#sd-hero-fill").style.width = `${heroPct}%`;

    const tl = $("#sd-topics");
    tl.innerHTML = "";
    sd.topics.forEach((t) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "topic-card";
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
    });
    filterTopics($("#sd-search-input")?.value || "");
  }

  function syncModeTiles() {
    const mode = state.topicMode;
    $$("#topic-mode-row .mode-tile").forEach((btn) => {
      const m = btn.dataset.mode;
      const isTest = m === "test";
      const on = !isTest && m === mode;
      btn.classList.toggle("mode-tile--on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      if (isTest) btn.classList.add("mode-tile--dim");
      else btn.classList.remove("mode-tile--dim");
    });
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
    const mode = state.topicMode;
    const label = $("#theory-section-label");
    const list = $("#theory-list-body");
    list.innerHTML = "";

    if (mode === "theory") {
      label.textContent = "Теория";
      appendTheoryItems(list, T);
    } else if (mode === "practice") {
      label.textContent = "Задачи";
      (T.practice || []).forEach((item) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "theory-item";
        row.innerHTML = `
          <i data-lucide="pencil"></i>
          <div class="theory-body">
            <strong>${item.title}</strong>
            <span>${item.sub}</span>
          </div>`;
        row.addEventListener("click", () =>
          toast("Задача: следующий шаг — отдельный экран решения.")
        );
        list.appendChild(row);
      });
    } else if (mode === "test") {
      label.textContent = "Тест";
      const row = document.createElement("div");
      row.className = "theory-item theory-muted";
      row.innerHTML = `
        <span class="accent-bar"></span>
        <div class="theory-body tm-body">
          <strong>Тест закрыт</strong>
          <span>Заверши практику — и тест разблокируется</span>
        </div>`;
      list.appendChild(row);
    }
    iconsRefresh();
  }

  function renderTopic(topic, sd) {
    const T = D.topic;
    const detail = sd || getSubjectDetail(state.subjectKey);
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

    const hs = e.target.closest("[data-home-subject]");
    if (hs) {
      state.subjectKey = routeSubjectKey(hs.getAttribute("data-home-subject"));
      renderSubjectDetail();
      setTab("subjects");
      openStack("subject-detail");
      return;
    }

    const fav = e.target.closest(".fav-card[data-open-subject]");
    if (fav) {
      state.subjectKey = fav.dataset.openSubject;
      renderSubjectDetail();
      setTab("subjects");
      openStack("subject-detail");
      return;
    }

    const ht = e.target.closest("[data-heart-toggle]");
    if (ht) {
      e.preventDefault();
      const row = ht.closest(".subject-row");
      if (row?.dataset.subjectId) {
        toggleFavoriteId(state.grade, row.dataset.subjectId);
        refreshProgressAfterFav();
      }
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

    if (e.target.closest("#btn-profile-settings")) {
      toast((D.copy && D.copy.settings) || "Настройки.");
      return;
    }

    if (e.target.closest("#btn-dock-camera")) {
      toast((D.copy && D.copy.camera) || "Камера.");
      return;
    }

    if (e.target.closest("#btn-sd-search")) {
      toggleSearchPanel();
      return;
    }

    const modeBtn = e.target.closest("#topic-mode-row .mode-tile[data-mode]");
    if (modeBtn) {
      const m = modeBtn.dataset.mode;
      if (m === "test") {
        toast("Тест закрыт: пройди практику по теме.");
        return;
      }
      state.topicMode = m;
      syncModeTiles();
      syncTopicBody();
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

    $$(".pill").forEach((p) => {
      p.addEventListener("click", () => {
        state.grade = +p.dataset.grade;
        renderSubjects();
        renderHome();
        iconsRefresh();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const ht = document.activeElement?.closest?.("[data-heart-toggle]");
      if (ht) {
        const row = ht.closest(".subject-row");
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
    $("#main-app")?.classList.remove("main-hidden");

    renderHome();
    renderSubjects();
    renderSubjectDetail();
    renderTopic(null, getSubjectDetail(state.subjectKey));
    renderNotes();
    bind();
    setTab("home");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
