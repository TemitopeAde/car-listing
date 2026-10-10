# Car Dealer Listings & Marketplace — Wix App Development Plan

**Version:** 1.0  
**Prepared:** 2026-10-10  
**Target:** Wix App Market  
**Framework:** Current Wix CLI (not legacy Wix CLI for Apps)  
**Status:** Implementation blueprint

## 1. Product vision

Build a complete car dealership and multi-seller vehicle marketplace app for Wix. Merchants manage vehicle inventory, dealers, inquiries, branding, and performance in a Wix dashboard. Visitors browse a searchable inventory, open shareable vehicle pages, compare cars, and contact sellers via WhatsApp, email, phone, or an inquiry form.

### Target users
- Single-location and multi-location dealerships
- Independent vehicle sellers operating through a dealership site
- Multi-dealer marketplaces and automotive directories
- Vehicle brokers and used-car showrooms

### Success criteria
- A new merchant can install, view seeded demo cars, configure settings, and display inventory without coding.
- Merchants can create, edit, publish, archive, duplicate, import, and bulk-update vehicles.
- Search, filtering, seller contacts, and analytics work on mobile and desktop.
- Vehicle pages have stable URLs, unique metadata, and validated SEO output.
- The same business rules power dashboard operations, site components, and App Tools.
- Seller data and inquiries are protected by site-scoped authorization.

## 2. Scope and features

### A. Inventory administration
- Vehicle CRUD; save draft, publish, reserve, sell, archive, restore, soft-delete.
- Vehicle stock ID and optional VIN; duplicate detection.
- Make, model, trim, model year, first registration date, condition, mileage and units.
- Engine size, horsepower, drivetrain, transmission, fuel, body style, doors, seats, emission class, exterior/interior colors.
- Price, original price, currency, negotiable flag, tax disclaimer, optional financing data.
- Title, rich-text description, highlights, feature checklist, badges.
- Multiple images (cover, reorder, captions/alt text), optional video.
- Assigned dealer, location, publish dates, expiration dates.
- Bulk edit, duplicate, CSV import with preview/error mapping, CSV export.
- Audit changes and ownership; configurable limits by subscription tier.

### B. Dealers and multi-seller workflows
- Dealer profiles: name, logo, address, contacts, website, social profiles, hours, description.
- Dealer locations, approval states, inventory count, lead routing.
- Optional seller onboarding and scoped portal, subject to validated Wix Members and permission integration.
- Admin can approve/reject dealers, move inventory, suspend sellers, and moderate listings.
- Each seller can only change permitted listings; app owner can manage all sellers.

### C. Public shopping/browsing experience
- Search by keywords, make, model, year, condition, price, mileage, location, and specs.
- Sidebar/dropdown filters, sort, pagination, empty states, responsive cards/list view.
- Vehicle details with gallery, features, specs, description, availability and dealer panel.
- WhatsApp deep links, email links, click-to-call, tracked inquiry forms.
- Featured/recent/related vehicles, dealer directory, dealer profile and inventory.
- Optional saved cars, comparison, payment estimator, test-drive and trade-in forms.
- Sold/reserved handling and customizable status badges.

### D. Analytics and inquiries
- Vehicle views (deduplicated reasonably), inquiry submits, WhatsApp/email/phone clicks.
- Metrics per listing, seller, timeframe and source; views-to-lead conversion rate.
- Dashboard charts, exports, top listings and underperforming listings.
- Inquiry inbox with status, tags, owner, notes and timestamps; email notifications.
- Consent-aware analytics; avoid storing sensitive identifiers unnecessarily.

### E. AI (optional, merchant-reviewed)
- Generate editable descriptions and title suggestions from provided vehicle facts.
- Translate editable text where supported, with human review.
- Suggest metadata, alt text and category labels; never fabricate vehicle facts.
- Usage accounting, rate limits and explicit approval before publishing AI text.

## 3. Wix extensions and editor strategy

### 3.1 Dashboard extensions
- Dashboard Overview, Vehicles, Vehicle Editor, Dealers, Leads, Analytics, Imports, Widget/Appearance Settings, Plans, Onboarding.
- React functional components, Shadcn UI, Tailwind CSS, React Hook Form, Zod, Sonner, Recharts.
- No WDS for the dashboard UI; use Shadcn primitives and consistent custom styling.

