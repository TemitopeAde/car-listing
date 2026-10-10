import { appInstances } from "@wix/app-management";

export default appInstances.onAppInstancePaidPlanPurchased((event) => {
  console.info("Car Listing app lifecycle", {
    event: "paid-plan-purchased",
    instanceId: event.metadata.instanceId,
    plan: event.data.vendorProductId,
    cycle: event.data.cycle,
    occurredAt: event.data.operationTimeStamp,
  });
});
