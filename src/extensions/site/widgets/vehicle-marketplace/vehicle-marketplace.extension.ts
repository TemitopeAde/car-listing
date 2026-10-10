import { extensions } from "@wix/astro/builders";

export default extensions.customElement({
  id: "6a1d9ed0-b432-4a99-92f2-a3a414277370",
  name: "vehicle-marketplace",
  width: {
    defaultWidth: 1000,
    allowStretch: true,
  },
  height: {
    defaultHeight: 900,
  },
  installation: {
    autoAdd: false,
  },
  presets: [
    {
      id: "0179e7b9-7055-485b-9f39-2cc69655243d",
      name: "default",
      thumbnailUrl: "{{BASE_URL}}/media/demo-car.svg",
    },
  ],

  tagName: "vehicle-marketplace",
  element:
    "./extensions/site/widgets/vehicle-marketplace/vehicle-marketplace.tsx",
  settings:
    "./extensions/site/widgets/vehicle-marketplace/vehicle-marketplace.panel.tsx",
});
