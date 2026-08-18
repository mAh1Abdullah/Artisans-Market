# The Artisan's Market

Multi-vendor handcrafted goods marketplace. Bangladesh MVP, architected for
future country expansion. This is the **Phase 0 scaffold** from
`ARTISANS_MARKET_DEV_PLAN.md` — environment and tooling only; almost no
feature code yet.

## What's actually implemented here

- ✅ Turborepo monorepo structure (`apps/web`, `apps/admin`, `packages/*`)
- ✅ Drizzle ORM wired to Postgres, with the domain schema files stubbed out
  per the plan's Database Domain Summary
- ✅ **Phase 7 (Payments) — mostly implemented:**
  - Full schema: `payment_attempts`, `payments`, `payment_provider_events`
    (with the real `UNIQUE(provider, event_id)` idempotency constraint),
    `refunds`, `refund_items`, `wallet_accounts`, `wallet_transactions`,
    `vendor_settlements`, `vendor_settlement_items`, `vendor_payout_accounts`
  - `PaymentService.handleProviderEvent()` is the piece that actually closes
    the gap Phase 6 left open on purpose: it's the only code path allowed
    to call `InventoryService.confirmSale()` for a non-COD order, and it's
    idempotent by construction — a duplicate webhook delivery hits the
    unique constraint and returns `{ alreadyProcessed: true }` instead of
    double-processing
  - `CheckoutService` was retrofitted (not just extended) — Phase 6 didn't
    create `payment_attempts`/`payments` rows at all since this schema
    didn't exist yet. Now COD gets its payment records immediately;
    bKash/SSLCommerz get a real attempt + provider redirect URL, with a
    deliberately different failure-handling strategy than inventory
    reservation (retry-the-payment, not cancel-the-order — see the comment
    in `checkout-service.ts` for why those two failure modes shouldn't be
    treated the same)
  - `BkashClient` / `SslcommerzClient` — written against each provider's
    publicly documented API shape, **never run against a real sandbox**
    (no network access, no credentials in this environment). Every method
    is honestly labeled with what needs verification before production.
    SSLCommerz's `verify_sign` reconstruction is the one place this matters
    most — it's a security check, not a UX nicety, and "probably right" is
    not good enough for it
  - `PayoutAccountService` — real AES-256-GCM encryption (not a stub — this
    part had no excuse to be fake, it doesn't need a sandbox), masked
    identifiers only in anything that could reach an API response
  - `RefundService` and `SettlementService` — request/approve/execute and
    generate/approve/mark-paid flows are real. The one gap: `RefundService.execute()`
    doesn't actually call a provider refund API — neither client has a
    refund method, only checkout creation. That's the last unimplemented
    leg of this phase, flagged explicitly in the code rather than silently
    approximated
  - Webhook routes: `/api/webhooks/bkash/callback`,
    `/api/webhooks/sslcommerz/callback`, both wired to real
    `PaymentService` calls
- ✅ **Phase 6 (Cart, Checkout & Orders) — mostly implemented:**
  - `carts` (with a genuine partial unique index for "one active cart per
    user" — `status = 'active'` only, so converted/abandoned carts don't
    collide), `cart_items`, `orders`, `vendor_orders`, `order_items`,
    plus a deliberately minimal `shipments`/`shipment_items`/`shipment_events`
    stand-in for Phase 9
  - `CartService` — resolves price/stock/images fresh from
    `currentVersionId` on every read, so a cart reflects live pricing right
    up until checkout freezes it
  - `CheckoutService.placeOrder` — this is the one piece of business logic
    in this pass I'd call genuinely tricky: it does NOT wrap
    `InventoryService` calls in the same transaction as order creation,
    because `InventoryService` explicitly documents that callers "should
    NOT wrap these in an outer transaction." So it's two phases — create
    the order graph, then reserve inventory per item — with real
    compensation logic (release + cancel the order) if reservation fails
    partway through, e.g. someone else bought the last unit in the gap
    between checkout starting and this line running
  - COD gating is real, not cosmetic: `TrustService.isCODEligible()` AND
    every vendor's `allowCod` flag are both checked, both at render time
    (so the option doesn't even show) and again at submission time
  - Real pages: `/cart`, `/checkout` (3-step), `/orders` (buyer history
    with a real progress stepper), `/orders/[orderId]` (doubles as the
    confirmation page). Product detail's Add to Cart button is finally
    real instead of intentionally disabled.
- ✅ **Phase 5 (Homepage & Storefront UI) — mostly implemented:**
  - `CatalogQueryService` — the sole read path for public product data.
    Every method joins through `products.currentVersionId`, never
    `latestVersionId`; this is the one file that exists specifically to
    protect that invariant, so any new public query should copy its join
    pattern rather than querying `products`/`productVersions` directly
    elsewhere
  - Added `products.slug` to the Phase 3 schema — genuinely missing from
    the original pass, not called out in the dev plan's Phase 3 table list
    but required for `/products/[slug]` routing. `ProductService` now
    resolves it the same collision-suffixed way `VendorService` does for
    shop slugs
  - `FileService.getPublicUrls()` batch resolver — added because product
    grids resolving dozens of images per page would otherwise be a real N+1
  - Real pages: `/products` (category filter + sort, live data), `/custom`
    (customizable-only), `/products/[slug]` (detail page, 404s for
    anything not currently approved), `/shop/[slug]` (seller shop page,
    same approved-only invariant), and the homepage's trending grid
  - Shared `ProductCard` in `packages/ui` — deliberately structurally
    typed rather than importing `ProductListItem` from `@artisans-market/lib`,
    so the UI package still has zero dependency on business logic
- ✅ **Phase 4 (Media & File Storage) — fully implemented:**
  - `files` schema (bucket, object key, visibility, soft-delete)
  - `FileService` — `upload` / `getPublicUrl` / `getSignedUrl` / `delete`
    against Cloudflare R2 (S3-compatible), with public/private buckets kept
    genuinely separate per Step 0.4, not just a flag on one bucket
  - Drag-and-drop `ImageUploader` in `packages/ui` — reorder to set primary
    image, remove, capped at 5 — deliberately decoupled from any specific
    server action via an injected `uploadFn`, so it's not tied to product
    images specifically
  - Wired into `/dashboard/products/new` for real — `images: []` is gone,
    uploaded file IDs flow into `product_versions.images` for real now
- ✅ **Phase 3 (Catalog, Products, Variants & Inventory) — fully implemented:**
  - Full schema: `products` / `product_versions` (two-pointer versioning),
    `product_variants` / `product_variant_versions` (stable SKU identity vs.
    version-scoped pricing), the attribute/attribute-value EAV pair for
    variant-defining options, and `inventory_items` (with a real Postgres
    `GENERATED ALWAYS AS` column for `quantity_available`, not an
    application-computed one) + append-only `inventory_events`
  - `ProductService` — `createDraftProduct` (product + version + variants +
    seeded inventory in one transaction), `submitForReview`,
    `createRevision` (edits to an approved product create a new version
    without moving `currentVersionId` — the live listing is untouched until
    the revision itself is approved), `approveVersion` / `rejectVersion`
  - `InventoryService` — `reserve` / `confirmSale` / `releaseReservation` /
    `restock` / `adjust`, every one of them using `SELECT ... FOR UPDATE`
    inside its own transaction, matching the checkout flow in §3.4 exactly
  - `/dashboard/products` (status-badged list) and
    `/dashboard/products/new` (the real Add Product form — dynamic variant
    rows, Save Draft vs. Submit for Review) — wired to real server actions
- ✅ **Phase 2 (Vendor Onboarding & Shop Profiles) — fully implemented:**
  - `vendor_profiles`, append-only `vendor_status_events`,
    `vendor_verification_documents`, `vendor_profile_change_requests`,
    `vendor_pickup_addresses` schema
  - `VendorService` — slug resolution (with collision suffixing), draft
    profile creation, and a guarded status-transition state machine
    (`VENDOR_STATUS_FLOW`) matching the §2.4 lifecycle diagram exactly
  - Organisation roles (`owner | manager | catalog_manager | order_manager |
    support`) wired into the Better Auth organization plugin
  - `/sell` application page — live shop-slug availability check, craft
    category, onboarding progress steps — backed by real server actions,
    not a mockup toast. Submitting creates the Better Auth organization,
    the vendor_profiles draft row, auto-assigns the `vendor_user` role, and
    immediately submits for review, per Step 2.2's exact sequence
  - `VendorStatusBanner` now reads a real status via a server-side fetch in
    `(site)/layout.tsx` instead of the hardcoded default from Phase 1
- ✅ **Phase 1 (Identity & Access) — fully implemented:**
  - `user_trust_profiles` + append-only `user_trust_events` schema
  - `TrustService` (evaluate / addEvent / isCODEligible)
  - Trust profile auto-created on account creation via a Better Auth
    `databaseHooks.user.create.after` hook
  - Auth pages: sign up, sign in, forgot password, reset password, phone
    (OTP) verification — all under an `(auth)` route group with its own
    clean layout
  - Server-side protected-route helpers (`requireUser`, `requireAdmin`,
    `getOptionalSession`) — redirect before protected content renders,
    no client-side flash
  - Role-based routing middleware in both apps (Step 1.2)
  - Role-switcher bar + vendor status banner as real client components,
    scoped to a `(site)` route group so the auth pages stay chrome-free
- ✅ Better Auth configured (email+password, phone OTP, organization plugin,
  admin plugin, custom `role` field) — not yet run against a live database
- ✅ Shared Tailwind config carrying the brand tokens validated in
  `ArtisansMarket.html` / `AdminDashboard.html`, plus a small shared
  component set (`Button`, `Input`, `Label`, `FormError`) in `packages/ui`
- ✅ CI workflow (lint/typecheck/test on every PR)
- 🚧 Everything else (Phase 8 on) — stubbed with header comments describing
  what belongs in each file, nothing more

## Two UI references already exist

Before writing any more app code, look at these — they're validated,
interactive HTML/JS mockups that the real pages should be built against:

- `mockups/ArtisansMarket.html` — consumer storefront (buyer/seller/wholesaler)
- `mockups/AdminDashboard.html` — operator console (vendor & product moderation,
  trust/COD management, settlements, coupons, audit log)

## Getting this running locally

This scaffold was written by hand in a sandboxed environment with no network
access, so nothing has been `pnpm install`-ed or run yet. To actually boot it:

```bash
# 1. Install dependencies (requires Node 20+, pnpm 9+)
pnpm install

# 2. Copy env template and fill in real values
cp .env.example .env
# at minimum you need DATABASE_URL (a Neon Postgres instance) and
# BETTER_AUTH_SECRET (openssl rand -base64 32)

# 3. Generate the Better Auth-owned tables into packages/db/src/schema/auth-schema.ts
pnpm --filter @artisans-market/db exec npx @better-auth/cli generate \
  --config ../../apps/web/lib/auth.ts \
  --output ./src/schema/auth-schema.ts

# 4. Generate + run migrations for everything else
pnpm db:generate
pnpm db:migrate

# 5. Seed sample data (currently only trust profiles — vendor/product/
#    wholesale seeding is written but deliberately a no-op; see the comments
#    in packages/db/src/seed.ts for exactly why)
pnpm db:seed

# 6. Run the storefront and admin console
pnpm dev:web     # http://localhost:3000
pnpm dev:admin   # http://localhost:3001
```

## Next steps, in order

1. Run the Better Auth CLI generation step above against a real database.
2. Get real bKash and SSLCommerz sandbox credentials and actually exercise
   `BkashClient`/`SslcommerzClient` against them — this is the single
   highest-priority verification task in the whole repo right now, since
   payment code that's "probably right" based on documentation alone isn't
   something to trust with real transactions. Confirm: the token
   grant/createPayment/executePayment shapes for bKash, and — critically —
   SSLCommerz's `verify_sign` reconstruction against a real IPN payload.
3. Smoke-test the full loop with COD first (no external dependency): sign
   up → apply to sell → add + manually approve a product → checkout with
   COD → confirm `payments.status = 'pending'` → call
   `PaymentService.confirmCodCollection()` manually → confirm it flips to
   `'paid'`. Then, once sandbox credentials exist, the same loop with
   bKash: confirm the order sits at `pending_payment` with only a
   `reservation` inventory event until the callback route fires, then
   confirm it flips to `placed` with a `sale` event afterward.
4. Phase 8 (Wholesale) is next and is comparatively small — `raw_materials`
   doesn't need the two-pointer versioning `catalog.ts` uses, and the
   access-gate logic (`vendor_profiles.status === 'approved'`) already
   exists via `VendorService`.
5. Gaps deliberately left in this Phase 7 pass:
   - `RefundService.execute()` doesn't call a real provider refund API —
     see the note in the service itself.
   - No UI anywhere calls any of this — no refund-request button on the
     order detail page, no settlement generation in `apps/admin` (which
     still doesn't exist as real pages), no payout account form for
     sellers. The backend is real; nothing user-facing triggers it yet.
   - Wallet credit refunds are schema-complete but functionally inert —
     matches Open Question #12 in the dev plan (not yet decided whether
     wallet credit is even exposed to buyers in MVP).
6. Still outstanding from earlier phases, unaddressed by this one:
   - **No admin UI** — the single biggest compounding gap. `ProductService`,
     `VendorService`, and now `PaymentService`/`RefundService`/
     `SettlementService` all have real, working methods with nothing in
     `apps/admin` calling them.
   - **No guest cart** — `CartService` requires a signed-in user throughout.
   - **Seller order management (Phase 11.3)** doesn't exist —
     `OrderQueryService.listForVendor` is ready, but `vendor_orders.status`
     never moves past `pending` after checkout because no seller-facing
     page can update it.
   - **No email confirmation, no delivery zone resolution** — Phase 9
     doesn't exist, `RESEND_API_KEY` sits unused in `.env.example`.

See `ARTISANS_MARKET_DEV_PLAN.md` for the full 16-phase breakdown, the
foundational architecture rules (§5), and the open questions tracker.
