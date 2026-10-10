import type { APIRoute } from "astro";
import { z } from "zod";
import { context } from "../../backend/context";
import { respond, readJson, methodNotAllowed } from "../../backend/errors";
import { dealerDirectory } from "../../backend/services/public-dealer-service";
import {
  listDealers,
  saveDealer,
  publicDealer,
} from "../../backend/services/dealer-service";
export const GET: APIRoute = ({ request }) =>
  respond(async () => {
    const p = new URL(request.url).searchParams;
    if (p.get("public") === "1")
      return p.get("id")
        ? publicDealer(await context(), z.string().min(1).parse(p.get("id")))
        : dealerDirectory(
            await context(),
            p.get("search") ?? "",
            z.coerce
              .number()
              .int()
              .min(0)
              .parse(p.get("cursor") ?? 0),
          );
    return listDealers(
      await context(true),
      p.get("search") ?? "",
      z.coerce
        .number()
        .int()
        .min(0)
        .parse(p.get("cursor") ?? 0),
    );
  });
export const POST: APIRoute = ({ request }) =>
  respond(async () => {
    const c = z
      .object({ id: z.string().optional(), payload: z.unknown() })
      .strict()
      .parse(await readJson(request));
    return saveDealer(await context(true), c.payload, c.id);
  });

export const ALL: APIRoute = () => methodNotAllowed(["GET", "POST"]);
