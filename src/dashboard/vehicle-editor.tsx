import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Globe } from "lucide-react";
import {
  vehicleInput,
  type Vehicle,
  type VehicleInput,
  type Dealer,
} from "../shared/schemas";
import { api } from "./api";
import { VehicleSections } from "./components/vehicle-sections";
import { useResource } from "./hooks";
import { Button, cn } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Badge } from "./components/common";
import { useVehicleUploads } from "./use-vehicle-uploads";
const sections = [
  "Basics",
  "Pricing",
  "Specifications",
  "Features",
  "Media",
  "Seller",
  "Description & SEO",
  "Publishing",
];
type FormInput = z.input<typeof vehicleInput>;
export function VehicleEditor({
  vehicle,
  onBack,
}: {
  vehicle: Vehicle | null;
  onBack: () => void;
}) {
  const [section, setSection] = useState(0),
    [saved, setSaved] = useState(vehicle),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState("");
  const createKey = useRef("");
  const dealers = useResource<{ items: Dealer[] }>("dealers");
  const form = useForm<FormInput, unknown, VehicleInput>({
    resolver: zodResolver(vehicleInput),
    defaultValues: vehicle
      ? vehicleInput.parse(
          Object.fromEntries(
            Object.keys(vehicleInput.shape).map((k) => [
              k,
              vehicle[k as keyof Vehicle],
            ]),
          ),
        )
      : {
          title: "",
          stockId: "",
          make: "",
          model: "",
          year: 2026,
          price: 0,
          currency: "USD",
          mileage: 0,
          condition: "used",
          transmission: "Automatic",
          fuel: "Petrol",
          category: "car",
          bodyStyle: "Sedan",
          doors: 4,
          seats: 5,
          mileageUnit: "mi",
          features: [],
          media: [],
          videos: [],
          description: "",
          dealerId: "",
        },
  });
  const uploads = useVehicleUploads(form);
  const {
    formState: { errors, isDirty },
  } = form;
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (isDirty || uploads.busy) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [isDirty, uploads.busy]);
  function back() {
    if (isDirty || uploads.busy) setConfirm("leave");
    else onBack();
  }
  async function save(input: VehicleInput, publish = false) {
    if (uploads.busy) {
      toast.error("Wait for media uploads to finish before saving.");
      return;
    }
    setBusy(true);
    try {
      if (!createKey.current) createKey.current = crypto.randomUUID();
      let result = await api<Vehicle>(
        "vehicles",
        saved
          ? {
              action: "update",
              id: saved._id,
              payload: input,
              version: saved.version,
            }
          : {
              action: "create",
              payload: input,
              idempotencyKey: createKey.current,
            },
      );
      setSaved(result);
      form.reset(
        vehicleInput.parse(
          Object.fromEntries(
            Object.keys(vehicleInput.shape).map((k) => [
              k,
              result[k as keyof Vehicle],
            ]),
          ),
        ),
      );
      if (publish) {
        result = await api<Vehicle>("vehicles", {
          action: "status",
          id: result._id,
          status: "published",
        });
        setSaved(result);
      }
      toast.success(publish ? "Vehicle published" : "Vehicle saved");
      setConfirm("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function statusAction(status: string) {
    if (!saved) return;
    setBusy(true);
    try {
      const result = await api<Vehicle>("vehicles", {
        action: "status",
        id: saved._id,
        status,
      });
      setSaved(result);
      toast.success(`Vehicle ${status}`);
      setConfirm("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <div className="flex justify-between flex-wrap items-center gap-3 mb-6">
        <Button variant="ghost" onClick={back}>
          <ArrowLeft size={16} />
          Back to inventory
        </Button>
        <div className="flex gap-2 items-center">
          <Badge status={saved?.status}>
            {saved?.demo ? "Demo vehicle" : (saved?.status ?? "New draft")}
          </Badge>
          <Button
            variant="outline"
            onClick={() => void form.handleSubmit((i) => save(i))()}
            disabled={busy || uploads.busy}
          >
            <Save size={16} />
            {busy ? "Saving…" : "Save changes"}
          </Button>
          <Button
            onClick={() => setConfirm("published")}
            disabled={
              busy ||
              uploads.busy ||
              saved?.demo ||
              saved?.status === "published"
            }
          >
            <Globe size={16} />
            Publish
          </Button>
        </div>
      </div>
      <div className="grid lg:grid-cols-[210px_1fr] gap-6">
        <nav
          aria-label="Vehicle editor sections"
          className="surface p-3 h-fit flex lg:flex-col flex-wrap gap-1"
        >
          {sections.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(i)}
              className={cn(
                "px-3 py-3 rounded-lg text-sm text-left flex gap-3 items-center",
                section === i
                  ? "bg-green-50 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted",
              )}
              aria-current={section === i ? "step" : undefined}
            >
              <span className="text-xs opacity-60">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s}
            </button>
          ))}
        </nav>
        <form
          className="surface p-6 lg:p-8"
          onSubmit={form.handleSubmit((i) => save(i))}
        >
          <h2 className="text-xl font-semibold">{sections[section]}</h2>
          <p className="hint mt-1 mb-7">
            {section === 0
              ? "Start with the facts that make this vehicle easy to find."
              : "Keep details accurate so buyers know what to expect."}
          </p>
          {Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-lg bg-red-50 text-red-800 text-sm"
            >
              <p className="font-semibold">Check these fields before saving:</p>
              <ul className="mt-2 list-disc pl-4">
                {Object.entries(errors).map(([key, e]) => (
                  <li key={key}>
                    {key}: {String(e?.message ?? "Please check this field")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <VehicleSections
            section={section}
            form={form}
            saved={saved}
            dealers={dealers}
            setConfirm={setConfirm}
            uploads={uploads}
          />
          <div className="border-t mt-8 pt-5 flex justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={section === 0}
              onClick={() => setSection((s) => s - 1)}
            >
              Previous
            </Button>
            {section < sections.length - 1 ? (
              <Button type="button" onClick={() => setSection((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={busy || uploads.busy}>
                Save changes
              </Button>
            )}
          </div>
        </form>
      </div>
      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm("");
        }}
      >
        <DialogContent>
          <DialogTitle className="section-heading">
            {confirm === "leave"
              ? "Discard unsaved changes?"
              : confirm === "published"
                ? "Publish this vehicle?"
                : `Mark this vehicle ${confirm}?`}
          </DialogTitle>
          <DialogDescription className="hint my-4">
            {confirm === "leave"
              ? "Changes since your last save will be lost and pending uploads will be cancelled."
              : confirm === "published"
                ? "Your changes will be saved and this listing will become visible to site visitors."
                : "This changes the availability of this listing on your storefront."}
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm("")}>
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={() =>
                confirm === "leave"
                  ? onBack()
                  : confirm === "published"
                    ? void form.handleSubmit(
                        (i) => save(i, true),
                        () => setConfirm(""),
                      )()
                    : void statusAction(confirm)
              }
            >
              {busy ? "Saving…" : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
