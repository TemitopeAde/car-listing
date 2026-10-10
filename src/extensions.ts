import { app } from "@wix/astro/builders";
import myPage from "./extensions/dashboard/pages/my-page/my-page.extension.ts";

import dataCollections from "./extensions/backend/data-collections/data-collections.extension.ts";

import vehicleInventory from "./extensions/site/components/vehicle-inventory/vehicle-inventory.extension.ts";
import vehicleDetailsComponent from "./extensions/site/components/vehicle-details/vehicle-details.extension.ts";

import inventoryTools from "./extensions/backend/app-tools/inventory-tools/inventory-tools.extension.ts";

import inventoryProvider from "./extensions/backend/service-plugins/inventory-provider/inventory-provider.extension.ts";

import savedCars from "./extensions/site/embedded-scripts/saved-cars/saved-cars.extension.ts";

export default app()
  .use(myPage)
  .use(dataCollections)
  .use(vehicleInventory)
  .use(vehicleDetailsComponent)
  .use(inventoryTools)
  .use(inventoryProvider)
  .use(savedCars);
