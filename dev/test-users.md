# Test User Credentials

This file contains the test user credentials for the Mock Shop application. These accounts are created during database seeding and can be used for testing different user roles and functionality.

## 👤 Customer Account

**Email:** `customer@mockshop.com`  
**Password:** `password123`  
**Role:** Customer  
**Name:** John Doe  

### Customer Features Access:
- ✅ Browse products and categories
- ✅ Add items to cart and wishlist
- ✅ Complete checkout process
- ✅ Apply discount codes
- ✅ View order history
- ✅ Manage account settings
- ✅ Leave product reviews

---

## 👨‍💼 Admin Account

**Email:** `admin@mockshop.com`  
**Password:** `password123`  
**Role:** Admin  
**Name:** Admin User  

### Admin Features Access:
- ✅ All customer features
- ✅ Admin dashboard with statistics
- ✅ Product management (CRUD operations)
- ✅ Order management and status updates
- ✅ Customer management
- ✅ Review moderation
- ✅ Discount code management
- ✅ Shop settings configuration
- ✅ Analytics and reports

---

## 🎫 Test Discount Codes

**Code:** `TESTCODE20`  
**Type:** Percentage  
**Value:** 20% off  
**Status:** Active  
**Minimum Order:** None  
**Usage Limit:** Unlimited  
**Expiration:** None  

### How to Test:
1. Add items to cart (total should be > $0)
2. Go to checkout
3. Enter `TESTCODE20` in discount code field
4. Click "Apply"
5. Verify 20% discount is applied

---

## 🛒 Test Products

The application includes 3 sample products:

1. **T-Shirt** - $29.99 (Clothing)
2. **Smartphone** - $699.99 (Electronics)  
3. **Wireless Headphones** - $199.99 (Electronics)

---

## 🧪 Testing Scenarios

### Customer Journey Test:
1. Sign in as customer
2. Browse products and add to cart
3. Apply discount code at checkout
4. Complete order with test payment info
5. View order in account history

### Admin Workflow Test:
1. Sign in as admin
2. Access admin dashboard
3. Manage products, orders, and settings
4. Create new discount codes
5. View analytics and reports

---

## 📝 Notes

- All passwords are `password123` for simplicity
- Accounts are created automatically during database seeding
- Admin users have access to all customer features plus admin panel
- The admin button appears in the header only for admin users
- Sessions persist across page navigation for logged-in users
- Cart contents are saved for registered users

---

## 🔧 Development Commands

```bash
# Reset database and reseed with test data
npm run db:reset

# View database in Prisma Studio
npx prisma studio

# Start development server
npm run dev
```