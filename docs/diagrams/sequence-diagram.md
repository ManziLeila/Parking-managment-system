# Sequence Diagrams

Sequence diagrams show the interaction between different components over time in the Smart Parking Management System.

## 1. User Registration Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Backend
    participant Auth as AuthController
    participant Model as UserModel
    participant DB as PostgreSQL
    participant Utils as PasswordUtil
    participant JWT as JWT Library
    
    User->>Frontend: Fill registration form
    User->>Frontend: Click "Register"
    Frontend->>Frontend: Validate input (client-side)
    
    alt Invalid Input
        Frontend-->>User: Show validation errors
    else Valid Input
        Frontend->>API: POST /api/auth/register<br/>{name, email, password, phone}
        API->>Auth: register(req, res)
        Auth->>Auth: Extract request data
        
        Auth->>Model: findByEmail(email)
        Model->>DB: SELECT * FROM users WHERE email = ?
        DB-->>Model: Query result
        Model-->>Auth: User or null
        
        alt Email Already Exists
            Auth-->>API: 409 Conflict
            API-->>Frontend: {message: "Email already registered"}
            Frontend-->>User: Show error message
        else Email Available
            Auth->>Utils: hashPassword(password)
            Utils->>Utils: bcrypt.hash(password, 10)
            Utils-->>Auth: hashedPassword
            
            Auth->>Model: create({name, email, hashedPassword, role, phone})
            Model->>DB: INSERT INTO users VALUES (...)
            DB-->>Model: New user record
            Model-->>Auth: user
            
            Auth->>JWT: sign({id, role}, secret, {expiresIn: '7d'})
            JWT-->>Auth: token
            
            Auth-->>API: 201 Created<br/>{user, token, message}
            API-->>Frontend: {user, token, message}
            Frontend->>Frontend: Store token in localStorage
            Frontend->>Frontend: Update AuthContext
            Frontend-->>User: Redirect to dashboard
        end
    end
```

## 2. User Login Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Backend
    participant Auth as AuthController
    participant Model as UserModel
    participant DB as PostgreSQL
    participant Utils as PasswordUtil
    participant JWT as JWT Library
    
    User->>Frontend: Enter email & password
    User->>Frontend: Click "Login"
    Frontend->>Frontend: Validate input
    
    Frontend->>API: POST /api/auth/login<br/>{email, password}
    API->>Auth: login(req, res)
    
    Auth->>Model: findByEmail(email)
    Model->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Model: User record or null
    Model-->>Auth: user
    
    alt User Not Found
        Auth-->>API: 401 Unauthorized
        API-->>Frontend: {message: "Invalid credentials"}
        Frontend-->>User: Show error
    else User Found
        Auth->>Utils: compare(password, user.password)
        Utils->>Utils: bcrypt.compare(password, hash)
        Utils-->>Auth: boolean (match)
        
        alt Password Mismatch
            Auth-->>API: 401 Unauthorized
            API-->>Frontend: {message: "Invalid credentials"}
            Frontend-->>User: Show error
        else Password Match
            Auth->>JWT: sign({id, role}, secret, {expiresIn: '7d'})
            JWT-->>Auth: token
            
            Auth-->>API: 200 OK<br/>{user, token, message}
            API-->>Frontend: {user, token, message}
            Frontend->>Frontend: Store token in localStorage
            Frontend->>Frontend: Update AuthContext
            Frontend-->>User: Redirect to dashboard
        end
    end
```

## 3. View Available Parking Lots Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Backend
    participant Controller as ParkingLotController
    participant Model as ParkingLotModel
    participant DB as PostgreSQL
    
    User->>Frontend: Navigate to "Parking Lots"
    Frontend->>Frontend: useEffect() triggered
    
    Frontend->>API: GET /api/parking
    API->>Controller: getAll(req, res)
    
    Controller->>Model: findAll()
    Model->>DB: SELECT * FROM parking_lots<br/>ORDER BY id DESC
    DB-->>Model: Array of parking lots
    Model-->>Controller: lots[]
    
    Controller-->>API: 200 OK<br/>{lots: [...]}
    API-->>Frontend: {lots: [...]}
    
    Frontend->>Frontend: Update state with lots
    Frontend->>Frontend: Render lot cards
    Frontend-->>User: Display parking lots with:<br/>- Name<br/>- Location<br/>- Available slots<br/>- Total slots
