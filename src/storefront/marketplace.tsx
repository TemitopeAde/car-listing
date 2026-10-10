import { ElementStyleContext, useElementStyle } from "./element-style";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { api, assetUrl } from "../shared/client";
import { defaultTheme, type Vehicle, type Theme } from "../shared/schemas";
import { demoVehicles } from "../shared/demo";
import { SearchFilters } from "./search-filters";
import type { FilterKey, FilterVisibility } from "./filter-visibility";
import { VehicleDetail } from "./vehicle-detail";
import {
  CompareToggle,
  CompareTray,
  VehicleComparison,
} from "./vehicle-comparison";
import { Button } from "./ui/button";
import { Alert } from "./ui/card";
import { cn } from "./ui/utils";
import { vehicleDetailsUrl } from "../shared/utils";
import {
  siteNavigation,
  vehicleLinkWithFallback,
} from "../shared/site-navigation";
import { VehicleCard } from "./vehicle-card";
import { Pagination } from "./pagination";
import { Eye, Heart, LoaderCircle } from "lucide-react";
import { VehicleQuickView } from "./vehicle-quick-view";
import { toast, Toaster } from "sonner";
import { toggleSavedCarForMember } from "../shared/member-saved-cars";
import { onSavedCarsChange, readSavedCars } from "../shared/saved-cars";
import {
  storefrontRootStyle,
  readFont,
  textSections,
  type WidgetStyle,
} from "./widget-style";
type ListingPage = {
  items: Vehicle[];
  total: number;
  nextCursor: number | null;
  samples?: boolean;
};
export type PaginationMode = "pages" | "infinite";
// Matches the API's maximum `cursor`; later pages of a huge catalog are reached by filtering.
const maxCursor = 100000;
function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
function demoPage(cursor: number, limit: number, featuredOnly: boolean) {
  const rows = demoVehicles.filter((v) => !featuredOnly || v.featured);
  return {
    items: rows.slice(cursor, cursor + limit),
    total: rows.length,
    nextCursor: cursor + limit < rows.length ? cursor + limit : null,
  };
}
export type MarketplaceProps = {
  title?: string;
  description?: string;
  designMode?: boolean;
  initialVehicle?: Vehicle;
  accent?: string;
  widgetStyle?: WidgetStyle;
  columns?: number;
  radius?: number;
  layout?: string;
  limit?: number;
  featuredOnly?: boolean;
  pagination?: PaginationMode;
  filterVisibility?: FilterVisibility;
  /** Page holding the Vehicle Details widget; without it, details open inside this widget. */
  detailsPage?: string;
};
const badgeFor = (v: Vehicle) =>
  v.demo ? "Sample" : v.status === "published" ? v.condition : v.status;
