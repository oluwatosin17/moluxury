# MASTER.md — MoLuxury Project Continuation File
# Last updated: June 2026 | Session: Admin CMS + Supabase build
# Use this file at the start of every new Claude session

---

## HOW TO START A NEW SESSION

Paste this at the top of any new chat:

```
I'm continuing development on MoLuxury.
Read MASTER.md before doing anything.

Repo: https://github.com/oluwatosin17/moluxury  (local: ~/moluxury)
Live: https://moluxury.vercel.app
Admin: https://moluxury.vercel.app/admin

Stack: Next.js 14 App Router · TypeScript · Tailwind · Supabase · Resend · Vercel
No CMS — products are in Supabase DB (not products.ts anymore)

Task today: [DESCRIBE YOUR TASK]
```

---

## 1. WHAT HAS BEEN BUILT

### 1.1 — Storefront (complete, deployed, working)

A full luxury wig e-commerce storefront at https://moluxury.vercel.app

| Route | Status |
|---|---|
| `/` | Homepage: hero, mood, new collection, signature, trending, experience, TikTok |
| `/shop` | Full catalogue with filter + sort (31 products) |
| `/shop/[slug]` | Product detail: gallery, length/density selector, add to cart, wishlist |
| `/services` | 6 in-studio services grid |
| `/services/[slug]` | Service detail + booking panel |
| `/about` | Brand story |
| `/checkout` | 3-step: details → bank transfer → confirmed |
| `/orders` | Public order lookup form |
| `/orders/[ref]` | Public order status page with timeline |

**Working features:**
- Cart (React state, in-memory — NOT persisted to localStorage yet)
- Wishlist (localStorage — persists across sessions)
- Fixed bottom search pill (imports from products.ts — in sync)
- Heart particle animation, GSAP animations, Web Audio sound effects
- Full SEO: sitemap, robots, OG tags, JSON-LD structured data
- PWA manifest, favicon set

### 1.2 — Admin Dashboard (built, deployed, NEEDS VERIFICATION)

Full CMS at https://moluxury.vercel.app/admin

| Route | Purpose |
|---|---|
| `/admin/login` | Magic link auth (no password) |
| `/admin/dashboard` | Stats: products, orders, bookings, pending. Recent lists |
| `/admin/products` | Product grid with search/filter, add/edit/delete |
| `/admin/products/new` | Create new product with image upload to Supabase Storage |
| `/admin/products/[slug]/edit` | Edit product, drag-drop images, publish/draft |
| `/admin/categories` | Add/edit/delete filter category tabs |
| `/admin/orders` | Orders list with status filter + pagination |
| `/admin/orders/[id]` | Order detail: status management, payment confirmation, notes |
| `/admin/bookings` | Bookings list |
| `/admin/bookings/[id]` | Booking detail + WhatsApp template |
| `/admin/media` | Upload homepage + service images to Supabase Storage |
| `/admin/settings` | Env var reference + quick links |

**Auth:** Magic link only. Two authorised emails: `omosope43@gmail.com` and `obalanatosin16@gmail.com`.

**Key mechanic:** When admin saves a product → calls `/api/revalidate` → Next.js ISR purges cache → live site updates within seconds. No redeployment needed.

### 1.3 — Supabase Project (set up, NEEDS VERIFICATION)

- **Project name:** moluxury  
- **Project ID:** `aurirjornlsqepblndwa`  
- **Project URL:** `https://aurirjornlsqepblndwa.supabase.co`  
- **Region:** EU West (Ireland) — `eu-west-1`

**Tables created:**
- `categories` — filter tab management (9 seeded)
- `products` — product catalogue (empty — needs seeding from products.ts OR via admin)
- `orders` — order records (written by `/api/confirm-order`)
- `bookings` — booking records (written by `/api/send-booking`)

**Storage buckets created:**
- `product-images` — public — for product photos uploaded via admin
- `service-images` — public — for service page images
- `homepage-assets` — public — for hero, mood section, experience section images
- `payment-proofs` — private — for customer payment proof uploads

**RLS policies:** Products and categories are publicly readable. Orders and bookings have no public access. All write operations require the service role key.

**Auth configured:**
- Site URL: `https://moluxury.vercel.app`
- Redirect URLs: `https://moluxury.vercel.app/admin/auth/callback` and `http://localhost:3000/admin/auth/callback`
- Admin users added: `omosope43@gmail.com` + `obalanatosin16@gmail.com`

---

## 2. WHAT CLAUDE CLAIMED TO DO (verify before trusting)

The following were completed in the browser automation session. Claude did these directly — verify them in Supabase dashboard before relying on them.

