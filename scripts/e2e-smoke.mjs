import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.SHANKS_BASE_URL || "http://127.0.0.1:8000";
const browser = await chromium.launch(process.env.CI ? { headless: true } : { channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const runtimeErrors = [];
page.on("pageerror", (error) => runtimeErrors.push(String(error)));

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  await page.locator("#onb-btn-start").click();
  await page.locator("#onb-name").fill("Саша");
  await page.locator("#onb-name-next").click();
  await page.locator('[data-on-choose-grade="10"]').click();
  await page.locator("#onb-grade-next").click();
  await page.locator("#onb-subjects-next").click();

  const textbookCards = page.locator("[data-on-choose-textbook]");
  assert.equal(await textbookCards.count(), 4, "grade 10 must show three textbook lines and universal route");
  assert.equal(await page.locator(".textbook-cover").count(), 4, "textbooks must use original Shanks cover tiles");
  await textbookCards.first().click();
  await page.locator("#onb-textbook-next").click();
  assert.ok((await page.locator("[data-on-choose-topic]").count()) > 0, "grade 10 topics must be available");
  await page.locator("#onb-topic-unknown").click();

  await page.locator("#main-app:not(.main-hidden)").waitFor();
  await page.locator("#home-continue-card").waitFor();
  assert.match(await page.locator("#home-continue-meta").innerText(), /10 класс/);

  const dataStats = await page.evaluate(() => ({
    packets: Object.keys(window.SHANKS_MATH_CONTENT_DATA?.contentByTopicId || {}).length,
    textbooks: window.SHANKS_MATH_CONTENT_DATA?.catalog?.lines?.length || 0,
    grades: Object.keys(window.SHANKS_MATH_CURRICULUM_EMBED || {}).sort(),
    richPilot: !!window.SHANKS_MATH_LEARNING?.byTopicId?.["g8-u01"],
  }));
  assert.equal(dataStats.packets, 313);
  assert.equal(dataStats.textbooks, 21);
  assert.deepEqual(dataStats.grades, ["10", "11", "5", "6", "7", "8", "9"]);
  assert.equal(dataStats.richPilot, true);

  await page.locator("#btn-home-continue").click();
  await page.locator("#stack-activity").waitFor({ state: "visible" });
  assert.equal(await page.locator("#activity-ai-note").isVisible(), true, "generated lesson must show AI beta notice");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("shanks_prefs_v2") || "{}"));
  assert.equal(saved.displayName, "Саша");
  assert.equal(saved.grade, 10);
  assert.ok(saved.textbookId);
  assert.ok(saved.lessonPosition?.topicId);

  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("#onboarding-root").isHidden(), true);
  assert.equal(await page.locator("#main-app").isVisible(), true);
  assert.equal(await page.locator("#auth-form").getAttribute("hidden"), null, "auth form must be available with Supabase config");

  assert.deepEqual(runtimeErrors, [], `browser runtime errors: ${runtimeErrors.join("; ")}`);
  console.log("e2e smoke: onboarding, textbooks, generated lesson, persistence ok");
} finally {
  await browser.close();
}
