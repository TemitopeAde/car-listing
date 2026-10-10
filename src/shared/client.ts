import { httpClient } from "@wix/essentials";
import { readResult } from "./api-response";
export { readResult } from "./api-response";
export const apiOrigin = new URL(import.meta.url).origin;
export function apiUrl(route: string) {
  return new URL(`/api/${route}`, apiOrigin).href;
}
/**
 * App-bundled files such as `/media/samples/…` must load from the app, not the merchant's site,
 * where a root-relative path would resolve to a page that doesn't exist.
 */
export function assetUrl(url: string) {
  // During server rendering the module URL is `file://` and its origin is "null".
  return url.startsWith("/") && apiOrigin.startsWith("http")
    ? new URL(url, apiOrigin).href
    : url;
}
export function apiInit(body: unknown, method: string): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}
export async function api<T>(
  route: string,
  body?: unknown,
  method = body === undefined ? "GET" : "POST",
): Promise<T> {
  const url = apiUrl(route);
  const init = apiInit(body, method);
  // The local storefront preview has its own isolated file store and never sends a Wix token.
  const response = await (import.meta.env.DEV &&
  import.meta.env.PUBLIC_CAR_LISTING_DEMO === "1" &&
  ["127.0.0.1", "localhost"].includes(window.location.hostname)
    ? fetch(url, init)
    : httpClient.fetchWithAuth(url, init));
  return readResult<T>(response);
}
export function download(
  name: string,
  content: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