```

## 4. Create Parking Reservation Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Backend
    participant Middleware as Auth Middleware
    participant Controller as ReservationController
    participant Model as ReservationModel
    participant DB as PostgreSQL
    participant QR as QRCode Library
    
    User->>Frontend: Select parking lot
    Frontend-->>User: Show reservation form
    User->>Frontend: Fill start/end time, slot number
    User->>Frontend: Click "Reserve"
    
    Frontend->>API: POST /api/reservations<br/>Authorization: Bearer <token><br/>{lot_id, start_time, end_time, slot_number}
    
    API->>Middleware: verifyToken(req, res, next)
    Middleware->>Middleware: Extract token from header
    Middleware->>Middleware: jwt.verify(token, secret)
    
    alt Invalid Token
        Middleware-->>API: 401 Unauthorized
        API-->>Frontend: {message: "Invalid token"}
        Frontend-->>User: Redirect to login
    else Valid Token
        Middleware->>Middleware: Attach user to req.user
        Middleware->>Controller: create(req, res)
        
        Controller->>Controller: Extract data from req.body
        Controller->>Controller: Get user_id from req.user.id
        
        Controller->>Model: createWithDecrement({user_id, lot_id, ...})
        
        Note over Model,DB: Transaction begins
        Model->>DB: BEGIN TRANSACTION
        Model->>DB: SELECT * FROM parking_lots<br/>WHERE id = ? FOR UPDATE
        DB-->>Model: Locked lot record
        
        alt No Available Slots
            Model->>DB: ROLLBACK
            Model-->>Controller: Error: "No available slots"
            Controller-->>API: 400 Bad Request
            API-->>Frontend: {message: "No available slots"}
            Frontend-->>User: Show error
        else Slots Available
            Model->>DB: UPDATE parking_lots<br/>SET available_slots = available_slots - 1<br/>WHERE id = ?
            Model->>DB: INSERT INTO reservations<br/>VALUES (...)
            DB-->>Model: New reservation record
            Model->>DB: COMMIT TRANSACTION
            Note over Model,DB: Transaction committed
            
            Model-->>Controller: reservation
            
            Controller->>QR: toDataURL(reservation.id)
            QR-->>Controller: qrCodeDataURL
            
            Controller-->>API: 201 Created<br/>{reservation, qrCode}
            API-->>Frontend: {reservation, qrCode}
            Frontend-->>User: Show success message<br/>Display QR code
        end
    end
```

## 5. Payment Processing Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Backend
    participant Middleware as Auth Middleware
    participant PayCtrl as PaymentController
    participant PayModel as PaymentModel
    participant ResModel as ReservationModel
    participant DB as PostgreSQL
    participant QR as QRCode Library
    participant UUID as UUID Library
    
    User->>Frontend: Navigate to "My Reservations"
    Frontend->>API: GET /api/reservations/my
    API-->>Frontend: {reservations: [...]}
    Frontend-->>User: Display reservations
    
    User->>Frontend: Click "Pay Now" on reservation
    Frontend-->>User: Show payment form
    User->>Frontend: Select payment method<br/>Enter details
    User->>Frontend: Click "Submit Payment"
    
    Frontend->>API: POST /api/payments<br/>Authorization: Bearer <token><br/>{reservation_id, amount, method}
    
    API->>Middleware: verifyToken(req, res, next)
    Middleware->>PayCtrl: create(req, res)
    
    PayCtrl->>PayCtrl: Extract payment data
    PayCtrl->>UUID: v4()
    UUID-->>PayCtrl: transaction_code
    
    PayCtrl->>PayModel: create({reservation_id, amount, method, status: 'pending', transaction_code})
    PayModel->>DB: INSERT INTO payments VALUES (...)
    DB-->>PayModel: Payment record
    PayModel-->>PayCtrl: payment
    
    Note over PayCtrl: Simulate payment processing
    PayCtrl->>PayCtrl: Process payment (mock)
    
    alt Payment Successful
        PayCtrl->>PayModel: markPaid(payment.id)
        PayModel->>DB: UPDATE payments<br/>SET status = 'paid', payment_time = NOW()<br/>WHERE id = ?
        DB-->>PayModel: Updated payment
        PayModel-->>PayCtrl: payment
        
        PayCtrl->>ResModel: findById(reservation_id)
        ResModel->>DB: SELECT * FROM reservations WHERE id = ?
        DB-->>ResModel: Reservation
        ResModel-->>PayCtrl: reservation
        
        PayCtrl->>QR: toDataURL(transaction_code)
        QR-->>PayCtrl: qrCodeDataURL
        
        PayCtrl-->>API: 201 Created<br/>{payment, reservation, qrCode}
        API-->>Frontend: {payment, reservation, qrCode}
        Frontend-->>User: Show receipt with QR code
    else Payment Failed
        PayCtrl-->>API: 400 Bad Request
        API-->>Frontend: {message: "Payment failed"}
        Frontend-->>User: Show error
    end
