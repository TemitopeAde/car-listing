import { appInstances } from "@wix/app-management";

export default appInstances.onAppInstancePaidPlanChanged((event) => {
  console.info("Car Listing app lifecycle", {
    event: "paid-plan-changed",
    instanceId: event.metadata.instanceId,
    plan: event.data.vendorProductId,
    previousPlan: event.data.previousVendorProductId,
    cycle: event.data.cycle,
    occurredAt: event.data.operationTimeStamp,
  });
});
