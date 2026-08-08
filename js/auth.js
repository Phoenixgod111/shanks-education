/**
 * Минимальный email/password API поверх SHANKS_CLOUD.
 * UI и тексты ошибок остаются ответственностью app.js.
 */
(function () {
  "use strict";

  async function ready() {
    const cloud = window.SHANKS_CLOUD;
    if (!cloud) return { enabled: false, reason: "cloud_module_missing", client: null };
    return cloud.init();
  }

  function cleanEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  async function signUp(email, password, options) {
    const state = await ready();
    if (!state.enabled) return { ok: false, reason: state.reason };
    const result = await state.client.auth.signUp({
      email: cleanEmail(email),
      password: String(password || ""),
      options: options && typeof options === "object" ? options : undefined,
    });
    if (result.error) return { ok: false, reason: "auth_error", error: result.error };
    return {
      ok: true,
      user: result.data.user,
      session: result.data.session,
      confirmationRequired: !result.data.session,
    };
  }

  async function signIn(email, password) {
    const state = await ready();
    if (!state.enabled) return { ok: false, reason: state.reason };
    const result = await state.client.auth.signInWithPassword({
      email: cleanEmail(email),
      password: String(password || ""),
    });
    if (result.error) return { ok: false, reason: "auth_error", error: result.error };
    return { ok: true, user: result.data.user, session: result.data.session };
  }

  async function signOut() {
    const state = await ready();
    if (!state.enabled) return { ok: false, reason: state.reason };
    const result = await state.client.auth.signOut();
    if (result.error) return { ok: false, reason: "auth_error", error: result.error };
    return { ok: true };
  }

  async function getSession() {
    const state = await ready();
    if (!state.enabled) return { ok: false, reason: state.reason, session: null };
    const result = await state.client.auth.getSession();
    if (result.error) return { ok: false, reason: "auth_error", error: result.error, session: null };
    return { ok: true, session: result.data.session };
  }

  async function getUser() {
    const state = await ready();
    if (!state.enabled) return { ok: false, reason: state.reason, user: null };
    const result = await state.client.auth.getUser();
    if (result.error) return { ok: false, reason: "auth_error", error: result.error, user: null };
    return { ok: true, user: result.data.user };
  }

  async function onAuthStateChange(callback) {
    const state = await ready();
    if (!state.enabled) return { ok: false, reason: state.reason, unsubscribe: function () {} };
    const subscription = state.client.auth.onAuthStateChange((event, session) => {
      if (typeof callback === "function") callback(event, session);
    });
    return {
      ok: true,
      unsubscribe: () => subscription.data.subscription.unsubscribe(),
    };
  }

  window.SHANKS_AUTH = Object.freeze({
    signUp,
    signIn,
    signOut,
    getSession,
    getUser,
    onAuthStateChange,
  });
})();
