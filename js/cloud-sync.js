/**
 * Изолированный Supabase-слой Shanks.
 * Не требует конфигурации: в локальном режиме методы возвращают disabled,
 * а приложение продолжает работать с localStorage.
 */
(function () {
  "use strict";

  const DEFAULT_SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  const DEFAULT_PREFS_KEY = "shanks_prefs_v2";
  const LEGACY_PREFS_KEYS = ["shanks_prefs_v1", "shanks_prefs"];
  let client = null;
  let initPromise = null;
  let status = { state: "idle", reason: null };

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function cloneJson(value, fallback) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_error) {
      return fallback;
    }
  }

  function getConfig() {
    return isObject(window.SHANKS_CONFIG) ? window.SHANKS_CONFIG : {};
  }

  function decodeJwtPayload(token) {
    try {
      const part = String(token).split(".")[1];
      if (!part) return null;
      const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(normalized));
    } catch (_error) {
      return null;
    }
  }

  function validateConfig(config) {
    const url = String(config.supabaseUrl || "").trim();
    const key = String(config.supabaseAnonKey || config.supabasePublishableKey || "").trim();
    if (!url || !key) return { ok: false, reason: "missing_config" };
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
        return { ok: false, reason: "insecure_url" };
      }
    } catch (_error) {
      return { ok: false, reason: "invalid_url" };
    }
    const payload = decodeJwtPayload(key);
    if (payload && payload.role === "service_role") return { ok: false, reason: "service_role_forbidden" };
    return { ok: true, url, key };
  }

  function isConfigured() {
    return validateConfig(getConfig()).ok;
  }

  function loadSdk(src) {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      return Promise.resolve(window.supabase);
    }
    if (typeof document === "undefined") return Promise.reject(new Error("Supabase SDK доступен только в браузере"));
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-shanks-supabase-sdk="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.supabase), { once: true });
        existing.addEventListener("error", () => reject(new Error("Не удалось загрузить Supabase SDK")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.shanksSupabaseSdk = "true";
      script.onload = () => resolve(window.supabase);
      script.onerror = () => reject(new Error("Не удалось загрузить Supabase SDK"));
      document.head.appendChild(script);
    });
  }

  async function init() {
    if (client) return { enabled: true, client };
    if (initPromise) return initPromise;
    const config = getConfig();
    const checked = validateConfig(config);
    if (!checked.ok) {
      status = { state: "disabled", reason: checked.reason };
      return { enabled: false, reason: checked.reason, client: null };
    }
    status = { state: "loading", reason: null };
    initPromise = loadSdk(String(config.supabaseSdkUrl || DEFAULT_SDK_URL))
      .then((sdk) => {
        if (!sdk || typeof sdk.createClient !== "function") throw new Error("Некорректный Supabase SDK");
        client = sdk.createClient(checked.url, checked.key, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        });
        status = { state: "ready", reason: null };
        return { enabled: true, client };
      })
      .catch((error) => {
        status = { state: "error", reason: String(error.message || error) };
        initPromise = null;
        return { enabled: false, reason: status.reason, client: null };
      });
    return initPromise;
  }

  function getStatus() {
    return { ...status, configured: isConfigured() };
  }

  async function requireUser() {
    const ready = await init();
    if (!ready.enabled) return { disabled: true, reason: ready.reason };
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    if (!data.user) return { disabled: false, user: null };
    return { disabled: false, user: data.user };
  }

  function normalizePrefs(value) {
    const source = isObject(value) ? value : {};
    const favoritesByGrade = {};
    if (isObject(source.favoritesByGrade)) {
      Object.keys(source.favoritesByGrade).forEach((grade) => {
        const n = Number(grade);
        if (n < 5 || n > 11 || !Array.isArray(source.favoritesByGrade[grade])) return;
        favoritesByGrade[String(n)] = Array.from(
          new Set(source.favoritesByGrade[grade].filter((id) => typeof id === "string" && id.length <= 64)),
        );
      });
    }
    const topicProgress = {};
    if (isObject(source.topicProgress)) {
      Object.keys(source.topicProgress).forEach((key) => {
        if (typeof key !== "string" || key.length > 260 || !isObject(source.topicProgress[key])) return;
        topicProgress[key] = cloneJson(source.topicProgress[key], {});
      });
    }
    const grade = Number(source.grade);
    const displayName = typeof source.displayName === "string" ? source.displayName.trim().slice(0, 48) : "";
    const textbookId = typeof source.textbookId === "string" ? source.textbookId.slice(0, 128) : null;
    const currentTopicId = typeof source.currentTopicId === "string" ? source.currentTopicId.slice(0, 128) : null;
    const trajectoryVersion =
      typeof source.trajectoryVersion === "string" ? source.trajectoryVersion.slice(0, 32) : "1";
    const prefsSchemaVersion = Number(source.prefsSchemaVersion || source.schemaVersion);
    return {
      ...cloneJson(source, {}),
      grade: grade >= 5 && grade <= 11 ? grade : null,
      displayName,
      textbookId,
      currentTopicId,
      trajectoryVersion,
      prefsSchemaVersion: Number.isInteger(prefsSchemaVersion) && prefsSchemaVersion >= 1 ? prefsSchemaVersion : 3,
      schemaVersion: Number.isInteger(prefsSchemaVersion) && prefsSchemaVersion >= 1 ? prefsSchemaVersion : 3,
      studyGoal: typeof source.studyGoal === "string" ? source.studyGoal.slice(0, 100) : null,
      onboardingCompleted: source.onboardingCompleted === true,
      initialized: source.initialized === true,
      favoritesByGrade,
      topicProgress,
    };
  }

  function hasMeaningfulPrefs(value) {
    const prefs = normalizePrefs(value);
    return !!(
      prefs.onboardingCompleted ||
      prefs.displayName ||
      prefs.grade != null ||
      prefs.textbookId ||
      prefs.currentTopicId ||
      isObject(prefs.lessonPosition) ||
      Object.keys(prefs.topicProgress).length > 0 ||
      prefs.subjectVote
    );
  }

  function readLocalPrefs(storageKey) {
    const config = getConfig();
    const primary = storageKey || config.prefsStorageKey || DEFAULT_PREFS_KEY;
    const configuredLegacy = Array.isArray(config.legacyPrefsStorageKeys) ? config.legacyPrefsStorageKeys : [];
    const keys = [primary, ...configuredLegacy, ...LEGACY_PREFS_KEYS].filter(
      (key, index, all) => typeof key === "string" && key && all.indexOf(key) === index,
    );
    if (typeof localStorage === "undefined") return { prefs: normalizePrefs({}), sourceKey: null };
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return { prefs: normalizePrefs(JSON.parse(raw)), sourceKey: key };
      } catch (_error) {}
    }
    return { prefs: normalizePrefs({}), sourceKey: null };
  }

  function writeLocalPrefs(prefs, storageKey) {
    const key = storageKey || getConfig().prefsStorageKey || DEFAULT_PREFS_KEY;
    if (typeof localStorage === "undefined") return false;
    try {
      localStorage.setItem(key, JSON.stringify(normalizePrefs(prefs)));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function parseTopicKey(key) {
    const parts = String(key).split(":");
    const grade = Number(parts[1]);
    if (parts.length < 3 || !parts[0] || grade < 5 || grade > 11) return null;
    return { subject_id: parts[0], grade, topic_id: parts.slice(2).join(":") };
  }

  function prefsToRows(prefs, userId) {
    const clean = normalizePrefs(prefs);
    const selectionsByKey = new Map();
    for (let grade = 5; grade <= 11; grade += 1) {
      const selected = (clean.favoritesByGrade[String(grade)] || []).includes("math");
      const isCurrentMath = grade === clean.grade;
      selectionsByKey.set(`${grade}:math`, {
        user_id: userId,
        grade,
        subject_id: "math",
        textbook_id: isCurrentMath ? clean.textbookId : null,
        trajectory_version: isCurrentMath ? clean.trajectoryVersion : null,
        current_topic_id: isCurrentMath ? clean.currentTopicId : null,
        selected,
      });
    }
    Object.keys(clean.favoritesByGrade).forEach((grade) => {
      clean.favoritesByGrade[grade].forEach((subjectId) => {
        const isCurrentMath = subjectId === "math" && Number(grade) === clean.grade;
        selectionsByKey.set(`${Number(grade)}:${subjectId}`, {
          user_id: userId,
          grade: Number(grade),
          subject_id: subjectId,
          textbook_id: isCurrentMath ? clean.textbookId : null,
          trajectory_version: isCurrentMath ? clean.trajectoryVersion : null,
          current_topic_id: isCurrentMath ? clean.currentTopicId : null,
          selected: true,
        });
      });
    });
    const selections = Array.from(selectionsByKey.values());
    const progress = [];
    Object.keys(clean.topicProgress).forEach((key) => {
      const parsed = parseTopicKey(key);
      if (parsed) progress.push({ user_id: userId, ...parsed, progress: clean.topicProgress[key] });
    });
    return {
      profile: {
        id: userId,
        display_name: clean.displayName || null,
        grade: clean.grade,
        study_goal: clean.studyGoal,
        prefs_schema_version: clean.prefsSchemaVersion,
        onboarding_completed: clean.onboardingCompleted,
      },
      selections,
      progress,
    };
  }

  async function upsertOwnedRows(table, rows) {
    if (!rows.length) return;
    const upserted = await client.from(table).upsert(rows);
    if (upserted.error) throw upserted.error;
  }

  async function pushPrefs(prefs) {
    const auth = await requireUser();
    if (auth.disabled || !auth.user) return { ok: false, reason: auth.disabled ? auth.reason : "not_authenticated" };
    const rows = prefsToRows(prefs, auth.user.id);
    const profile = await client.from("profiles").upsert(rows.profile);
    if (profile.error) throw profile.error;
    await upsertOwnedRows("learning_selections", rows.selections);
    await upsertOwnedRows("topic_progress", rows.progress);
    return { ok: true, userId: auth.user.id };
  }

  async function pullPrefs() {
    const auth = await requireUser();
    if (auth.disabled || !auth.user) return { ok: false, reason: auth.disabled ? auth.reason : "not_authenticated", prefs: null };
    const [profile, selections, progress, latestPosition, vote] = await Promise.all([
      client
        .from("profiles")
        .select("display_name,grade,study_goal,prefs_schema_version,onboarding_completed,updated_at")
        .eq("id", auth.user.id)
        .maybeSingle(),
      client
        .from("learning_selections")
        .select("grade,subject_id,textbook_id,trajectory_version,current_topic_id,selected,updated_at")
        .eq("user_id", auth.user.id),
      client.from("topic_progress").select("subject_id,grade,topic_id,progress,updated_at").eq("user_id", auth.user.id),
      client
        .from("lesson_positions")
        .select("position,updated_at")
        .eq("user_id", auth.user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client.from("subject_votes").select("subject_id,updated_at").eq("user_id", auth.user.id).maybeSingle(),
    ]);
    if (profile.error) throw profile.error;
    if (selections.error) throw selections.error;
    if (progress.error) throw progress.error;
    if (latestPosition.error) throw latestPosition.error;
    if (vote.error) throw vote.error;
    const activeMath = (selections.data || []).find(
      (row) => row.selected && row.subject_id === "math" && row.grade === profile.data?.grade,
    );
    const hasRemoteData = !!(
      (profile.data &&
        (profile.data.onboarding_completed ||
          profile.data.display_name ||
          profile.data.grade != null ||
          profile.data.study_goal)) ||
      (selections.data || []).some((row) => row.selected) ||
      (progress.data || []).length ||
      latestPosition.data ||
      vote.data
    );
    const prefs = normalizePrefs({
      initialized: hasRemoteData,
      onboardingCompleted: profile.data?.onboarding_completed === true,
      prefsSchemaVersion: profile.data?.prefs_schema_version ?? 3,
      displayName: profile.data?.display_name ?? "",
      grade: profile.data?.grade ?? null,
      studyGoal: profile.data?.study_goal ?? null,
      textbookId: activeMath?.textbook_id ?? null,
      trajectoryVersion: activeMath?.trajectory_version ?? "1",
      currentTopicId: activeMath?.current_topic_id ?? null,
      lessonPosition: latestPosition.data?.position ?? null,
      subjectVote: vote.data?.subject_id ?? null,
      subjectVoteUpdatedAt: vote.data?.updated_at ?? null,
      favoritesByGrade: (selections.data || []).reduce((all, row) => {
        if (!row.selected) return all;
        const key = String(row.grade);
        if (!all[key]) all[key] = [];
        all[key].push(row.subject_id);
        return all;
      }, {}),
      topicProgress: (progress.data || []).reduce((all, row) => {
        all[`${row.subject_id}:${row.grade}:${row.topic_id}`] = row.progress;
        return all;
      }, {}),
    });
    return {
      ok: true,
      prefs,
      userId: auth.user.id,
      updatedAt: profile.data?.updated_at || null,
      hasRemoteData,
    };
  }

  async function syncPrefsProgress(options) {
    const opts = isObject(options) ? options : {};
    const local = normalizePrefs(opts.prefs || readLocalPrefs(opts.storageKey).prefs);
    const strategy = opts.strategy || "local-wins";
    if (strategy === "remote-wins") {
      const pulled = await pullPrefs();
      if (!pulled.ok) return pulled;
      if (opts.writeLocal !== false) writeLocalPrefs(pulled.prefs, opts.storageKey);
      return pulled;
    }
    const pushed = await pushPrefs(local);
    if (!pushed.ok) return pushed;
    return { ok: true, prefs: local, userId: pushed.userId };
  }

  async function migrateLocalStorage(options) {
    const opts = isObject(options) ? options : {};
    const auth = await requireUser();
    if (auth.disabled || !auth.user) return { ok: false, migrated: false, reason: auth.disabled ? auth.reason : "not_authenticated" };
    const markerKey = `shanks_cloud_migrated_v1:${auth.user.id}`;
    if (!opts.force && localStorage.getItem(markerKey) === "1") return { ok: true, migrated: false, reason: "already_migrated" };
    const local = readLocalPrefs(opts.storageKey);
    if (!local.sourceKey) return { ok: true, migrated: false, reason: "no_local_data" };
    if (!hasMeaningfulPrefs(local.prefs)) {
      return { ok: true, migrated: false, reason: "no_meaningful_local_data" };
    }
    const remote = await pullPrefs();
    if (remote.ok && remote.hasRemoteData) {
      localStorage.setItem(markerKey, "1");
      return { ok: true, migrated: false, reason: "remote_data_exists", prefs: remote.prefs };
    }
    const result = await pushPrefs(local.prefs);
    if (!result.ok) return { ...result, migrated: false };
    writeLocalPrefs(local.prefs, opts.storageKey);
    localStorage.setItem(markerKey, "1");
    return { ok: true, migrated: true, sourceKey: local.sourceKey, prefs: local.prefs };
  }

  async function saveLessonPosition(input) {
    const auth = await requireUser();
    if (auth.disabled || !auth.user) return { ok: false, reason: auth.disabled ? auth.reason : "not_authenticated" };
    const row = {
      user_id: auth.user.id,
      subject_id: String(input?.subjectId || ""),
      grade: Number(input?.grade),
      topic_id: String(input?.topicId || ""),
      lesson_id: String(input?.lessonId || ""),
      position: isObject(input?.position) ? cloneJson(input.position, {}) : {},
    };
    const result = await client.from("lesson_positions").upsert(row);
    if (result.error) throw result.error;
    return { ok: true };
  }

  async function loadLessonPosition(input) {
    const auth = await requireUser();
    if (auth.disabled || !auth.user) return { ok: false, reason: auth.disabled ? auth.reason : "not_authenticated", position: null };
    const result = await client
      .from("lesson_positions")
      .select("position,updated_at")
      .eq("user_id", auth.user.id)
      .eq("subject_id", String(input?.subjectId || ""))
      .eq("grade", Number(input?.grade))
      .eq("topic_id", String(input?.topicId || ""))
      .eq("lesson_id", String(input?.lessonId || ""))
      .maybeSingle();
    if (result.error) throw result.error;
    return { ok: true, position: result.data?.position || null, updatedAt: result.data?.updated_at || null };
  }

  async function trackEvent(eventName, properties) {
    if (!/^[a-z0-9_.-]{1,80}$/.test(String(eventName || ""))) return { ok: false, reason: "invalid_event_name" };
    const auth = await requireUser();
    if (auth.disabled || !auth.user) return { ok: false, reason: auth.disabled ? auth.reason : "not_authenticated" };
    const result = await client.from("events").insert({
      user_id: auth.user.id,
      event_name: eventName,
      properties: isObject(properties) ? cloneJson(properties, {}) : {},
    });
    if (result.error) throw result.error;
    return { ok: true };
  }

  async function voteForSubject(subjectId) {
    const id = String(subjectId || "");
    if (!/^[a-z0-9_-]{1,64}$/.test(id)) return { ok: false, reason: "invalid_subject_id" };
    const auth = await requireUser();
    if (auth.disabled || !auth.user) return { ok: false, reason: auth.disabled ? auth.reason : "not_authenticated" };
    const result = await client.from("subject_votes").upsert({ user_id: auth.user.id, subject_id: id });
    if (result.error) throw result.error;
    return { ok: true, subjectId: id };
  }

  async function getMySubjectVote() {
    const auth = await requireUser();
    if (auth.disabled || !auth.user) return { ok: false, reason: auth.disabled ? auth.reason : "not_authenticated", subjectId: null };
    const result = await client.from("subject_votes").select("subject_id,updated_at").eq("user_id", auth.user.id).maybeSingle();
    if (result.error) throw result.error;
    return { ok: true, subjectId: result.data?.subject_id || null, updatedAt: result.data?.updated_at || null };
  }

  window.SHANKS_CLOUD = Object.freeze({
    init,
    isConfigured,
    getStatus,
    normalizePrefs,
    hasMeaningfulPrefs,
    readLocalPrefs,
    writeLocalPrefs,
    prefsToRows,
    parseTopicKey,
    pushPrefs,
    pullPrefs,
    syncPrefsProgress,
    migrateLocalStorage,
    saveLessonPosition,
    loadLessonPosition,
    trackEvent,
    voteForSubject,
    getMySubjectVote,
    getClient: () => client,
  });
})();
