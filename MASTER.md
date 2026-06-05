# MASTER.md — MoLuxury Single Source of Truth
# Last updated: June 2026 | Covers all sessions to date
# READ THIS ENTIRE FILE before writing a single line of code

---

## HOW TO START A NEW SESSION

Paste this at the top of any new chat:

```
I'm continuing development on MoLuxury.
Read MASTER.md before doing anything.

Repo: https://github.com/oluwatosin17/moluxury  (local: ~/moluxury)
Live: https://moluxury.vercel.app
Admin: https://moluxury.vercel.app/admin

Stack: Next.js 14.2 · TypeScript · Tailwind · Supabase · Resend · Vercel · Cloudinary

Task today: [DESCRIBE YOUR TASK]
```

---

## 1. WHAT IS BUILT AND CONFIRMED WORKING

### 1.1 — Storefront (live, deployed, reads from Supabase)

| Route | Description |
|---|---|
| `/` | Homepage — hero, new collection, trending, experience, TikTok |
| `/shop` | Product catalogue — filter + sort — reads from Supabase |
| `/shop/[slug]` | Product detail — gallery, length/density selectors, add to cart |
| `/services` | 6 in-studio services grid |
| `/services/[slug]` | Service detail + booking panel |
| `/about` | Brand story |
| `/checkout` | 3-step: details → bank transfer → confirmed |
| `/orders` | Public order lookup |
| `/orders/[ref]` | Order status page with timeline |

**The storefront reads products from Supabase, not `products.ts`.** This migration is complete.

Working features on storefront:
- Cart (in-memory, React state — NOT persisted to localStorage)
- Wishlist (localStorage — persists across sessions)
- Fixed bottom search pill
- GSAP animations, Web Audio sound effects, heart particle animation
- Full SEO: sitemap, robots, OG tags, JSON-LD structured data

### 1.2 — Admin Dashboard (live, all routes working)

URL: https://moluxury.vercel.app/admin

| Route | Purpose | Status |
|---|---|---|
| `/admin/login` | Magic link auth (no password) | ✅ |
| `/admin/dashboard` | Stats overview + recent orders/bookings | ✅ |
| `/admin/analytics` | Full analytics with SVG charts + date filters | ✅ |
| `/admin/products` | Product grid — shows ALL including drafts | ✅ |
| `/admin/products/new` | Create product, upload images via Cloudinary | ✅ |
| `/admin/products/[slug]/edit` | Edit product — all fields including publish toggle | ✅ |
| `/admin/categories` | Manage filter category tabs | ✅ |
| `/admin/orders` | Orders list with search + status filter | ✅ |
| `/admin/orders/[id]` | Order detail — status management, notes, WhatsApp | ✅ |
| `/admin/bookings` | Bookings list | ✅ |
| `/admin/bookings/[id]` | Booking detail + WhatsApp template | ✅ |
| `/admin/media` | Upload homepage/service images | ✅ |
| `/admin/settings` | Env var reference | ✅ |

**Auth:** Magic link only. Authorised: `omosope43@gmail.com` + `obalanatosin16@gmail.com`.

### 1.3 — Supabase (confirmed working)

- **Project URL:** `https://aurirjornlsqepblndwa.supabase.co`
- **Project ID:** `aurirjornlsqepblndwa`
- **Region:** EU West (Ireland)

**Tables (all confirmed with data):**
- `products` — **31 products seeded** (30 from products.ts + 1 existing)
- `categories` — 9 categories seeded
- `orders` — receives new orders from checkout (2 real orders as of last session)
- `bookings` — receives bookings from services pages (1 real booking as of last session)

**Current product image format:**
All 31 seeded products have images stored as local paths e.g. `/products/bodie-1.jpg`.
These are served from the `/public/products/` folder in the Next.js repo.
When admin uploads NEW images via the product editor, they go to Cloudinary and are stored as full `https://res.cloudinary.com/oluwatosin17/...` URLs.
`getImageUrl()` handles both formats transparently.

### 1.4 — All Service-Role API Routes (the architecture that makes everything work)

