// Saved cars live in the visitor's browser only. The marketplace widget writes them and the
// saved-cars embedded script reads them; both run in the same site document.
export type SavedCar = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  href: string;
};
const storageKey = "autohaus:saved-cars:v1";
export const savedCarsEvent = "autohaus:saved-cars";
const maxSaved = 50;
function isSavedCar(value: unknown): value is SavedCar {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.price === "number" &&
    typeof v.currency === "string" &&
    typeof v.image === "string" &&
    typeof v.href === "string"
  );
}
export function readSavedCars(): SavedCar[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(storageKey) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter(isSavedCar) : [];
  } catch {
    return [];
  }
}
function writeSavedCars(cars: SavedCar[]) {
  const next = cars.slice(0, maxSaved);
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch (error) {
    console.error("Could not store saved cars", error);
  }
  window.dispatchEvent(new CustomEvent(savedCarsEvent));
  return next;
}
export function toggleSavedCar(car: SavedCar) {
  const current = readSavedCars();
  return writeSavedCars(
    current.some((c) => c.id === car.id)
      ? current.filter((c) => c.id !== car.id)
      : [car, ...current],
  );
}
export function removeSavedCar(id: string) {
  return writeSavedCars(readSavedCars().filter((c) => c.id !== id));
}
/** Calls `listener` whenever saved cars change in this tab or another tab. */
export function onSavedCarsChange(listener: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey) listener();
  };
  window.addEventListener(savedCarsEvent, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(savedCarsEvent, listener);
    window.removeEventListener("storage", onStorage);
  };
}
