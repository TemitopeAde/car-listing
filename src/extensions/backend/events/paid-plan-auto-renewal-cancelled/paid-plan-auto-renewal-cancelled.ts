import { appInstances } from "@wix/app-management";

export default appInstances.onAppInstancePaidPlanAutoRenewalCancelled(
  (event) => {
    console.info("Car Listing app lifecycle", {
      event: "paid-plan-auto-renewal-cancelled",
      instanceId: event.metadata.instanceId,
      plan: event.data.vendorProductId,
      cycle: event.data.cycle,
      occurredAt: event.data.operationTimeStamp,
    });
  },
);
