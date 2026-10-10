import { extensions } from "@wix/astro/builders";

export default extensions.embeddedScript({
  id: "a5360fbe-5559-4c2a-8df9-04848443f226",
  name: "Saved Cars",
  placement: "BODY_END",
  scriptType: "FUNCTIONAL",
  source: "./extensions/site/embedded-scripts/saved-cars/saved-cars.html",
});