### 3.2 Editor React Components — Harmony

**Important:** As of this plan, Editor React Components are alpha and Harmony-only. Do not treat them as compatible with classic Wix Editor or Wix Studio. The generated manifest powers native editing panels. Validate the extension's available controls against the installed CLI version.

Components:
1. Vehicle Inventory Grid/List
2. Vehicle Detail
3. Search and Filter Bar
4. Featured Vehicles Carousel
5. Vehicle Gallery
6. Dealer Profile / Dealer Directory
7. Seller Contact / Inquiry
8. Related Vehicles
9. Comparison Widget
10. Payment Estimator
11. Recently Added Vehicles
12. Test Drive Request

Every applicable component must expose editable options through its manifest: fonts, colors, spacing, cards/grid columns, images, buttons, visibility toggles, border/radius, responsive presets, item limits, and sorting. Use typed props and defaults; avoid hardcoding site-wide design settings.

### 3.3 Custom Elements — Wix Studio / classic Wix Editor
- Implement equivalent site widgets as Custom Element extensions with settings panels where supported.
- Prefer shared pure UI logic, data hooks, themes and rendering contracts, while keeping editor-specific integration wrappers.
- Verify actual editor installation behavior; do not assume auto-install on arbitrary URLs, page templates or all pages.
- Include merchant-facing setup checklist for placing inventory/detail widgets.
- Avoid Wix Blocks as the primary approach for Harmony-only components.

### 3.4 Public detail pages and SEO: explicit feasibility gate
- Requirement: stable canonical URL per vehicle, e.g. `/cars/toyota-camry-2022-12345`.
- Spike before production: validate Wix-supported page routing/dynamic-page strategy, app installation flow, site ownership, editor compatibility, SSR/indexability, deletion redirects, and data hydration.
- If app-created dynamic pages cannot be provisioned reliably, document merchant steps to configure CMS dynamic pages or a supported alternate page strategy; do not claim automatic per-car pages without end-to-end proof.
- Implement title, description, canonical, Open Graph, image alt text, sitemap/indexability validation, and applicable structured data after verifying supported Wix APIs and schema.

## 4. App Tools + Tools Provider (Wix Aria)

Create **both** the App Tools extension (tool declarations and schemas) and the **Tools Provider service plugin** (execution via `runTool`). Scaffold with the current Wix CLI, using relevant Wix Skills and MCP guidance rather than manually guessing generated extension files.

### Initial tool contracts
| Tool | Inputs | Output | Permissions |
|---|---|---|---|
| `listVehicles` | filters, cursor, limit | paginated summary | owner/seller scoped |
| `getVehicle` | vehicleId | vehicle detail | site scoped |
| `createVehicleDraft` | validated vehicle payload | new draft ID | write inventory |
| `updateVehicle` | vehicleId, patch | updated detail | listing owner/admin |
| `publishVehicle` | vehicleId | publish state | publish role |
| `setVehicleStatus` | vehicleId, status | updated state | publish role |
| `bulkUpdateVehicles` | IDs, safe patch | per-record results | manager/admin |
| `listDealers` | search, cursor | dealers | site scoped |
| `createDealer` | dealer payload | dealer ID | admin |
| `updateDealer` | dealerId, patch | updated dealer | admin/authorized dealer |
| `getInventorySummary` | optional dealer/date | counts | authorized |
| `getVehicleAnalytics` | IDs, time range | metric breakdown | authorized |
| `getInquiries` | filters, cursor | redacted lead summaries | authorized; PII restricted |
| `suggestVehicleDescription` | facts, desired tone | editable suggestion | AI usage entitlement |

Safety and correctness:
- Validate request/response against schemas; apply Zod in service layer.
- Resolve site/instance/actor from trusted Wix context, never from client-supplied IDs alone.
- Require confirmation in UX for deletes, irreversible bulk edits and publication decisions where supported.
- Do not expose buyer PII by default to Aria outputs; use least privilege and redaction.
- Implement audit logs, idempotency keys for creates/imports, per-site rate limits and structured errors.
- Tools call shared services, not separate business logic.
- Verify actual tool/extension naming and schemas against current docs/CLI before coding.

## 5. Data architecture — Wix Data

