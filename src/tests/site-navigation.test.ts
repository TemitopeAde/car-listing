import { test } from "node:test";
import assert from "node:assert/strict";
import { createSiteNavigation } from "../shared/site-navigation";
import { vehicleDetailsUrl } from "../shared/utils";

function fixture(base: string) {
  const navigations: string[] = [];
  let reads = 0;
  const navigation = createSiteNavigation({
    baseUrl: async () => {
      reads++;
      return base;
    },
    url: async () =>
      `${base.replace(/\/$/, "")}/inventory?category=used#sort=price`,
    to: async (url) => {
      navigations.push(url);
    },
  });
  return { navigation, navigations, reads: () => reads };
}
test("vehicle redirects obtain Wix's base URL and preserve the free site's path", async () => {
  const { navigation, navigations, reads } = fixture(
    "https://dealer.wixsite.com/showroom/",
  );
  await navigation.to(vehicleDetailsUrl("camry & hybrid"));
  assert.equal(reads(), 1);
  assert.deepEqual(navigations, [
    "https://dealer.wixsite.com/showroom/vehicle-details?slug=camry%20%26%20hybrid",
  ]);
  await navigation.to("/");
  assert.equal(navigations[1], "https://dealer.wixsite.com/showroom/");
});
test("custom-domain saved links resolve using Wix's base URL with or without a trailing slash", async () => {
  for (const base of [
    "https://cars.example.com",
    "https://cars.example.com/",
  ]) {
    const { navigation } = fixture(base);
    assert.equal(
      await navigation.pageUrl(
        vehicleDetailsUrl("civic", "/inventory/details"),
      ),
      "https://cars.example.com/inventory/details?slug=civic",
    );
  }
});
test("an inline saved vehicle uses Wix's current page URL and preserves its query and hash values", async () => {
  const { navigation } = fixture("https://dealer.wixsite.com/showroom/");
  const url = new URL(await navigation.vehicleLink("vehicle 123"));
  assert.equal(url.pathname, "/showroom/inventory");
  assert.equal(url.search, "?category=used");
  assert.equal(new URLSearchParams(url.hash.slice(1)).get("sort"), "price");
  assert.equal(
    new URLSearchParams(url.hash.slice(1)).get("car"),
    "vehicle 123",
  );
});
test("failed Wix URL lookup does not redirect to an inferred browser or iframe URL", async () => {
  let navigated = false;
  const navigation = createSiteNavigation({
    baseUrl: async () => {
      throw new Error("Wix URL unavailable");
    },
    url: async () => "https://host.example.com/",
    to: async () => {
      navigated = true;
    },
  });
  await assert.rejects(navigation.to("/vehicle-details"), /unavailable/);
  assert.equal(navigated, false);
});
test("site navigation rejects external paths and paths escaping a free site's root", async () => {
  const { navigation } = fixture("https://dealer.wixsite.com/showroom/");
  for (const path of [
    "//evil.example.com",
    "https://evil.example.com",
    "/../another-site",
    "/%2e%2e/another-site",
  ]) {
    await assert.rejects(navigation.to(path), /page on this site/);
  }
});