```

## 6. Admin Dashboard Data Loading Sequence

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as React Frontend
    participant API as Express Backend
    participant Middleware as Auth Middleware
    participant ReportCtrl as ReportController
    participant PayModel as PaymentModel
    participant ResModel as ReservationModel
    participant LotModel as ParkingLotModel
    participant DB as PostgreSQL
    
    Admin->>Frontend: Navigate to Admin Dashboard
    Frontend->>Frontend: useEffect() triggered
    
    Note over Frontend,API: Multiple parallel requests
    
    par Fetch Daily Revenue
        Frontend->>API: GET /api/reports/daily?date=2025-12-03
        API->>Middleware: verifyToken & checkRole('admin')
        Middleware->>ReportCtrl: dailyRevenue(req, res)
        ReportCtrl->>PayModel: sumByDay('2025-12-03')
        PayModel->>DB: SELECT SUM(amount)<br/>FROM payments<br/>WHERE status='paid' AND DATE(payment_time) = ?
        DB-->>PayModel: total
        PayModel-->>ReportCtrl: total
        ReportCtrl-->>Frontend: {total: 15000}
    and Fetch Revenue by Lot
        Frontend->>API: GET /api/reports/by-lot?date=2025-12-03
        API->>Middleware: verifyToken & checkRole('admin')
        Middleware->>ReportCtrl: revenueByLot(req, res)
        ReportCtrl->>PayModel: sumByDayPerLot('2025-12-03')
        PayModel->>DB: SELECT lot_id, SUM(amount)<br/>FROM payments JOIN reservations<br/>GROUP BY lot_id
        DB-->>PayModel: Array of {lot_id, lot_name, total}
        PayModel-->>ReportCtrl: lotRevenue[]
        ReportCtrl-->>Frontend: {data: [...]}
    and Fetch All Reservations
        Frontend->>API: GET /api/reservations
        API->>Middleware: verifyToken & checkRole('admin')
        Middleware->>ResModel: findAll()
        ResModel->>DB: SELECT * FROM reservations<br/>JOIN users JOIN parking_lots
        DB-->>ResModel: reservations[]
        ResModel-->>Frontend: {reservations: [...]}
    and Fetch All Parking Lots
        Frontend->>API: GET /api/parking
        API->>LotModel: findAll()
        LotModel->>DB: SELECT * FROM parking_lots
        DB-->>LotModel: lots[]
        LotModel-->>Frontend: {lots: [...]}
    end
    
    Frontend->>Frontend: Process data for charts
    Frontend->>Frontend: Render dashboard components
    Frontend-->>Admin: Display:<br/>- Revenue metrics<br/>- Charts<br/>- Recent reservations<br/>- Lot statistics
```

