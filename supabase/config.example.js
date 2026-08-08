/**
 * Скопируйте значения из Supabase Dashboard → Project Settings → API.
 * Anon/publishable key предназначен для браузера; service_role сюда не добавлять.
 */
window.SHANKS_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
  prefsStorageKey: "shanks_prefs_v2",
};
