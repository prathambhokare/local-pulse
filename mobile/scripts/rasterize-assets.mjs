import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";

const assetsDir = path.resolve("assets");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const jobs = [
  { svg: "localpulse-icon.svg",       png: "icon.png",                    size: 1024, bg: "#0B5B3A" },
  { svg: "localpulse-splash.svg",     png: "splash-icon.png",             size: 1024, bg: "#ffffff" },
  { svg: "localpulse-foreground.svg", png: "android-icon-foreground.png", size: 1024, bg: "#ffffff" },
  { svg: "localpulse-monochrome.svg", png: "android-icon-monochrome.png", size: 1024, bg: "#ffffff" },
  { svg: "localpulse-splash.svg",     png: "favicon.png",                 size: 64,  bg: "#ffffff" },
];

const browser = await chromium.launch({ headless: true, executablePath: chromePath });

for (const { svg, png, size, bg } of jobs) {
  const svgContent = readFileSync(path.join(assetsDir, svg), "utf8");
  const encoded = Buffer.from(svgContent).toString("base64");
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:${bg}"><img src="data:image/svg+xml;base64,${encoded}" style="width:${size}px;height:${size}px;display:block"/></body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(assetsDir, png), fullPage: false });
  await page.close();
  console.log(`✓ ${png} (${size}×${size})`);
}

await browser.close();
