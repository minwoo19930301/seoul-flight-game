import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = fileURLToPath(new URL("../", import.meta.url));
const evidence = resolve(root, "test-results");
await mkdir(evidence, { recursive: true });
const types = { ".html": "text/html", ".mjs": "text/javascript", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
const server = createServer(async (request, response) => {
  const path = resolve(root, `.${new URL(request.url, "http://localhost").pathname}`);
  if (!path.startsWith(root)) { response.writeHead(403).end(); return; }
  try {
    const bytes = await readFile(path);
    response.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" }).end(bytes);
  } catch { response.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {}) });
const failures = [];

async function openPage(options = {}, failMap = false) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(error.message));
  // Inspect the real application state only in this browser test. No debug
  // global or test route is shipped in the production module.
  await page.route("**/seoul-flight.mjs*", async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    await route.fulfill({ response, body: `${source}\nwindow.__flightTest = { state, runtime, input, world, checkpointDefs, updateFlight, updateCheckpoints, updateHud, resetFlight, startGame, pauseFlight, enforceBoundary };` });
  });
  if (failMap) await page.route("**/seoul-scene-data.json", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto(`${origin}/index-seoul-flight.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__flightTest, null, { timeout: 60000 });
  return { context, page };
}

try {
  const { context, page } = await openPage({ viewport: { width: 1440, height: 900 } });
  assert.equal(await page.locator("#start-btn").isEnabled(), true);
  assert.equal(await page.locator("#bearing-value").textContent(), "0°");
  assert.ok(await page.evaluate(() => __flightTest.runtime.renderer.info.render.calls > 0), "actual WebGL scene renders");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => __flightTest.state.mode === "running");
  assert.ok(await page.evaluate(() => Math.abs(__flightTest.state.position.x) < __flightTest.world.width/2-__flightTest.world.boundaryPadding), "spawn is inside the physical-metre flight boundary");
  const initialYaw = await page.evaluate(() => __flightTest.state.yaw);
  await page.keyboard.down("KeyD");
  await page.waitForFunction((yaw) => __flightTest.state.yaw < yaw - 0.05, initialYaw);
  await page.keyboard.up("KeyD");
  assert.ok(await page.evaluate(() => __flightTest.state.roll < 0));

  await page.keyboard.down("Shift");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const paused = await page.evaluate(() => ({ mode: __flightTest.state.mode, position: __flightTest.state.position.toArray(), elapsed: __flightTest.state.elapsedMs, input: Object.values(__flightTest.input) }));
  assert.equal(paused.mode, "paused");
  assert.ok(paused.input.every((value) => !value));
  await page.waitForTimeout(180);
  assert.deepEqual(await page.evaluate(() => __flightTest.state.position.toArray()), paused.position);
  assert.equal(await page.evaluate(() => __flightTest.state.elapsedMs), paused.elapsed);
  await page.keyboard.up("Shift");
  await page.keyboard.press("KeyP");
  await page.waitForFunction(() => __flightTest.state.mode === "running");

  const returned = await page.evaluate(() => {
    const t = __flightTest;
    const limitX=t.world.width/2-t.world.boundaryPadding;
    t.state.position.set(limitX+1, 500, 0);
    t.state.yaw = -Math.PI / 2;
    t.enforceBoundary(1);
    t.updateFlight(1 / 60);
    return { x: t.state.position.x, forwardX: t.state.forward.x, limitX };
  });
  assert.ok(returned.x < returned.limitX && returned.forwardX < 0, "east boundary turns west into the map");
  await page.evaluate(() => { __flightTest.resetFlight(); __flightTest.startGame(); });
  await page.screenshot({ path: resolve(evidence, "flight-desktop.png") });

  const completed = await page.evaluate(() => {
    const t = __flightTest;
    // Visit every actual checkpoint in order, exercising altitude and distance
    // gates without spending minutes flying between them in each test run.
    for (const checkpoint of t.checkpointDefs) {
      t.state.position.set(checkpoint.x, checkpoint.y, checkpoint.z);
      t.updateCheckpoints(performance.now());
    }
    t.updateHud();
    t.updateCheckpoints(performance.now());
    return { mode: t.state.mode, index: t.state.checkpointIndex, count: t.checkpointDefs.length };
  });
  assert.deepEqual(completed, { mode: "complete", index: 5, count: 5 });
  assert.equal(await page.locator("#progress-value").textContent(), "5 / 5");
  assert.equal(await page.locator("#message-panel").isVisible(), true);
  assert.equal(await page.locator("#resume-btn").isVisible(), false);
  await page.screenshot({ path: resolve(evidence, "flight-complete.png") });
  await page.locator("#restart-btn").click();
  await page.waitForFunction(() => __flightTest.state.mode === "running" && __flightTest.state.checkpointIndex === 0);
  await context.close();

  const mobile = await openPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobile.page.locator("#start-btn").tap();
  await mobile.page.waitForFunction(() => __flightTest.state.mode === "running");
  const control = mobile.page.locator('[data-control="bankRight"]');
  const box = await control.boundingBox();
  assert.ok(box && box.x >= 0 && box.y + box.height <= 844, "mobile controls stay on screen");
  await mobile.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await mobile.page.mouse.down();
  await mobile.page.waitForFunction(() => __flightTest.input.bankRight);
  await mobile.page.mouse.move(195, 380);
  assert.equal(await mobile.page.evaluate(() => __flightTest.input.bankRight), true, "captured pointer survives dragging off button");
  await mobile.page.mouse.up();
  assert.equal(await mobile.page.evaluate(() => __flightTest.input.bankRight), false);
  await mobile.page.screenshot({ path: resolve(evidence, "flight-mobile.png") });
  await mobile.page.locator("#pause-btn").tap();
  assert.equal(await mobile.page.evaluate(() => __flightTest.state.mode), "paused");
  await mobile.page.keyboard.press("KeyP");
  await mobile.page.waitForFunction(() => __flightTest.state.mode === "running");
  await mobile.page.locator("#pause-btn").tap();
  await mobile.page.locator("#resume-btn").tap();
  await mobile.page.waitForFunction(() => __flightTest.state.mode === "running");
  await mobile.page.setViewportSize({ width: 844, height: 390 });
  await mobile.page.screenshot({ path: resolve(evidence, "flight-landscape.png") });
  await mobile.context.close();

  const failed = await openPage({ viewport: { width: 1280, height: 720 } }, true);
  assert.equal(await failed.page.evaluate(() => __flightTest.state.mode), "error");
  assert.equal(await failed.page.locator("#restart-btn").textContent(), "다시 불러오기");
  await failed.page.unroute("**/seoul-scene-data.json");
  await failed.page.locator("#restart-btn").click();
  await failed.page.waitForFunction(() => window.__flightTest?.state.mode === "intro", null, { timeout: 60000 });
  assert.equal(await failed.page.locator("#start-btn").isEnabled(), true, "failed initialization can reload and recover");
  await failed.context.close();

  assert.deepEqual(failures, [], "no uncaught browser exceptions");
  console.log("PASS: WebGL boot, keyboard steering, pause/resume, boundary recovery, 5/5 completion/restart, mobile pointer capture/layout, initialization retry.");
  console.log(`Screenshots: ${evidence}`);
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
