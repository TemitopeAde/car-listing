import { test, expect } from "@playwright/test";
import { money } from "../../shared/utils";

test("vehicle currency defaults to USD and persists each dealer selection", async ({
  page,
  request,
}) => {
  const unique = Date.now().toString();
  const title = `2024 Honda Civic Currency ${unique}`;
  await page.goto("/preview#Vehicles");
  await page.getByRole("button", { name: "Add vehicle", exact: true }).click();
  await page.getByLabel("Listing title").fill(title);
  await page.getByLabel("Stock ID").fill(`CURRENCY-${unique}`);
  await page.getByLabel("Make *", { exact: true }).selectOption("Honda");
  await page.getByLabel("Model *", { exact: true }).fill("Civic");
  await page.getByLabel("Model year").selectOption("2024");
  await page.getByRole("button", { name: "02 Pricing" }).click();
  await page.getByLabel("Asking price").fill("26000");
  await expect(page.getByLabel("Currency", { exact: true })).toHaveValue("USD");

  let vehicleId = "";
  for (const currency of ["USD", "EUR", "GBP", "NGN"]) {
    await page.getByLabel("Currency", { exact: true }).selectOption(currency);
    const savedResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/vehicles") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .first()
      .click();
    const response = await savedResponse;
    expect(response.ok()).toBeTruthy();
    const vehicle = (await response.json()).data;
    expect(vehicle.currency).toBe(currency);
    vehicleId = vehicle._id;
    await page.getByRole("button", { name: "Back to inventory" }).click();
    await page.reload();
    const row = page.getByRole("row").filter({ hasText: `CURRENCY-${unique}` });
    await expect(row).toContainText(money(26000, currency));
    await row
      .getByRole("button", { name: `Edit ${title}`, exact: true })
      .click();
    await page.getByRole("button", { name: "02 Pricing" }).click();
    await expect(page.getByLabel("Currency", { exact: true })).toHaveValue(
      currency,
    );
  }

  const dealerResponse = await request.post("/api/dealers", {
    data: {
      payload: {
        businessName: `Currency Motors ${unique}`,
        approvalState: "approved",
      },
    },
  });
  expect(dealerResponse.ok()).toBeTruthy();
  const dealer = (await dealerResponse.json()).data;
  const updated = await request.post("/api/vehicles", {
    data: {
      action: "update",
      id: vehicleId,
      payload: {
        dealerId: dealer._id,
        description: "A verified vehicle with a complete inspection report.",
        media: [
          { url: "https://static.wixstatic.com/media/test.jpg", alt: title },
        ],
      },
    },
  });
  expect(updated.ok()).toBeTruthy();
  // An unrelated update must preserve the dealer's chosen currency.
  const vehicle = (await updated.json()).data;
  expect(vehicle.currency).toBe("NGN");
  const published = await request.post("/api/vehicles", {
    data: { action: "status", id: vehicleId, status: "published" },
  });
  expect(published.ok()).toBeTruthy();
  await page.goto(`/preview/storefront#car=${vehicleId}`);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(
    page.getByText(money(26000, "NGN"), { exact: true }).first(),
  ).toBeVisible();
  const detail = await request.get(`/cars/${vehicle.slug}`);
  expect(detail.ok()).toBeTruthy();
  expect(await detail.text()).toContain('"priceCurrency":"NGN"');
});
