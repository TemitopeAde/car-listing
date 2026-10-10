# Car Dealer Listings implementation

Implemented from `plan.md` on 2026-10-10. This is a working core application and a Wix preview build, not an App Market production release. The plan’s live-platform delivery gates remain open.

## Run and review

```sh
npm install
npm run dev:local
# http://127.0.0.1:4323/preview
# http://127.0.0.1:4323/preview/storefront
# http://127.0.0.1:4323/preview/editor
npm run check
npm test
npm run test:e2e
npm run build
npx wix generate manifest
npx wix preview
```

Local preview deliberately skips the Wix integration and uses an isolated JSON store under `.data/`. Authentication bypass requires BOTH Astro development mode and `CAR_LISTING_DEMO=1`. Preview pages return 404 in production. Production operations use Wix Data and trusted Wix token context. Playwright uses its own server, port 4322 and `.data/e2e.json`; service tests use `.data/service-tests.json`.

The development site created for this app is `c196a309-68d1-4fac-ba08-d8382ecab9d3`. Complete its browser installation before running `npx wix dev-site select c196a309-68d1-4fac-ba08-d8382ecab9d3` and `npm run dev`. The CLI returns the authoritative installer links when creating a preview.

## Implemented

- Shadcn/Radix dashboard with Overview, Vehicles, Dealers, Inquiries, Analytics, Import/Export, Appearance, Settings and Billing screens; responsive navigation, skeletons, errors and toasts.
- Vehicle editor with eight sections, React Hook Form and Zod, field validation, VIN checks, technical specs, images and cover ordering, custom features, price, dealership assignment, description, SEO fields, expiration, publication confirmation and unsaved-change guards.
- Inventory CRUD, duplication, soft deletion/restoration, lifecycle validation, search by title/make/model/stock, status filters, ordering, table/grid views, pagination, bulk publication/archive and CSV export.
- Dealer profiles, approval and suspension. Suspending a dealer archives currently published/reserved listings. Approval does not automatically republish them.
- CSV parsing, header mapping, per-row preview/errors, formula-safe export, batching bounds and deterministic IDs for safe import retries. Limit: 1,000 rows / 2 MB per request; Free quota still applies.
- Searchable public inventory with price/year/mileage, make/model, location, body, transmission, fuel and condition filters; detail gallery/specifications/features, related cars and approved dealer directory.
- WhatsApp/email/call contacts, consented inquiries, test-drive and trade-in request types, seller inbox statuses and team notes. Inquiry replies use the merchant’s email client; automated notifications are not configured.
- Comparison of up to three vehicles, device-local saved car IDs, featured-only mode and an illustrative payment calculator. Favorites are not Wix Members accounts.
- Consent-aware views/contact events, daily deduplication, actual inquiry totals, date-range charts and exports. No fabricated analytics. Inquiry spam checks include a honeypot, caller/site hourly bounds and idempotency. These checks are best effort under concurrency.
- Six private collections: `vehicles`, `dealers`, `inquiries`, `events`, `audit-logs`, `settings`, under namespace `@admin14744/car-listing`. Initial vehicle/dealer data is explicitly demo data, privately readable, and cannot be published.
- Server publication rules, stock-ID uniqueness index, VIN preflight, stable slugs, conditional version updates, site-context permissions and audit records. Site scoping is supplied by Wix’s trusted SDK context, not a client-supplied site ID.
- App Tools declarations and Tools Provider for 13 tools using the same services. Runtime input validation, mutation confirmation fields and redacted inquiry outputs. Tools require matching trusted Wix collaborator identity and CMS permission.
- Custom Element marketplace and settings panel for the classic/Studio strategy; opt-in installation. Harmony Editor React inventory component with generated heading/description, font, color, spacing, border and radius controls. Inventory, detail, contact, comparison and calculator experiences are composed inside these widgets; the twelve separate widget extensions proposed in the plan are not all generated.
- App-server `/cars/:slug` SSR pages with title, description, canonical, Open Graph and Vehicle JSON-LD. These require Wix site context; they do not provision routes on the merchant’s Wix website.

## Verified

