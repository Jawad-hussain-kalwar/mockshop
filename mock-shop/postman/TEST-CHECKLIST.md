# Mock Shop API Testing Checklist

This checklist ensures comprehensive testing coverage for all API endpoints and functionality.

## 🚀 Pre-Test Setup

### Environment Setup
- [ ] Mock Shop server is running (`npm run dev`)
- [ ] Database is seeded with test data (`npm run db:seed`)
- [ ] Postman is installed and configured
- [ ] Newman CLI is installed (`npm install -g newman newman-reporter-html`)
- [ ] Environment variables are properly configured

### Health Check
- [ ] Run health check script: `node health-check.js`
- [ ] Verify all critical endpoints are responding
- [ ] Check database connectivity
- [ ] Confirm authentication system is working

## 🧪 Test Execution Checklist

### 1. Authentication & Authorization Tests

#### User Registration (POST /api/auth/signup)
- [ ] ✅ Valid user registration with all required fields
- [ ] ✅ Admin user registration with role specification
- [ ] ❌ Registration with missing required fields
- [ ] ❌ Registration with invalid email format
- [ ] ❌ Registration with duplicate email
- [ ] ❌ Registration with weak password
- [ ] ✅ Response contains user data without password
- [ ] ✅ User role is correctly assigned

#### Session Management
- [ ] ✅ Session token generation on successful login
- [ ] ✅ Session validation for protected endpoints
- [ ] ❌ Access denied for invalid/expired sessions
- [ ] ✅ Session cleanup on logout

### 2. Product Management Tests

#### Public Product Endpoints
- [ ] ✅ GET /api/products - Retrieve all active products
- [ ] ✅ GET /api/products/{id} - Retrieve single product with details
- [ ] ✅ Product filtering by category
- [ ] ✅ Product filtering by price range (minPrice, maxPrice)
- [ ] ✅ Product search functionality
- [ ] ✅ Product data includes all required fields
- [ ] ✅ Product reviews are included in single product view
- [ ] ❌ Non-existent product returns 404
- [ ] ❌ Invalid product ID format handling

#### Product Data Validation
- [ ] ✅ Price is numeric and positive
- [ ] ✅ Stock quantity is integer and non-negative
- [ ] ✅ Category information is included
- [ ] ✅ Images array is properly formatted
- [ ] ✅ Product status (active/inactive) is respected

### 3. Shopping Cart Tests

#### Cart Operations (Authenticated Users)
- [ ] ✅ GET /api/cart - Retrieve user's cart items
- [ ] ✅ POST /api/cart - Add item to cart
- [ ] ✅ PUT /api/cart - Update cart item quantity
- [ ] ✅ DELETE /api/cart - Remove item from cart
- [ ] ✅ Cart total calculation is accurate
- [ ] ✅ Stock validation when adding items
- [ ] ❌ Cart operations require authentication
- [ ] ❌ Adding out-of-stock items is prevented

#### Cart Data Integrity
- [ ] ✅ Cart persists across sessions for registered users
- [ ] ✅ Cart items include product details
- [ ] ✅ Quantity updates reflect immediately
- [ ] ✅ Removed items are completely deleted
- [ ] ✅ Cart totals update with quantity changes

### 4. Order Management Tests

#### Order Creation (POST /api/orders)
- [ ] ✅ Create order with valid cart items
- [ ] ✅ Order includes shipping address validation
- [ ] ✅ Order includes billing address validation
- [ ] ✅ Payment method validation
- [ ] ✅ Discount code application (if applicable)
- [ ] ✅ Order total calculation with taxes/fees
- [ ] ✅ Stock reduction after order creation
- [ ] ❌ Order creation requires authentication
- [ ] ❌ Invalid payment method rejection

#### Order Retrieval (GET /api/orders)
- [ ] ✅ Retrieve user's order history
- [ ] ✅ Orders include all item details
- [ ] ✅ Order status is correctly displayed
- [ ] ✅ Order dates are properly formatted
- [ ] ❌ Users can only see their own orders

### 5. User Profile Tests

#### Profile Management
- [ ] ✅ GET /api/user/profile - Retrieve user profile
- [ ] ✅ PUT /api/user/profile - Update user profile
- [ ] ✅ Profile data validation (email format, required fields)
- [ ] ❌ Profile operations require authentication
- [ ] ❌ Email uniqueness validation on updates

#### Profile Data Security
- [ ] ✅ Password is never returned in profile data
- [ ] ✅ Sensitive data is properly protected
- [ ] ✅ Profile updates are validated
- [ ] ✅ User can only access their own profile

### 6. Admin Functionality Tests

#### Admin Dashboard (GET /api/admin/dashboard)
- [ ] ✅ Dashboard statistics are accurate
- [ ] ✅ Total products count
- [ ] ✅ Total orders count
- [ ] ✅ Total customers count
- [ ] ✅ Revenue calculations
- [ ] ✅ Low stock alerts
- [ ] ✅ Pending orders count
- [ ] ❌ Admin role required for access

#### Admin Product Management
- [ ] ✅ GET /api/admin/products - All products (including inactive)
- [ ] ✅ POST /api/admin/products - Create new product
- [ ] ✅ GET /api/admin/products/{id} - Single product for editing
- [ ] ✅ PUT /api/admin/products/{id} - Update product
- [ ] ✅ PATCH /api/admin/products/{id} - Partial update (status toggle)
- [ ] ✅ DELETE /api/admin/products/{id} - Delete product
- [ ] ❌ All admin endpoints require admin role
- [ ] ❌ Regular users cannot access admin endpoints

