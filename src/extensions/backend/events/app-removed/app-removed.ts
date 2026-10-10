import { appInstances } from "@wix/app-management";

export default appInstances.onAppInstanceRemoved((event) => {
  console.info("Car Listing app lifecycle", {
    event: "app-removed",
    instanceId: event.metadata.instanceId,
    appId: event.data.appId,
  });
});
