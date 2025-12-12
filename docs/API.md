# API Documentation

Complete REST API reference for the Smart Parking Management System.

**Base URL**: `http://localhost:5000/api`

## Table of Contents

- [Authentication](#authentication)
- [Parking Lots](#parking-lots)
- [Reservations](#reservations)
- [Payments](#payments)
- [Reports](#reports)
- [Error Codes](#error-codes)

---

## Authentication

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`  
**Authentication**: None  
**Role**: Public

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "securePassword123",
  "phone": "+250788123456",
  "role": "driver"  // Optional, defaults to "driver"
}
```

**Success Response** (201 Created):
```json
{
  "message": "Registered",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@university.edu",
    "role": "driver",
    "phone_number": "+250788123456",
    "created_at": "2025-12-03T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `409 Conflict`: Email already registered
- `500 Internal Server Error`: Server error

---

### Login

Authenticate and receive a JWT token.

**Endpoint**: `POST /auth/login`  
**Authentication**: None  
**Role**: Public

**Request Body**:
```json
{
  "email": "john@university.edu",
  "password": "securePassword123"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Logged in",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@university.edu",
    "role": "driver",
    "phone_number": "+250788123456"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

---

### Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /auth/me`  
**Authentication**: Required  
**Role**: Any authenticated user

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@university.edu",
    "role": "driver",
    "phone_number": "+250788123456",
    "created_at": "2025-12-03T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

## Parking Lots

### List All Parking Lots

Get all available parking lots.

**Endpoint**: `GET /parking`  
**Authentication**: None  
**Role**: Public

**Success Response** (200 OK):
```json
{
  "lots": [
    {
      "id": 1,
      "name": "Main Campus Parking",
      "location": "Building A, Ground Floor",
      "total_slots": 100,
      "available_slots": 45,
      "created_at": "2025-12-01T08:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Faculty Parking",
      "location": "Building B, Level 2",
      "total_slots": 50,
      "available_slots": 12,
      "created_at": "2025-12-01T08:00:00.000Z"
    }
  ]
}
```

---

### Get Single Parking Lot

Get details of a specific parking lot.

**Endpoint**: `GET /parking/:id`  
**Authentication**: None  
**Role**: Public

**URL Parameters**:
- `id` (integer): Parking lot ID

**Success Response** (200 OK):
```json
{
  "lot": {
    "id": 1,
    "name": "Main Campus Parking",
    "location": "Building A, Ground Floor",
    "total_slots": 100,
    "available_slots": 45,
    "created_at": "2025-12-01T08:00:00.000Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Parking lot not found

---

### Create Parking Lot

Create a new parking lot (Admin only).

**Endpoint**: `POST /parking`  
**Authentication**: Required  
**Role**: Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "New Parking Lot",
  "location": "Building C, Level 1",
  "total_slots": 75
}
```

**Success Response** (201 Created):
```json
{
  "lot": {
    "id": 3,
    "name": "New Parking Lot",
    "location": "Building C, Level 1",
    "total_slots": 75,
    "available_slots": 75,
    "created_at": "2025-12-03T12:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not an admin user
- `500 Internal Server Error`: Server error

---

### Update Parking Lot

Update an existing parking lot (Admin only).

**Endpoint**: `PUT /parking/:id`  
**Authentication**: Required  
**Role**: Admin

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (integer): Parking lot ID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Parking Lot Name",
  "location": "Updated Location",
  "total_slots": 80,
  "available_slots": 50
}
```

**Success Response** (200 OK):
```json
{
  "lot": {
    "id": 3,
    "name": "Updated Parking Lot Name",
    "location": "Updated Location",
    "total_slots": 80,
    "available_slots": 50,
    "created_at": "2025-12-03T12:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not an admin user
- `404 Not Found`: Parking lot not found
- `500 Internal Server Error`: Server error

---

### Delete Parking Lot

Delete a parking lot (Admin only).

**Endpoint**: `DELETE /parking/:id`  
**Authentication**: Required  
**Role**: Admin

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (integer): Parking lot ID

**Success Response** (200 OK):
```json
{
  "message": "Parking lot deleted"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not an admin user
- `404 Not Found`: Parking lot not found
- `500 Internal Server Error`: Server error

---

## Reservations

### Create Reservation

Create a new parking reservation.

**Endpoint**: `POST /reservations`  
**Authentication**: Required  
**Role**: Driver or Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "lot_id": 1,
  "slot_number": "A12",
  "start_time": "2025-12-03T08:00:00Z",
  "end_time": "2025-12-03T17:00:00Z"
}
```

**Success Response** (201 Created):
```json
{
  "reservation": {
    "id": 101,
    "user_id": 1,
    "lot_id": 1,
    "slot_number": "A12",
    "start_time": "2025-12-03T08:00:00.000Z",
    "end_time": "2025-12-03T17:00:00.000Z",
    "status": "booked",
    "created_at": "2025-12-03T07:30:00.000Z"
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields or no available slots
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### Get My Reservations

Get all reservations for the authenticated user.

**Endpoint**: `GET /reservations/my`  
**Authentication**: Required  
**Role**: Driver or Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "reservations": [
    {
      "id": 101,
      "user_id": 1,
      "lot_id": 1,
      "lot_name": "Main Campus Parking",
      "location": "Building A, Ground Floor",
      "slot_number": "A12",
      "start_time": "2025-12-03T08:00:00.000Z",
      "end_time": "2025-12-03T17:00:00.000Z",
      "status": "booked",
      "created_at": "2025-12-03T07:30:00.000Z"
    }
  ]
}
```

---

### Get All Reservations

Get all reservations (Admin only).

**Endpoint**: `GET /reservations`  
**Authentication**: Required  
**Role**: Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "reservations": [
    {
      "id": 101,
      "user_id": 1,
      "user_name": "John Doe",
      "lot_id": 1,
      "lot_name": "Main Campus Parking",
      "slot_number": "A12",
      "start_time": "2025-12-03T08:00:00.000Z",
      "end_time": "2025-12-03T17:00:00.000Z",
      "status": "booked",
      "created_at": "2025-12-03T07:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not an admin user

---

### Cancel Reservation

Cancel a reservation.

**Endpoint**: `PUT /reservations/:id/cancel`  
**Authentication**: Required  
**Role**: Driver (own reservations) or Admin

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (integer): Reservation ID

**Success Response** (200 OK):
```json
{
  "reservation": {
    "id": 101,
    "user_id": 1,
    "lot_id": 1,
    "slot_number": "A12",
    "start_time": "2025-12-03T08:00:00.000Z",
    "end_time": "2025-12-03T17:00:00.000Z",
    "status": "cancelled",
    "created_at": "2025-12-03T07:30:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Cannot cancel (invalid status)
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not authorized to cancel this reservation
- `404 Not Found`: Reservation not found

---

### Complete Reservation

Mark a reservation as completed (Admin only).

**Endpoint**: `PUT /reservations/:id/complete`  
**Authentication**: Required  
**Role**: Admin

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (integer): Reservation ID

**Success Response** (200 OK):
```json
{
  "reservation": {
    "id": 101,
    "status": "completed"
  }
}
```

---

## Payments

### Create Payment

Create a payment for a reservation.

**Endpoint**: `POST /payments`  
**Authentication**: Required  
**Role**: Driver or Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "reservation_id": 101,
  "amount": 5000,
  "method": "mobile_money"  // or "credit_card", "cash"
}
```

**Success Response** (201 Created):
```json
{
  "payment": {
    "id": 201,
    "reservation_id": 101,
    "amount": 5000,
    "method": "mobile_money",
    "status": "paid",
    "transaction_code": "TXN-550e8400-e29b-41d4-a716-446655440000",
    "payment_time": "2025-12-03T08:00:00.000Z",
    "created_at": "2025-12-03T08:00:00.000Z"
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields or invalid reservation
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### Get Payment Receipt

Get payment receipt with QR code.

**Endpoint**: `GET /payments/receipt/:reservationId`  
**Authentication**: Required  
**Role**: Driver (own payments) or Admin

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `reservationId` (integer): Reservation ID

**Success Response** (200 OK):
```json
{
  "payment": {
    "id": 201,
    "reservation_id": 101,
    "amount": 5000,
    "method": "mobile_money",
    "status": "paid",
    "transaction_code": "TXN-550e8400-e29b-41d4-a716-446655440000",
    "payment_time": "2025-12-03T08:00:00.000Z"
  },
  "reservation": {
    "id": 101,
    "lot_name": "Main Campus Parking",
    "slot_number": "A12",
    "start_time": "2025-12-03T08:00:00.000Z",
    "end_time": "2025-12-03T17:00:00.000Z"
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgo..."
}
```

---

## Reports

### Daily Revenue

Get total revenue for a specific date (Admin only).

**Endpoint**: `GET /reports/daily?date=2025-12-03`  
**Authentication**: Required  
**Role**: Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `date` (string): Date in YYYY-MM-DD format

**Success Response** (200 OK):
```json
{
  "date": "2025-12-03",
  "total": 125000
}
```

---

### Revenue by Parking Lot

Get revenue breakdown by parking lot (Admin only).

**Endpoint**: `GET /reports/by-lot?date=2025-12-03`  
**Authentication**: Required  
**Role**: Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `date` (string): Date in YYYY-MM-DD format

**Success Response** (200 OK):
```json
{
  "date": "2025-12-03",
  "data": [
    {
      "lot_id": 1,
      "lot_name": "Main Campus Parking",
      "total": 75000
    },
    {
      "lot_id": 2,
      "lot_name": "Faculty Parking",
      "total": 50000
    }
  ]
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

### Error Response Format

All errors follow this format:

```json
{
  "message": "Error description"
}
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained from the `/auth/register` or `/auth/login` endpoints and are valid for 7 days.

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes

---

**API Version**: 1.0.0  
**Last Updated**: December 2025