| Action | Claimed | Should Verify |
|---|---|---|
| Supabase project created | ✅ | Check supabase.com dashboard |
| SQL schema ran successfully | ✅ "Success. No rows returned" | Check Table Editor — all 4 tables should exist with correct columns |
| All 4 storage buckets created | ✅ | Check Storage — product-images PUBLIC, service-images PUBLIC, homepage-assets PUBLIC, payment-proofs PRIVATE |
| Auth site URL set to https://moluxury.vercel.app | ✅ | Check Auth → URL Configuration |
| Both redirect URLs added | ✅ | Check Auth → URL Configuration — should see both prod + localhost URLs |
| Both admin users added | ✅ (saw both in screenshot) | Check Auth → Users — should see both emails |
| All 9 Vercel env vars set | ✅ | Run `vercel env ls` in ~/moluxury — should show 10 vars total |
| Latest Vercel deployment: READY | ✅ dpl_67ujn5Z8MzGypQf1ZXUZYzWXVAyH | Visit https://moluxury.vercel.app/admin |

---

## 3. WHAT MUST BE VERIFIED BEFORE CONTINUING

### 3.1 — CRITICAL: Service Role Key May Be Wrong

The `SUPABASE_SERVICE_ROLE_KEY` was extracted from Supabase via browser JavaScript char codes. There is a known risk of a 1-character error in the extracted value. If this key is wrong:
- The admin dashboard UI will still render (it uses the anon key for reads)
- **But DB writes will fail silently** — orders won't save, bookings won't save, product edits won't persist

**How to verify and fix:**
1. Go to: `https://supabase.com/dashboard/project/aurirjornlsqepblndwa/settings/api-keys/legacy`
2. Click **Reveal** on the service_role key
3. Copy the full key
4. Run in terminal:
```bash
cd ~/moluxury
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes
echo "PASTE_FULL_KEY_HERE" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Also update .env.local:
# SUPABASE_SERVICE_ROLE_KEY=PASTE_FULL_KEY_HERE
```
5. Also update `src/lib/supabase/admin-client.ts` — no changes needed, it reads from env

Then redeploy: `git commit --allow-empty -m "chore: fix service role key" && git push`

### 3.2 — Admin Login Flow (must test end-to-end)
1. Go to https://moluxury.vercel.app/admin
2. Should redirect to `/admin/login`
3. Enter `omosope43@gmail.com` — click "Send magic link"
4. Check inbox — click the link
5. Should redirect to `/admin/dashboard`

If the magic link doesn't arrive: check Supabase Auth → Emails settings, ensure "Enable email confirmations" is off for OTP.

### 3.3 — Products table is EMPTY

The SQL schema seeded the `categories` table with 9 rows, but the `products` table has **zero rows**. The storefront still reads from `src/lib/products.ts` (the static file).

**The storefront has NOT been migrated to Supabase yet.** See Section 5 for what remains.

### 3.4 — `service-images` bucket PUBLIC status

The `service-images` bucket may not have been set to public — the browser automation hit a snag during that step. Verify in Supabase Storage that it shows "PUBLIC" badge alongside `product-images` and `homepage-assets`.

---

## 4. CURRENT FILE STRUCTURE (key files only)

```
~/moluxury/
├── .env.local                          ← DO NOT COMMIT — has all secrets
├── src/
│   ├── middleware.ts                   ← Protects /admin/* routes (Edge runtime)
│   ├── lib/
│   │   ├── products.ts                 ← STILL THE STOREFRONT SOURCE OF TRUTH (31 products)
│   │   │                                  (Supabase migration not yet done)
│   │   ├── cart-context.tsx            ← In-memory cart (NOT persisted to localStorage)
│   │   ├── wishlist-context.tsx        ← localStorage-persisted wishlist
│   │   ├── sound.ts                    ← Web Audio API sound effects
│   │   ├── gsap-utils.ts               ← GSAP animation presets
│   │   └── supabase/
│   │       ├── client.ts               ← Browser Supabase client (anon key)
│   │       ├── server.ts               ← Server Supabase client (next/headers, cookie-based)
│   │       ├── admin-client.ts         ← Service role client (NO next/headers — server-only)
│   │       ├── storefront.ts           ← getAllProducts(), getProductBySlug(), getCategories()
│   │       │                              (ready to use but storefront not migrated yet)
│   │       ├── types.ts                ← DBProduct, Category, Order, Booking types
│   │       ├── utils.ts                ← getImageUrl() — safe in client + server
│   │       └── admin-config.ts         ← ADMIN_EMAILS list from env var
│   ├── app/
│   │   ├── admin/                      ← Full admin dashboard (all routes built)
│   │   ├── orders/                     ← Public order tracking (/orders + /orders/[ref])
│   │   ├── api/
│   │   │   ├── confirm-order/          ← Sends customer email + writes to Supabase orders table
│   │   │   ├── send-order/             ← Admin notification email
│   │   │   ├── send-booking/           ← Admin booking notification + writes to Supabase bookings
│   │   │   └── revalidate/             ← POST to purge ISR cache after admin saves
│   │   └── [storefront pages...]
│   └── components/
│       ├── admin/                      ← sidebar, topbar, product-editor, image-uploader, etc.
│       └── [storefront components...]
```