Every admin operation goes through a Next.js API route using the service role key.
Direct Supabase client calls from admin pages (anon key) were blocked by RLS — this was fixed.

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/products` | GET | All products including drafts |
| `/api/admin/product` | POST | Create product |
| `/api/admin/product` | PUT | Update product |
| `/api/admin/product` | DELETE | Delete product |
| `/api/admin/orders` | GET | All orders |
| `/api/admin/orders/[id]` | GET | Single order |
| `/api/admin/orders/[id]` | PATCH | Update status/notes/tracking |
| `/api/admin/bookings` | GET | All bookings |
| `/api/admin/bookings/[id]` | GET | Single booking |
| `/api/admin/bookings/[id]` | PATCH | Update status/notes |
| `/api/admin/stats` | GET | Dashboard counts + recent lists |
| `/api/admin/analytics` | GET | Full analytics with date range |
| `/api/confirm-order` | POST | Customer checkout → writes order to DB |
| `/api/send-booking` | POST | Service booking → writes booking to DB |
| `/api/revalidate` | POST | Clears Next.js ISR cache after product save |

### 1.5 — Cloudinary Image Upload Flow

**This is how uploading a product image works:**

```
Admin opens /admin/products/new or /admin/products/[slug]/edit
    ↓
Clicks the upload area (ImageUploader component)
    ↓
Cloudinary Upload Widget opens in browser (no backend involved)
    ↓
Admin selects images from their device
    ↓
Images upload DIRECTLY from browser → Cloudinary servers
    ↓
Cloudinary returns full URL: https://res.cloudinary.com/oluwatosin17/image/upload/...
    ↓
URL is added to the images[] array in the product form state
    ↓
Admin clicks "Save & Publish"
    ↓
PUT /api/admin/product → Supabase products.images[] updated with Cloudinary URLs
    ↓
/api/revalidate called → Next.js ISR cache cleared
    ↓
