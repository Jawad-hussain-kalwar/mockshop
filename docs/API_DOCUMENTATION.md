# API Documentation

## Overview

The Mock Shop API provides RESTful endpoints for managing an e-commerce application. All endpoints return JSON responses and use standard HTTP status codes.

## Authentication

Most endpoints require authentication via NextAuth.js sessions. Admin endpoints additionally require the user to have an `ADMIN` role.

### Authentication Headers
```
Cookie: next-auth.session-token=<session-token>
```

## Base URL
```
http://localhost:3000/api
```

## Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## Endpoints

### Authentication

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }
}
```

### Products

#### GET /api/products
Get all active products with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category slug
- `search` (optional): Search in product names and descriptions
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response:**
```json
{
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "stockQuantity": 100,
      "images": "['/images/product.jpg']",
      "category": {
        "id": "category_id",
        "name": "Category Name"
      }
    }
  ]
}
```

#### GET /api/products/[id]
Get a single product by ID.

**Response:**
```json
{
  "product": {
    "id": "product_id",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "stockQuantity": 100,
    "images": "['/images/product.jpg']",
    "category": {
      "id": "category_id",
      "name": "Category Name"
    },
    "reviews": [
      {
        "id": "review_id",
        "rating": 5,
        "comment": "Great product!",
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

### Cart Management

#### GET /api/cart
Get the current user's cart items.

**Authentication:** Required

**Response:**
```json
{
  "items": [
    {
      "id": "cart_item_id",
      "quantity": 2,
      "product": {
        "id": "product_id",
        "name": "Product Name",
        "price": 29.99,
        "images": "['/images/product.jpg']",
        "stockQuantity": 100
      }
    }
  ],
  "total": 59.98
}
```

#### POST /api/cart
Add an item to the cart.

**Authentication:** Required

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

**Response:**
```json
{
  "message": "Item added to cart"
}
```

#### PUT /api/cart
Update cart item quantity.

**Authentication:** Required

**Request Body:**
```json
{
  "itemId": "cart_item_id",
  "quantity": 3
}
```

**Response:**
```json
{
  "message": "Cart updated"
}
```

#### DELETE /api/cart
Remove an item from the cart.

**Authentication:** Required

**Request Body:**
```json
{
  "itemId": "cart_item_id"
}
```

**Response:**
```json
{
  "message": "Item removed from cart"
}
```

### Orders

#### GET /api/orders
Get the current user's orders.

**Authentication:** Required

**Response:**
```json
{
  "orders": [
    {
      "id": "order_id",
      "status": "CONFIRMED",
      "subtotal": 29.99,
      "discountAmount": 0,
      "total": 32.99,
      "createdAt": "2024-01-01T00:00:00Z",
      "items": [
        {
          "id": "order_item_id",
          "quantity": 1,
          "price": 29.99,
          "product": {
            "id": "product_id",
            "name": "Product Name",
            "images": "['/images/product.jpg']"
          }
        }
      ]
    }
  ]
}
```

#### POST /api/orders
Create a new order.

**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 1,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US"
  },
  "paymentMethod": "card",
  "discountCode": "WELCOME10",
  "discountAmount": 3.00,
  "subtotal": 29.99,
  "total": 32.99
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "orderId": "order_id",
  "order": {
    "id": "order_id",
    "status": "CONFIRMED",
    "total": 32.99,
    "items": [...]
  }
}
```

### User Profile

#### GET /api/user/profile
Get the current user's profile information.

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/user/profile
Update the current user's profile.

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Admin Endpoints

### Admin Dashboard

#### GET /api/admin/dashboard
Get dashboard statistics for admin users.

**Authentication:** Required (Admin role)

**Response:**
```json
{
  "stats": {
    "totalProducts": 10,
    "totalOrders": 25,
    "totalCustomers": 15,
    "totalRevenue": 1250.50,
    "lowStockProducts": 2,
    "pendingOrders": 3
  }
}
```

### Admin Product Management

#### GET /api/admin/products
Get all products for admin management.

**Authentication:** Required (Admin role)

**Response:**
```json
{
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "stockQuantity": 100,
      "images": "['/images/product.jpg']",
      "isActive": true,
      "category": {
        "id": "category_id",
        "name": "Category Name"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/admin/products
Create a new product.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 29.99,
  "categoryId": "category_id",
  "stockQuantity": 100,
  "images": ["/images/product.jpg"]
}
```

**Response:**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": "product_id",
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "stockQuantity": 100,
    "isActive": true,
    "category": {
      "id": "category_id",
      "name": "Category Name"
    }
  }
}
```

#### GET /api/admin/products/[id]
Get a single product for admin management.

**Authentication:** Required (Admin role)

**Response:**
```json
{
  "product": {
    "id": "product_id",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "stockQuantity": 100,
    "images": "['/images/product.jpg']",
    "isActive": true,
    "category": {
      "id": "category_id",
      "name": "Category Name"
    }
  }
}
```

#### PUT /api/admin/products/[id]
Update a product.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 39.99,
  "categoryId": "category_id",
  "stockQuantity": 150,
  "images": ["/images/updated-product.jpg"],
  "isActive": true
}
```

**Response:**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": "product_id",
    "name": "Updated Product",
    "price": 39.99,
    "stockQuantity": 150
  }
}
```

#### PATCH /api/admin/products/[id]
Partially update a product (e.g., toggle active status).

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": "product_id",
    "isActive": false
  }
}
```

#### DELETE /api/admin/products/[id]
Delete a product.

**Authentication:** Required (Admin role)

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting for API endpoints.

## CORS

CORS is configured to allow requests from the same origin. For production deployment, configure CORS appropriately for your domain.