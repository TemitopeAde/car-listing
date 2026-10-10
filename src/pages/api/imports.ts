import type { APIRoute } from "astro";
import { context } from "../../backend/context";
import { respond } from "../../backend/errors";
import { importCSV } from "../../backend/services/import-service";
export const POST: APIRoute = ({ request }) =>
  respond(async () => importCSV(await context(true), await request.json()));