## 7. Admin Create Parking Lot Sequence

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as React Frontend
    participant API as Express Backend
    participant Middleware as Auth Middleware
    participant Controller as ParkingLotController
    participant Model as ParkingLotModel
    participant DB as PostgreSQL
    
    Admin->>Frontend: Navigate to "Manage Lots"
    Admin->>Frontend: Click "Create New Lot"
    Frontend-->>Admin: Show create form
    
    Admin->>Frontend: Fill form:<br/>- Name<br/>- Location<br/>- Total Slots
    Admin->>Frontend: Click "Create"
    
    Frontend->>Frontend: Validate input
    Frontend->>API: POST /api/parking<br/>Authorization: Bearer <token><br/>{name, location, total_slots}
    
    API->>Middleware: verifyToken(req, res, next)
    Middleware->>Middleware: Verify JWT
    Middleware->>Middleware: Check role === 'admin'
    
    alt Not Admin
        Middleware-->>API: 403 Forbidden
        API-->>Frontend: {message: "Admin access required"}
        Frontend-->>Admin: Show error
    else Is Admin
        Middleware->>Controller: create(req, res)
        
        Controller->>Controller: Extract data
        Controller->>Controller: Set available_slots = total_slots
        
        Controller->>Model: create({name, location, total_slots, available_slots})
        Model->>DB: INSERT INTO parking_lots<br/>VALUES (name, location, total_slots, available_slots)
        DB-->>Model: New parking lot record
        Model-->>Controller: lot
        
        Controller-->>API: 201 Created<br/>{lot}
        API-->>Frontend: {lot}
        Frontend->>Frontend: Add lot to state
        Frontend->>Frontend: Refresh lot list
        Frontend-->>Admin: Show success message<br/>Display updated list
    end
```

## 8. Reservation Cancellation Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Backend
    participant Middleware as Auth Middleware
    participant Controller as ReservationController
    participant Model as ReservationModel
    participant DB as PostgreSQL
    
    User->>Frontend: View "My Reservations"
    Frontend->>API: GET /api/reservations/my
    API-->>Frontend: {reservations: [...]}
    Frontend-->>User: Display reservations
    
    User->>Frontend: Click "Cancel" on reservation
    Frontend-->>User: Show confirmation dialog
    User->>Frontend: Confirm cancellation
    
    Frontend->>API: PATCH /api/reservations/:id/cancel<br/>Authorization: Bearer <token>
    
    API->>Middleware: verifyToken(req, res, next)
    Middleware->>Controller: cancel(req, res)
    
    Controller->>Controller: Extract reservation_id
    
    Note over Model,DB: Transaction begins
    Model->>DB: BEGIN TRANSACTION
    Model->>DB: SELECT * FROM reservations<br/>WHERE id = ? FOR UPDATE
    DB-->>Model: Locked reservation
    
    alt Invalid Status
        Model->>DB: ROLLBACK
        Model-->>Controller: Error: "Cannot cancel"
        Controller-->>API: 400 Bad Request
        API-->>Frontend: {message: "Cannot cancel this reservation"}
        Frontend-->>User: Show error
    else Valid for Cancellation
        Model->>DB: UPDATE reservations<br/>SET status = 'cancelled'<br/>WHERE id = ?
        
        Model->>DB: UPDATE parking_lots<br/>SET available_slots = available_slots + 1<br/>WHERE id = ?
        
        Model->>DB: COMMIT TRANSACTION
        Note over Model,DB: Transaction committed
        
        Model-->>Controller: Updated reservation
        Controller-->>API: 200 OK<br/>{reservation}
        API-->>Frontend: {reservation}
        Frontend->>Frontend: Update reservation in state
        Frontend-->>User: Show success message<br/>Update reservation list
    end
```

## Key Interaction Patterns

### 1. Authentication Pattern

All protected endpoints follow this pattern:
1. Frontend sends request with `Authorization: Bearer <token>` header
2. Middleware extracts and verifies JWT token
3. Middleware attaches user info to `req.user`
4. Controller accesses user data via `req.user.id` or `req.user.role`

### 2. Transaction Pattern

Critical operations use database transactions:
1. `BEGIN TRANSACTION`
2. `SELECT ... FOR UPDATE` (row-level lock)
3. Validate business rules
4. Perform updates
5. `COMMIT` or `ROLLBACK`

### 3. Error Handling Pattern

Consistent error responses:
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource
- **500 Internal Server Error**: Server error

### 4. Response Pattern

Successful responses include:
- **200 OK**: Successful GET/PATCH/DELETE
- **201 Created**: Successful POST
- Response body: `{data, message}` or `{resource}`

---

**Note**: These sequence diagrams show the happy path and common error scenarios. Additional error handling exists in the actual implementation.
