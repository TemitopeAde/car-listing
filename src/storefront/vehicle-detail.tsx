import { useEffect, useState } from "react";
import { api } from "../shared/client";
import { money, payment, vehicleDetailsUrl } from "../shared/utils";
import { siteNavigation } from "../shared/site-navigation";
import type { Vehicle } from "../shared/schemas";
import {
  categoryLabels,
  isCommercial,
  isTrailer,
} from "../shared/vehicle-options";
import { Button } from "./ui/button";
import { Alert, Badge } from "./ui/card";
import { Input, Label, NativeSelect } from "./ui/input";
import { VehicleCard } from "./vehicle-card";
import { DetailGallery } from "./vehicle-gallery";
import { VehicleContact, type PublicDealer } from "./vehicle-contact";
export function VehicleDetail({
  id,
  slug,
  initialVehicle,
  consent,
  onRelated,
  preview = false,
}: {
  id: string;
  /** Looks the vehicle up by its public slug instead of `id`. */
  slug?: string;
  initialVehicle?: Vehicle;
  consent: boolean;
  onRelated?: (id: string) => void;
  /** Editor preview: show `initialVehicle` without calling the API. */
  preview?: boolean;
}) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(
      initialVehicle ?? null,
    ),
    [dealer, setDealer] = useState<PublicDealer | null>(null),
    [related, setRelated] = useState<Vehicle[]>([]),
    [error, setError] = useState(""),
    [navigationError, setNavigationError] = useState(""),
    [loading, setLoading] = useState(!initialVehicle),
    [deposit, setDeposit] = useState(0),
    [rate, setRate] = useState(12),
    [months, setMonths] = useState(48);
  useEffect(() => {
    if (preview) return;
    let active = true;
    setLoading(true);
    setError("");
    setRelated([]);
    api<Vehicle>(
      slug
        ? `vehicles?public=1&slug=${encodeURIComponent(slug)}`
        : `vehicles?public=1&id=${encodeURIComponent(id)}`,
    )
      .then(async (v) => {
        if (!active) return;
        setVehicle(v);
        setLoading(false);
        const [seller, cars] = await Promise.allSettled([
          api<PublicDealer | null>(
            `dealers?public=1&id=${encodeURIComponent(v.dealerId)}`,
          ),
          api<{ items: Vehicle[] }>(
            `vehicles?public=1&similar=${encodeURIComponent(v._id)}&limit=4`,
          ),
        ]);
        if (!active) return;
        if (seller.status === "fulfilled") setDealer(seller.value);
        else setDealer(null);
        if (cars.status === "fulfilled")
          setRelated(cars.value.items.filter((x) => x._id !== v._id));
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, slug, preview]);
  useEffect(() => {
    if (consent && vehicle)
      void api("events", {
        vehicleId: vehicle._id,
        eventType: "view",
        consent: true,
      }).catch(() => {});
  }, [consent, vehicle?._id]);
  function track(channel: string) {
    if (consent && vehicle)
      void api("events", {
        vehicleId: vehicle._id,
        eventType: channel,
        consent: true,
      }).catch(() => {});
  }
  if (loading)
    return (
      <p className="py-12 text-center text-muted-foreground" role="status">
        Loading vehicle details…
      </p>
    );
  if (error)
    return (
      <Alert variant="destructive" role="alert">
        {error}
      </Alert>
    );
  if (!vehicle) return null;
  const notSpecified = (value: string | number) => value || "Not specified";
  const trailer = isTrailer(vehicle.category);
  const specs: [string, string | number][] = [
    ["Category", categoryLabels[vehicle.category]],
    ["Year", vehicle.year],
    ...(trailer
      ? []
      : ([
          [
            "Mileage",
            `${vehicle.mileage.toLocaleString("en")} ${vehicle.mileageUnit}`,
          ],
          ["Transmission", vehicle.transmission],
          ["Fuel", vehicle.fuel],
        ] as [string, string][])),
    [vehicle.category === "car" ? "Body" : "Body type", vehicle.bodyStyle],
    ["Condition", vehicle.condition],
    ...(trailer
      ? []
      : ([
          ["Engine", notSpecified(vehicle.engineSize)],
          [
            vehicle.category === "lorry" ? "Axle configuration" : "Drivetrain",
            notSpecified(vehicle.drivetrain),
          ],
        ] as [string, string | number][])),
    ...(isCommercial(vehicle.category)
      ? ([
          ["Axles", notSpecified(vehicle.axles)],
          [
            "Gross weight",
            vehicle.grossWeight
              ? `${vehicle.grossWeight.toLocaleString("en")} kg`
              : "Not specified",
          ],
          [
            "Payload",
            vehicle.payload
              ? `${vehicle.payload.toLocaleString("en")} kg`
              : "Not specified",
          ],
          [
            "Body length",
            vehicle.bodyLength ? `${vehicle.bodyLength} m` : "Not specified",
          ],
        ] as [string, string | number][])
      : []),
    ["Color", notSpecified(vehicle.exteriorColor)],
    ...(trailer
      ? []
      : ([
          ["Seats", vehicle.seats],
          ["Doors", vehicle.doors],
        ] as [string, number][])),
    ["Stock ID", vehicle.stockId],
  ];
  return (
    <div className="mt-6 grid gap-8">
      {navigationError && (
        <Alert variant="destructive" role="alert">
          {navigationError}
        </Alert>
      )}
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="grid gap-2">
          <Badge>
            {vehicle.status === "published"
              ? vehicle.condition
              : vehicle.status}
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">
            {vehicle.title}
          </h2>
          <p className="text-muted-foreground">
            {vehicle.location} · Stock {vehicle.stockId}
          </p>
        </div>
        <p data-sf="price" className="text-2xl font-semibold">
          {money(vehicle.price, vehicle.currency)}
          {vehicle.negotiable && (
            <small className="text-sm font-normal text-muted-foreground">
              {" "}
              · Negotiable
            </small>
          )}
        </p>
      </header>
      <div className="sf-detail grid grid-cols-1 gap-8">
        <div className="grid min-w-0 content-start gap-6">
          <DetailGallery
            key={vehicle._id}
            media={vehicle.media}
            title={vehicle.title}
          />
          {vehicle.videos.length > 0 && (
            <section className="grid gap-4" aria-label="Vehicle videos">
              <h3 className="text-lg font-semibold">Videos</h3>
              {vehicle.videos.map((video, index) => (
                <figure key={video.fileId ?? video.url} className="grid gap-2">
                  <video
                    src={video.url}
                    poster={video.poster}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={video.title || `Vehicle video ${index + 1}`}
                    className="aspect-video w-full rounded-lg bg-black"
                  />
                  {video.title && (
                    <figcaption className="text-sm text-muted-foreground">
                      {video.title}
                    </figcaption>
                  )}
                </figure>
              ))}
            </section>
          )}
          <section className="grid gap-4">
            <h3 className="text-lg font-semibold">Vehicle details</h3>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-5">
              {specs.map(([label, value]) => (
                <div key={label} className="border-b pb-3">
                  <dt className="mb-1 text-xs text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="grid gap-3">
            <h3 className="text-lg font-semibold">About this vehicle</h3>
            <p className="whitespace-pre-wrap break-words leading-7">
              {vehicle.description}
            </p>
          </section>
          {vehicle.features.length > 0 && (
            <section className="grid gap-3">
              <h3 className="text-lg font-semibold">Features & equipment</h3>
              <ul className="flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <li key={f}>
                    <Badge variant="outline" className="normal-case">
                      ✓ {f}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {vehicle.taxDisclaimer && (
            <p className="text-xs text-muted-foreground">
              {vehicle.taxDisclaimer}
            </p>
          )}
          <details className="rounded-lg border p-5">
            <summary className="font-medium">
              Illustrative payment estimator
            </summary>
            <div className="mt-4 grid gap-4">
              <p className="text-sm text-muted-foreground">
                This calculator is an estimate, not a lender offer. Fees and
                taxes are excluded.
              </p>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                <Label>
                  Deposit
                  <Input
                    type="number"
                    min="0"
                    max={vehicle.price}
                    value={deposit}
                    onChange={(e) =>
                      setDeposit(
                        Math.max(
                          0,
                          Math.min(vehicle.price, Number(e.target.value)),
                        ),
                      )
                    }
                  />
                </Label>
                <Label>
                  Annual interest (%)
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={rate}
                    onChange={(e) =>
                      setRate(
                        Math.max(0, Math.min(100, Number(e.target.value))),
                      )
                    }
                  />
                </Label>
                <Label>
                  Months
                  <NativeSelect
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                  >
                    {[12, 24, 36, 48, 60, 72].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </NativeSelect>
                </Label>
              </div>
              <p className="text-xl font-semibold">
                {money(
                  payment(vehicle.price, deposit, rate, months),
                  vehicle.currency,
                )}{" "}
                / month
              </p>
            </div>
          </details>
        </div>
        <VehicleContact
          key={vehicle._id}
          vehicle={vehicle}
          dealer={dealer}
          track={track}
        />
      </div>
      {related.length > 0 && (
        <section className="grid min-w-0 gap-4">
          <h3 className="text-lg font-semibold">You may also like</h3>
          {/* One swipeable row on narrow widgets instead of a long stack of cards. */}
          <div className="grid auto-rows-fr gap-5 max-sm:auto-cols-[minmax(240px,80%)] max-sm:grid-flow-col max-sm:overflow-x-auto max-sm:pb-2 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))]">
            {related.map((v) => (
              <VehicleCard key={v._id} vehicle={v}>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (onRelated) onRelated(v._id);
                    else {
                      setNavigationError("");
                      void siteNavigation
                        .to(vehicleDetailsUrl(v.slug))
                        .catch(() =>
                          setNavigationError(
                            "Could not open the vehicle page. Please try again.",
                          ),
                        );
                    }
                  }}
                >
                  View vehicle
                </Button>
              </VehicleCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
