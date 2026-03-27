(function () {
  "use strict";

  const D = window.SHANKS_DATA || {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const state = {
    tab: "home",
    grade: D.defaultGrade || 5,
    stack: null,
    subjectKey: "math",
  };

  function iconsRefresh() {
    if (window.lucide) window.lucide.createIcons();
  }

  function setTab(tab) {
    state.tab = tab;
    $$(".view-main").forEach((el) => el.classList.toggle("is-active", el.dataset.tab === tab));
    $$(".nav-seg").forEach((btn) => {
      const on = btn.dataset.nav === tab;
      btn.classList.toggle("nav-seg--active", on);
    });
    $("#app").classList.remove("stack-open");
    iconsRefresh();
  }

  function openStack(name) {
    state.stack = name;
    $("#app").classList.add("stack-open");
    if (name === "subject-detail") {
      $("#stack-topic").classList.remove("is-open");
      $("#stack-subject-detail").classList.add("is-open");
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
    iconsRefresh();
  }

  function renderHome() {
    const h = D.home;
    if (!h) return;
    $("#home-big-pct").textContent = `${h.overallPct}%`;
    $("#home-task-text").textContent = h.taskDay.title;
    $("#home-task-xp").textContent = h.taskDay.xp;
    $("#home-quiz-text").textContent = h.quiz.text;
    $($("#home-quiz-btn").querySelector("span")).textContent = h.quiz.cta;

    const list = $("#home-subj-list");
    list.innerHTML = "";
    h.subjects.forEach((s) => {
      const row = document.createElement("div");
      row.className = "subj-row";
      const muted = s.pct === 0;
      row.innerHTML = `
        <i data-lucide="${s.icon}" class="subj-ico"></i>
        <div class="subj-meta">
          <strong>${s.label}</strong>
          <span>${s.sub}</span>
        </div>
        <div class="pb-track"><div class="pb-fill" style="width:${muted ? 0 : s.pct}%"></div></div>
        <span class="subj-pct ${muted ? "subj-pct--muted" : ""}">${s.pct}%</span>`;
      list.appendChild(row);
    });
  }

  function renderSubjects() {
    $("#sub-grade-kicker").textContent = `★ КЛАСС ${state.grade}`;
    $$(".pill").forEach((p) => {
      const g = +p.dataset.grade;
      p.classList.toggle("pill--on", g === state.grade);
    });

    const fav = $("#fav-list");
    fav.innerHTML = "";
    (D.subjectsScreen?.favorites || []).forEach((f) => {
      const card = document.createElement("div");
      card.className = "fav-card";
      card.innerHTML = `
        <div class="fav-inner">
          <div class="fav-left">
            <div class="fav-ico"><i data-lucide="${f.icon}"></i></div>
            <div class="fav-meta"><strong>${f.name}</strong></div>
          </div>
          <div class="fav-stat">
            <i data-lucide="heart" class="ico-heart-fill"></i>
            <span class="fav-pct">${f.pct}%</span>
          </div>
        </div>`;
      fav.appendChild(card);
    });

    const rows = $("#sub-rows");
    rows.innerHTML = "";
    (D.subjectsScreen?.rows || []).forEach((r) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "subject-row";
      el.dataset.subjectId = r.id;
      el.innerHTML = `
        <div class="sr-left">
          <span class="sr-dot" style="background:${r.dot}"></span>
          <span class="sr-title">${r.name}</span>
        </div>
        <div class="sr-right">
          <i data-lucide="heart" class="${r.favorite ? "ico-heart-fill" : "ico-heart"}"></i>
          <span class="sr-pct">${r.pct}%</span>
        </div>`;
      el.addEventListener("click", () => {
        state.subjectKey = r.name === "Физика" ? "math" : "math";
        renderSubjectDetail();
        openStack("subject-detail");
      });
      rows.appendChild(el);
    });
  }

  function renderSubjectDetail() {
    const key = state.subjectKey;
    const sd = D.subjectDetail?.[key] || D.subjectDetail?.math;
    if (!sd) return;
    $("#sd-class").textContent = `★ ${sd.classLabel}`;
    $("#sd-title").textContent = sd.title;
    $("#sd-pct-label").textContent = `${sd.heroPct}% изучено`;
    $("#sd-hero-fill").style.width = `${sd.heroPct}%`;

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
        renderTopic(t);
        openTopicOverDetail();
      });
      tl.appendChild(card);
    });
  }

  function renderTopic(topic) {
    const T = D.topic;
    $("#tp-title").textContent = topic?.title || T.title;
    $("#tp-meta").textContent = T.subjectLine;
    $("#tp-bar").style.width = `${T.barWidthPct}%`;

    const list = $("#theory-list-body");
    list.innerHTML = "";
    $("#theory-section-label").textContent = "Теория";

    T.theory.forEach((item) => {
      if (item.kind === "done") {
        const row = document.createElement("div");
        row.className = "theory-item";
        row.innerHTML = `
          <i data-lucide="book-open"></i>
          <div class="theory-body">
            <strong>${item.title}</strong>
            <span>${item.sub}</span>
          </div>
          <i data-lucide="check" class="check"></i>`;
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
        const row = document.createElement("div");
        row.className = "theory-item theory-muted";
        row.innerHTML = `
          <span class="accent-bar"></span>
          <div class="theory-body tm-body">
            <strong>${item.title}</strong>
            <span>${item.sub}</span>
          </div>`;
        list.appendChild(row);
      }
    });
  }

  function renderNotes() {
    const grid = $("#notes-grid");
    grid.innerHTML = "";
    (D.notes?.bubbles || []).forEach((b) => {
      const tile = document.createElement("div");
      tile.className = "bubble";
      tile.innerHTML = `
        <div class="bubble-ico"><i data-lucide="${b.icon}"></i></div>
        <strong>${b.subject}</strong>
        <span>${b.grade}</span>`;
      grid.appendChild(tile);
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "bubble bubble--cta";
    add.innerHTML = `<i data-lucide="plus"></i><strong>Новый диалог</strong>`;
    grid.appendChild(add);
    $("#dock-hint").textContent = D.notes?.dock || "";
  }

  function bind() {
    $$(".nav-seg").forEach((btn) => {
      btn.addEventListener("click", () => setTab(btn.dataset.nav));
    });

    $$(".pill").forEach((p) => {
      p.addEventListener("click", () => {
        state.grade = +p.dataset.grade;
        renderSubjects();
        iconsRefresh();
      });
    });

    $("#sd-back").addEventListener("click", closeStack);
    $("#tp-back").addEventListener("click", closeTopic);

    $("#tab-subjects").addEventListener("click", () => {
      renderSubjects();
    });

    $("#tab-notes").addEventListener("click", () => {
      renderNotes();
    });
  }

  function init() {
    $("#loading")?.classList.add("is-hidden");
    $("#main-app")?.classList.remove("main-hidden");

    renderHome();
    renderSubjects();
    renderSubjectDetail();
    renderTopic(null);
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
