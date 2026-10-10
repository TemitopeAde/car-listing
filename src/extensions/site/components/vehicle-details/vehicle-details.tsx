import classNames from "classnames";
import { useIsEditMode } from "@wix/react-component-utils";
import { useEffect, useState, type FC } from "react";
import { VehicleDetailsPage } from "../../../../storefront/vehicle-details-page";
import type { VehicleDetailsProps } from "./vehicle-details.props";
import styles from "./vehicle-details.module.css";
export const VehicleDetails: FC<VehicleDetailsProps> = (props) => {
  const { id, className, direction, backLabel, elementProps } = props;
  const designMode = useIsEditMode();
  // The page URL is only readable after hydration; `null` renders a loading state on the server.
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    const read = () =>
      setSlug(new URLSearchParams(window.location.search).get("slug") ?? "");
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  return (
    <section
      id={id}
      dir={direction}
      className={classNames(
        "vehicle-details",
        styles.root,
        styles.fallbackDirection,
        className,
      )}
    >
      <div
        {...elementProps?.details}
        className={classNames(
          "vehicle-details-details",
          styles.details,
          elementProps?.details?.className,
        )}
      >
        <VehicleDetailsPage
          slug={slug}
          backLabel={backLabel}
          designMode={designMode}
        />
      </div>
    </section>
  );
};
export default VehicleDetails;