Recommended collections (finalize Wix Data permissions and indexes after platform validation):

| Collection | Important fields |
|---|---|
| `Vehicles` | `_id`, `siteId`, `dealerId`, `stockId`, `vin?`, `slug`, title, make, model, trim, year, specs, price, currency, status, flags, publishedAt, expiresAt, createdAt, updatedAt |
| `VehicleMedia` | `_id`, `vehicleId`, kind, wixMediaUrl, position, altText, cover |
| `FeatureDefinitions` | `_id`, category, key, localizedLabel |
| `VehicleFeatures` | `vehicleId`, featureKeys[] or typed feature data |
| `Dealers` | `_id`, `siteId`, businessName, logo, location, contact channels, approvalState |
| `SellerAccess` | `siteId`, `dealerId`, memberId/actorRef, role, state |
| `Inquiries` | `_id`, `siteId`, `vehicleId`, dealerId, buyer data, channel, message, consent, status, timestamps |
| `VehicleStatsDaily` | `siteId`, vehicleId, date, views, contactClicks, leads |
| `VehicleEvents` | `siteId`, vehicleId, eventType, coarse source, timestamp, dedupe token/TTL |
| `AppSettings` | `siteId`, locale, currency, default units, plans, SEO/lead settings |
| `WidgetSettings` | `siteId`, widgetKey/instance, appearance, layout, displayOptions |
| `SavedVehicles` | `siteId`, memberId, vehicleId, createdAt |
| `AuditLogs` | actor, siteId, entity, action, changes summary, createdAt |
| `ImportJobs` | `siteId`, fileRef, status, counters, errors, startedAt, completedAt |

Notes:
- Use Wix Media Manager for asset storage, not public writable image URLs.
- Apply server-side pagination and cursor/batch operations; do not load every record into a single query.
- Test Wix Data query, storage and permission limits with realistic inventory sizes.
- Don't rely only on frontend checks for tenant isolation or plan limits.

## 6. API and shared services

Use the Wix CLI-generated backend endpoint layout supported by the selected current CLI version. **Do not assume `pages/api` is the endpoint convention for this Wix CLI project**; follow generated file structure. Organize shared business logic as `services/` modules.

### Logical HTTP endpoint design
```
GET    /api/vehicles                list, filter, sort, paginate
POST   /api/vehicles                create draft
GET    /api/vehicles/:id            detail
PATCH  /api/vehicles/:id            update
POST   /api/vehicles/:id/publish    publish
POST   /api/vehicles/bulk           bulk actions
GET    /api/dealers                 list
POST   /api/dealers                 create
PATCH  /api/dealers/:id             update
POST   /api/inquiries               submit lead
GET    /api/inquiries               authorized list
GET    /api/analytics/overview      summary
GET    /api/analytics/vehicles      per vehicle
POST   /api/imports                 start/import CSV
GET    /api/imports/:id             status/errors
GET    /api/settings                read
PATCH  /api/settings                update
```
These are **logical routes**, not a guarantee that every verb or path is supported verbatim by Wix-generated HTTP extensions. Adapt to generated routing conventions and approved auth mechanism.

### Service modules
- `vehicleService`: validation, lifecycle transitions, filters, quotas, metadata
- `dealerService`: dealer profiles, memberships, approvals
- `inquiryService`: sanitization, notifications, spam protection, lead routing
- `analyticsService`: ingest, aggregate, reporting
- `mediaService`: metadata and Wix Media uploads
- `seoService`: slugging, canonical metadata, redirects
- `importService`: CSV validation, batching, retry/error report
- `planService`: feature/record limits and entitlement checks
- `toolService`: thin adapters for Aria/App Tools

### Response format
```json
{"success":true,"data":{},"pagination":{"nextCursor":null}}
```
On failure, return structured errors with stable codes, appropriate HTTP status, and no leaked secrets or stack traces.

## 7. Dashboard UX specification

Navigation: Overview, Vehicles, Dealers, Inquiries, Analytics, Import/Export, Appearance, Settings, Billing.