- TypeScript compile, Astro check (zero errors and warnings), and Wix build.
- Seven domain/service tests: validation, VIN/media rejection, consent, slug/calculator math, lifecycle, CSV edge cases/formula safety, publication prerequisites, duplicate handling, optimistic revision checks, import retry IDs, inquiry persistence and tool redaction.
- Two Playwright scenarios: dashboard vehicle creation/publication → storefront inquiry → inbox update → SSR metadata; filtering, saved appearance, invalid CSV preview and mobile navigation.
- Browser Axe scans report zero violations in the checked dashboard and shared storefront fixture. No browser runtime exceptions in the checked previews. Storefront container widths 1000, 650, 320 and 240 px fit without horizontal overflow.
- Harmony manifest generation produces the intended heading, description and inventory parts. ESLint/semantic accessibility scans passed. The skill’s CommonJS SSR scanner cannot load the ESM `import.meta.url` client helper; browser checks cover the actual rendered shared UI instead. This does not establish a live Harmony editor test.

## Required before production

1. Install the app preview on the development site. Confirm the app’s `SCOPE.DC-DATA.READ` and `SCOPE.DC-DATA.WRITE` permissions and collection provisioning; test actual collaborator roles, private lead permissions and two different sites.
2. Place and exercise the Harmony component on a Harmony site. Test the Custom Element/settings panel separately on classic and Studio sites. Browser resize checks are not editor compatibility proof.
3. Test Aria tool discovery/invocation on the installed app, including `metadata.identity` and token-context behavior. The provider fails closed if identities do not match. Do not weaken authorization to make an SPI invocation pass.
4. Choose and verify a merchant-site dynamic-page strategy. App-server slugs and local SSR metadata are implemented, but merchant-site canonical URLs, SSR/indexability, sitemap inclusion, deleted-page redirects and automatic installation are NOT verified.
5. Integrate Wix billing entitlements before offering paid tiers. All current installations enforce the Free 10-real-vehicle limit; proposed paid prices are clearly identified as hypotheses. Seller membership/scoped self-service, AI provider usage/billing, notifications, native Media Manager picker, financing records, subscription expiration jobs and App Market submission materials remain future work.
6. Harden and load-test concurrency: VIN uniqueness, capacity reservations, lead throttles, write/audit atomicity and large imports. Stock-ID uniqueness and conditional versions exist, but cross-request quota checks and rate limits are not transactional.
7. Resolve upstream dependency audit findings before release. Compatible fixes and a patched `tar` override were applied; the installed Wix integration and hosting adapter require Astro 5, while current audit remediation requests a major Astro upgrade. The image optimizer is disabled in this application. A clean dependency audit is still a launch gate; do not run a forced major upgrade without validating Wix compatibility.

No production release, site publication, paid subscription or App Market submission has been performed.

## Dashboard media uploads

The vehicle editor now uploads multiple photos and videos directly to Wix Media Manager using `@wix/media` and `tus-js-client`. It generates a signed TUS ticket, transfers the file, finalizes with the upload token, then polls `getFileDescriptor` until Wix reports `READY`. Processing failures and private/wrong-type files are not attached. Retries retain the transfer URL or finalized file ID. Photos remain a separate ordered gallery (first photo is the cover); videos are saved in the vehicle collection and rendered with playback controls on detail pages. Existing vehicle records default to an empty videos list.

Application limits: 30 photos (25 MB each), 10 videos (500 MB each). Photos: JPG, PNG, WebP, GIF. Videos: MP4, WebM, MOV. Saving waits for pending uploads; uploads survive switching editor sections and are cancelled when leaving the editor. Removing an attachment does not delete the original Media Manager asset.

Before using live uploads, enable **Manage Media Manager** (`SCOPE.DC-MEDIA.MANAGE-MEDIAMANAGER`) and **Read Media Manager** (`SCOPE.DC-MEDIA.READ-MEDIAMANAGER`) in this app's Dev Center permissions, and update the app installation to grant them. The updated preview must also provision the vehicle collection's new `videos` field. Uploading uses the dashboard collaborator's normal Wix SDK identity, without permission elevation.

References: [Wix resumable upload flow](https://dev.wix.com/docs/api-reference/assets/media/media-manager/files/resumable-upload-api), [generateFileResumableUploadUrl](https://dev.wix.com/docs/api-reference/assets/media/media-manager/files/generate-file-resumable-upload-url?apiView=SDK), [getFileDescriptor](https://dev.wix.com/docs/api-reference/assets/media/media-manager/files/get-file-descriptor?apiView=SDK).

Verified: upload contract tests cover finalization, asynchronous readiness, processing retries, cancellation and URL/type validation; service tests cover persisted multiple photos/videos and preservation of unrelated fields. Two targeted Playwright tests exercise the real TUS browser client against a simulated Wix upload endpoint, dropdown/custom selections, reordering/removal and persisted storefront video rendering. Live Wix transfers and video transcoding remain unverified.