Live storefront re-fetches product → shows Cloudinary image
```

**Cloudinary credentials:**
- Cloud name: `oluwatosin17`
- Upload preset: `moluxury-unsigned` (unsigned, folder: `moluxury`)
- Widget loaded via Script tag in admin layout (beforeInteractive)

**Image hosting status:**
- **30 seeded products** → images stored as `/products/slug.jpg` (served from `/public/`)
- **Any new product created via admin** → images go to Cloudinary, stored as full https:// URL
- Both formats work on the storefront because `getImageUrl()` handles both

---

## 2. KEY BUGS FIXED (understand these before touching related code)

### Bug 1 — RLS blocks anon key (the most pervasive bug)
**Every** admin page was using `createClient()` (anon key). Supabase RLS silently returns empty results for anon requests on protected tables. Fixed by routing all admin reads/writes through `/api/admin/*` routes that use `createAdminSupabaseClient()` (service role key, bypasses RLS).

**Rule:** Admin pages NEVER call Supabase directly. They call `/api/admin/*` routes.

### Bug 2 — Next.js fetch cache (caused stale/empty data)
Next.js 14 patches the global `fetch` function and caches all GET requests by default. The Supabase JS client uses `fetch` internally, so cached responses returned stale data. Fixed by adding `cache: 'no-store'` to every fetch call in `admin-client.ts`:
```typescript
global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }) }
```

### Bug 3 — Orders never reached Supabase
`confirm-order` API tried to send customer email first. Resend sandbox blocked emails to non-verified addresses, returned 503, route crashed, Supabase write never ran. Fixed: DB write happens FIRST, emails are non-fatal.

### Bug 4 — Publish toggle was cosmetic
Product editor's `save()` function took a hardcoded `publish: boolean` parameter from the button clicked — the toggle's state was ignored. Fixed: `save()` now reads the `published` state. Toggle is the single source of truth. Buttons stay in sync with toggle.

### Bug 5 — use(params) crash on detail pages (Next.js version mismatch)
Order/booking detail pages used `use(params)` — the Next.js 15 async params API. This app is Next.js 14 / React 18 where `params` is a plain object. Calling `use()` on a plain object throws. Fixed: `const { id } = params` directly.

### Bug 6 — head:true count parsing
`supabase.from("table").select("*", { count: "exact", head: true })` doesn't reliably return `.count` in Next.js server context. Fixed: use `select("id", { count: "exact" })` (no head:true).

### Bug 7 — Draft products invisible in admin
`/admin/products` was using anon client. RLS only exposes `is_published=true` to anon. Drafts returned empty. Fixed: page fetches from `/api/admin/products` (service role).

---

## 3. ARCHITECTURE RULES — NEVER VIOLATE THESE

1. **Admin pages never call Supabase directly.** All data comes from `/api/admin/*` routes.
2. **`createAdminSupabaseClient()`** is the only client used in API routes. It uses the service role key and has `cache: 'no-store'` on all fetches.
3. **`createClient()`** (anon key) is used ONLY for: auth (sign in/out) and the slug uniqueness check in the product editor. Nothing else.
4. **`createServerSupabaseClient()`** is used ONLY in middleware for session verification.
5. **`getAllProducts()` and `getProductBySlug()`** are for storefront server components only — they use service role but are read-only.
6. **All API routes have `export const dynamic = "force-dynamic"`** to prevent Next.js from caching responses.
7. **Product images from admin go to Cloudinary.** Do NOT introduce Supabase Storage for new uploads.
8. **`SUPABASE_SERVICE_ROLE_KEY` is server-only.** It must never appear in `NEXT_PUBLIC_*` variables or client-side code.
9. **Do NOT delete `products.ts`.** It is deprecated but kept for reference. The storefront no longer reads from it.
10. **Never use `git push --force`.** All commits are clean.

---

## 4. ENVIRONMENT VARIABLES

### `.env.local` (local only — never committed)
```
RESEND_API_KEY=re_G26NNtrk_CVFxowqpiHMgZ735pqpQKjDp
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=omosope43@gmail.com
NEXT_PUBLIC_SITE_URL=https://moluxury.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://aurirjornlsqepblndwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cmlyam9ybmxzcWVwYmxuZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MjE3MjEsImV4cCI6MjA5NjE5NzcyMX0.SzTGUa_Ne8PoLxsk8OnpfckO18ktkTjXzB_7y5L9y1c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cmlyam9ybmxzcWVwYmxuZHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYyMTcyMSwiZXhwIjoyMDk2MTk3NzIxfQ.4OiRQlEa0dAMAjLKNAujNs1v76cl3S7WjwaHwkE6tts

ADMIN_EMAILS=omosope43@gmail.com,obalanatosin16@gmail.com
REVALIDATE_SECRET=moluxury-revalidate-2026
NEXT_PUBLIC_REVALIDATE_SECRET=moluxury-revalidate-2026

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=oluwatosin17
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=moluxury-unsigned
```

All 12 variables are also set in Vercel production.

### Supabase credentials
- Dashboard: https://supabase.com/dashboard/project/aurirjornlsqepblndwa
- DB password: `m7F3u2EttmDwomJs`

---

## 5. FILE STRUCTURE (key files only)

```
~/moluxury/
├── .env.local                              ← DO NOT COMMIT
├── MASTER.md                               ← This file
├── scripts/
│   └── seed-products.mjs                  ← One-time seed script (already run)
├── src/
│   ├── middleware.ts                       ← Protects /admin/* (Edge runtime)
│   ├── lib/
│   │   ├── products.ts                     ← DEPRECATED. Storefront no longer reads this.
│   │   │                                      Keep for reference. Do not delete.
│   │   ├── cart-context.tsx                ← In-memory cart (not localStorage)
│   │   ├── wishlist-context.tsx            ← localStorage wishlist
│   │   └── supabase/
│   │       ├── client.ts                   ← Browser client (anon key) — admin auth only
│   │       ├── server.ts                   ← Server client + re-exports admin client
│   │       ├── admin-client.ts             ← Service role client + cache:no-store fix
│   │       ├── storefront.ts               ← getAllProducts(), getProductBySlug()
│   │       ├── types.ts                    ← DBProduct, Order, Booking, Category types
│   │       └── utils.ts                    ← getImageUrl() — handles /path and https://
│   ├── app/
│   │   ├── shop/
│   │   │   ├── page.tsx                    ← async server component, fetches from Supabase
│   │   │   ├── client.tsx                  ← accepts DBProduct[] prop
│   │   │   └── [slug]/
│   │   │       ├── page.tsx                ← async, fetches product + related from Supabase
│   │   │       └── client.tsx              ← accepts DBProduct + relatedProducts props
│   │   ├── admin/
│   │   │   ├── analytics/page.tsx          ← SVG charts, date filters, multi-series
│   │   │   ├── dashboard/page.tsx          ← fetches from /api/admin/stats
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx               ← fetches from /api/admin/orders
│   │   │   │   └── [id]/page.tsx          ← fetches from /api/admin/orders/[id]
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx               ← fetches from /api/admin/bookings
│   │   │   │   └── [id]/page.tsx          ← fetches from /api/admin/bookings/[id]
│   │   │   └── products/
│   │   │       ├── page.tsx               ← fetches from /api/admin/products (ALL incl. drafts)
│   │   │       ├── new/page.tsx
│   │   │       └── [slug]/edit/page.tsx
│   │   └── api/
│   │       ├── admin/
│   │       │   ├── stats/route.ts
│   │       │   ├── analytics/route.ts      ← accepts ?from=&to= date params
│   │       │   ├── products/route.ts       ← GET all (service role)
│   │       │   ├── product/route.ts        ← POST/PUT/DELETE (service role)
│   │       │   ├── orders/route.ts + [id]/route.ts
│   │       │   └── bookings/route.ts + [id]/route.ts
│   │       ├── confirm-order/route.ts      ← Writes order to Supabase FIRST, then emails
│   │       ├── send-booking/route.ts       ← Writes booking to Supabase, then email
│   │       └── revalidate/route.ts         ← Clears ISR cache for /shop, /shop/[slug], /
│   └── components/
│       ├── admin/
│       │   ├── image-uploader.tsx          ← Cloudinary widget (no Supabase Storage)
│       │   ├── product-editor.tsx          ← Calls /api/admin/product (NOT Supabase direct)
│       │   ├── sidebar.tsx                 ← Nav with Analytics link
│       │   └── status-badge.tsx
│       └── [storefront components...]
```

---

## 6. KNOWN ISSUES / REMAINING WORK

### Priority 1 — Email delivery (partly broken)
**Status:** `RESEND_FROM_EMAIL=onboarding@resend.dev` is Resend's sandbox address.
- Emails to `omosope43@gmail.com` (the Resend account owner) → work
- Emails to customers with arbitrary addresses → **silently blocked by Resend sandbox**
- Orders still save to Supabase (DB write is first, email is non-fatal)
- Admin sees the order in dashboard but customer gets no confirmation email

**To fix:** Verify a domain in Resend dashboard (resend.com/domains). Then:
```bash
# Update in Vercel:
RESEND_FROM_EMAIL=orders@yourdomain.com
# Then redeploy
```

### Priority 2 — Cart not persisted to localStorage
Cart is lost on page refresh. Wishlist persists fine. Add localStorage to `src/lib/cart-context.tsx` following the same pattern as `src/lib/wishlist-context.tsx` (hydration guard, useEffect load on mount, save on every change).

### Priority 3 — Expiring homepage/service images
Some images on the homepage and services pages may still use Figma URLs (in `src/lib/assets.ts`). These expire after ~7 days. Use `/admin/media` to upload replacements to Cloudinary, update `src/lib/assets.ts` with permanent URLs, and remove `www.figma.com` from `next.config.mjs` image domains.

### Priority 4 — Storefront product images (low priority)
All 30 seeded products have images as `/products/slug.jpg` paths (from the repo's `/public/` folder). These work fine. If you want admin-managed images for existing products, go to `/admin/products/[slug]/edit`, upload images via Cloudinary, and save. The new Cloudinary URL replaces the path.

### Priority 5 — Custom 404 page
No `app/not-found.tsx` exists. `notFound()` falls back to Next.js generic page. Create a branded page matching MoLuxury aesthetic.

### Priority 6 — Product views tracking
Analytics shows "no data" for product views because there's no tracking infrastructure. To add: create a `product_views` table in Supabase (product_slug, viewed_at), call an API route from the product detail page on load, query in analytics. Not implemented yet.

---

## 7. HOW THE ADMIN SAVE FLOW WORKS (read before touching product editor)

```
Admin fills in form (name, price, description, images, categories, etc.)
    ↓
Toggle switch = the ONLY publish control
  "Save & Publish" button → calls save() using toggle state (if ON → published)
  "Save as Draft" button  → calls save(false) → forces draft regardless of toggle
    ↓
save() function calls:
  PUT /api/admin/product  { id, ...allFields, is_published: publishValue }
    ↓
/api/admin/product (PUT handler):
  createAdminSupabaseClient() → service role → bypasses RLS
  supabase.from("products").update(payload).eq("id", id)
  Returns { product: updatedRow }
    ↓
On success:
  POST /api/revalidate?secret=...&slug=...
  Clears Next.js ISR cache for /shop/[slug], /shop, /
    ↓
Toast shown. Live site updates within 60 seconds.
```

**If you see saves not working:** Check the browser network tab for `/api/admin/product` — if it returns 4xx, the payload is likely missing a required field or the service role key expired.

---

## 8. HOW ORDERS FLOW FROM CUSTOMER TO ADMIN

```
Customer completes checkout → clicks "Confirm Order"
    ↓
POST /api/confirm-order {
  orderId, customerName, customerEmail, items, total, ...
}
    ↓
STEP 1 (always runs): Write to Supabase orders table via service role
  supabase.from("orders").upsert({ order_ref: orderId, ... })
    ↓
STEP 2 (non-fatal): Send customer confirmation email via Resend
  May fail if customer email is not verified in sandbox — DB record still saved
    ↓
STEP 3 (non-fatal): Send admin notification email
    ↓
Return { success: true } to customer
    ↓
Admin dashboard (/admin/orders) fetches GET /api/admin/orders → sees the order
```

**Bookings follow the same pattern** via `POST /api/send-booking`.

---

## 9. WHAT MUST NOT BE ASSUMED

1. **Do NOT assume admin pages call Supabase directly.** They don't — they call `/api/admin/*`. If you add a new admin feature and query Supabase directly from a client component, drafts will be invisible, counts will be wrong, and writes will fail.

2. **Do NOT assume `head: true` works for counts in Next.js.** Use `select("id", { count: "exact" })` instead.

3. **Do NOT assume emails reach customers.** Resend sandbox restriction. The DB record is written regardless.

4. **Do NOT assume `products.ts` is the data source.** The storefront reads from Supabase. `products.ts` is deprecated.

5. **Do NOT assume all product images are on Cloudinary.** Seeded products use `/products/slug.jpg` (local). Only new admin uploads go to Cloudinary. Both work.

6. **Do NOT use `use(params)` in Next.js 14.** It's a Next.js 15 API. Use `params.id` directly.

7. **Do NOT add `head: true` to count queries.** It doesn't work reliably with the cache: no-store setup.

8. **Do NOT delete `src/lib/products.ts`.** Marked deprecated — keep for reference.

9. **Do NOT push `--force` to git.**

10. **Do NOT expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code.**

---

## 10. WHAT SUCCESS LOOKS LIKE (the golden rule)

> Every change an admin makes reflects on the live website within 60 seconds. No code. No redeployment.

**You're done when:**
- [x] Admin logs in at `/admin` with magic link
- [x] Admin creates a product via `/admin/products/new`, uploads images via Cloudinary, saves → appears on storefront
- [x] Admin edits product name/price/publish toggle → reflects on live site
- [x] Admin can see and manage orders at `/admin/orders`
- [x] Admin can see and manage bookings at `/admin/bookings`
- [x] Draft products are visible in admin but hidden from storefront
- [x] Analytics page shows charts with date range filter
- [x] Orders placed on storefront appear in admin dashboard
- [x] Bookings made on services pages appear in admin dashboard
- [ ] Customer receives email confirmation after order ← blocked by Resend sandbox
- [ ] Cart persists on page refresh ← not yet implemented
- [ ] Homepage/service images are permanent URLs (not expiring Figma) ← in progress

---

## 11. BRAND REFERENCE

**Voice:** Quiet, editorial, intentional. Never explains itself.
- Sample: *"Wear luxury like it was made for you."* | *"Luxury isn't rushed."*

**Typography:** Cormorant Garamond (headings, italic) + Inter Tight (body)

**Colours:**
- `primary` = `#181b25` (near-black)
- `secondary` = `#666052` (warm gray)
- `surface` = `#f1ede7` (warm off-white)
- Admin accent: `#c9a96e` (gold)
- Admin background: `#0e0f11`, surfaces `#16181d`, borders `rgba(255,255,255,0.07)`

**Contact:**
- WhatsApp/Phone: `+2348144730948`
- Admin email: `omosope43@gmail.com`
- Resend account owner: `obalanatosin17@gmail.com`
- Payment: Opay | Account: `8144730948` | Name: MoLuxury

---

## 12. QUICK DIAGNOSTIC COMMANDS

Run these if something seems broken:

```bash
# Check all tables have data
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cmlyam9ybmxzcWVwYmxuZHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYyMTcyMSwiZXhwIjoyMDk2MTk3NzIxfQ.4OiRQlEa0dAMAjLKNAujNs1v76cl3S7WjwaHwkE6tts"

curl -s "https://aurirjornlsqepblndwa.supabase.co/rest/v1/products?select=count" \
  -H "Prefer: count=exact" -H "apikey:$SERVICE_KEY" -H "Authorization:Bearer $SERVICE_KEY" \
  -I | grep content-range
# Should show: 0-0/31

# Test product update API locally
curl -s -X PUT "http://localhost:3000/api/admin/product" \
  -H "Content-Type: application/json" \
  -d '{"id":"PRODUCT_UUID","slug":"test","name":"Test","price_naira":100000,"is_published":true,"images":[],"category_slugs":[],"available_lengths":[],"available_densities":[],"texture":"","cap_type":"HD Transparent Lace","origin":"100% Virgin Human Hair"}' \
  | python3 -m json.tool

# Test analytics API
curl -s "http://localhost:3000/api/admin/analytics?from=2026-01-01&to=2026-12-31" \
  | python3 -m json.tool
```

---

*Generated June 2026. Covers all development sessions.*
*Next session should start by reading this file and then asking: "What specifically do you want to work on today?"*
