import { useElementStyle } from "./element-style";
import type { ReactNode } from "react";
import type { Vehicle } from "../shared/schemas";
import { money } from "../shared/utils";
import { isTrailer } from "../shared/vehicle-options";
import { CardGallery } from "./vehicle-gallery";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
export function VehicleCard({
  vehicle: v,
  badge,
  children,
}: {
  vehicle: Vehicle;
  badge?: string;
  children: ReactNode;
}) {
  const elementStyle = useElementStyle();
  return (
    <Card data-sf="card" className="flex flex-col">
      <CardGallery media={v.media} title={v.title} />
      <CardHeader>
        {badge && <Badge>{badge}</Badge>}
        <CardTitle data-sf="vehicle-title">{v.title}</CardTitle>
        <CardDescription data-sf="vehicle-meta">
          {isTrailer(v.category) ? (
            // Trailers have no engine or gearbox; show what buyers compare instead.
            <>
              <span {...elementStyle("vehicle-mileage")}>{v.bodyStyle}</span>
              {v.axles > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span {...elementStyle("vehicle-transmission")}>
                    {v.axles} axles
                  </span>
                </>
              )}
              {v.bodyLength > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span {...elementStyle("vehicle-fuel")}>
                    {v.bodyLength} m
                  </span>
                </>
              )}
            </>
          ) : (
            <>
              <span {...elementStyle("vehicle-mileage")}>
                {v.mileage.toLocaleString("en")} {v.mileageUnit}
              </span>{" "}
              ·{" "}
              <span {...elementStyle("vehicle-transmission")}>
                {v.transmission}
              </span>{" "}
              · <span {...elementStyle("vehicle-fuel")}>{v.fuel}</span>
            </>
          )}{" "}
          · <span {...elementStyle("vehicle-location")}>{v.location}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p data-sf="price" className="text-xl font-semibold">
          {money(v.price, v.currency)}
        </p>
      </CardContent>
      <CardFooter className="mt-auto">{children}</CardFooter>
    </Card>
  );
}
