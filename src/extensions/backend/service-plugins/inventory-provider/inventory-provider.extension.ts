import { extensions } from "@wix/astro/builders";

export default extensions.toolsProvider({
  id: "0d812ee2-b1f6-4843-888e-94065682423d",
  name: "inventory-provider",
  source:
    "./extensions/backend/service-plugins/inventory-provider/inventory-provider.ts",
});
