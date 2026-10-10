import { app } from "@wix/astro/builders";
import myPage from "./extensions/dashboard/pages/my-page/my-page.extension.ts";

import dataCollections from "./extensions/backend/data-collections/data-collections.extension.ts";

import vehicleMarketplace from "./extensions/site/widgets/vehicle-marketplace/vehicle-marketplace.extension.ts";
import vehicleDetailsWidget from "./extensions/site/widgets/vehicle-details/vehicle-details.extension.ts";

import vehicleInventory from "./extensions/site/components/vehicle-inventory/vehicle-inventory.extension.ts";
import vehicleDetailsComponent from "./extensions/site/components/vehicle-details/vehicle-details.extension.ts";

import inventoryTools from "./extensions/backend/app-tools/inventory-tools/inventory-tools.extension.ts";

import inventoryProvider from "./extensions/backend/service-plugins/inventory-provider/inventory-provider.extension.ts";

import savedCars from "./extensions/site/embedded-scripts/saved-cars/saved-cars.extension.ts";

import appInstalled from "./extensions/backend/events/app-installed/app-installed.extension.ts";

import appRemoved from "./extensions/backend/events/app-removed/app-removed.extension.ts";

import paidPlanPurchased from "./extensions/backend/events/paid-plan-purchased/paid-plan-purchased.extension.ts";

import paidPlanChanged from "./extensions/backend/events/paid-plan-changed/paid-plan-changed.extension.ts";

import paidPlanAutoRenewalCancelled from "./extensions/backend/events/paid-plan-auto-renewal-cancelled/paid-plan-auto-renewal-cancelled.extension.ts";

export default app()
  .use(myPage)
  .use(dataCollections)
  .use(vehicleMarketplace)
  .use(vehicleDetailsWidget)
  .use(vehicleInventory)
  .use(vehicleDetailsComponent)
  .use(inventoryTools)
  .use(inventoryProvider)
  .use(savedCars)
  .use(appInstalled)
  .use(appRemoved)
  .use(paidPlanPurchased)
  
  .use(paidPlanChanged)
  .use(paidPlanAutoRenewalCancelled);
