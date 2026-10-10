import { toggleSavedCar, type SavedCar } from "./saved-cars";

async function loggedIn(): Promise<boolean> {
  // The isolated local preview has no Wix member session.
  if (
    import.meta.env?.DEV &&
    import.meta.env.PUBLIC_CAR_LISTING_DEMO === "1" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  )
    return false;
  const { authentication } = await import("@wix/site");
  return authentication.loggedIn();
}

export async function toggleSavedCarForMember(
  getCar: () => Promise<SavedCar>,
  checkLogin: () => Promise<boolean> = loggedIn,
): Promise<SavedCar[] | null> {
  if (!(await checkLogin())) return null;
  return toggleSavedCar(await getCar());
}
