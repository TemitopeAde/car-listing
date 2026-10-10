import { useElementStyle } from "./element-style";
import type { Dispatch, SetStateAction } from "react";
import { Input, Label, NativeSelect } from "./ui/input";
import {
  bodyStyles,
  bodyStylesByCategory,
  categoryLabels,
  makeOptions,
  modelYears,
  vehicleCategories,
  type VehicleCategory,
} from "../shared/vehicle-options";
import {
  filterSettings,
  primaryFilterCount,
  type FilterKey,
  type FilterVisibility,
} from "./filter-visibility";
export type ExtraFilters = {
  category: string;
  model: string;
  location: string;
  condition: string;
  minPrice: string;
  maxYear: string;
  maxMileage: string;
  transmission: string;
};
const extraLabels = {
  model: "Model",
  location: "Location",
  minPrice: "Min. price",
  maxMileage: "Max. mileage",
} as const;
const grid = "grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3";
export function SearchFilters({
  visibility = {},
  availableMakes = [],
  makesError = "",
  search,
  make,
  minYear,
  maxPrice,
  fuel,
  body,
  sort,
  setSearch,
  setMake,
  setMinYear,
  setMaxPrice,
  setFuel,
  setBody,
  setSort,
  extraFilters,
  setExtraFilters,
}: {
  visibility?: FilterVisibility;
  availableMakes?: string[];
  makesError?: string;
  search: string;
  make: string;
  minYear: string;
  maxPrice: string;
  fuel: string;
  body: string;
  sort: string;
  setSearch: Dispatch<SetStateAction<string>>;
  setMake: Dispatch<SetStateAction<string>>;
  setMinYear: Dispatch<SetStateAction<string>>;
  setMaxPrice: Dispatch<SetStateAction<string>>;
  setFuel: Dispatch<SetStateAction<string>>;
  setBody: Dispatch<SetStateAction<string>>;
  setSort: Dispatch<SetStateAction<string>>;
  extraFilters: ExtraFilters;
  setExtraFilters: Dispatch<SetStateAction<ExtraFilters>>;
}) {
  const elementStyle = useElementStyle();
  const update =
    (set: Dispatch<SetStateAction<string>>) =>
    (e: { target: { value: string } }) =>
      set(e.target.value);
  const updateExtra =
    (key: keyof ExtraFilters) => (e: { target: { value: string } }) =>
      setExtraFilters((f) => ({ ...f, [key]: e.target.value }));
  const visible = (key: FilterKey) => visibility[key] !== false;
  const hasPrimary = filterSettings
    .slice(0, primaryFilterCount)
    .some(([key]) => visible(key));
  const hasExtra = filterSettings
    .slice(primaryFilterCount)
    .some(([key]) => visible(key));
  const category = extraFilters.category as VehicleCategory | "";
  const bodies = category ? bodyStylesByCategory[category] : bodyStyles;
  if (!hasPrimary && !hasExtra) return null;
  return (
    <div className="mb-6 grid gap-3">
      {hasPrimary && (
        <div className={grid}>
          {visible("search") && (
            <Label className="col-span-full">
              <span {...elementStyle("filter-search-label")}>Search</span>
              <Input
                {...elementStyle("filter-search-input")}
                value={search}
                placeholder="Make, model or keyword"
                onChange={update(setSearch)}
              />
            </Label>
          )}
          {visible("category") && (
            <Label>
              <span {...elementStyle("filter-category-label")}>Category</span>
              <NativeSelect
                {...elementStyle("filter-category-input")}
                value={category}
                onChange={(e) => {
                  setExtraFilters((f) => ({ ...f, category: e.target.value }));
                  // Body types differ per category.
                  setBody("");
                }}
              >
                <option value="">All vehicles</option>
                {vehicleCategories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </NativeSelect>
            </Label>
          )}
          {visible("make") && (
            <Label>
              <span {...elementStyle("filter-make-label")}>Make</span>
              <NativeSelect
                {...elementStyle("filter-make-input")}
                value={make}
                onChange={update(setMake)}
              >
                <option value="">All makes</option>
                {makeOptions([...availableMakes, make], category).map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </NativeSelect>
              {makesError && (
                <span role="alert" className="text-xs">
                  {makesError}
                </span>
              )}
            </Label>
          )}
          {visible("minYear") && (
            <Label>
              <span {...elementStyle("filter-min-year-label")}>Min. year</span>
              <NativeSelect
                {...elementStyle("filter-min-year-input")}
                value={minYear}
                onChange={update(setMinYear)}
              >
                <option value="">Any year</option>
                {modelYears().map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </NativeSelect>
            </Label>
          )}
          {visible("maxPrice") && (
            <Label>
              <span {...elementStyle("filter-max-price-label")}>
                {" "}
                Max. price
              </span>
              <Input
                {...elementStyle("filter-max-price-input")}
                type="number"
                min="0"
                placeholder="Any price"
                value={maxPrice}
                onChange={update(setMaxPrice)}
              />
            </Label>
          )}
          {visible("bodyStyle") && (
            <Label>
              <span {...elementStyle("filter-body-label")}>Body</span>
              <NativeSelect
                {...elementStyle("filter-body-input")}
                value={body}
                onChange={update(setBody)}
              >
                <option value="">All body types</option>
                {bodies.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </NativeSelect>
            </Label>
          )}
          {visible("fuel") && (
            <Label>
              <span {...elementStyle("filter-fuel-label")}>Fuel</span>
              <NativeSelect
                {...elementStyle("filter-fuel-input")}
                value={fuel}
                onChange={update(setFuel)}
              >
                <option value="">All fuels</option>
                {["Petrol", "Diesel", "Hybrid", "Electric", "CNG"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </NativeSelect>
            </Label>
          )}
          {visible("sort") && (
            <Label>
              <span {...elementStyle("filter-sort-label")}>Sort</span>
              <NativeSelect
                {...elementStyle("filter-sort-input")}
                value={sort}
                onChange={update(setSort)}
              >
                <option value="recent">Recently added</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="year-desc">Model year</option>
              </NativeSelect>
            </Label>
          )}
        </div>
      )}
      {hasExtra && (
        <details className="rounded-md border px-4 py-3">
          <summary
            {...elementStyle("more-filters")}
            className="text-sm font-medium"
          >
            More filters
          </summary>
          <div className={`${grid} mt-4`}>
            {(Object.keys(extraLabels) as (keyof typeof extraLabels)[]).map(
              (key) =>
                visible(key) && (
                  <Label key={key}>
                    <span
                      {...elementStyle(
                        `filter-${key === "minPrice" ? "min-price" : key === "maxMileage" ? "max-mileage" : key}-label`,
                      )}
                    >
                      {extraLabels[key]}
                    </span>
                    <Input
                      {...elementStyle(
                        `filter-${key === "minPrice" ? "min-price" : key === "maxMileage" ? "max-mileage" : key}-input`,
                      )}
                      type={
                        ["minPrice", "maxMileage"].includes(key)
                          ? "number"
                          : "text"
                      }
                      value={extraFilters[key]}
                      onChange={updateExtra(key)}
                    />
                  </Label>
                ),
            )}
            {visible("maxYear") && (
              <Label>
                <span {...elementStyle("filter-max-year-label")}>
                  {" "}
                  Max. year
                </span>
                <NativeSelect
                  {...elementStyle("filter-max-year-input")}
                  value={extraFilters.maxYear}
                  onChange={updateExtra("maxYear")}
                >
                  <option value="">Any year</option>
                  {modelYears().map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </NativeSelect>
              </Label>
            )}
            {visible("condition") && (
              <Label>
                <span {...elementStyle("filter-condition-label")}>
                  {" "}
                  Condition
                </span>
                <NativeSelect
                  {...elementStyle("filter-condition-input")}
                  value={extraFilters.condition}
                  onChange={updateExtra("condition")}
                >
                  <option value="">Any condition</option>
                  <option value="used">Used</option>
                  <option value="new">New</option>
                  <option value="certified">Certified</option>
                </NativeSelect>
              </Label>
            )}
            {visible("transmission") && (
              <Label>
                <span {...elementStyle("filter-transmission-label")}>
                  {" "}
                  Transmission
                </span>
                <NativeSelect
                  {...elementStyle("filter-transmission-input")}
                  value={extraFilters.transmission}
                  onChange={updateExtra("transmission")}
                >
                  <option value="">Any transmission</option>
                  <option>Automatic</option>
                  <option>Manual</option>
                  <option>Automated manual</option>
                </NativeSelect>
              </Label>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