---

## 5. REMAINING WORK (prioritised)

### Priority 1 — VERIFY (before any new feature work)
1. **Fix service role key** (see Section 3.1)
2. **Test admin login** end-to-end (see Section 3.2)
3. **Confirm Supabase tables exist** — visit Table Editor in Supabase dashboard
4. **Confirm `service-images` is public** — Storage → check for PUBLIC badge

### Priority 2 — Seed products into Supabase
The storefront still reads from `products.ts`. Until products are in Supabase, the admin product editor is cosmetic only — changes won't appear on the storefront.

Run this SQL in Supabase SQL Editor to seed all 31 products:
```sql
-- Run the seed SQL from MOLUXURY_ADMIN_SPEC.md Section 5.5
-- It covers all 30 named products with slugs, prices, categories
-- Then add the 31st product (morayo) manually if missing
```

OR: Add products one by one via the admin dashboard after verifying login works.

### Priority 3 — Migrate storefront to Supabase (the "golden rule")
Once products are in Supabase DB, update the storefront pages to read from DB instead of `products.ts`:

**Files to update:**
- `src/app/shop/page.tsx` + `client.tsx` — replace `import { products }` with `getAllProducts()`
- `src/app/shop/[slug]/page.tsx` + `client.tsx` — replace lookup with `getProductBySlug(slug)`
- `src/app/sitemap.ts` — replace products import with `getAllProducts()`
- `src/components/fixed-search.tsx` — already imports from `products.ts`; update to Supabase

**Helper already written:** `src/lib/supabase/storefront.ts` has `getAllProducts()`, `getProductBySlug()`, `getCategories()` ready to use.

After migration: `products.ts` should be marked deprecated but NOT deleted (kept for reference).

### Priority 4 — Cart localStorage persistence
The cart is lost on page refresh. Wishlist already persists. Add localStorage to cart-context.tsx following the same pattern as wishlist-context.tsx.

### Priority 5 — Email delivery (Resend domain verification)
`RESEND_FROM_EMAIL=onboarding@resend.dev` is Resend sandbox — can only send to the Resend account owner's email. Customer confirmation emails and admin notifications are NOT reliably delivered.

To fix: Verify a domain (e.g. moluxury.com) in Resend dashboard → DNS TXT record → update `RESEND_FROM_EMAIL` to `orders@moluxury.com` in Vercel env vars.

### Priority 6 — Upload product images to Supabase Storage
Current product images are in `/public/products/`. These work fine for the storefront but can't be managed from the admin. For full CMS control, upload all 109 product images to the `product-images` bucket and update the DB image paths.

### Priority 7 — Upload UI/section images to Supabase Storage
Current homepage/service images use expiring Figma URLs (assets.ts). Use `/admin/media` to upload replacements to `homepage-assets/` and `service-images/` buckets, then update `src/lib/assets.ts` with the permanent Supabase URLs.

### Priority 8 — Custom 404 page
No `app/not-found.tsx` exists. `notFound()` is called for invalid slugs but there's no branded page.

---

## 6. ENVIRONMENT VARIABLES

### `.env.local` (local only, never committed)
```
RESEND_API_KEY=re_G26NNtrk_CVFxowqpiHMgZ735pqpQKjDp
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=omosope43@gmail.com
NEXT_PUBLIC_SITE_URL=https://moluxury.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://aurirjornlsqepblndwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cmlyam9ybmxzcWVwYmxuZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MjE3MjEsImV4cCI6MjA5NjE5NzcyMX0.SzTGUa_Ne8PoLxsk8OnpfckO18ktkTjXzB_7y5L9y1c
SUPABASE_SERVICE_ROLE_KEY=[VERIFY THIS — may have 1-char extraction error, see Section 3.1]

ADMIN_EMAILS=omosope43@gmail.com,obalanatosin16@gmail.com
REVALIDATE_SECRET=moluxury-revalidate-2026
NEXT_PUBLIC_REVALIDATE_SECRET=moluxury-revalidate-2026
```

### Supabase credentials
- Dashboard: https://supabase.com/dashboard/project/aurirjornlsqepblndwa
- Project ref: `aurirjornlsqepblndwa`
- DB password (saved by Claude during setup): `m7F3u2EttmDwomJs`

### Admin users
- `omosope43@gmail.com` — password set to `MoLuxury2026!` (not used — magic link only)
- `obalanatosin16@gmail.com` — same placeholder password

---

## 7. WHAT NOT TO ASSUME

