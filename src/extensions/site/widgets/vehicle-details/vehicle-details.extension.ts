import { extensions } from "@wix/astro/builders";

export default extensions.customElement({
  id: "0b6f1d7d-e461-449e-8959-a2faed79a7a6",
  name: "vehicle-details",
  width: {
    defaultWidth: 1000,
    allowStretch: true,
  },
  height: {
    defaultHeight: 1200,
  },
  installation: {
    autoAdd: false,
  },
  presets: [
    {
      id: "76a68e3d-7b16-4b34-934c-a5f55a3a34f7",
      name: "default",
      thumbnailUrl: "{{BASE_URL}}/media/demo-car.svg",
    },
  ],

  tagName: "vehicle-details",
  element: "./extensions/site/widgets/vehicle-details/vehicle-details.tsx",
  settings:
    "./extensions/site/widgets/vehicle-details/vehicle-details.panel.tsx",
});
