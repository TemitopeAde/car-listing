type SiteLocation = {
  baseUrl(): Promise<string>;
  url(): Promise<string>;
  to(url: string): Promise<void>;
};

function pageUrl(baseUrl: string, path: string) {
  if (!path.startsWith("/") || path.startsWith("//"))
    throw new Error("Choose a page on this site.");
  const base = new URL(baseUrl);
  if (
    !["https:", "http:"].includes(base.protocol) ||
    base.username ||
    base.password
  )
    throw new Error("Wix did not return a valid site URL.");
  base.search = "";
  base.hash = "";
  base.pathname = `${base.pathname.replace(/\/+$/, "")}/`;
  // A free Wix site's base includes its site name, which a root-relative URL drops.
  const target = new URL(path.slice(1), base);
  if (
    target.origin !== base.origin ||
    !target.pathname.startsWith(base.pathname)
  )
    throw new Error("Choose a page on this site.");
  return target.href;
}

export function createSiteNavigation(location: SiteLocation) {
  return {
    pageUrl: async (path: string) => pageUrl(await location.baseUrl(), path),
    to: async (path: string) =>
      location.to(pageUrl(await location.baseUrl(), path)),
    vehicleLink: async (id: string) => {
      const current = new URL(await location.url());
      const hash = new URLSearchParams(current.hash.slice(1));
      hash.set("car", id);
      current.hash = hash.toString();
      return current.href;
    },
  };
}

async function hostLocation(): Promise<SiteLocation> {
  // Only the isolated localhost development fixture uses browser URLs.
  if (
    import.meta.env?.DEV &&
    import.meta.env.PUBLIC_CAR_LISTING_DEMO === "1" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return {
      baseUrl: async () => window.location.origin,
      url: async () => window.location.href,
      to: async (url) => window.location.assign(url),
    };
  }
  return (await import("@wix/site-location")).location;
}
export const siteNavigation = createSiteNavigation({
  baseUrl: async () => (await hostLocation()).baseUrl(),
  url: async () => (await hostLocation()).url(),
  to: async (url) => (await hostLocation()).to(url),
});
/**
 * A link back to a vehicle for the saved-cars list. If Wix can't provide the site URL, it falls
 * back to the current page, so saving a vehicle never fails just because a link couldn't be built.
 */
export async function vehicleLinkWithFallback(
  build: () => Promise<string>,
  id: string,
  currentUrl: string,
) {
  try {
    return await build();
  } catch (error) {
    console.warn(
      "Could not build the vehicle link; using the current page",
      error,
    );
    const url = new URL(currentUrl);
    const hash = new URLSearchParams(url.hash.slice(1));
    hash.set("car", id);
    url.hash = hash.toString();
    return url.href;
  }
}
