import { extensions } from "@wix/astro/builders";

import vehiclesCollection from "./vehicles";

import dealersCollection from "./dealers";

import inquiriesCollection from "./inquiries";

import eventsCollection from "./events";

import auditLogsCollection from "./audit-logs";

import settingsCollection from "./settings";

import savedCarsCollection from "./saved-cars";

export default extensions.dataCollections({
  id: "e135a83d-3f88-4104-b386-fe66f828bb42",
  name: "Data Collections",
  collections: [
    vehiclesCollection,
    dealersCollection,
    inquiriesCollection,
    eventsCollection,
    auditLogsCollection,
    settingsCollection,
    savedCarsCollection,
  ],
});
