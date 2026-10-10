import type { APIRoute } from "astro";
import { z } from "zod";
import { context } from "../../backend/context";
import { respond } from "../../backend/errors";
import { seedDemo, clearDemo } from "../../backend/services/vehicle-service";
export const POST: APIRoute = ({ request }) =>
  respond(async () => {
    const { action } = z
      .object({ action: z.enum(["seed", "clear"]) })
      .strict()
      .parse(await request.json());
    const ctx = await context(true);
    return action === "seed" ? seedDemo(ctx) : clearDemo(ctx);
  });
