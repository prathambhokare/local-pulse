import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const appUrl = process.env.LOCALPULSE_WEB_URL ?? "http://localhost:8081";
const apiUrl = process.env.LOCALPULSE_API_URL ?? "http://localhost:8080";
const outputDir = path.resolve("demo/linkedin-screenshots");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const phone = `9${String(Date.now()).slice(-9)}`;
const listingName = "Fresh Alphonso Mango Box";
let token;

const api = async (route, options = {}) => {
  const response = await fetch(`${apiUrl}${route}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${route} failed with ${response.status}`);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return null;
  return response.json();
};

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

const maskPhone = async (page, normalizedPhone) => {
  await page.evaluate((phone) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent === phone) nodes.push(node);
    }
    nodes.forEach((n) => { n.textContent = "+91 ••••• ••123"; });
  }, normalizedPhone);
};

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const otpRequest = await api("/api/auth/otp/request", {
  method: "POST",
  body: JSON.stringify({ phone }),
});
const auth = await api("/api/auth/otp/verify", {
  method: "POST",
  body: JSON.stringify({ phone, otp: otpRequest.devOtp }),
});
token = auth.token;
await api("/api/sellers/me", {
  method: "PUT",
  body: JSON.stringify({
    businessName: "Pune Fresh Market",
    category: "Fruits",
    address: "FC Road, Pune",
    latitude: 18.5204,
    longitude: 73.8567,
  }),
});

// Pre-seed diverse listings so the discovery feed looks like a live marketplace
await Promise.all([
  api("/api/listings", {
    method: "POST",
    body: JSON.stringify({
      itemName: "Fresh Rohu Fish",
      category: "Fish",
      description: "Freshly caught Rohu, cleaned and cut. Direct from Mandai this morning.",
      price: 180,
      priceUnit: "kg",
      quantityInfo: "8 kg available",
      address: "Mandai Market, Pune",
      latitude: 18.5204,
      longitude: 73.8567,
      expiryHours: 5,
    }),
  }),
  api("/api/listings", {
    method: "POST",
    body: JSON.stringify({
      itemName: "Organic Tomatoes",
      category: "Vegetables",
      description: "Ripe, firm tomatoes from our farm. No pesticides.",
      price: 40,
      priceUnit: "kg",
      quantityInfo: "10 kg available",
      address: "Market Yard, Pune",
      latitude: 18.518,
      longitude: 73.854,
      expiryHours: 8,
    }),
  }),
  api("/api/listings", {
    method: "POST",
    body: JSON.stringify({
      itemName: "Vadapav & Cutting Chai",
      category: "Street Food",
      description: "Fresh vadapav with green chutney, served with cutting chai. Made to order.",
      price: 25,
      priceUnit: "plate",
      quantityInfo: "30 servings available",
      address: "FC Road, Pune",
      latitude: 18.519,
      longitude: 73.855,
      expiryHours: 3,
    }),
  }),
]);

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  geolocation: { latitude: 18.5204, longitude: 73.8567 },
  permissions: ["geolocation"],
  deviceScaleFactor: 2,
});
await context.addInitScript((authToken) => {
  localStorage.setItem("localpulse:token", authToken);
}, token);
const page = await context.newPage();

try {
  await page.goto(appUrl, { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: /Sell/ }).click();
  await clickable(page.getByText("Pune Fresh Market", { exact: true }));
  await page.getByText("+ Post new availability", { exact: true }).click();
  await page.getByText("Post fresh availability", { exact: true }).waitFor();

  await page.getByPlaceholder("e.g. Fresh Rohu Fish").fill(listingName);
  await clickText(page, "Fruits");
  await page.getByPlaceholder("Caught this morning, 40kg available...").fill(
    "Sweet Ratnagiri mangoes packed this morning. Limited boxes available."
  );
  await page.getByPlaceholder("220").fill("450");
  await page.getByPlaceholder("kg or item").fill("box");
  await page.getByPlaceholder("e.g. 40kg available").fill("12 boxes available");
  await page.getByPlaceholder("Shop, street, area and landmark").fill("FC Road, near Goodluck Chowk, Pune");
  const expiryOption = page.getByText("12 hours", { exact: true });
  await expiryOption.scrollIntoViewIfNeeded();
  await expiryOption.click();

  await page.getByPlaceholder("220").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, "02-seller-listing-form.png") });

  const postButton = page.getByText("Post availability", { exact: true });
  await postButton.scrollIntoViewIfNeeded();
  await postButton.click();
  await clickable(page.getByText(listingName, { exact: true }));
  await page.screenshot({ path: path.join(outputDir, "04-seller-dashboard.png") });

  await page.getByRole("tab", { name: /Discover/ }).click();
  // Wait for the feed to populate then scroll to the top so multiple listings are visible
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, -1000);
  await page.waitForTimeout(400);
  await maskPhone(page, auth.phone);
  await page.screenshot({ path: path.join(outputDir, "01-buyer-discovery.png") });

  // Narrow to the mango listing for the contact screenshot
  await page.getByPlaceholder("Search fish, vegetables, salon...").fill("Alphonso Mango");
  const buyerListingTitle = await clickable(page.getByText(listingName, { exact: true }));
  await buyerListingTitle.scrollIntoViewIfNeeded();
  const buyerListingCard = buyerListingTitle.locator("..").locator("..").locator("..");
  await buyerListingCard.getByText("Open directions in Google Maps", { exact: true }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await maskPhone(page, auth.phone);
  await page.screenshot({ path: path.join(outputDir, "03-direct-contact.png") });

  await page.getByRole("tab", { name: /Sell/ }).click();
  await clickable(page.getByText(listingName, { exact: true }));
  const deleteButton = await clickable(page.getByLabel("Delete listing"));
  await deleteButton.click();
  await clickable(page.getByText("Delete listing?", { exact: true }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, "05-delete-confirmation.png") });
  await page.getByText("Cancel", { exact: true }).click();
} finally {
  try {
    const listings = await api("/api/listings/mine");
    for (const listing of listings) {
      await api(`/api/listings/${listing.id}`, { method: "DELETE" });
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

console.log(outputDir);