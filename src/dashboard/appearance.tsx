import { useEffect, useState } from "react";
import { assetUrl } from "../shared/client";
import { toast } from "sonner";
import { RotateCcw, Download, Upload, Save } from "lucide-react";
import { themeSchema, defaultTheme, type Theme } from "../shared/schemas";
import { demoVehicles } from "../shared/demo";
import { money } from "../shared/utils";
import { api, download } from "./api";
import { useResource } from "./hooks";
import { Button } from "./components/ui/button";
export function Appearance() {
  const resource = useResource<Theme>("settings");
  const [theme, setTheme] = useState(defaultTheme),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (resource.data) setTheme(resource.data);
  }, [resource.data]);
  async function save() {
    setBusy(true);
    try {
      await api("settings", theme, "PATCH");
      toast.success("Appearance saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="section-heading">Make it feel like your showroom</h2>
          <p className="hint mt-1">
            Set global styling. Widget controls can override it in the editor.
          </p>
        </div>
        <Button disabled={busy} onClick={() => void save()}>
          <Save size={16} />
          {busy ? "Saving…" : "Save appearance"}
        </Button>
      </div>
      {resource.error && (
        <p role="alert" className="text-red-700">
          {resource.error}
        </p>
      )}
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <section className="surface p-6 space-y-5">
          <div>
            <label className="label" htmlFor="brand">
              Showroom name
            </label>
            <input
              id="brand"
              className="field"
              value={theme.brandName}
              onChange={(e) =>
                setTheme({ ...theme, brandName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="accent">
              Accent color
            </label>
            <div className="flex gap-3">
              <input
                id="accent"
                type="color"
                className="w-10 h-10 rounded cursor-pointer"
                value={theme.accent}
                onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
              />
              <input
                aria-label="Accent hex value"
                className="field"
                value={theme.accent}
                onChange={(e) => {
                  if (/^#[a-f\d]{6}$/i.test(e.target.value))
                    setTheme({ ...theme, accent: e.target.value });
                }}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="font">
              Typography
            </label>
            <select
              id="font"
              className="field"
              value={theme.fontFamily}
              onChange={(e) =>
                setTheme({
                  ...theme,
                  fontFamily: e.target.value as Theme["fontFamily"],
                })
              }
            >
              {["system-ui", "Georgia", "Trebuchet MS"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="columns">
              Columns: {theme.columns}
            </label>
            <input
              id="columns"
              className="w-full accent-primary"
              type="range"
              min="1"
              max="4"
              value={theme.columns}
              onChange={(e) =>
                setTheme({ ...theme, columns: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="radius">
              Corner radius: {theme.radius}px
            </label>
            <input
              id="radius"
              className="w-full accent-primary"
              type="range"
              min="0"
              max="32"
              value={theme.radius}
              onChange={(e) =>
                setTheme({ ...theme, radius: Number(e.target.value) })
              }
            />
          </div>
          <div className="border-t pt-5 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setTheme(defaultTheme)}
            >
              <RotateCcw size={15} />
              Reset defaults
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                download(
                  "showroom-theme.json",
                  JSON.stringify(theme, null, 2),
                  "application/json",
                )
              }
            >
              <Download size={15} />
              Export theme
            </Button>
            <label className="flex items-center justify-center gap-2 border rounded-md h-10 cursor-pointer text-sm">
              <Upload size={15} />
              Import theme
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setTheme(themeSchema.parse(JSON.parse(await f.text())));
                    toast.success("Theme loaded. Save to apply it.");
                  } catch {
                    toast.error("Choose a valid showroom theme file.");
                  }
                }}
              />
            </label>
          </div>
        </section>
        <section className="surface p-6 min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
            Live preview · demo inventory
          </div>
          <div style={{ fontFamily: theme.fontFamily }}>
            <h3 className="text-2xl mb-2 font-semibold">{theme.brandName}</h3>
            <p className="hint mb-6">
              Find the car that fits your next chapter.
            </p>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${Math.max(150, 600 / theme.columns)}px), 1fr))`,
              }}
            >
              {demoVehicles.slice(0, 3).map((v) => (
                <article
                  key={v._id}
                  className="border overflow-hidden"
                  style={{ borderRadius: theme.radius }}
                >
                  <img
                    src={v.media[0] && assetUrl(v.media[0].url)}
                    title={v.media[0]?.credit}
                    alt={v.media[0]?.alt}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold text-sm">{v.title}</p>
                    <p className="hint text-xs mt-2">
                      {v.mileage.toLocaleString("en")} km · {v.transmission}
                    </p>
                    <p
                      style={{ color: theme.accent }}
                      className="mt-4 font-semibold"
                    >
                      {money(v.price, v.currency)}
                    </p>
                    <span className="text-xs text-muted-foreground mt-3 block">
                      Sample listing
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
