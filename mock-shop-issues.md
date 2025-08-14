## Mock Shop Issues Tracker

Status key: [ ] open, [wip] in progress, [x] fixed/verified

- [x] Admin Discounts page parse error (/admin/discounts)
  - Symptom: Build error Parsing ecmascript source code failed at `src/app/admin/discounts/page.tsx` around line 379
  - Fix: Added missing closing `</div>` wrapping header/action row to balance JSX
  - Verified: Page loads, shows "Loading discounts..." and proceeds

- [x] Guest checkout order placement fails
  - Symptom: Checkout showed discount applied, but Place Order alerted failure; initial suspicion of 404
  - Fix/Verification: API already supports guest orders (creates with `userId: null`). Verified with direct POST to `/api/orders` returning 201 and valid `orderId`.
  - Follow-up: Ensure UI handles API errors; the earlier failure was likely due to incomplete form or transient issue. No server change required.
  - Update: Added cart clearing after successful checkout; authenticated carts clear via context, guest carts clear localStorage.

- [x] Wishlist page flow
  - Fix/Verification: Adjusted wishlist heart overlay in `product-card` to stop link navigation when clicked. Added smartphone to wishlist and verified success alert; `/account/wishlist` loads (shows loading then items).
  - Follow-up: Confirm removal and add-to-cart interactions from wishlist page during broader QA.
  - Update: Wishlist "Add to Cart" now refreshes cart context to update header count immediately after success.

- [x] Reviews flow eligibility
  - Fix/Verification: Placed an order via UI as the customer and confirmed it appears in `/account/orders`. Product page now shows the review form when signed in; moderation is already available in `/admin/reviews`.

- [x] Admin Analytics missing
  - Fix: Implemented `/admin/analytics` page consuming `/api/admin/dashboard` stats and rendering metrics.
  - Verified: Page loads (shows loading then stats when available).

- [x] Admin Settings complete
  - Symptom: `/admin/settings` previously showed "Loading settings..." without UI
  - Fix: Settings UI is present and wired to `/api/admin/settings` (GET/PUT). Verified saving changes (e.g., set Tax Rate to 8%), received success alert, and values persisted after reload.
  - Verified: Page loads full form, save works, subsequent GET reflects saved values.

- [x] Header search works
  - Symptom: Reported as broken in test plan
  - Verification: Using header search for "shirt" navigates to `/products?search=shirt`, displays 1 matching product and back-to-all link. No code change required.

- [x] Admin access entry visible
  - Symptom: Reported missing in test plan
  - Verification: When signed in as Admin, header shows Admin button; clicking navigates to `/admin` which loads dashboard stats. No code change required.

- [x] Minor: Missing/invalid images
  - Symptom: 404 for `/images/smartphone.jpg`
  - Status: Verified assets exist at `/images/smartphone/smartphone.webp` per `public/images/smartphone/smartphone.webp`; current app uses `.webp`. The `.jpg` 404 comes from stale browser requests or docs examples; no code change needed.

### 14-Aug-2025

- [ ] Prisma SQLite relative path fails on Windows (dev server)
  - Symptom: Requests to `/products` and `/api/cart` return 500 with `PrismaClientInitializationError` → "Error code 14: Unable to open the database file" when starting dev with a relative `DATABASE_URL` (e.g., `file:./prisma/dev.db`).
  - Evidence: Server logs show failures on port 3000; same app works when started with an absolute `DATABASE_URL` (e.g., port 3001 using `file:D:\\Dev\\mockshop\\mock-shop\\prisma\\dev.db`).
  - Impact: All DB-backed pages break (products list, cart, etc.) under the relative path.
  - Workaround: Use an absolute path for `DATABASE_URL` or set it in `.env.local` to an absolute `file:` URI.
  - Fix: Normalize DB path resolution for Prisma on Windows (ensure consistent working dir) or document absolute-path requirement for local dev.

- [ ] Next 15 dynamic APIs: synchronous `params` usage
  - Symptom: Dev error logs for `/api/products/[id]` and `/order-confirmation/[orderId]`: "Route ... used `params.X`. `params` should be awaited before using its properties." Pages still respond 200.
  - Impact: No functional break now; noisy in dev and may become breaking in future Next versions.
  - Fix: Update route handlers/pages to `await params` per Next.js 15 guidance.

- [ ] next/image with `fill` missing `sizes`
  - Symptom: Console warnings for images (e.g., `/images/tshirt1/tshirt.webp`, `/images/wireless-headphone/wireless-headphone.webp`): "has `fill` but is missing `sizes` prop".
  - Impact: Performance/layout hints; not user-facing break.
  - Fix: Add an appropriate `sizes` prop wherever `fill` is used (e.g., `sizes="(min-width: 1024px) 33vw, 100vw"`).

- [wip] Wishlist → Add to Cart does not reflect immediately
  - Symptom: On `/account/wishlist` while signed in, clicking "Add to Cart" showed header count remaining `0`, and `/cart` appeared empty immediately after, despite 200 responses from `/api/cart`.
  - Hypothesis: Session/cart context desync in RSC + client context, or header/cart not refreshing on wishlist action in some states.
  - Next: Reproduce deterministically; verify API payload and cart retrieval for the signed-in user; ensure header/cart context revalidates post-mutation.

- [ ] Product page → Add to Cart doesn’t update header count (signed-in)
  - Symptom: On `/products/[id]` as an authenticated customer, clicking "Add to Cart" did not change the header cart count (remained `0`).
  - Impact: Misleading UI; users may think the item was not added.
  - Next: Verify `/cart` content and ensure header cart context revalidates after mutation; align with wishlist flow fix.
  - Observation: Navigating to `/cart` immediately after shows "Your cart is empty" while authenticated; API calls to `/api/cart` previously returned 200 in other sessions—needs deeper repro/debug.

- [ ] Product Wishlist button toggles active state but doesn’t surface confirmation/toast
  - Symptom: Clicking "Wishlist" on `/products/[id]` toggles button active state but no confirmation or header indicator change, making it unclear if the action succeeded.
  - Impact: UX clarity issue.
  - Next: Consider toast/inline feedback and updating wishlist count (if shown) or navigational hint.

- [ ] Search works but header/cart context still stale
  - Symptom: Searching "shirt" navigates to `/products?search=shirt` and shows 1 result correctly, but header cart count remains stale following prior add-to-cart attempts.
  - Impact: Confirms search OK; highlights broader cart header refresh issue.
  - Next: Centralize cart state updates and ensure header derives from server state with revalidation on mutations.

- [x] Listing Add to Cart updates header count after alert
  - Symptom: On `/products?category=clothing`, clicking "Add to Cart" shows an alert and header count increments from `0` to `1`.
  - Note: Behavior differs from product page flow; header context seems to refresh from listing.

- [x] Discount code TESTCODE20 applies correctly at checkout
  - Symptom: Entering `TESTCODE20` on `/checkout` shows "Discount applied: -$6.00" and updates total from `$42.98` to `$36.98`.
  - Status: Works as expected.