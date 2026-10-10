import type { A11y, Direction } from "@wix/editor-react-types";
export type VehicleDetailsProps = {
  id: string;
  className?: string;
  direction?: Direction;
  a11y?: A11y;
  backLabel: string;
  elementProps?: {
    details?: { className?: string };
  };
};
export const defaultProps = {
  backLabel: "← Back to inventory",
} satisfies Omit<VehicleDetailsProps, "id" | "className">;
