# Supabase для Shanks

Облачный слой опционален. Без `window.SHANKS_CONFIG` приложение продолжает работать с `localStorage`, а методы `SHANKS_CLOUD`/`SHANKS_AUTH` возвращают `{ ok: false, reason: "missing_config" }`.

## 1. Создание проекта и схема

1. Создайте проект в Supabase.
2. Примените `supabase/migrations/202608090001_initial_cloud_sync.sql` через Supabase CLI:

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

   Либо выполните migration целиком в SQL Editor.
3. В Authentication → Providers оставьте включённым Email. Решите, требуется ли подтверждение email, в соответствии с окружением.
4. Для локальной разработки добавьте `http://localhost:8000` в Authentication → URL Configuration → Redirect URLs.

Migration создаёт `profiles`, `learning_selections`, `topic_progress`, `lesson_positions`, `events`, `subject_votes`. На всех таблицах включён RLS; авторизованный пользователь может обращаться только к своим строкам.

## 2. Публичная конфигурация

До подключения модулей задайте конфигурацию:

```html
<script>
  window.SHANKS_CONFIG = {
    supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
    supabaseAnonKey: "YOUR_PUBLISHABLE_OR_ANON_KEY",
    prefsStorageKey: "shanks_prefs_v2",
  };
</script>
<script src="js/cloud-sync.js"></script>
<script src="js/auth.js"></script>
```

Подключайте `cloud-sync.js` и `auth.js` до `app.js`, если `app.js` будет вызывать их при старте.

`supabaseAnonKey` (или новый publishable key) публичен по модели Supabase и безопасен только вместе с RLS. Никогда не помещайте в HTML, JS, `.env` фронтенда или `window.SHANKS_CONFIG` ключ `service_role`. Модуль дополнительно отклоняет JWT с ролью `service_role`.

По умолчанию SDK v2 загружается из jsDelivr при первом `init()`. Если SDK уже подключён глобально как `window.supabase`, повторной загрузки не будет. Для self-hosted SDK можно указать `supabaseSdkUrl`.

## 3. Авторизация

```js
const registration = await SHANKS_AUTH.signUp(email, password);
const login = await SHANKS_AUTH.signIn(email, password);
const session = await SHANKS_AUTH.getSession();
await SHANKS_AUTH.signOut();
```

`signUp` возвращает `confirmationRequired: true`, если в проекте включено подтверждение email и сессия ещё не выдана. Ошибки Supabase возвращаются в поле `error`; UI не должен показывать пользователю внутренний stack trace.

Подписка на смену сессии:

```js
const listener = await SHANKS_AUTH.onAuthStateChange((event, session) => {
  // Обновить UI и запустить синхронизацию после SIGNED_IN.
});

listener.unsubscribe();
```

## 4. Синхронизация и миграция localStorage

После успешного входа один раз перенесите текущий `shanks_prefs_v2`:

```js
const migration = await SHANKS_CLOUD.migrateLocalStorage();
```

Маркер миграции хранится отдельно для каждого `user.id`. Также распознаются legacy-ключи `shanks_prefs_v1` и `shanks_prefs`; дополнительные ключи можно задать в `legacyPrefsStorageKeys`.

Явная синхронизация:

```js
// Локальная копия побеждает и отправляется в облако.
await SHANKS_CLOUD.syncPrefsProgress({ prefs });

// Облачная копия побеждает и записывается в shanks_prefs_v2.
const result = await SHANKS_CLOUD.syncPrefsProgress({
  strategy: "remote-wins",
  writeLocal: true,
});
```

Рекомендуемый стартовый поток:

1. `SHANKS_CLOUD.init()`.
2. Если сессии нет — оставить текущий локальный режим.
3. После первого входа — `migrateLocalStorage()`.
4. При обычном входе на другом устройстве — `syncPrefsProgress({ strategy: "remote-wins" })`, затем обновить состояние UI из `result.prefs`.
5. После локального `savePrefs()` — debounce-вызов `syncPrefsProgress({ prefs })`.

Синхронизация не вызывается автоматически: это исключает скрытые изменения текущего поведения до интеграции в `app.js`.

## 5. Остальной API

```js
await SHANKS_CLOUD.saveLessonPosition({
  subjectId: "math",
  grade: 8,
  topicId: "g8-u01",
  lessonId: "theory",
  position: { panel: "reader", blockId: "intro", cursor: 2 },
});

const position = await SHANKS_CLOUD.loadLessonPosition({
  subjectId: "math",
  grade: 8,
  topicId: "g8-u01",
  lessonId: "theory",
});

await SHANKS_CLOUD.trackEvent("lesson.completed", {
  subjectId: "math",
  grade: 8,
  topicId: "g8-u01",
});

await SHANKS_CLOUD.voteForSubject("geo");
const vote = await SHANKS_CLOUD.getMySubjectVote();
```

События пишутся только для авторизованных пользователей и не содержат автоматически email или другие персональные данные. Не отправляйте в `properties` ответы ученика, токены, email и иные чувствительные данные.

Из-за user-only RLS клиент видит только собственный голос. Публичные итоги голосования должны публиковаться отдельно серверным/административным процессом; выдавать клиенту `service_role` для подсчёта нельзя.

## 6. Экспортируемые объекты

- `window.SHANKS_AUTH`: `signUp`, `signIn`, `signOut`, `getSession`, `getUser`, `onAuthStateChange`.
- `window.SHANKS_CLOUD`: `init`, `isConfigured`, `getStatus`, `normalizePrefs`, `readLocalPrefs`, `writeLocalPrefs`, `prefsToRows`, `parseTopicKey`, `pushPrefs`, `pullPrefs`, `syncPrefsProgress`, `migrateLocalStorage`, `saveLessonPosition`, `loadLessonPosition`, `trackEvent`, `voteForSubject`, `getMySubjectVote`, `getClient`.

Чистые функции, пригодные для вызова и тестирования без сети: `normalizePrefs`, `prefsToRows`, `parseTopicKey`.
