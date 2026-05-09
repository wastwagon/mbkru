#!/usr/bin/env node
/**
 * Writes docs/STAKEHOLDER_PHASE_COMPLETION_CHECKLIST.pdf from the print HTML.
 * Requires: npm run test:e2e (or npx playwright install chromium) once for browsers.
 */
import { chromium } from "playwright";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const htmlPath = join(root, "docs", "STAKEHOLDER_PHASE_COMPLETION_CHECKLIST.html");
const pdfPath = join(root, "docs", "STAKEHOLDER_PHASE_COMPLETION_CHECKLIST.pdf");

const url = new URL(`file://${htmlPath}`).href;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    margin: { top: "18mm", bottom: "18mm", left: "14mm", right: "14mm" },
    printBackground: true,
  });
  console.log(`[pdf] wrote ${pdfPath}`);
} finally {
  await browser.close();
}
