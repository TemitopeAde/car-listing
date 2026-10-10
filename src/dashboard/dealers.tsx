import { useState } from "react";
import { toast } from "sonner";
import { Plus, MapPin, Mail, Phone, Building2 } from "lucide-react";
import type { Dealer } from "../shared/schemas";
import { dealerInput } from "../shared/schemas";
import { api } from "./api";
import { useResource } from "./hooks";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Badge, Empty, LoadState } from "./components/common";
export function Dealers() {
  const [search, setSearch] = useState(""),
    [editing, setEditing] = useState<Dealer | null>(null),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const resource = useResource<{ items: Dealer[]; total: number }>(
    `dealers?search=${encodeURIComponent(search)}`,
  );
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const result = dealerInput.safeParse(data);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Check dealer details");
      return;
    }
    setBusy(true);
    try {
      await api("dealers", { id: editing?._id, payload: result.data });
      toast.success("Dealership saved");
      setOpen(false);
      await resource.reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="section-heading">Your dealer network</h2>
          <p className="hint mt-1">
            Manage sellers and route buyers to the right team.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={16} />
          Add dealership
        </Button>
      </div>
      <input
        className="field max-w-sm"
        aria-label="Search dealerships"
        placeholder="Search dealerships…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <LoadState {...resource} retry={() => void resource.reload()} />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {resource.data?.items.map((d) => (
          <button
            key={d._id}
            onClick={() => {
              setEditing(d);
              setOpen(true);
            }}
            className="surface p-6 text-left hover:border-primary"
          >
            <div className="flex justify-between">
              <span className="p-3 rounded-lg bg-muted text-primary">
                <Building2 size={22} />
              </span>
              <Badge status={d.approvalState}>
                {d.demo ? "Demo" : d.approvalState}
              </Badge>
            </div>
            <h3 className="font-semibold mt-4">{d.businessName}</h3>
            <p className="hint flex gap-2 mt-3">
              <MapPin size={15} />
              {d.location || "No location added"}
            </p>
            <p className="hint flex gap-2 mt-2">
              <Mail size={15} />
              {d.email || "No email added"}
            </p>
            <p className="hint flex gap-2 mt-2">
              <Phone size={15} />
              {d.phone || "No phone added"}
            </p>
          </button>
        ))}
      </div>
      {resource.data?.items.length === 0 && (
        <Empty
          title="No dealerships yet"
          description="Add your dealership, complete its contact details and approve it before publishing vehicles."
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="section-heading">
            {editing ? "Edit" : "Add"} dealership
          </DialogTitle>
          <DialogDescription className="hint mt-1 mb-5">
            These contact details appear beside public listings.
          </DialogDescription>
          <form onSubmit={save} className="space-y-4">
            {(
              [
                "businessName",
                "location",
                "address",
                "email",
                "phone",
                "whatsapp",
                "website",
                "hours",
              ] as const
            ).map((k) => (
              <div key={k}>
                <label className="label capitalize" htmlFor={`d-${k}`}>
                  {k === "businessName"
                    ? "Business name"
                    : k === "whatsapp"
                      ? "WhatsApp (international number)"
                      : k}
                </label>
                <input
                  id={`d-${k}`}
                  name={k}
                  className="field"
                  type={k === "email" ? "email" : "text"}
                  defaultValue={editing?.[k] ?? ""}
                  required={k === "businessName"}
                />
              </div>
            ))}
            <div>
              <label className="label" htmlFor="d-description">
                Description
              </label>
              <textarea
                id="d-description"
                name="description"
                className="field h-20"
                defaultValue={editing?.description ?? ""}
              />
            </div>
            <label className="label" htmlFor="d-approval">
              Approval state
            </label>
            <select
              id="d-approval"
              name="approvalState"
              className="field"
              defaultValue={editing?.approvalState ?? "pending"}
            >
              {["pending", "approved", "suspended", "rejected"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={busy}>
                {busy ? "Saving…" : "Save dealership"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