### Vehicle editor
- Multi-step sections: Basic, Price, Technical Specs, Features, Media, Seller, Description, SEO, Publishing.
- Zod schemas and React Hook Form; field-level messages.
- Use Shadcn Dialog for short create/edit forms and confirmations; use a dedicated page or full-screen workflow for the large vehicle editor.
- Remove number input spin buttons using CSS; maintain keyboard and screen-reader usability.
- Save draft, publish, revert, validation summary, unsaved changes guard.
- Toast on successful submission; reset fields only after a successful *new creation* (not when editing a saved record).
- Responsive tables with filters, bulk selection, badges, empty states, skeletons.

### Appearance controls
- Global design tokens: font family, sizes, colors, radius, spacing, shadows.
- Per-widget overrides in native editor panels/Custom Element panels where supported.
- Grid/list layout, cards-per-row desktop/tablet/mobile, badges, price positions, picture ratio, visible fields.
- Live preview; reset defaults and import/export theme JSON.

### Onboarding
- Install -> sample inventory (clearly flagged demos) -> configure seller -> add inventory -> add widget -> verify detail page/SEO -> publish.
- Never publish fabricated demo vehicles to public pages without explicit merchant consent.
- Demo data can be deleted in one action; ensure seed idempotency.

## 8. Security, compliance and quality

- Authenticate requests using supported Wix app instance / site context and validate actor permissions.
- Site-scoped data access for every query and mutation.
- Restrict lead data, protect against CSRF/replay where relevant, validate upload type and size.
- Escape/sanitize rich content and externally supplied URLs; prevent script injection.
- Rate limit public inquiries, protect against spam, collect privacy/marketing consent where required.
- Use stable paginated Wix Data queries; protect against repeated writes and duplicate leads.
- Accessible controls, keyboard navigation, meaningful alt text, mobile testing.
- Observe Wix App Market policies, API permission requirements and subscription rules.
- Account for GDPR/privacy obligations and local buyer-consent rules depending on merchant geography.

## 9. Test plan

- Unit: schemas, slug generation, filtering, state transitions, price formats, quotas.
- Integration: Wix Data CRUD, site boundaries, inquiry persistence, seller permissions, App Tools schemas.
- E2E: onboarding, create vehicle, publish, filter, view detail, send inquiry, archive, CSV import, appearance edits.
- Editor matrix: Harmony Editor React Components; Wix Studio/classic Custom Elements where supported.
- SEO verification: publicly reachable unique URLs, page metadata, canonical tags, indexability, schema markup.
- Scale: large inventories, many images, concurrent updates, pagination, charts and bulk operations.
- Negative cases: missing seller, unavailable car, bad VIN, invalid price, unauthorized access, duplicate CSV rows, broken media.

## 10. Build phases and delivery gates

### Phase 0 — Platform discovery and feasibility
- [ ] Initialize current Wix CLI app and inspect generated extensions.
- [ ] Use Wix Skills and Wix MCP tools to validate latest API signatures and scaffolding.
- [ ] Confirm Harmony Editor React Component manifest workflow and alpha limitations.
- [ ] Confirm App Tools declaration + Tools Provider scaffold.
- [ ] Prove vehicle URL SEO/indexability and detail-page installation route.
- [ ] Verify classic/Studio Custom Element compatibility and settings panels.
- [ ] Record working extension matrix and developer setup.

**Gate:** Working proof of concept for a vehicle list, one accessible detail URL, one tool call and one editor appearance control.

### Phase 1 — Foundation and data
- [ ] Shared types and Zod schemas.
- [ ] Wix Data collections, access policy and indexes.
- [ ] Vehicle/dealer CRUD services; status machine; upload/asset model.
- [ ] Authentication, tenant isolation, error handling, logging.
- [ ] Seed demo inventory and first-run onboarding.

### Phase 2 — Dashboard
- [ ] Shadcn navigation, Overview metrics and inventory table.
- [ ] Add/Edit Vehicle workflow, media management, publish/draft controls.
- [ ] Dealer management and seller assignment.
- [ ] Forms, dialogs, toasts, empty states and accessibility.
- [ ] Bulk actions, CSV import/export.

### Phase 3 — Storefront and editor integrations
- [ ] Inventory, filters, featured cars and detail components.
- [ ] Gallery, dealer contact, inquiry form, related vehicles.
- [ ] Harmony Editor React Component props/manifests/controls.
- [ ] Custom Element alternatives and editor panels.
- [ ] Merchant configurable widget appearance.
- [ ] SEO URLs, redirects, metadata and testing.

