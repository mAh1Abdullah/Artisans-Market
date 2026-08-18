# The Artisan's Market — Full Development Plan

> **Living document.** Update this file as decisions are finalized, phases are completed, and scope evolves. Every architectural decision made in this plan must be implemented before the corresponding migration or code is written.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [User Roles & Personas](#2-user-roles--personas)
3. [Design Principles](#3-design-principles)
4. [Tech Stack](#4-tech-stack)
5. [Foundational Architecture Rules](#5-foundational-architecture-rules)
6. [Phase 0 — Environment & Project Setup](#phase-0--environment--project-setup)
7. [Phase 1 — Identity & Access](#phase-1--identity--access)
8. [Phase 2 — Vendor Onboarding & Shop Profiles](#phase-2--vendor-onboarding--shop-profiles)
9. [Phase 3 — Catalog, Products, Variants & Inventory](#phase-3--catalog-products-variants--inventory)
10. [Phase 4 — Media & File Storage](#phase-4--media--file-storage)
11. [Phase 5 — Homepage & Storefront UI](#phase-5--homepage--storefront-ui)
12. [Phase 6 — Cart, Checkout & Orders](#phase-6--cart-checkout--orders)
13. [Phase 7 — Payments (bKash, SSLCommerz, COD)](#phase-7--payments-bkash-sslcommerz-cod)
14. [Phase 8 — Raw Materials Wholesale Marketplace](#phase-8--raw-materials-wholesale-marketplace)
15. [Phase 9 — Shipping, Delivery Zones & Courier](#phase-9--shipping-delivery-zones--courier)
16. [Phase 10 — Customer Features (Wishlist, Reviews, Notifications)](#phase-10--customer-features-wishlist-reviews-notifications)
17. [Phase 11 — Seller Dashboard](#phase-11--seller-dashboard)
18. [Phase 12 — Admin Dashboard & Moderation](#phase-12--admin-dashboard--moderation)
19. [Phase 13 — Trust, Risk & COD Eligibility](#phase-13--trust-risk--cod-eligibility)
20. [Phase 14 — Marketing, Coupons & Promotions](#phase-14--marketing-coupons--promotions)
21. [Phase 15 — Testing, QA & Launch](#phase-15--testing-qa--launch)
22. [Phase 16 — Post-Launch & Scaling](#phase-16--post-launch--scaling)
23. [Open Questions Tracker](#open-questions-tracker)
24. [Database Domain Summary](#database-domain-summary)

---

## 1. Project Overview

**The Artisan's Market** is a production-grade multi-vendor e-commerce marketplace for handcrafted arts and crafts. It connects three distinct user types on a single platform:

| Role | Who They Are | Primary Goal |
|---|---|---|
| **Buyer** | People who love handcrafted goods | Discover, customise, and purchase unique handmade products |
| **Artisan / Seller** | Independent craft artists | Sell pre-made and custom-order products; source raw materials |
| **Wholesaler** | Suppliers of arts & crafts raw materials | Sell bulk raw materials to registered artisan sellers |

### Core Product Areas

- **Consumer Storefront** — browse, search, filter, wishlist, custom orders, cart, checkout
- **Artisan Seller Dashboard** — product management, custom order handling, order tracking, payouts
- **Wholesale Hub** — raw materials marketplace exclusive to approved artisan sellers
- **Admin Dashboard** — vendor approvals, product moderation, trust scoring, settlements

### MVP Market Focus
Bangladesh — with architecture intentionally designed for future country expansion.

---

## 2. User Roles & Personas

### 2.1 Buyer
- Browses and purchases handcrafted products
- Can request product customisations (option selection, special instructions, reference file upload)
- Has an order history, wishlist, and notification feed
- COD eligibility determined by trust score
- Can leave reviews on delivered/purchased products only

### 2.2 Artisan / Seller
- Applies to become a seller through an onboarding form
- Shop backed by a Better Auth **organisation** entity
- One user → one vendor shop (enforced by DB unique constraint in MVP)
- Can add products **before** approval (products stay hidden until approved)
- Only the **shop owner** can submit or resubmit an application
- Team members can be invited before approval (owner and manager roles only)
- Has access to the Wholesale Raw Materials Hub after approval
- Receives bi-weekly payouts via bKash or bank transfer
- Can manage pre-made and custom-order products

### 2.3 Wholesaler
- A verified supplier of raw arts & crafts materials (beads, yarn, clay, wood, etc.)
- Lists materials in the Wholesale Hub at bulk pricing with minimum order quantities (MOQ)
- Onboarding separate from artisan seller flow
- Platform admin approves and manages wholesaler accounts

### 2.4 Platform Admin
- Manages vendor approvals, rejections, suspensions
- Moderates products before they go live
- Manages trust scores and COD eligibility overrides
- Has access to audit logs, settlement management, courier configuration
- Admin access via Better Auth admin roles — does **not** use organisation membership

---

## 3. Design Principles

### UX / Visual
- **Role-switcher bar** at the top — buyer, artisan, wholesaler — adapts the experience contextually
- **Vendor status banner** visible to artisans (pending, approved, suspended)
- Typography: `Cormorant Garamond` (editorial serif for display/headings) + `Outfit` (clean sans-serif for UI)
- Colour palette: Forest green `#2C4A3E` primary, aged gold `#C9952A` accent, warm parchment `#F5F0E8` background
- Sharp corners (2px border-radius), craft-market editorial aesthetic — no soft pill-heavy UI
- Mobile-first responsive grid

### Product / Architecture
- **Design database domains before writing migrations** — update this document first
- **Own vs. Borrow** — never edit Better Auth owned tables directly; extend via 1:1 tables
- **Immutable commerce snapshots** — freeze product, price, and address data at checkout into `jsonb`
- **Two-pointer versioning** — `current_version_id` (live) and `latest_version_id` (draft) on products
- **Append-only ledgers** for inventory, payments, trust, and audit events
- **Decoupled inventory** with PostgreSQL `SELECT ... FOR UPDATE` row-level locks at checkout
- **CUID2 text primary keys** for all marketplace-owned tables
- **Text status columns** with application-level validation (no PostgreSQL enums)
- **`timestamptz`** for all timestamps
- **Integer cents** for all monetary amounts
- **`jsonb`** for metadata, snapshots, raw provider payloads, and rules engines
- **Double-entry idempotency** on payment webhooks via composite unique indexes

---

## 4. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Next.js (App Router) | SSR + RSC for SEO-critical storefront pages |
| **Styling** | Tailwind CSS | Custom design tokens aligned to brand palette |
| **UI Components** | shadcn/ui | Accessible, unstyled base; customised to brand |
| **Authentication** | Better Auth | Organisations, admin plugin, 2FA, phone auth |
| **Database** | PostgreSQL (Neon / Supabase / Railway) | `timestamptz`, `jsonb`, generated columns |
| **ORM** | Drizzle ORM | Type-safe; schema-first; migration-managed |
| **Object Storage** | S3-compatible (AWS S3 / Cloudflare R2) | Product media, vendor docs, avatars |
| **Payment — Mobile** | bKash Payment Gateway API | Primary mobile wallet for Bangladesh |
| **Payment — Card** | SSLCommerz | Card and multi-method gateway |
| **Payment — COD** | Platform-managed | Trust-gated; reconciled manually in MVP |
| **Email** | Resend / Postmark | Order confirmations, vendor notifications |
| **SMS** | Twilio / local BD provider | OTP, order alerts (post-MVP or MVP stretch) |
| **ID Generation** | `cuid2` | All marketplace-owned table primary keys |
| **Validation** | Zod | App-level status enums, form validation, API schemas |
| **API** | Next.js Route Handlers + tRPC (optional) | Type-safe API layer |
| **Courier APIs** | Pathao, RedX, Steadfast (BD) | Booking and tracking integration |
| **Hosting** | Vercel (frontend) + managed DB | |
| **CDN** | Cloudflare | Static assets, image delivery |

---

## 5. Foundational Architecture Rules

These rules apply **across every phase**. Never skip them.

### 5.1 Database Rules
1. **CUIDs over UUIDs** — use `cuid2` for all marketplace-owned primary keys
2. **No PostgreSQL enums** — use `text` columns + Zod enum validation in application code
3. **`timestamptz` everywhere** — never use `timestamp without time zone`
4. **Integer cents** — never store money as floats or strings (e.g. `$55.00` → `5500`)
5. **`jsonb` for flexible data** — metadata, snapshots, raw payloads, marketing rules
6. **Append-only for critical domains** — inventory events, payments, trust, audit logs, moderation history
7. **Immutable snapshots at checkout** — `shippingAddressSnapshot`, `orderItem.snapshot` freeze data at purchase time
8. **No direct edits to Better Auth tables** — extend with 1:1 tables (`vendor_profiles` → `organization`)
9. **Design first, migrate second** — update this document before applying any migration

### 5.2 Security Rules
1. Never store plain card PAN/CVV — use provider tokenisation only
2. Vendor documents must be `private` visibility — never served publicly
3. Payout account details must be encrypted or tokenised — expose masked identifiers only
4. Admin notes (`private_note`) must never be exposed to vendors or customers
5. Provider webhook payloads (`request_payload`, `response_payload`) must be restricted at DB access level
6. Audit logs are append-only — no application `UPDATE` or `DELETE` on audit tables

### 5.3 Concurrency Rules
1. Use `SELECT ... FOR UPDATE` row-level locks on `inventory_items` during checkout
2. Use `CHECK (quantity_on_hand >= 0)` as last-line-of-defence constraint
3. Use PostgreSQL generated column `quantity_available` (computed as `on_hand - reserved`) to prevent drift
4. Payment provider webhooks must be idempotent — unique index on `(provider, event_id)` in `payment_provider_events`

---

## Phase 0 — Environment & Project Setup

**Goal:** A clean, working repository with all tooling configured before any feature work begins.

### Step 0.1 — Repository & Monorepo Structure
- [ ] Initialise a Git repository
- [ ] Set up a monorepo structure (recommended: Turborepo)
  ```
  /apps
    /web          ← Next.js consumer storefront
    /admin        ← Next.js admin dashboard (separate app)
  /packages
    /db           ← Drizzle schema, migrations, seed data
    /ui           ← Shared UI components (shadcn/ui base)
    /lib          ← Shared utilities, validators, types
    /config       ← Shared ESLint, TypeScript, Tailwind config
  ```
- [ ] Configure TypeScript (strict mode) across all packages
- [ ] Configure ESLint + Prettier
- [ ] Set up `.env.example` with all required environment variable keys documented
- [ ] Add `.gitignore` (exclude `.env`, `node_modules`, `.next`, `dist`)

### Step 0.2 — Database Setup
- [ ] Provision a PostgreSQL database (Neon recommended for serverless Next.js)
- [ ] Install Drizzle ORM and Drizzle Kit
- [ ] Create `/packages/db` with:
  - `schema/` folder (one file per domain)
  - `migrations/` folder (managed by Drizzle Kit)
  - `index.ts` export
- [ ] Configure `drizzle.config.ts`
- [ ] Test connection with a simple query

### Step 0.3 — Authentication Setup (Better Auth)
- [ ] Install Better Auth
- [ ] Configure Better Auth with:
  - Email + password provider
  - Phone number provider (for Bangladesh OTP)
  - Organisation plugin
  - Admin plugin
- [ ] Run Better Auth schema generation — do **not** manually edit generated tables
- [ ] Verify auth tables exist: `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`

### Step 0.4 — Object Storage Setup
- [ ] Provision S3-compatible bucket (Cloudflare R2 recommended)
- [ ] Create two access levels: `public` (product images) and `private` (vendor documents)
- [ ] Configure signed URL generation for private files
- [ ] Test upload and retrieval

### Step 0.5 — Styling Foundation
- [ ] Install Tailwind CSS and configure `tailwind.config.ts` with brand tokens:
  ```js
  colors: {
    forest:      '#2C4A3E',
    'forest-dark': '#1a2e26',
    gold:        '#C9952A',
    parchment:   '#F5F0E8',
    paper:       '#FDFBF7',
    ink:         '#1C1C1A',
  }
  ```
- [ ] Install and configure `Cormorant Garamond` and `Outfit` from Google Fonts
- [ ] Set up shadcn/ui with the brand theme
- [ ] Build global CSS layer with design tokens (role colours, badge styles, etc.)

### Step 0.6 — CI/CD
- [ ] Set up GitHub Actions:
  - Lint + type-check on every PR
  - Run tests on every PR
  - Deploy preview to Vercel on PR open
  - Deploy to production on merge to `main`
- [ ] Configure Vercel project with environment variables

### Step 0.7 — Seed Data
- [ ] Create a `seed.ts` script in `/packages/db` with:
  - Sample products across all four categories (Jewelry, Pottery, Home Decor, Textiles)
  - Sample artisan vendor accounts
  - Sample wholesale materials (Beads, Yarn, Clay, Wood)
  - Sample buyer accounts with order history

---

## Phase 1 — Identity & Access

**Goal:** Working auth with role-based routing and trust profile scaffolding.

### Step 1.1 — Database Schema: Identity Domain

Create `/packages/db/schema/identity.ts`:

```
Tables to implement:
  user                  (Better Auth owned — add custom fields via plugin config)
  user_trust_profiles   (1:1 with user — trust score, COD eligibility, risk level)
  user_trust_events     (append-only — explains why trust changed)
```

**`user` custom fields to configure in Better Auth:**
- `role` — platform role: `user | vendor_user | admin | developer | support_member | auditor`
- `phone_number` — Bangladesh mobile number
- `phone_number_verified` — boolean
- `two_factor_enabled` — boolean
- `banned`, `ban_reason`, `ban_expires` — admin plugin fields

**`user_trust_profiles` columns:**
- `id` (cuid2), `user_id`, `score` (integer 0–100), `cod_eligible` (boolean), `risk_level` (text: `low | medium | high`), `manual_review_required` (boolean), `last_evaluated_at`, `created_at`, `updated_at`

**`user_trust_events` columns:**
- `id` (cuid2), `user_id`, `event_type` (text), `score_delta` (integer), `reason` (text), `metadata` (jsonb), `created_by_user_id`, `created_at`

> **Rule:** `user.role` is for admin access and routing hints only. It does not grant vendor permissions. Vendor permissions come from organisation membership.

### Step 1.2 — Role-Based Routing

- [ ] Implement middleware that reads `user.role` and redirects:
  - `admin | developer | support_member | auditor` → `/admin`
  - `vendor_user` → seller dashboard tab as default (still shows consumer shop)
  - `user` → consumer storefront
- [ ] Add a **role-switcher UI bar** at the top of every page (Buyer / Artisan / Wholesaler) that adapts the visible navigation and experience context — this is a UI experience switch, not an auth permission change
- [ ] Add a **vendor status banner** visible to artisan role: shows `pending | approved | suspended` state

### Step 1.3 — Auth Pages

- [ ] Sign up page (email + phone OTP)
- [ ] Sign in page
- [ ] Forgot password / reset flow
- [ ] Phone number verification flow (Bangladesh mobile OTP)
- [ ] Protected route wrapper component

### Step 1.4 — Trust Profile Initialisation

- [ ] On user creation, auto-create a `user_trust_profiles` row with:
  - `score: 50` (neutral starting score)
  - `cod_eligible: false` (COD requires score above threshold)
  - `risk_level: 'medium'`
- [ ] Build a `TrustService` with:
  - `evaluateTrust(userId)` — recalculates score based on events
  - `addTrustEvent(userId, eventType, delta, reason)` — appends to `user_trust_events`
  - `isCODEligible(userId)` — checks score threshold and manual flags

---

## Phase 2 — Vendor Onboarding & Shop Profiles

**Goal:** Artisans can apply, get reviewed, and manage their shop profile.

### Step 2.1 — Database Schema: Vendor Domain

Create `/packages/db/schema/vendors.ts`:

```
Tables to implement:
  vendor_profiles               (1:1 with Better Auth organization)
  vendor_status_events          (append-only lifecycle history)
  vendor_verification_documents (optional MVP — trade license, ID, etc.)
  vendor_profile_change_requests (post-approval major change requests)
```

**`vendor_profiles` key columns:**
- `id` (cuid2), `organization_id` (FK → organization.id), `owner_user_id`
- `public_slug` (unique, immutable post-approval without admin action)
- `requested_slug` (vendor's desired slug before approval)
- `display_name`, `legal_name`, `status`
- `status` values: `draft | submitted | under_review | approved | rejected | suspended | closed`
- `allow_cod` (boolean — vendor can disable COD for their shop)
- `has_pending_major_changes` (boolean)
- `submitted_at`, `approved_at`, `approved_by_user_id`, `rejected_at`, `rejected_by_user_id`
- `suspended_at`, `suspended_by_user_id`

**Major-change fields** (trigger admin review when changed by approved vendor):
- `public_slug`, `display_name`, `legal_name`, `business_address_id`

**Minor-change fields** (can be published without full re-approval):
- Description, support contact details, non-critical storefront content

> **Invariant:** Only `approved` vendors may have publicly visible products. Products from `draft | submitted | under_review | rejected` vendors must never appear in public commerce flows.

### Step 2.2 — Vendor Onboarding UI

**Seller Application Page (`/sell`):**
- [ ] Full name, email address fields
- [ ] Desired shop name field (with slug preview and uniqueness check)
- [ ] Primary craft category selector (Jewelry, Pottery, Textiles, Home Decor, Mixed)
- [ ] "About your craft" textarea
- [ ] Optional document upload (trade license, national ID) — with clear messaging that documents are private and never shown publicly
- [ ] Informational note: *"Only the shop owner can submit or resubmit applications. Approved shop slugs cannot be changed without admin review."*
- [ ] Onboarding progress steps visualisation: Apply → Review → Approved → Publish

**On submission:**
1. Create a Better Auth `organization` (vendor business container)
2. Create `vendor_profiles` row linked to organisation — status: `draft`
3. Auto-assign `vendor_user` platform role to the submitting user
4. Insert `vendor_status_events` record: `null → draft`
5. On explicit submission by owner → status: `submitted`; insert event; notify admin

### Step 2.3 — Organisation Roles

Configure Better Auth organisation roles from day one:

| Role | Permissions |
|---|---|
| `owner` | Full shop access; submit/resubmit application; manage team |
| `manager` | Edit profile, manage products and orders; cannot submit application |
| `catalog_manager` | Create and edit products only |
| `order_manager` | View and manage orders only |
| `support` | View orders and handle customer messages only |

### Step 2.4 — Vendor Status Lifecycle

```
draft → submitted → under_review → approved
                                 → rejected → (edit) → submitted
approved → suspended
suspended → approved (admin re-approves)
```

- [ ] Each status transition appends to `vendor_status_events`
- [ ] `rejected` vendors may edit and resubmit — all fields editable except `public_slug` after first approval
- [ ] Major-change fields on an `approved` vendor trigger `has_pending_major_changes = true` and move profile to `under_review` before changes go public
- [ ] Slug change after approval requires a `vendor_profile_change_requests` record and admin review

### Step 2.5 — Vendor Pickup Addresses

- [ ] Implement `vendor_pickup_addresses` table (distinct from `user_addresses`)
- [ ] Vendor sets a default pickup address used for courier booking
- [ ] UI: address form in shop settings with division/district/upazila fields (Bangladesh)

---

## Phase 3 — Catalog, Products, Variants & Inventory

**Goal:** Full product management with versioning, variant system, and decoupled inventory.

### Step 3.1 — Database Schema: Catalog Domain

Create `/packages/db/schema/catalog.ts`:

```
Tables to implement:
  products                               (core identity + version pointers)
  product_versions                       (immutable content blocks)
  product_variants                       (stable SKU identity)
  product_variant_versions               (version-scoped variant details)
  product_attributes                     (custom schema: Color, Material, etc.)
  product_attribute_values               (enum-like values per attribute)
  product_variant_version_attribute_values (actual selections per variant version)
  inventory_items                        (real-time stock balance)
  inventory_events                       (append-only stock movement ledger)
```

### Step 3.2 — Two-Pointer Versioning Pattern

```
products
  ├── current_version_id  → product_versions (live on storefront)
  └── latest_version_id   → product_versions (vendor's draft/pending)
```

- **Creating a product:** vendor creates a `product_version` (latest) — status `draft`
- **Submitting for review:** `latest_version` status → `pending_review`
- **Admin approves:** `current_version_id` updated to point to approved version — now public
- **Vendor edits an approved product:** new `product_version` created (latest) — `current_version_id` unchanged — live product unaffected until re-approved
- **Rule:** Unapproved edits must never leak into live sales

### Step 3.3 — Variant System (EAV Hybrid)

Products have variants from day one.

```
Example: Ceramic Coffee Mug
  Attribute: Glaze Colour (is_variant_defining: true)
    Values: Ocean Blue, Forest Green, Matte White

  Variants:
    SKU: MUG-BLUE   → Glaze Colour = Ocean Blue  → price: $28.00 → inventory: 5
    SKU: MUG-GREEN  → Glaze Colour = Forest Green → price: $28.00 → inventory: 3
    SKU: MUG-WHITE  → Glaze Colour = Matte White  → price: $26.00 → inventory: 8
```

- `product_attributes.is_variant_defining` flag distinguishes variant axes from informational attributes
- Enforces `UNIQUE(vendor_profile_id, sku)` on `product_variants`

### Step 3.4 — Inventory System

**`inventory_items` columns:**
- `id`, `product_variant_id`, `quantity_on_hand` (integer ≥ 0), `quantity_reserved` (integer)
- `quantity_available` — **PostgreSQL generated column**: `quantity_on_hand - quantity_reserved`
- `CHECK (quantity_on_hand >= 0)` constraint

**`inventory_events` columns (append-only):**
- `id`, `inventory_item_id`, `event_type` (text: `restock | reservation | reservation_release | sale | adjustment | return`), `quantity_delta`, `quantity_after`, `reference_type`, `reference_id`, `note`, `created_by_user_id`, `created_at`

**Checkout flow:**
1. `SELECT ... FOR UPDATE` on `inventory_items` row
2. Check `quantity_available >= requested_qty`
3. If yes: increment `quantity_reserved`, insert `inventory_events` (type: `reservation`)
4. On payment success: decrement `quantity_on_hand`, decrement `quantity_reserved`, insert event (type: `sale`)
5. On payment failure/timeout: decrement `quantity_reserved`, insert event (type: `reservation_release`)

### Step 3.5 — Product Management UI

**Seller: Add/Edit Product Form:**
- [ ] Product name, category, description fields
- [ ] Define variant attributes and variant rows (price + SKU per variant)
- [ ] Inventory quantity input per variant
- [ ] Image upload (up to 5 images per product — stored in S3)
- [ ] Customisation options toggle: enable/disable custom orders
  - If enabled: preset option list (e.g. "Light Wood Finish", "Dark Wood Finish", "Engraving")
  - Custom instructions textarea for buyer
  - Optional file attachment by buyer
- [ ] "Save Draft" → `product.status: draft`
- [ ] "Submit for Review" → `product.status: pending_review`; admin notified

**Product Status Badge on Seller Dashboard:**
- `draft` → amber badge
- `pending_review` → blue badge
- `approved` → green badge
- `rejected` → red badge (with rejection reason visible to seller)

### Step 3.6 — Product Moderation

- [ ] Admin product review queue (Phase 12)
- [ ] Admin can approve, reject (with reason), or request changes
- [ ] Rejection reason stored in `product_versions.rejection_reason`
- [ ] `vendor-visible` rejection message vs. private admin note must be separate fields

---

## Phase 4 — Media & File Storage

**Goal:** Secure, scalable file handling for product images, vendor docs, and avatars.

### Step 4.1 — Database Schema: Files Domain

Create `/packages/db/schema/files.ts`:

```
files
  id (cuid2)
  bucket (text)
  object_key (text)
  original_filename (text)
  content_type (text)
  byte_size (integer)
  checksum (text)
  visibility (text: 'public' | 'private')
  uploaded_by_user_id
  created_at
```

### Step 4.2 — Upload Service

- [ ] Build a `FileService` with:
  - `upload(file, visibility, uploadedByUserId)` → stores bytes in S3, inserts `files` record, returns `files.id`
  - `getPublicUrl(fileId)` → CDN URL for public files
  - `getSignedUrl(fileId, expiresIn)` → time-limited signed URL for private files
  - `delete(fileId)` → removes from S3 and marks deleted in DB
- [ ] Product images → `public` visibility → served via CDN
- [ ] Vendor documents → `private` visibility → served only via signed URL to authorised parties
- [ ] Never expose raw S3 bucket URLs for private files in any API response

### Step 4.3 — Image Upload UI

- [ ] Drag-and-drop image uploader component (max 5 images per product)
- [ ] Image reorder UI (drag to set primary image)
- [ ] Image crop/resize on upload (optional — can use Cloudflare Images)
- [ ] Avatar upload for buyer profile
- [ ] Shop logo upload for vendor profile

---

## Phase 5 — Homepage & Storefront UI

**Goal:** The full consumer-facing storefront experience.

### Step 5.1 — Homepage

- [ ] **Hero section** — headline, sub-headline, CTA buttons (Shop Now, Start Selling), platform stats (products, artisans, buyers)
- [ ] **Category grid** — Jewelry, Pottery, Home Decor, Textiles — click to filtered products page
- [ ] **Trending Products grid** — 8 products, randomised or by recent approval date
- [ ] **Artisan CTA banner** — dark background, "Are you an artisan?" with "Apply to Sell" button
- [ ] **Wholesale Materials callout** — teaser for the wholesale hub with "Browse Materials" CTA
- [ ] Hero section hidden when navigating to internal pages (shows only on home)

### Step 5.2 — Product Listing Page (`/products`)

- [ ] Filter by category pills (All, Jewelry, Pottery, Home Decor, Textiles)
- [ ] Sort selector (Featured, Price Low–High, Price High–Low, Name A–Z, Newest)
- [ ] Product count label ("42 products found")
- [ ] 4-column responsive product grid (→ 2 col on mobile)
- [ ] Each card shows: image, category label, product name, seller name, price, inventory status (In Stock / Only 2 left / Out of Stock), wishlist heart, quick "Add to Cart" button on hover

### Step 5.3 — Custom Products Page (`/custom`)

- [ ] Filtered view of products with `customizable: true`
- [ ] Informational banner: "These items can be fully personalised"
- [ ] Same grid layout as Products page

### Step 5.4 — Product Detail Page (`/products/[slug]`)

- [ ] Main image with 3-thumbnail strip (click to switch)
- [ ] Category label, product name, seller name (links to seller shop)
- [ ] Star rating + review count
- [ ] Inventory status indicator with colour dot (green/amber/red)
- [ ] Price (large, serif font)
- [ ] **Customisation box** (visible only if `customizable: true`):
  - Preset option dropdown
  - Special instructions textarea
  - Optional reference file upload
- [ ] Product description
- [ ] "Add to Cart" button (disabled with "Out of Stock" text if `quantity_available <= 0`)
- [ ] Wishlist heart button (toggles; syncs with wishlist page)
- [ ] Accepted payment methods note (bKash, Card, SSLCommerz, COD)
- [ ] **Reviews section** — verified purchase reviews only; star ratings; reviewer name and date
- [ ] **You Might Also Like** — 4 suggested products from same category or seller
- [ ] SEO: `<title>`, `<meta description>`, Open Graph tags per product

### Step 5.5 — Seller Shop Page (`/shop/[slug]`)

- [ ] Seller avatar / shop logo, shop name, short description
- [ ] All approved products from this vendor
- [ ] "Contact Seller" button (Phase 10 messaging, or email fallback in MVP)

### Step 5.6 — Search

- [ ] Global header search bar (keyboard shortcut: `/`)
- [ ] Search across product name, category, seller name
- [ ] Results page with count label
- [ ] Empty state with "No results for X. Try…" suggestions

---

## Phase 6 — Cart, Checkout & Orders

**Goal:** Full purchase flow with immutable order snapshots.

### Step 6.1 — Database Schema: Orders Domain

Create `/packages/db/schema/orders.ts`:

```
Tables to implement:
  carts                 (1 active cart per user — partial unique index)
  cart_items            (product_variant_id, quantity, customisation jsonb)
  orders                (parent checkout entity with address snapshot)
  vendor_orders         (per-vendor fulfilment sub-order)
  order_items           (individual purchased units with immutable snapshot)
  shipments             (courier assignment per vendor_order)
  shipment_items        (order_items within a shipment)
  shipment_events       (append-only courier tracking history)
```

**`orders` key fields:**
- `id` (cuid2), `user_id`, `status` (text), `total_amount` (integer cents)
- `shipping_address_snapshot` (jsonb) — **immutable snapshot of buyer address at checkout**

**`order_items` key fields:**
- `id`, `vendor_order_id`, `product_variant_id` (reference only — actual data in snapshot)
- `snapshot` (jsonb) — **immutable snapshot**: `{ title, variantTitle, attributes, price, image, seller, customisation }`
- `quantity`, `unit_price` (integer cents)

**`vendor_orders` status values:**
`pending | accepted | processing | ready_for_pickup | shipped | delivered | cancelled | refund_requested | refunded`

**`orders` status values:**
`pending_payment | placed | processing | partially_shipped | shipped | delivered | cancelled | refunded`

### Step 6.2 — Cart UI

- [ ] Persistent cart (stored in DB per user when logged in; localStorage for guests → merge on sign-in)
- [ ] Cart page shows: product image, name, variant, customisation summary, quantity stepper, remove button
- [ ] Order summary sidebar: subtotal, shipping (free above $75), total
- [ ] Payment method icons (bKash, Card, COD)
- [ ] "Proceed to Checkout" button → checkout flow

### Step 6.3 — Checkout Flow

**Step 1 — Delivery Address:**
- [ ] Show saved addresses (if any) with select option
- [ ] Add new address form: recipient name, phone, address line, division, district, upazila, postal code
- [ ] System resolves address to a `delivery_location` and shows delivery zone + estimated days
- [ ] Delivery suggestion recalculated on every checkout (Phase 9)

**Step 2 — Payment Method:**
- [ ] bKash (redirect to bKash payment page)
- [ ] Card / SSLCommerz (redirect to SSLCommerz gateway)
- [ ] Cash on Delivery (only shown if `user_trust_profiles.cod_eligible = true` AND `vendor_profiles.allow_cod = true`)
- [ ] COD ineligibility message if trust score too low

**Step 3 — Review & Place:**
- [ ] Show full order summary with frozen prices
- [ ] "Place Order" button
- [ ] COD → order placed immediately if eligibility passes
- [ ] Online payment → `pending_payment` status until provider confirms

### Step 6.4 — Order Confirmation & Tracking

- [ ] Order confirmation page with order ID, items summary, estimated delivery
- [ ] Order history in buyer profile: each order shows a progress stepper (Placed → Processing → Shipped → Delivered)
- [ ] Tracking number + courier name shown after shipment booked
- [ ] Email confirmation sent on order placement

---

## Phase 7 — Payments (bKash, SSLCommerz, COD)

**Goal:** Secure, provider-neutral, idempotent payment processing.

### Step 7.1 — Database Schema: Payments Domain

Create `/packages/db/schema/payments.ts`:

```
Tables to implement:
  payment_attempts          (checkout payment attempts — provider neutral)
  payments                  (successful/authoritative payment records)
  payment_provider_events   (append-only provider webhook/callback log)
  refunds                   (refund requests and execution records)
  refund_items              (item-level refund detail)
  wallet_accounts           (customer wallet balance)
  wallet_transactions       (append-only wallet ledger)
  vendor_settlements        (settlement batches owed to vendors)
  vendor_settlement_items   (line-level settlement detail)
  vendor_payout_accounts    (vendor payout destination — encrypted)
```

**All monetary amounts: integer cents.**

**`payment_attempts` provider values:** `cod | bkash | sslcommerz`
**`payment_attempts` status values:** `created | pending | requires_action | succeeded | failed | cancelled | expired`
**`payments` status values:** `pending | authorized | paid | partially_refunded | refunded | failed | cancelled`
**`refunds` status values:** `requested | approved | processing | succeeded | failed | cancelled`
**`refund_method` values:** `original_payment_source | manual_bank_transfer | mobile_wallet | wallet_credit | gift_credit`

> **Default refund method:** `original_payment_source`. Alternatives require support/admin handling.

### Step 7.2 — Payment Flow

**bKash flow:**
1. Create `payment_attempt` (status: `created`)
2. Call bKash API → get payment URL
3. Redirect buyer to bKash
4. bKash calls our webhook on completion
5. Validate webhook signature → insert into `payment_provider_events`
6. If success → update `payment_attempt` (succeeded) → create `payments` record → update `order.status` to `placed`
7. Webhook idempotency: `UNIQUE(provider, event_id)` on `payment_provider_events` rejects duplicates

**SSLCommerz flow:** Same pattern, different API calls and webhook format.

**COD flow:**
1. Check `user_trust_profiles.cod_eligible = true`
2. Check `vendor_profiles.allow_cod = true` for all vendors in cart
3. If both pass → create `payment_attempt` (COD) → immediately create `payments` record (status: `pending`) → set `order.status` to `placed`
4. COD collection confirmed by vendor/admin → `payments.status` → `paid`

### Step 7.3 — Webhook Security

- [ ] Validate all incoming webhooks with provider-specific signature verification
- [ ] Store raw payload in `payment_provider_events.raw_payload` for audit/debug
- [ ] Never trust provider data without signature verification
- [ ] Process webhook events idempotently

### Step 7.4 — Settlement System

- [ ] `vendor_settlements` generated per settlement period (bi-weekly in MVP)
- [ ] `vendor_settlement_items` break down: sale, commission (10%), refund deductions, adjustments, shipping fees
- [ ] Settlement status: `draft → pending_review → approved → paid → cancelled`
- [ ] Admin approves settlements before payout is executed
- [ ] Payout to vendor's registered `vendor_payout_accounts` (bKash or bank transfer)
- [ ] `vendor_payout_accounts.details_encrypted` — sensitive payout details always encrypted; masked identifier exposed in UI

### Step 7.5 — Refunds

- [ ] Buyer requests refund → creates `refunds` record (status: `requested`) + `refund_items`
- [ ] Admin reviews and approves
- [ ] Refund executed via original provider (bKash refund API / SSLCommerz refund)
- [ ] COD refunds → manual bank transfer → `refund_method: manual_bank_transfer`
- [ ] Wallet credit as alternative only with support approval → `refund_method: wallet_credit`

---

## Phase 8 — Raw Materials Wholesale Marketplace

**Goal:** A separate marketplace section for approved artisans to purchase raw materials from verified wholesalers.

### Step 8.1 — Access Control

- [ ] Wholesale Hub accessible only to users whose linked `vendor_profiles.status = 'approved'`
- [ ] Buyers and unapproved vendors see a "seller-only" access gate with CTA to apply
- [ ] Wholesalers can view their supplier dashboard to manage listings

### Step 8.2 — Material Catalogue

Materials share a simplified version of the product schema (no versioning needed for MVP):

```
raw_materials
  id (cuid2)
  wholesaler_vendor_profile_id
  name
  category (text: 'Beads' | 'Yarn' | 'Clay' | 'Wood' | ...)
  description
  price (integer cents — per unit)
  unit (text: 'pack' | 'spool' | 'bag' | 'set' | 'kg' | ...)
  moq (integer — minimum order quantity)
  stock_quantity (integer)
  status (text: 'active' | 'inactive' | 'out_of_stock')
  images (jsonb — array of file IDs)
  created_at, updated_at
```

### Step 8.3 — Wholesale UI

**Materials page:**
- [ ] Category tabs: Beads, Yarn, Clay, Wood (expandable)
- [ ] Material cards: image, category label, name, supplier, MOQ note, stock badge, price, "Order" button
- [ ] Filtering by category, supplier, stock status
- [ ] "Viewing as Artisan / Seller" label (role-aware)

**Material Detail (MVP — modal or full page):**
- [ ] Larger images, full description, supplier info
- [ ] Quantity selector (respects MOQ)
- [ ] "Add to Wholesale Order" button

**Wholesale Cart / Order:**
- [ ] Separate from consumer cart
- [ ] Checkout flow: delivery address, payment (online only — no COD for wholesale orders in MVP)
- [ ] Order confirmation with supplier breakdown

### Step 8.4 — Wholesaler Dashboard

- [ ] Wholesaler profile setup (separate from artisan flow)
- [ ] Add/edit material listings
- [ ] View and process wholesale orders
- [ ] Settlement reporting

---

## Phase 9 — Shipping, Delivery Zones & Courier

**Goal:** Bangladesh-specific zone-based delivery pricing with courier API integration.

### Step 9.1 — Database Schema: Shipping Domain

Create `/packages/db/schema/shipping.ts`:

```
Tables to implement:
  user_addresses              (saved buyer addresses)
  vendor_pickup_addresses     (seller pickup points — separate from user_addresses)
  delivery_locations          (platform-normalised deliverable locations)
  delivery_zones              (pricing/service zones)
  delivery_zone_locations     (many locations → one zone)
  courier_providers           (courier directory: Pathao, RedX, Steadfast)
  courier_service_areas       (which courier covers which delivery_location)
  shipments                   (shipment record per vendor_order)
  shipment_items              (order_items per shipment)
  shipment_events             (append-only courier tracking history)
  delivery_suggestions        (recommendation history for audit and ML)
```

### Step 9.2 — MVP Delivery Zones (Bangladesh)

| Zone | Coverage | Base Price |
|---|---|---|
| Dhaka Metro | Dhaka city and immediate surroundings | TBD |
| Outside Dhaka | Other major cities (Chittagong, Sylhet, Rajshahi, etc.) | TBD |
| Remote Area | Rural and hard-to-reach locations | TBD |

- [ ] Seed `delivery_zones` and `delivery_zone_locations` tables
- [ ] Admin UI to manage zones and location mappings

### Step 9.3 — Delivery Suggestion Engine

At checkout:
1. Resolve buyer `user_address` → nearest `delivery_location` (by upazila/district match)
2. Find all `courier_service_areas` that cover that `delivery_location`
3. Score couriers by: COD support, price, delivery speed, current availability
4. Return top suggestion to checkout UI
5. Store suggestion in `delivery_suggestions` (for audit and future ML improvement)
6. Vendor can override suggested courier if needed (stored with `courier_overridden_by_user_id` and `courier_override_reason`)

### Step 9.4 — Courier API Integration

Priority order for MVP:
1. **Pathao** (most common in Dhaka)
2. **RedX** (strong outside Dhaka)
3. **Steadfast** (COD specialist)

For each courier:
- [ ] API booking: `bookShipment(vendorOrderId)` → returns tracking number
- [ ] API tracking: `getTrackingStatus(trackingNumber)` → returns events
- [ ] Tracking events stored in `shipment_events` (append-only)
- [ ] Manual fallback: seller can manually enter tracking number if API booking fails

---

## Phase 10 — Customer Features (Wishlist, Reviews, Notifications)

**Goal:** Buyer engagement features that improve retention and trust.

### Step 10.1 — Wishlist

```
wishlist_items
  id (cuid2)
  user_id
  product_id
  created_at
  UNIQUE(user_id, product_id)
```

- [ ] Heart toggle on every product card and detail page
- [ ] Wishlist page: grid of wishlisted products with remove option
- [ ] Wishlist count badge on header heart icon
- [ ] "Back in stock" notification when a wishlisted out-of-stock item is restocked (Phase 10.3)
- [ ] No wishlist folders/collections in MVP

### Step 10.2 — Reviews

```
product_reviews
  id (cuid2)
  user_id, product_id, product_variant_id
  order_item_id           ← enforces verified-purchase requirement
  vendor_profile_id
  rating (integer 1–5)
  title, body
  status (text: 'submitted' | 'approved' | 'rejected' | 'hidden')
  submitted_at, approved_at, rejected_at, rejection_reason
  UNIQUE(user_id, order_item_id)   ← one review per purchased item

review_status_events   (append-only moderation history)
```

**Rules:**
- [ ] Buyer can only review after order status is `delivered`
- [ ] Review submitted → status `submitted` → appears in vendor/admin review queue
- [ ] Vendor can approve reviews for their own products
- [ ] Admin can override any vendor review decision
- [ ] Public product pages show only `approved` reviews
- [ ] Rejection reason shown to reviewer; private admin notes kept internal

### Step 10.3 — Notifications

```
notifications
  id (cuid2), user_id, type, title, body
  entity_type, entity_id (for deep linking)
  read_at, created_at

notification_deliveries (optional — per-channel tracking)
  id, notification_id, channel, status, sent_at
```

**Notification types for MVP:**

| Type | Trigger |
|---|---|
| `order_placed` | Buyer places an order |
| `order_shipped` | Seller marks order as shipped |
| `order_delivered` | Courier confirms delivery |
| `review_request` | 3 days after delivery |
| `wishlist_restock` | Wishlisted product back in stock |
| `vendor_approved` | Vendor application approved |
| `vendor_rejected` | Vendor application rejected (with reason) |
| `product_approved` | Product listing approved |
| `product_rejected` | Product listing rejected |
| `seller_new_order` | Seller receives a new order |
| `payout_sent` | Seller payout processed |

- [ ] In-app notification bell with unread count badge
- [ ] Notification feed page
- [ ] "Mark all read" action
- [ ] Email delivery for critical notifications (order placed, shipped, payout)
- [ ] SMS for COD order confirmations (stretch goal)

### Step 10.4 — User Style Profile (Optional MVP)

```
user_style_profiles
  id, user_id, department, size_tops, size_bottoms, size_shoes
  preferences (jsonb), consent_version, consented_at, deleted_at
```

- [ ] Optional profile section "Personalise your experience"
- [ ] Used for product recommendations — never for eligibility, pricing, or moderation
- [ ] Full GDPR-style consent with version tracking

---

## Phase 11 — Seller Dashboard

**Goal:** Complete seller management experience.

### Step 11.1 — Dashboard Overview

- [ ] Stat cards: Total Revenue, Last Payout, Pending Payout, Total Orders this month
- [ ] Recent orders table
- [ ] Quick actions: Add Product, View Payouts, Shop Settings

### Step 11.2 — My Products

- [ ] Product list with status badges (Draft, Pending Review, Approved, Rejected)
- [ ] Filter by status
- [ ] Click to edit product → opens product form
- [ ] Add New Product button
- [ ] Rejected products show rejection reason and "Resubmit" button

### Step 11.3 — Orders

- [ ] Incoming orders list: order ID, buyer (masked), item, amount, status, date
- [ ] Order detail: full item breakdown, customisation notes, delivery address (within seller's view)
- [ ] Actions: Accept, Mark as Processing, Mark as Ready for Pickup
- [ ] Courier assignment: view suggested courier, confirm or override
- [ ] Mark as Shipped (triggers shipment booking API)
- [ ] View tracking status

### Step 11.4 — Payments & Settlements

- [ ] Settlement summary: gross, commission (10%), refund deductions, net payout
- [ ] Transaction history: per order, per settlement period
- [ ] Payout account management (masked display; change request flow)
- [ ] Download settlement report (CSV) — stretch goal

### Step 11.5 — Shop Settings

- [ ] Display name, description, support email/phone
- [ ] Shop logo upload
- [ ] COD enable/disable toggle
- [ ] Pickup address management
- [ ] Team member management (invite, assign role, remove)
- [ ] Slug change request (triggers admin review)

---

## Phase 12 — Admin Dashboard & Moderation

**Goal:** Internal tools for running the marketplace safely at scale.

### Step 12.1 — Database Schema: Audit Domain

```
audit_logs      (platform-wide append-only action log)
admin_notes     (internal notes on entities — never exposed to vendors/buyers)
```

**`audit_logs` key columns:**
- `id`, `actor_user_id`, `actor_role`, `action`, `entity_type`, `entity_id`
- `reason` (required for sensitive actions), `public_message`, `private_note`
- `metadata` (jsonb), `ip_address`, `user_agent`, `impersonated_user_id`, `created_at`

**Sensitive actions requiring a `reason` field:**
- Vendor rejection, suspension, reapproval
- Product rejection, reapproval rejection
- Trust score adjustment
- Refund redirect to non-original payment source
- Wallet/manual credit adjustment
- Admin role changes
- User ban/unban
- Admin impersonation of user

### Step 12.2 — Vendor Management

- [ ] Vendor queue: list of `submitted` and `under_review` vendors with submission date
- [ ] Vendor detail: application info, documents, lifecycle history
- [ ] Approve (with optional note), Reject (reason required), Suspend (reason required)
- [ ] All actions logged to `vendor_status_events` and `audit_logs`
- [ ] Vendor-visible rejection reasons must be sanitised — private admin notes stay internal

### Step 12.3 — Product Moderation

- [ ] Product review queue: `pending_review` products
- [ ] Product detail review: images, description, price, variant, inventory
- [ ] Approve (sets `current_version_id`), Reject (reason required, visible to seller), Request Changes
- [ ] All decisions logged to `audit_logs`

### Step 12.4 — User Management

- [ ] User list with search and filter by role
- [ ] User detail: profile, trust score, order history, platform role
- [ ] Ban/Unban (reason required)
- [ ] Manually adjust trust score (reason required → appends `user_trust_events`)
- [ ] Override COD eligibility

### Step 12.5 — Settlement Management

- [ ] Generate settlement batch for a period
- [ ] Review settlement line items per vendor
- [ ] Approve and mark as paid
- [ ] Cannot delete settlement records after payout

### Step 12.6 — Audit Log Viewer

- [ ] Searchable, filterable view of `audit_logs`
- [ ] Filter by actor, entity type, action type, date range
- [ ] Cannot edit or delete any audit log entry

---

## Phase 13 — Trust, Risk & COD Eligibility

**Goal:** A trust scoring system that governs COD eligibility and risk management.

### Step 13.1 — Trust Score Model

Starting score: **50 / 100** (neutral) on account creation.

| Event | Score Delta |
|---|---|
| Phone number verified | +10 |
| First purchase completed | +5 |
| Order delivered successfully | +3 per order |
| COD order delivered | +5 |
| COD order refused / not collected | -15 |
| Refund requested (legitimate) | 0 |
| Refund requested repeatedly | -5 per occurrence |
| Account flagged by admin | -20 |
| Manual admin adjustment | Admin-specified |

**COD eligibility threshold:** Score ≥ 65 (configurable by admin).

### Step 13.2 — Trust Service

- [ ] `TrustService.evaluate(userId)` — recalculates score from all events
- [ ] `TrustService.addEvent(userId, eventType, delta, reason, createdByUserId)` — appends event
- [ ] `TrustService.isCODEligible(userId)` — checks score + manual flags + vendor COD setting
- [ ] Trust score shown to buyer in profile (as a bar visualisation, not raw score)
- [ ] Admin sees full trust event history

---

## Phase 14 — Marketing, Coupons & Promotions

**Goal:** Flexible coupon/discount system without schema sprawl.

### Step 14.1 — Database Schema: Marketing Domain

```
coupons
  id (cuid2)
  code (text — unique)
  description
  status (text: 'active' | 'inactive' | 'expired')
  type (text: 'platform' | 'vendor')
  vendor_profile_id (nullable — null = platform-wide)
  rules (jsonb)    ← THE RULES ENGINE
  usage_limit (integer nullable — null = unlimited)
  usage_count (integer)
  valid_from, valid_until
  created_by_user_id, created_at, updated_at

coupon_redemptions
  id, coupon_id, user_id, order_id, discount_amount, created_at
```

### Step 14.2 — JSONB Rules Engine

The `rules` column encodes all eligibility and calculation logic. Examples:

```json
{
  "discount": { "type": "percentage", "value": 15 },
  "conditions": {
    "min_order_amount": 5000,
    "max_discount_cap": 2000,
    "applicable_categories": ["Jewelry", "Pottery"],
    "first_order_only": true,
    "max_uses_per_user": 1
  }
}
```

```json
{
  "discount": { "type": "fixed", "value": 500 },
  "conditions": {
    "specific_vendor_id": "vendor_profile_id_here",
    "min_order_amount": 3000
  }
}
```

- [ ] `CouponService.validate(code, userId, cartItems)` — parses `rules` jsonb and validates eligibility
- [ ] `CouponService.apply(code, userId, orderId, discountAmount)` — creates `coupon_redemptions`
- [ ] Admin UI to create/edit coupons
- [ ] Coupon input field at checkout
- [ ] Coupon usage tracked in `coupon_redemptions`

---

## Phase 15 — Testing, QA & Launch

**Goal:** Verified, stable, secure platform ready for real users.

### Step 15.1 — Unit Tests
- [ ] `TrustService` — score calculation, COD eligibility, event appending
- [ ] `CouponService` — rules engine parsing and validation
- [ ] `InventoryService` — reservation, release, sale flows
- [ ] `PaymentService` — payment attempt creation, webhook processing, idempotency
- [ ] `DeliveryService` — zone resolution, courier suggestion
- [ ] All Zod schemas — valid and invalid input cases

### Step 15.2 — Integration Tests
- [ ] Full checkout flow: add to cart → checkout → payment → order created → inventory decremented
- [ ] COD flow: eligibility check → order placed immediately
- [ ] Vendor onboarding: apply → admin approves → products become visible
- [ ] Product versioning: approved product edit → new version → current_version unchanged
- [ ] Webhook idempotency: same webhook sent twice → only one `payment_provider_events` row
- [ ] Wishlist: add → remove → page renders correctly
- [ ] Review gating: cannot review without a delivered order_item

### Step 15.3 — E2E Tests (Playwright)
- [ ] Buyer journey: sign up → browse → wishlist → checkout → view order
- [ ] Artisan journey: apply → dashboard → add product → order received
- [ ] Admin journey: review vendor → approve → review product → approve
- [ ] Search and filter flows
- [ ] Mobile viewport for all critical flows

### Step 15.4 — Security Audit
- [ ] Verify all private file URLs require auth/signed URL — no public access to vendor documents
- [ ] Verify payout account details are never returned in any API response (only masked identifier)
- [ ] Verify admin notes never appear in vendor or buyer API responses
- [ ] Verify vendor products from unapproved vendors do not appear in public queries
- [ ] Verify inventory row-level locking works under concurrent test load
- [ ] Verify payment webhooks are rejected without valid provider signatures
- [ ] Penetration test on auth flows (IDOR, privilege escalation)

### Step 15.5 — Performance
- [ ] Add indexes on all foreign keys and frequently-queried columns
- [ ] Add composite indexes for common queries (e.g. `(vendor_profile_id, status)` on `products`)
- [ ] Test product listing page under 500 concurrent users
- [ ] Test checkout flow under flash-sale simulation (high inventory contention)
- [ ] Add Redis caching for product listing pages and category counts (optional Phase 16)

### Step 15.6 — Launch Checklist
- [ ] All environment variables set in production
- [ ] Database connection pooling configured (PgBouncer recommended)
- [ ] S3 bucket policies verified (public vs. private)
- [ ] Payment provider webhooks pointed to production URLs
- [ ] Courier API keys set to production mode
- [ ] Error monitoring set up (Sentry)
- [ ] Uptime monitoring set up (Better Uptime / Checkly)
- [ ] Database backup policy confirmed
- [ ] `robots.txt` and sitemap configured
- [ ] Legal pages: Privacy Policy, Terms of Service, Refund Policy

---

## Phase 16 — Post-Launch & Scaling

These items are explicitly deferred from MVP but must be kept in mind architecturally.

| Feature | Notes |
|---|---|
| Multi-country expansion | Address schema supports `country_code`; currency is already abstracted |
| Redis caching | Product listing, category counts, session data |
| Search engine (Meilisearch / Algolia) | Replace DB LIKE queries with full-text search + faceted filtering |
| Email/SMS delivery tracking | `notification_deliveries` table already in schema |
| Review photos | `product_reviews` can link to `files` via jsonb extension |
| Wishlist folders | `wishlist_items` schema extended with `folder_id` |
| Gift cards | Separate `gift_cards` table; `wallet_credit` refund method already in schema |
| Buyer messaging to sellers | In-app messaging system |
| Analytics dashboard | Seller analytics; platform analytics |
| Mobile app | React Native with shared `/packages/lib` and `/packages/db` |
| ML delivery suggestions | `delivery_suggestions` table already logging data for training |
| Automated settlements | Cron job replaces manual settlement generation |
| Admin role finalization | Role permission matrix to be finalized post-MVP |

---

## Open Questions Tracker

Track unresolved decisions here. Update with decision and date when resolved.

| # | Question | Status | Decided |
|---|---|---|---|
| 1 | Final admin role names and permission matrix | ⏳ Open | — |
| 2 | Final trust event types | ⏳ Open | — |
| 3 | Whether `vendor_user` auto-assigned on joining a vendor org | ⏳ Open | — |
| 4 | Exact document types for optional MVP vendor verification | ⏳ Open | — |
| 5 | Whether team invitations before approval limited to owner + manager | ⏳ Open | — |
| 6 | Whether vendor support email/phone required before submission | ⏳ Open | — |
| 7 | Exact Bangladesh zone model and zone pricing for MVP | ⏳ Open | — |
| 8 | Whether courier API booking is automatic or vendor-confirmed | ⏳ Open | — |
| 9 | Exact courier override policy for admin vs. vendor | ⏳ Open | — |
| 10 | S3-compatible provider selection (AWS vs. R2) | ⏳ Open | — |
| 11 | Whether image processing derivatives need their own table | ⏳ Open | — |
| 12 | Whether wallet credit exposed to buyers in MVP | ⏳ Open | — |
| 13 | Exact commission model (currently assumed 10%) | ⏳ Open | — |
| 14 | Settlement schedule (currently assumed bi-weekly) | ⏳ Open | — |
| 15 | COD collection reconciliation process for vendors | ⏳ Open | — |
| 16 | Exact payout account requirements for Bangladesh vendors | ⏳ Open | — |
| 17 | Audit log retention policy | ⏳ Open | — |
| 18 | Whether review photos are supported in MVP | ⏳ Open | — |
| 19 | Whether email/SMS notifications are in MVP scope | ⏳ Open | — |
| 20 | COD eligibility score threshold (currently assumed 65) | ⏳ Open | — |

---

## Database Domain Summary

Quick reference for all database schema files and their domain ownership.

| Schema File | Domain | Tables |
|---|---|---|
| `identity.ts` | Identity & Access | `user` (BA), `user_trust_profiles`, `user_trust_events` |
| `vendors.ts` | Vendor Orgs & Shops | `organization` (BA), `vendor_profiles`, `vendor_status_events`, `vendor_verification_documents`, `vendor_profile_change_requests` |
| `catalog.ts` | Catalog & Inventory | `products`, `product_versions`, `product_variants`, `product_variant_versions`, `product_attributes`, `product_attribute_values`, `product_variant_version_attribute_values`, `inventory_items`, `inventory_events` |
| `files.ts` | Media & Storage | `files` |
| `orders.ts` | Cart, Checkout & Orders | `carts`, `cart_items`, `orders`, `vendor_orders`, `order_items`, `shipments`, `shipment_items`, `shipment_events` |
| `payments.ts` | Payments & Settlements | `payment_attempts`, `payments`, `payment_provider_events`, `refunds`, `refund_items`, `wallet_accounts`, `wallet_transactions`, `vendor_settlements`, `vendor_settlement_items`, `vendor_payout_accounts` |
| `shipping.ts` | Shipping & Delivery | `user_addresses`, `vendor_pickup_addresses`, `delivery_locations`, `delivery_zones`, `delivery_zone_locations`, `courier_providers`, `courier_service_areas`, `delivery_suggestions` |
| `customers.ts` | Customer Features | `wishlist_items`, `product_reviews`, `review_status_events`, `notifications`, `notification_deliveries`, `user_style_profiles` |
| `audit.ts` | Moderation & Audit | `audit_logs`, `admin_notes` |
| `marketing.ts` | Coupons & Promotions | `coupons`, `coupon_redemptions` |
| `wholesale.ts` | Raw Materials Hub | `raw_materials` (simplified product schema for wholesalers) |

---

*Last updated: 2025 · The Artisan's Market Development Team*
*This document is the source of truth for all database and architecture decisions. Update before implementing.*