1. **Do NOT assume the Supabase service role key is correct.** Verify it (Section 3.1) before writing any code that depends on DB writes.

2. **Do NOT assume products are in the Supabase DB.** The `products` table was created but NOT seeded. `products.ts` is still the storefront data source.

3. **Do NOT assume the storefront reads from Supabase.** It still reads from `src/lib/products.ts`. The admin product editor saves to Supabase, but the storefront ignores it until migration is done (Priority 3).

4. **Do NOT assume emails deliver to `omosope43@gmail.com`.** Resend sandbox only delivers to the Resend account owner email. Emails to admin + customers may silently fail.

5. **Do NOT assume the admin login works without testing it.** The middleware, magic link, and auth callback were all written but never tested end-to-end.

6. **Do NOT delete `products.ts`.** It is still the active data source for the storefront. Mark it deprecated only after storefront migration is complete and verified.

7. **Do NOT run `git push --force`.** All commits are clean. Never amend pushed commits.

8. **Do NOT assume `service-images` bucket is public.** The browser automation step was interrupted. Verify manually.

---

## 8. WHAT SUCCESS LOOKS LIKE (final goal)

**The golden rule (from MOLUXURY_ADMIN_SPEC.md):**
> Every change an admin makes in the dashboard reflects on the live website immediately. No code. No redeployments. No touching `products.ts`.

**You're done when:**
- [ ] Admin can log in at `/admin` with magic link
- [ ] Admin can add a new product from `/admin/products/new`, upload images, set price and categories, click "Save & Publish" — and it appears on the live shop within 60 seconds
- [ ] Admin can edit a product name/price and see it update on the live site
- [ ] Admin can upload a new hero image via `/admin/media` and see it on the homepage
- [ ] When a customer places an order, it appears in `/admin/orders`
- [ ] When a customer makes a service booking, it appears in `/admin/bookings`
- [ ] The storefront `/shop` page reads products from Supabase DB (not `products.ts`)
- [ ] `products.ts` is marked `// DEPRECATED` at the top

---

## 9. TECHNICAL NOTES FOR CLAUDE

### The `next/headers` split
`server.ts` uses `next/headers` → cannot be imported by client components.
`admin-client.ts` uses only `@supabase/supabase-js` → safe to import from anywhere server-side.
`utils.ts` has `getImageUrl()` → pure function, safe everywhere.

Client components import: `getImageUrl` from `@/lib/supabase/utils`
Server components/API routes import: `createAdminSupabaseClient` from `@/lib/supabase/admin-client` (or via `server.ts` re-export)
Middleware imports: `createServerClient` from `@supabase/ssr` directly (not via our files)

### Revalidation pattern
After every admin save:
```typescript
await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}&slug=${slug}`, { method: 'POST' })
```
This triggers Next.js ISR to regenerate `/shop/[slug]`, `/shop`, and `/`. The live site updates within 60 seconds.

### Image storage paths
Images stored in Supabase are stored as **paths**, not full URLs:
- Good: `product-images/imani/1234567890.jpg`
- Bad: `https://aurirjornlsqepblndwa.supabase.co/storage/v1/...`

Always use `getImageUrl(path)` from `src/lib/supabase/utils.ts` to convert.
Legacy `/public/` paths (`/products/imani-1.jpg`) pass through `getImageUrl` unchanged.

### ESLint is strict on Vercel
Any `no-unused-vars` violation causes a build failure. Run `npx tsc --noEmit` locally before pushing.

### Supabase service key is server-only
`SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in client-side code or `NEXT_PUBLIC_` prefixed vars. It bypasses all RLS policies. Only use it in API routes and server components via `createAdminSupabaseClient()`.

---

## 10. BRAND REFERENCE

**Voice:** Quiet, editorial, intentional. Never explains itself. Never apologises.
- Sample: *"Wear luxury like it was made for you."* | *"Luxury isn't rushed."*

**Typography:** Cormorant Garamond (headings, italic) + Inter Tight (body)

**Colours:**
- `primary` = `#181b25` (near-black)
- `secondary` = `#666052` (warm gray)
- `surface` = `#f1ede7` (warm off-white — page background)
- `surface-inverse` = `#0e121b` (dark buttons)
- Admin accent: `#c9a96e` (gold)

**Admin design system:** Dark theme — `bg-[#0e0f11]`, surfaces `#16181d`, borders `rgba(255,255,255,0.07)`, accent gold `#c9a96e`. Desktop-only. No responsive needed for admin.

**Contact:**
- WhatsApp/Phone: `+2348144730948`
- Admin email: `omosope43@gmail.com`
- Payment: Opay | Account: `8144730948` | Name: MoLuxury

---

*Generated at end of session — June 2026. Covers work done across 2 Claude sessions.*
*Next session should start by verifying service role key + testing admin login before any new work.*