#### Product Creation/Update Validation
- [ ] ✅ Required fields validation
- [ ] ✅ Price validation (positive numbers)
- [ ] ✅ Stock quantity validation (non-negative integers)
- [ ] ✅ Category assignment validation
- [ ] ✅ Image URL validation
- [ ] ❌ Invalid data rejection with clear error messages

### 7. Security & Validation Tests

#### Input Validation
- [ ] ❌ SQL injection attempts are blocked
- [ ] ❌ XSS attempts are sanitized
- [ ] ❌ Invalid JSON is handled gracefully
- [ ] ❌ Oversized payloads are rejected
- [ ] ❌ Invalid data types are rejected
- [ ] ❌ Missing required fields are caught

#### Authentication Security
- [ ] ❌ Unauthenticated access to protected endpoints
- [ ] ❌ Invalid session tokens are rejected
- [ ] ❌ Expired sessions are handled
- [ ] ❌ Role-based access control is enforced
- [ ] ✅ Password hashing is implemented
- [ ] ✅ Sensitive data is not exposed in responses

#### Error Handling
- [ ] ✅ Consistent error response format
- [ ] ✅ Appropriate HTTP status codes
- [ ] ✅ Clear error messages for users
- [ ] ❌ Internal errors don't expose system details
- [ ] ✅ Validation errors include field-specific messages

### 8. Performance Tests

#### Response Time Validation
- [ ] ✅ GET /api/products responds within 500ms
- [ ] ✅ GET /api/products/{id} responds within 300ms
- [ ] ✅ POST /api/orders responds within 1000ms
- [ ] ✅ GET /api/admin/dashboard responds within 800ms
- [ ] ✅ All endpoints respond within acceptable limits

#### Load Testing
- [ ] ✅ Handle 100 concurrent product requests
- [ ] ✅ Handle 50 concurrent single product requests
- [ ] ✅ Handle 20 concurrent order creations
- [ ] ✅ Handle 10 concurrent admin dashboard requests
- [ ] ✅ System remains stable under load

#### Resource Usage
- [ ] ✅ Memory usage remains reasonable
- [ ] ✅ Database connections are properly managed
- [ ] ✅ No memory leaks detected
- [ ] ✅ Response sizes are optimized

### 9. Edge Cases & Error Scenarios

#### Data Edge Cases
- [ ] ❌ Empty search queries
- [ ] ❌ Very long search strings
- [ ] ❌ Special characters in search
- [ ] ❌ Negative price filters
- [ ] ❌ Zero quantity cart additions
- [ ] ❌ Non-existent product IDs
- [ ] ❌ Non-existent user IDs

#### System Edge Cases
- [ ] ❌ Database connection failures
- [ ] ❌ External service timeouts
- [ ] ❌ Disk space limitations
- [ ] ❌ Network connectivity issues
- [ ] ✅ Graceful degradation when possible

### 10. Integration Tests

#### End-to-End Workflows
- [ ] ✅ Complete user registration → login → browse → add to cart → checkout flow
- [ ] ✅ Admin login → create product → manage inventory → view orders flow
- [ ] ✅ User profile updates → order history → reorder flow
- [ ] ✅ Product search → filter → view details → add to cart flow

#### Cross-Feature Integration
- [ ] ✅ Cart items reflect product price changes
- [ ] ✅ Order creation reduces product stock
- [ ] ✅ User profile updates reflect in orders
- [ ] ✅ Admin product changes appear in public catalog

## 📊 Test Execution Commands

### Quick Tests
```bash
# Health check
npm run health-check

# Smoke tests (basic functionality)
npm run test:api

# Full test suite
npm run test:api:full
```

### Specific Test Suites
```bash
# Security tests
npm run test:api:security

# Performance tests
npm run test:api:performance

# Authentication tests
cd postman && node run-api-tests.js auth

# Admin functionality tests
cd postman && node run-api-tests.js admin
```

### Custom Test Runs
```bash
# Multiple iterations for load testing
cd postman && node run-api-tests.js performance --iterations 5

# Slower execution for debugging
cd postman && node run-api-tests.js full --delay 1000

# Multiple test suites
cd postman && node run-api-tests.js smoke security performance
```

## 📋 Test Results Validation

### Success Criteria
- [ ] All smoke tests pass (100%)
- [ ] Security tests show no vulnerabilities
- [ ] Performance tests meet response time requirements
- [ ] Authentication flows work correctly
- [ ] Admin functionality is properly protected
- [ ] Error handling is consistent and user-friendly

### Report Review
- [ ] HTML reports generated successfully
- [ ] JSON reports available for CI/CD integration
- [ ] Test coverage meets requirements (>95%)
- [ ] No critical failures in production-like scenarios
- [ ] Performance benchmarks are met

## 🚨 Failure Investigation

### Common Issues Checklist
- [ ] Server is running and accessible
- [ ] Database is properly seeded
- [ ] Environment variables are correct
- [ ] Network connectivity is stable
- [ ] Required dependencies are installed

### Debug Steps
1. [ ] Run health check to identify basic issues
2. [ ] Check server logs for errors
3. [ ] Verify database state and connections
4. [ ] Test individual endpoints manually
5. [ ] Review test scripts for logic errors
6. [ ] Check environment configuration

## ✅ Sign-off

### Test Execution Sign-off
- [ ] All critical tests executed successfully
- [ ] Test reports reviewed and approved
- [ ] Performance benchmarks met
- [ ] Security validation completed
- [ ] Documentation updated

**Tester:** _________________ **Date:** _________

**Reviewer:** _________________ **Date:** _________

---

## 📝 Notes

Use this space for additional notes, observations, or issues discovered during testing:

```
[Add your testing notes here]
```