import type { VehicleForm } from "./vehicle-form-types";
export function VehicleFeatures({ form }: { form: VehicleForm }) {
  const { watch, setValue } = form;
  const features = watch("features") ?? [];
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          "Leather seats",
          "Rear-view camera",
          "Bluetooth",
          "Cruise control",
          "Sunroof",
          "Navigation",
          "Parking sensors",
          "Heated seats",
          "Apple CarPlay",
          "Android Auto",
          "Keyless entry",
          "Alloy wheels",
          "ABS",
          "Airbags",
        ].map((f) => (
          <label
            key={f}
            className="flex items-center gap-3 text-sm p-3 rounded-lg border"
          >
            <input
              type="checkbox"
              checked={features.includes(f)}
              onChange={(e) =>
                setValue(
                  "features",
                  e.target.checked
                    ? [...features, f]
                    : features.filter((x) => x !== f),
                  { shouldDirty: true },
                )
              }
            />
            {f}
          </label>
        ))}
      </div>
      <label className="label mt-6" htmlFor="custom-features">
        Additional features (one per line)
      </label>
      <textarea
        id="custom-features"
        className="field h-24"
        defaultValue={features
          .filter(
            (f) =>
              ![
                "Leather seats",
                "Rear-view camera",
                "Bluetooth",
                "Cruise control",
                "Sunroof",
                "Navigation",
                "Parking sensors",
                "Heated seats",
                "Apple CarPlay",
                "Android Auto",
                "Keyless entry",
                "Alloy wheels",
                "ABS",
                "Airbags",
              ].includes(f),
          )
          .join("\n")}
        onBlur={(e) =>
          setValue(
            "features",
            Array.from(
              new Set([
                ...features,
                ...e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              ]),
            ),
            { shouldDirty: true },
          )
        }
      />
    </>
  );
}
