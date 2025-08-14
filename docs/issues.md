## Mock Shop Issues Tracker

Status key: [ ] open, [wip] in progress, [x] fixed/verified

### 14-Aug-2025 - Updated 15-Aug-2025
- [ ] Admin: Missing Order details page - **CONFIRMED STILL EXISTS**
  - 404 for `/admin/orders/[id]` page: There’s no page at that route (only API routes exist), so direct navigation returns 404. That’s expected because an order-details admin page has not been implemented yet.
  - Fix: create a order details page immidiately with high priority.

- [ ] Inventory/category note: 
  - Gardening category isn’t in seeds (categories are Electronics, Clothing, Home & Garden with slug home). That’s why tests/products created under “gardening” may appear uncategorized unless you supply the correct categoryId.
  - status: Investigation Pending

- [ ] Admin: Add product does not work - 
  - `http://localhost:3000/admin/products/new` leads to 404
  - status: Investigation Pending

- [ ] Admin: edit product does not work - 
  - `http://localhost:3000/admin/products/[id]/edit` leads to 404
  - status: Investigation Pending

- [ ] Admin: order filtering is not working
  - on `http://localhost:3000/admin/orders` after filtering confirmed shows no orders, while marking some orders as delivered, and then filtering delivered shows those orders.
  - status: Investigation Pending

- [ ] Admin: Missing Customers page
  - `http://localhost:3000/admin/customers` leads to 404
  - status: Investigation Pending

- [ ] Admin: Back to Dashboard Button misplaced
  - `Back to Dashboard` apears to be on the left of page heading in the same line rather than being on the top of it
  - status: Investigation Pending [required screenshots]

- [ ] User: Missing Feature-> Registered users do not have saved details
  - when the registered users proceed to checkout their details are not stored anywhere and aren't filled automatically
  - status: Investigation Pending

- [ ] User: Missing Feature-> No filter and sort on the catalog page
  - on the  product catalog on `http://localhost:3000/products` or `http://localhost:3000/products?category=[category]` pages there is no filter or sort options
  - status: Investigation Pending

- [ ] Next 15 dynamic APIs: synchronous `params` usage - **STATUS UNCLEAR**
  - Symptom: Dev error logs for `/api/products/[id]` and `/order-confirmation/[orderId]`: "Route ... used `params.X`. `params` should be awaited before using its properties."
  - Testing: Navigated to product detail pages, no visible params warnings in browser console. May only appear in server logs.
  - Impact: No functional break observed; pages respond correctly.
  - Fix: Update route handlers/pages to `await params` per Next.js 15 guidance.

- [ ] next/image with `fill` missing `sizes` - **CONFIRMED STILL EXISTS**
  - Symptom: Multiple console warnings observed: "Image with src '/images/tshirt1/tshirt.webp' has 'fill' but is missing 'sizes' prop"
  - Evidence: Warnings appear when navigating to product pages with multiple images.
  - Impact: Performance/layout optimization warnings; no functional break.
  - Fix: Add `sizes` prop to all `<Image>` components using `fill` (e.g., `sizes="(min-width: 1024px) 33vw, 100vw"`).

- [x] Cart context refresh issues - **MOSTLY FIXED**
  - Previous Symptom: Cart header count not updating after add-to-cart actions.
  - Testing Results: 
    - ✅ Product page → Add to Cart: Header count updates correctly (0→1)
    - ✅ Cart persistence: Cart contents maintained across navigation
    - ⚠️ Session restoration: Occasional 400 errors during page loads that resolve automatically
    - ❌ Wishlist persistence: Items added to wishlist don't persist (shows empty wishlist)
  - Status: Core cart functionality working; minor session restoration delays remain.

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

- [ ] Add to Cart does not update from the product detail page
  - Symptom: On `/products?category=clothing`, clicking "Add to Cart" shows an alert and header count increments from `0` to `1`. but when a product is clicked and etails open clisking on add to cart does not work.
  - status: Investigation Pending

- [wip] Customer can submit product review (queued for approval)
  - Symptom: On `/products/[id]`, selecting rating + entering comment then submitting shows success alert indicating moderation; form resets/disabled accordingly.
  - Status: Works; moderation flow to be verified in admin.


- [ ] Reorder button gives no feedback and does not navigate
  - Symptom: Clicking "Reorder Items" on `/account/orders` highlights the button but does not show a confirmation, add items back to cart, or navigate to checkout/cart.
  - Impact: Users cannot complete reorder flow.
  - Next: Implement reorder handler to add items to cart and redirect to `/cart` or `/checkout`, with success toast.
##
# New Issues Identified - 15-Aug-2025

- [ ] Wishlist persistence failure
  - Symptom: Items added to wishlist on product pages don't persist when navigating to `/account/wishlist` (shows empty).
  - Evidence: Wishlist button shows active state on product page, but wishlist page shows "0 items saved".
  - Impact: Wishlist functionality not working for users.
  - Fix: Debug wishlist API endpoints and ensure proper data persistence.

- [ ] Session restoration delays with 400 errors
  - Symptom: Occasional 400 (Bad Request) errors during page navigation that resolve automatically after a few seconds.
  - Evidence: Observed during cart loading and page transitions.
  - Impact: Temporary loading states and potential user confusion.
  - Fix: Improve session restoration handling and error recovery.

### Testing Status Update - 15-Aug-2025

**Issues Confirmed Still Exist:**
- ❌ Prisma SQLite relative path issue (DATABASE_URL path mismatch)
- ❌ next/image missing `sizes` prop warnings (multiple images affected)
- ❌ Wishlist persistence failure (new finding)
- ❌ Session restoration 400 errors (intermittent)

**Recommended Fixes:**
1. Update `.env` DATABASE_URL to `"file:./prisma/dev.db"`
2. Add `sizes` prop to all `<Image>` components using `fill`
3. Debug wishlist API endpoints for persistence issues
4. Improve session restoration error handling
5. Check server logs for Next.js 15 params warnings and update route handlers accordingly
---


## Summary of Issue Testing - 15-Aug-2025


### ❌ Issues Still Present:
1. **Prisma SQLite path** - DATABASE_URL uses `./dev.db` but file is at `./prisma/dev.db`
2. **Image sizing warnings** - Multiple `<Image>` components missing `sizes` prop
3. **Wishlist persistence** - Items don't persist when navigating to wishlist page
4. **Session restoration** - Occasional 400 errors during page loads (auto-resolve)

### ❓ Issues Unclear:
1. **Next.js 15 params warnings** - May only appear in server logs, not browser console

### 🔧 Priority Fixes Needed:
1. Fix DATABASE_URL path in `.env` file
2. Add `sizes` prop to Image components using `fill`
3. Debug wishlist API persistence issue
4. Investigate Next.js 15 params warnings in server logs