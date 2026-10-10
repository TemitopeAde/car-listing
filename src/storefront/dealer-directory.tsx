import { useEffect, useState } from "react";
import { api } from "../shared/client";
import type { Dealer } from "../shared/schemas";
import { Button } from "./ui/button";
import {
  Alert,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input, Label } from "./ui/input";
type DealerPage = { items: Dealer[]; total: number; nextCursor: number | null };
export function DealerDirectory({
  onDealer,
}: {
  onDealer: (id: string) => void;
}) {
  const [search, setSearch] = useState(""),
    [cursor, setCursor] = useState(0),
    [data, setData] = useState<DealerPage | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api<DealerPage>(
      `dealers?public=1&search=${encodeURIComponent(search)}&cursor=${cursor}`,
    )
      .then((r) => active && setData(r))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [search, cursor]);
  return (
    <section className="mt-6 grid gap-6">
      <h3 className="text-xl font-semibold">Meet our dealerships</h3>
      <Label className="max-w-sm">
        Find a dealership
        <Input
          placeholder="Search dealership name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCursor(0);
          }}
        />
      </Label>
      {loading && (
        <p className="py-12 text-center text-muted-foreground" role="status">
          Loading dealerships…
        </p>
      )}
      {error && (
        <Alert variant="destructive" role="alert">
          {error}
        </Alert>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-5">
        {data?.items.map((d) => (
          <Card key={d._id}>
            <CardHeader>
              <CardTitle>{d.businessName}</CardTitle>
              <CardDescription>
                {[d.location, d.address].filter(Boolean).join(" · ")}
              </CardDescription>
            </CardHeader>
            {d.description && (
              <CardContent className="whitespace-pre-wrap">
                {d.description}
              </CardContent>
            )}
            <CardFooter>
              <Button onClick={() => onDealer(d._id)}>
                Browse their vehicles
              </Button>
              {d.website && (
                <Button variant="outline" asChild>
                  <a href={d.website} rel="noreferrer" target="_blank">
                    Website
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span>{data?.total ?? 0} dealerships</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!cursor}
            onClick={() => setCursor(Math.max(0, cursor - 30))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={data?.nextCursor == null}
            onClick={() => setCursor(data?.nextCursor ?? 0)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
