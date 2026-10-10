import { test } from "node:test";
import assert from "node:assert/strict";
import { toggleSavedCarForMember } from "../shared/member-saved-cars";
import type { SavedCar } from "../shared/saved-cars";
import { vehicleLinkWithFallback } from "../shared/site-navigation";

test("only members can toggle saved cars, and expired or failed login checks cannot write", async () => {
  const values = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
    window: new EventTarget(),
  });
  const car: SavedCar = {
    id: "member-car",
    title: "Toyota Camry",
    price: 24500,
    currency: "USD",
    image: "",
    href: "https://example.com/cars/camry",
  };
  let calls = 0;
  const getCar = async () => {
    calls++;
    return car;
  };
  assert.equal(await toggleSavedCarForMember(getCar, async () => false), null);
  assert.equal(calls, 0);
  assert.equal(values.size, 0);
  assert.deepEqual(await toggleSavedCarForMember(getCar, async () => true), [
    car,
  ]);
  const snapshot = [...values];
  assert.equal(await toggleSavedCarForMember(getCar, async () => false), null);
  assert.deepEqual([...values], snapshot);
  await assert.rejects(
    toggleSavedCarForMember(getCar, async () => {
      throw new Error("Login status unavailable");
    }),
  );
  assert.deepEqual([...values], snapshot);
  assert.deepEqual(await toggleSavedCarForMember(getCar, async () => true), []);
});
test("a saved vehicle falls back to a current-page link when Wix can't provide the site URL", async () => {
  assert.equal(
    await vehicleLinkWithFallback(
      async () => "https://cars.example.com/vehicle-details?slug=camry",
      "car-1",
      "https://cars.example.com/inventory",
    ),
    "https://cars.example.com/vehicle-details?slug=camry",
  );
  const warn = console.warn;
  console.warn = () => {};
  try {
    assert.equal(
      await vehicleLinkWithFallback(
        async () => {
          throw new Error("Wix did not return a valid site URL.");
        },
        "car-1",
        "https://cars.example.com/inventory#tab=all",
      ),
      "https://cars.example.com/inventory#tab=all&car=car-1",
    );
  } finally {
    console.warn = warn;
  }
});
