import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const appUrl = process.env.LOCALPULSE_WEB_URL ?? "http://localhost:8081";
const outputDir = path.resolve("demo");
const outputPath = path.join(outputDir, "localpulse-end-to-end-demo.webm");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const phone = `9${String(Date.now()).slice(-9)}`;
const listingName = "Fresh Alphonso Mango Box";

const pause = (page, milliseconds = 900) => page.waitForTimeout(milliseconds);
const visible = async (locator, timeout = 10000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      if (await candidate.isVisible()) return candidate;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`No visible match found for ${locator}`);
};
const visibleText = (page, text) => visible(page.getByText(text, { exact: true }));
const clickable = async (locator, timeout = 10000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      if (!await candidate.isVisible()) continue;
      const isTopmost = await candidate.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const hit = element.ownerDocument.elementFromPoint(
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2
        );
        return hit === element || element.contains(hit) || Boolean(hit?.contains(element));
      });
      if (isTopmost) return candidate;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`No clickable match found for ${locator}`);
};
const clickText = async (page, text) => {
  const target = await clickable(page.getByText(text, { exact: true }));
  await target.click();
};

// Pre-seed a marketplace account so the discovery feed looks realistically active
const seedPhone = `8${String(Date.now()).slice(-9)}`;
let seedToken;
const seedFetch = async (route, options = {}) => {
  const res = await fetch(`http://localhost:8080${route}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(seedToken ? { authorization: `Bearer ${seedToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
};
const seedOtp = await seedFetch("/api/auth/otp/request", { method: "POST", body: JSON.stringify({ phone: seedPhone }) });
const seedAuth = await seedFetch("/api/auth/otp/verify", { method: "POST", body: JSON.stringify({ phone: seedPhone, otp: seedOtp.devOtp }) });
seedToken = seedAuth.token;
await seedFetch("/api/sellers/me", {
  method: "PUT",
  body: JSON.stringify({ businessName: "City Market", category: "Fish", address: "Mandai, Pune", latitude: 18.5204, longitude: 73.8567 }),
});
const seedListingIds = (await Promise.all([
  seedFetch("/api/listings", { method: "POST", body: JSON.stringify({ itemName: "Fresh Rohu Fish", category: "Fish", description: "Early morning catch, cleaned and ready.", price: 180, priceUnit: "kg", quantityInfo: "8 kg available", address: "Mandai Market, Pune", latitude: 18.5204, longitude: 73.8567, expiryHours: 5 }) }),
  seedFetch("/api/listings", { method: "POST", body: JSON.stringify({ itemName: "Organic Tomatoes", category: "Vegetables", description: "Farm fresh, no pesticides. Juicy and firm.", price: 40, priceUnit: "kg", quantityInfo: "10 kg available", address: "Market Yard, Pune", latitude: 18.518, longitude: 73.854, expiryHours: 8 }) }),
  seedFetch("/api/listings", { method: "POST", body: JSON.stringify({ itemName: "Vadapav & Cutting Chai", category: "Street Food", description: "Fresh vadapav with green chutney. Made to order.", price: 25, priceUnit: "plate", quantityInfo: "30 servings available", address: "FC Road, Pune", latitude: 18.519, longitude: 73.855, expiryHours: 3 }) }),
])).map((l) => l?.id).filter(Boolean);

await mkdir(outputDir, { recursive: true });
// Only remove the previous video; preserve other demo assets (screenshots, etc.)
try { await rm(outputPath, { force: true }); } catch {}

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  geolocation: { latitude: 18.5204, longitude: 73.8567 },
  permissions: ["geolocation"],
  recordVideo: {
    dir: outputDir,
    size: { width: 390, height: 844 },
  },
});
const page = await context.newPage();
const video = page.video();

