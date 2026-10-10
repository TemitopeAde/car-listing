import type { APIRoute } from "astro";
import { context } from "../../backend/context";
import { respond } from "../../backend/errors";
import {
  getSettings,
  setSettings,
} from "../../backend/services/settings-service";
export const GET: APIRoute = () =>
  respond(async () => getSettings(await context()));
export const PATCH: APIRoute = ({ request }) =>
  respond(async () => setSettings(await context(true), await request.json()));
