import type { A11y, Direction } from "@wix/editor-react-types";
export type VehicleInventoryProps = {
  id: string;
  className?: string;
  direction?: Direction;
  a11y?: A11y;
  title: string;
  description: string;
  /** @min 1 @max 100 */
  itemLimit: number;
  featuredOnly: boolean;
  pagination: "pages" | "infinite";
  elementProps?: {
    heading?: { className?: string };
    description?: { className?: string };
    inventory?: { className?: string };
  };
};
export const defaultProps = {
  title: "Find your next chapter.",
  description:
    "Browse our collection, compare vehicles and contact the dealership.",
  itemLimit: 12,
  featuredOnly: false,
  pagination: "pages",
} satisfies Omit<VehicleInventoryProps, "id" | "className">;
