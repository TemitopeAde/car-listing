import { appInstances } from "@wix/app-management";

export default appInstances.onAppInstanceInstalled((event) => {
  console.info("Car Listing app lifecycle", {
    event: "app-installed",
    instanceId: event.metadata.instanceId,
    appId: event.data.appId,
    originInstanceId: event.data.originInstanceId,
  });
});