try {
  await page.goto(appUrl, { waitUntil: "networkidle" });
  await page.getByText("LocalPulse", { exact: true }).waitFor();
  await pause(page, 1600);

  await page.mouse.wheel(0, 620);
  await pause(page, 1300);
  await page.mouse.wheel(0, -620);
  await pause(page);

  await page.getByRole("tab", { name: /Sell/ }).click();
  await page.getByText("Start selling locally", { exact: true }).waitFor();
  await pause(page);

  await page.getByPlaceholder("+91 98765 43210").fill(phone);
  await pause(page, 500);
  await page.getByText("Continue with OTP", { exact: true }).click();
  await page.getByText("Verify your number", { exact: true }).waitFor();
  await pause(page, 1200);
  await page.getByText("Verify & Continue", { exact: true }).click();

  await page.getByText("Set up your shop", { exact: true }).waitFor();
  await pause(page);
  await page.getByPlaceholder("e.g. Ravi Fish Mart").fill("Pune Fresh Market");
  await clickText(page, "Fruits");
  await page.getByPlaceholder("Shop / area / landmark").fill("FC Road, Pune");
  await page.getByText("Location captured", { exact: true }).waitFor();
  await pause(page, 700);
  await page.getByText("Save & continue", { exact: true }).click();

  await page.getByText("Pune Fresh Market", { exact: true }).waitFor();
  await pause(page, 1200);
  await page.getByText("+ Post new availability", { exact: true }).click();
  await page.getByText("Post fresh availability", { exact: true }).waitFor();
  await pause(page);

  await page.getByPlaceholder("e.g. Fresh Rohu Fish").fill(listingName);
  await clickText(page, "Fruits");
  await page.getByPlaceholder("Caught this morning, 40kg available...").fill(
    "Sweet Ratnagiri mangoes packed this morning. Limited boxes available."
  );
  await page.getByPlaceholder("220").fill("450");
  await page.getByPlaceholder("kg or item").fill("box");
  await page.getByPlaceholder("e.g. 40kg available").fill("12 boxes available");
  await page.getByPlaceholder("Shop, street, area and landmark").fill("FC Road, near Goodluck Chowk, Pune");
  await page.getByText("12 hours", { exact: true }).click();
  await page.getByText("Post availability", { exact: true }).scrollIntoViewIfNeeded();
  await pause(page, 900);
  await page.getByText("Post availability", { exact: true }).click();

  await visibleText(page, listingName);
  await pause(page, 1500);

  await page.getByRole("tab", { name: /Discover/ }).click();
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, -1000);
  await pause(page, 1200);
  await page.mouse.wheel(0, 700);
  await pause(page, 1400);
  await page.mouse.wheel(0, -700);
  await pause(page, 1200);
  await page.getByPlaceholder("Search fish, vegetables, salon...").fill("Alphonso Mango");
  await visibleText(page, listingName);
  await pause(page, 1600);

  await page.getByRole("tab", { name: /Sell/ }).click();
  await visibleText(page, listingName);
  await page.getByLabel("Delete listing").click();
  await page.getByText("Delete listing?", { exact: true }).waitFor();
  await pause(page, 1400);
  await page.getByText("Cancel", { exact: true }).click();
  await pause(page, 900);

  const token = await page.evaluate(() => localStorage.getItem("localpulse:token"));
  const listings = await page.evaluate(async (authToken) => {
    const response = await fetch("http://localhost:8080/api/listings/mine", {
      headers: { authorization: `Bearer ${authToken}` },
    });
    return response.json();
  }, token);
  const demoListing = listings.find((listing) => listing.itemName === listingName);

  await context.close();
  const recordedPath = await video.path();
  await rename(recordedPath, outputPath);

  if (demoListing) {
    await fetch(`http://localhost:8080/api/listings/${demoListing.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
  }

  console.log(outputPath);
  for (const id of seedListingIds) {
    await seedFetch(`/api/listings/${id}`, { method: "DELETE" });
  }
} finally {
  if (page && !page.isClosed()) {
    await context.close();
  }
  await browser.close();
}