export function Marketplace(props: MarketplaceProps) {
  return (
    <ElementStyleContext.Provider value={props.widgetStyle ?? {}}>
      <MarketplaceContent {...props} />
    </ElementStyleContext.Provider>
  );
}
function MarketplaceContent({
  title = "Find your next chapter.",
  description = "A carefully managed collection of cars. Find the one that feels right.",
  designMode = false,
  initialVehicle,
  accent,
  widgetStyle = {},
  columns,
  radius,
  layout = "grid",
  limit = 12,
  featuredOnly = false,
  pagination = "pages",
  filterVisibility = {},
  detailsPage,
}: MarketplaceProps) {
  const toasterId = useId();
  const elementStyle = useElementStyle();
  const pageSize = Math.min(100, Math.max(1, Math.round(limit) || 12));
  const [vehicles, setVehicles] = useState<ListingPage | null>(
      designMode ? demoPage(0, pageSize, featuredOnly) : null,
    ),
    [theme, setTheme] = useState<Theme>(defaultTheme),
    [extraFilters, setExtraFilters] = useState({
      category: "",
      model: "",
      location: "",
      condition: "",
      minPrice: "",
      maxYear: "",
      maxMileage: "",
      transmission: "",
    }),
    [search, setSearch] = useState(""),
    [make, setMake] = useState(""),
    [minYear, setMinYear] = useState(""),
    [maxPrice, setMaxPrice] = useState(""),
    [fuel, setFuel] = useState(""),
    [body, setBody] = useState(""),
    [sort, setSort] = useState("recent"),
    [loading, setLoading] = useState(!designMode),
    [loadingMore, setLoadingMore] = useState(false),
    [error, setError] = useState(""),
    [navigationError, setNavigationError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [detail, setDetail] = useState(initialVehicle?._id ?? ""),
    [comparison, setComparison] = useState<Vehicle[]>([]),
    [comparing, setComparing] = useState(false),
    [quickView, setQuickView] = useState<Vehicle | null>(null),
    quickViewTrigger = useRef<HTMLElement | null>(null),
    [saved, setSaved] = useState<string[]>([]),
    [availableMakes, setAvailableMakes] = useState<string[]>([]),
    [makesError, setMakesError] = useState("");
  useEffect(() => {
    if (designMode) {
      setAvailableMakes(demoVehicles.map((vehicle) => vehicle.make));
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const result = await api<{ makes: string[] }>(
          "vehicles?public=1&makes=1",
        );
        if (active) {
          setAvailableMakes(result.makes);
          setMakesError("");
        }
      } catch (error) {
        console.error("Could not load vehicle makes", error);
        if (active)
          setMakesError("Could not load all makes. Refresh to retry.");
      }
    };
    void load();
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, [designMode]);
  useEffect(() => {
    if (designMode) return;
    const sync = () => setSaved(readSavedCars().map((c) => c.id));
    sync();
    return onSavedCarsChange(sync);
  }, [designMode]);
  useEffect(() => {
    if (designMode) return;
    api<Theme>("settings")
      .then(setTheme)
      .catch(() => {});
    const read = () => {
      const p = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      setDetail(p.get("car") ?? initialVehicle?._id ?? "");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [designMode, initialVehicle?._id]);
  // Filters apply after typing pauses, so large catalogs aren't queried on every keystroke.
  const filterQuery = useMemo(() => {
    const p = new URLSearchParams({
      public: "1",
      sort: filterVisibility.sort === false ? "recent" : sort,
    });
    for (const [key, value] of Object.entries({
      search: search.trim(),
      make,
      fuel,
      bodyStyle: body,
      minYear,
      maxPrice,
      ...extraFilters,
    }))
      if (value && filterVisibility[key as FilterKey] !== false)
        p.set(key, value);
    if (featuredOnly) p.set("featured", "true");
    p.set("limit", String(pageSize));
    return p.toString();
  }, [
    filterVisibility,
    extraFilters,
    search,
    make,
    minYear,
    maxPrice,
    fuel,
    body,
    sort,
    featuredOnly,
    pageSize,
  ]);
  const query = `${useDebounced(filterQuery)}&mode=${pagination}`;
  // A position belongs to one query; any filter, size or mode change starts again at the top.
  const [position, setPosition] = useState({ query, cursor: 0 });
  const cursor = position.query === query ? position.cursor : 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    const append = pagination === "infinite" && cursor > 0;
    (append ? setLoadingMore : setLoading)(true);
    setError("");
    const request = designMode
      ? Promise.resolve(demoPage(cursor, pageSize, featuredOnly))
      : api<ListingPage>(
          `vehicles?${query.replace(/&mode=\w+$/, "")}&cursor=${cursor}`,
        );
    request
      .then((page) => {
        if (!active) return;
        setVehicles((current) => {
          if (!append || !current) return page;
          const seen = new Set(current.items.map((v) => v._id));
          return {
            ...page,
            items: [
              ...current.items,
              ...page.items.filter((v) => !seen.has(v._id)),
            ],
          };
        });
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setLoadingMore(false);
      });
    return () => {
      active = false;
    };
    // `pagination`, `pageSize` and `featuredOnly` are already part of the debounced `query`.
  }, [designMode, query, cursor, attempt]);
  const nextCursor = vehicles?.nextCursor ?? null;
  const busy = loading || loadingMore;
  const canLoadMore =
    pagination === "infinite" && nextCursor !== null && nextCursor <= maxCursor;
  function loadMore() {
    if (canLoadMore && !busy) setPosition({ query, cursor: nextCursor ?? 0 });
  }
  useEffect(() => {
    const target = sentinelRef.current;
    if (
      !canLoadMore ||
      busy ||
      error ||
      !target ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    // Re-created after every load, so a sentinel that is still visible fetches the next batch.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting)
          setPosition({ query, cursor: nextCursor ?? 0 });
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [canLoadMore, busy, error, query, nextCursor]);
  const total = vehicles?.total ?? 0;
  const pages = Math.min(
    Math.ceil(total / pageSize),
    Math.floor(maxCursor / pageSize) + 1,
  );
  const page = Math.floor(cursor / pageSize) + 1;
  function scrollToTop() {
    const top = rootRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) rootRef.current?.scrollIntoView({ block: "start" });
  }
  function goToPage(next: number) {
    setPosition({ query, cursor: (next - 1) * pageSize });
    scrollToTop();
  }
  async function save(v: Vehicle) {
    try {
      const next = await toggleSavedCarForMember(async () => {
        const href = await vehicleLinkWithFallback(
          () =>
            detailsPage
              ? siteNavigation.pageUrl(vehicleDetailsUrl(v.slug, detailsPage))
              : siteNavigation.vehicleLink(v._id),
          v._id,
          window.location.href,
        );
        return {
          id: v._id,
          title: v.title,
          price: v.price,
          currency: v.currency,
          // Saved cars are shown by a site script, so the image needs an absolute URL.
          image: v.media[0] ? assetUrl(v.media[0].url) : "",
          href,
        };
      });
      if (!next) {
        toast.info("Please log in to like vehicles.", {
          id: `${toasterId}-login-required`,
          toasterId,
        });
        return;
      }
      setSaved(next.map((c) => c.id));
      setNavigationError("");
    } catch (error) {
      console.error("Could not save vehicle", error);
      // Login was already confirmed above, so don't blame it here.
      toast.error("Could not save this vehicle. Please try again.", {
        toasterId,
      });
    }
  }
  async function viewVehicle(v: Vehicle) {
    if (!detailsPage) {
      open(v._id);
      return;
    }
    setNavigationError("");
    try {
      await siteNavigation.to(vehicleDetailsUrl(v.slug, detailsPage));
    } catch {
      setNavigationError("Could not open the vehicle page. Please try again.");
    }
  }
  function open(id: string) {
    setDetail(id);
    const p = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (id) p.set("car", id);
    else p.delete("car");
    window.location.hash = p.toString();
  }
  const cards = vehicles?.items ?? [];
  const resolved = {
    ...theme,
    accent: accent || theme.accent,
    radius: radius ?? theme.radius,
    columns: columns ?? theme.columns,
  };
  // `auto-fill` keeps empty tracks, so a lone card keeps its column width instead of
  // stretching across the row; each track is 1/columns of the row (gap-5 = 1.25rem), and
  // narrow widgets wrap to fewer columns at 230px.
  const gridStyle: CSSProperties =
    layout === "list"
      ? { gridTemplateColumns: "minmax(0,1fr)" }
      : {
          gridTemplateColumns: `repeat(auto-fill,minmax(min(100%,max(230px,(100% - ${resolved.columns - 1} * 1.25rem) / ${resolved.columns})),1fr))`,
          gridAutoRows: "1fr",
        };
  // Shared with UI rendered outside the widget (the compare bar) so merchant styling still applies.
  const scope = {
    "data-color-roles": textSections
      .filter(([key]) => widgetStyle[`${key}-color`])
      .map(([key]) => key)
      .join(" "),
    "data-font-roles": textSections
      .filter(([key]) => readFont(widgetStyle[`${key}-font`]))
      .map(([key]) => key)
      .join(" "),
    style: storefrontRootStyle(resolved, widgetStyle),
  };
  return (
    <div ref={rootRef} className="autohaus" {...scope}>
      {navigationError && (
        <Alert variant="destructive" role="alert">
          {navigationError}
        </Alert>
      )}
      <Toaster id={toasterId} position="bottom-right" richColors />
      {designMode && (
        <Alert className="mb-5">
          Editor preview · sample inventory. On your live site, sample cars show
          only until you publish your first vehicle.
        </Alert>
      )}
      {detail && !designMode ? (
        <>
          <Button
            {...elementStyle("back-to-inventory")}
            variant="outline"
            onClick={() => open("")}
          >
            ← Back to inventory
          </Button>
          <VehicleDetail
            id={detail}
            initialVehicle={
              initialVehicle?._id === detail ? initialVehicle : undefined
            }
            consent={false}
            onRelated={open}
          />
        </>
      ) : comparing && comparison.length > 0 ? (
        <VehicleComparison
          comparison={comparison}
          setComparison={setComparison}
          onBack={() => setComparing(false)}
          onView={designMode ? undefined : (v) => void viewVehicle(v)}
        />
      ) : (
        <>
          <header className="mb-7 grid gap-2">
            <p data-sf="brand" className="text-sm text-muted-foreground">
              {theme.brandName}
            </p>
            <h2
              data-sf="heading"
              className="text-3xl font-semibold tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                data-sf="description"
                className="leading-relaxed text-muted-foreground"
              >
                {description}
              </p>
            )}
          </header>
          <SearchFilters
            availableMakes={availableMakes}
            makesError={makesError}
            visibility={filterVisibility}
            search={search}
            make={make}
            minYear={minYear}
            maxPrice={maxPrice}
            fuel={fuel}
            body={body}
            sort={sort}
            setSearch={setSearch}
            setMake={setMake}
            setMinYear={setMinYear}
            setMaxPrice={setMaxPrice}
            setFuel={setFuel}
            setBody={setBody}
            setSort={setSort}
            extraFilters={extraFilters}
            setExtraFilters={setExtraFilters}
          />
          {loading && !vehicles && (
            <div
              className="flex justify-center py-12 text-primary"
              role="status"
            >
              <LoaderCircle
                className="h-8 w-8 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span className="sr-only">Loading showroom</span>
            </div>
          )}
          {vehicles && total > 0 && (
            <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-2">
              <p
                {...elementStyle("results-count")}
                className="text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {pagination === "infinite"
                  ? `Showing ${cards.length.toLocaleString()} of ${total.toLocaleString()} vehicles`
                  : `Showing ${(cursor + 1).toLocaleString()}–${(cursor + cards.length).toLocaleString()} of ${total.toLocaleString()} vehicles`}
              </p>
              {/* Always reachable, even where the site layout stops the tray from pinning. */}
              {comparison.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  {...elementStyle("compare-vehicles")}
                  onClick={() => setComparing(true)}
                >
                  Compare {comparison.length} vehicles
                </Button>
              )}
            </div>
          )}
          {!designMode && vehicles?.samples && cards.length > 0 && (
            <Alert className="mb-5">
              Sample listings for preview. Real inventory replaces them once the
              first vehicle is published.
            </Alert>
          )}
          {vehicles && !loading && !error && cards.length === 0 && (
            <p
              {...elementStyle("empty-results")}
              className="py-12 text-center text-muted-foreground"
            >
              No matching vehicles. Try adjusting your filters.
            </p>
          )}
          {vehicles && (
            <div
              className={cn(
                "grid gap-5 transition-opacity",
                loading && "opacity-50",
              )}
              aria-busy={busy}
              style={gridStyle}
            >
              {cards.map((v) => (
                <VehicleCard key={v._id} vehicle={v} badge={badgeFor(v)}>
                  <Button
                    disabled={designMode}
                    {...elementStyle("view-vehicle")}
                    onClick={() => void viewVehicle(v)}
                  >
                    View vehicle
                  </Button>
                  <CompareToggle
                    vehicle={v}
                    comparison={comparison}
                    setComparison={setComparison}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-10 w-10 px-0"
                    disabled={designMode}
                    aria-label={`Quick view ${v.title}`}
                    title="Quick view"
                    onClick={(e) => {
                      quickViewTrigger.current = e.currentTarget;
                      setQuickView(v);
                    }}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  <Button
                    {...elementStyle("save-vehicle")}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 w-10 px-0",
                      saved.includes(v._id) && "text-primary",
                    )}
                    disabled={designMode}
                    aria-pressed={saved.includes(v._id)}
                    aria-label={`${saved.includes(v._id) ? "Remove" : "Save"} ${v.title}`}
                    onClick={() => void save(v)}
                  >
                    <Heart
                      className="h-5 w-5"
                      fill={saved.includes(v._id) ? "currentColor" : "none"}
                    />
                  </Button>
                </VehicleCard>
              ))}
            </div>
          )}
          {error && (
            <Alert
              variant="destructive"
              role="alert"
              className="mt-6 flex flex-wrap items-center justify-between gap-3"
            >
              {error}
              <Button
                variant="outline"
                size="sm"
                {...elementStyle("retry")}
                onClick={() => setAttempt((n) => n + 1)}
              >
                Try again
              </Button>
            </Alert>
          )}
          {pagination === "pages" ? (
            <Pagination
              page={page}
              pages={pages}
              disabled={busy}
              onChange={goToPage}
            />
          ) : (
            canLoadMore &&
            !error && (
              <div ref={sentinelRef} className="mt-6 flex justify-center">
                {/* Fallback for keyboard users and browsers without IntersectionObserver. */}
                <Button
                  {...elementStyle("load-more")}
                  variant="outline"
                  disabled={busy}
                  onClick={loadMore}
                >
                  {loadingMore ? "Loading more vehicles…" : "Load more"}
                </Button>
              </div>
            )
          )}
          <VehicleQuickView
            vehicle={quickView}
            badge={quickView ? badgeFor(quickView) : undefined}
            scope={scope}
            onClose={() => setQuickView(null)}
            returnFocus={quickViewTrigger.current}
            onViewDetails={(v) => {
              setQuickView(null);
              void viewVehicle(v);
            }}
          />
          <CompareTray
            comparison={comparison}
            setComparison={setComparison}
            onCompare={() => {
              setComparing(true);
              scrollToTop();
            }}
            scope={scope}
            inline={designMode}
          />
        </>
      )}
    </div>
  );
}