### Phase 4 — Inquiries and analytics
- [ ] Lead collection, contact clicks, notification handling.
- [ ] Inquiry inbox, statuses, ownership, consent.
- [ ] Analytics pipeline and date-filtered visualizations.
- [ ] Per-dealer analytics and conversion metrics.

### Phase 5 — App Tools / Aria
- [ ] Generate App Tools declaration and Tools Provider plugin.
- [ ] Implement read-only tools first, then mutating tools.
- [ ] Access checks, confirmation, redaction, audit logs.
- [ ] Tool schema validation and integration tests.

### Phase 6 — Premium capabilities
- [ ] Comparison and favorites.
- [ ] Test-drive and trade-in requests.
- [ ] Financing calculator (clearly illustrative, not a lender offer).
- [ ] AI descriptions with review, limits and billing.
- [ ] Seller self-service portal and listing expiration.

### Phase 7 — Launch
- [ ] Free/Pro/Business entitlements and quota enforcement.
- [ ] App Market listing copy, screenshots, policy and support pages.
- [ ] Performance, security and accessibility audits.
- [ ] QA on supported editors, mobile and desktop.
- [ ] Production monitoring, rollback and migration documentation.

## 11. Suggested pricing (hypothesis, validate before launch)

| Plan | Example price | Inventory | Main features |
|---|---:|---:|---|
| Free | $0 | 10 vehicles | 1 dealer, basic listing and contacts |
| Pro | $9.99/month | 100 vehicles | advanced filters, import/export, analytics |
| Business | $19.99/month | higher/fair-use limit | multi-dealer, all widgets, AI allowances |

Plan names, limits and prices are initial hypotheses; validate economics, Wix billing fees and demand before finalizing. Do not promise unlimited storage or traffic without quotas.

## 12. Recommended code organization (illustrative)

```text
src/
  extensions/                 # generated Wix CLI extensions; preserve generator structure
  dashboard/
    pages/
    components/
    forms/
    charts/
  storefront/
    components/
    hooks/
    themes/
  editor-react/               # conceptual grouping; actual output per Wix CLI generator
  custom-elements/            # conceptual grouping; actual output per Wix CLI generator
  backend/
    services/
    repositories/
    validation/
    permissions/
    tools/
  shared/
    types/
    schemas/
    constants/
    utils/
  tests/
```

Use the Wix generator's authoritative paths for entry points, endpoint files, and extension declarations. Do not override generated wiring merely to match this sketch.

## 13. Definition of done

- [ ] The merchant can install, configure, and manage a full inventory from the Wix dashboard.
- [ ] The public site supports search/filter, vehicle details, contacts and mobile layouts.
- [ ] Dedicated vehicle URLs and SEO work in verified supported editors.
- [ ] Dashboard and editor styling changes persist and appear on site.
- [ ] App Tools can safely read and mutate authorized data via shared services.
- [ ] Leads and private dealer data stay isolated across tenants.
- [ ] Analytics metrics reconcile to recorded events and do not count preview traffic as real traffic.
- [ ] CSV import errors are actionable and operations are idempotent.
- [ ] Automated tests, app documentation and deployment procedures are complete.

## 14. Current official documentation

- Editor React Component manifest (alpha): https://dev.wix.com/docs/build-apps/develop-your-app/extensions/site-extensions/editor-react-components/manifest-reference/about-the-manifest
- Editor React Component files / Harmony compatibility: https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/supported-extensions/site/editor-react-components/editor-react-component-extension-files-and-code
- App Tools / Tools Provider extension: https://dev.wix.com/docs/api-reference/app-management/app-tools/tools-provider-v1/extension-config
- Wix CLI custom elements: https://dev.wix.com/docs/build-apps/develop-your-app/frameworks/wix-cli/supported-extensions/site/custom-elements/add-a-custom-element-extension-with-the-wix-cli
- Wix site widgets overview: https://dev.wix.com/docs/build-apps/develop-your-app/extensions/site-extensions/site-widgets/about-site-widget-extensions

**Implementation rule:** Before executing each phase, consult Wix Skills and Wix MCP plus current official docs for APIs, CLI commands and manifest fields. Generated scaffolds and current compatibility guidance take precedence over illustrative file paths in this plan.
