import { randomUUID } from "node:crypto";
import { dealerInput, dealerSchema } from "../../shared/schemas";
import type { Context } from "../context";
import { AppError } from "../errors";
import { saveRow, getRow, queryRows } from "../repositories/repository";
import { audit } from "./audit-service";
import { setStatus } from "./vehicle-service";
export async function listDealers(ctx: Context, search = "", cursor = 0) {
  const result = await queryRows(ctx, "dealers", {
    search,
    offset: cursor,
    limit: 100,
    sort: "businessName",
  });
  return {
    items: result.rows.map((r) => dealerSchema.parse(r)),
    total: result.total,
  };
}
export async function saveDealer(ctx: Context, raw: unknown, id?: string) {
  if (!ctx.manager)
    throw new AppError(
      "FORBIDDEN",
      "Dealer management permission is required.",
      403,
    );
  const input = id ? dealerInput.partial().parse(raw) : dealerInput.parse(raw),
    existing = id ? await getRow(ctx, "dealers", id) : null;
  if (id && !existing)
    throw new AppError("NOT_FOUND", "Dealer not found.", 404);
  const now = new Date().toISOString(),
    dealer = dealerSchema.parse({
      ...existing,
      ...input,
      _id: id ?? randomUUID(),
      demo: existing?.demo ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  await saveRow(ctx, "dealers", dealer, !id);
  if (id && dealer.approvalState !== "approved") {
    let offset = 0;
    while (true) {
      const r = await queryRows(ctx, "vehicles", {
        eq: { dealerId: id },
        offset,
        limit: 100,
        sort: "_id",
      });
      for (const v of r.rows)
        if (["published", "reserved"].includes(String(v.status)))
          await setStatus(ctx, v._id, "archived");
      offset += r.rows.length;
      if (offset >= r.total || !r.rows.length) break;
    }
  }
  await audit(ctx, "dealer", dealer._id, id ? "update" : "create");
  return dealer;
}
export async function publicDealer(ctx: Context, id: string) {
  const r = await getRow(ctx, "dealers", id, true);
  if (!r || r.approvalState !== "approved" || r.demo) return null;
  const d = dealerSchema.parse(r);
  return {
    _id: d._id,
    businessName: d.businessName,
    phone: d.phone,
    whatsapp: d.whatsapp,
    email: d.email,
    address: d.address,
    location: d.location,
    website: d.website,
    description: d.description,
    hours: d.hours,
  };
}
