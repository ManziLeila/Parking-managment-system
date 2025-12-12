# Data Flow Diagrams (DFD)

Data Flow Diagrams show how data moves through the Smart Parking Management System.

## Level 0: Context Diagram

The context diagram shows the system as a single process with external entities.

```mermaid
flowchart TB
    subgraph External_Entities
        DRIVER[Driver/Student]
        ADMIN[Administrator]
        DB[(Database)]
    end
    
    subgraph System
        PARKING[Smart Parking<br/>Management System]
    end
    
    DRIVER -->|Registration Info| PARKING
    DRIVER -->|Login Credentials| PARKING
    DRIVER -->|Reservation Request| PARKING
    DRIVER -->|Payment Info| PARKING
    
    PARKING -->|Authentication Token| DRIVER
    PARKING -->|Available Lots| DRIVER
    PARKING -->|Reservation Confirmation| DRIVER
    PARKING -->|Receipt & QR Code| DRIVER
    
    ADMIN -->|Login Credentials| PARKING
    ADMIN -->|Lot Management Data| PARKING
    ADMIN -->|Report Requests| PARKING
    
    PARKING -->|Authentication Token| ADMIN
    PARKING -->|Dashboard Data| ADMIN
    PARKING -->|Reports & Analytics| ADMIN
    
    PARKING <-->|User Data<br/>Lot Data<br/>Reservation Data<br/>Payment Data| DB
```

## Level 1: Major Processes

This diagram breaks down the system into major functional processes.

```mermaid
flowchart TB
    subgraph External
        DRIVER[Driver]
        ADMIN[Admin]
    end
    
    subgraph Data_Stores
        D1[(D1: Users)]
        D2[(D2: Parking Lots)]
        D3[(D3: Reservations)]
        D4[(D4: Payments)]
    end
    
    subgraph Processes
        P1[P1: Authentication<br/>& Authorization]
        P2[P2: Parking Lot<br/>Management]
        P3[P3: Reservation<br/>Management]
        P4[P4: Payment<br/>Processing]
        P5[P5: Reporting &<br/>Analytics]
    end
    
    DRIVER -->|Registration/Login Info| P1
    P1 -->|JWT Token| DRIVER
    P1 <-->|User Credentials| D1
    
    DRIVER -->|View Lots Request| P2
    P2 -->|Available Lots| DRIVER
    P2 <-->|Lot Data| D2
    
    ADMIN -->|Lot CRUD Operations| P2
    P2 -->|Operation Result| ADMIN
    
    DRIVER -->|Reservation Request| P3
    P3 -->|Confirmation & QR| DRIVER
    P3 <-->|Reservation Data| D3
    P3 <-->|Update Availability| D2
    P3 -->|User Info| D1
    
    DRIVER -->|Payment Info| P4
    P4 -->|Receipt & QR| DRIVER
    P4 <-->|Payment Records| D4
    P4 -->|Reservation ID| D3
    
    ADMIN -->|Report Request| P5
    P5 -->|Reports & Charts| ADMIN
    P5 -->|Revenue Data| D4
    P5 -->|Reservation Stats| D3
    P5 -->|Lot Usage| D2
```

## Level 2: Detailed Process Breakdown

### 2.1 Authentication & Authorization Process (P1)

```mermaid
flowchart TB
    USER[User] -->|Registration Data| P1_1[P1.1: Validate<br/>Registration]
    P1_1 -->|Validated Data| P1_2[P1.2: Hash<br/>Password]
    P1_2 -->|Hashed Password| P1_3[P1.3: Create<br/>User Account]
    P1_3 <-->|User Record| D1[(D1: Users)]
    P1_3 -->|User Created| P1_4[P1.4: Generate<br/>JWT Token]
    P1_4 -->|Token| USER
    
    USER -->|Login Credentials| P1_5[P1.5: Validate<br/>Login]
    P1_5 <-->|User Data| D1
    P1_5 -->|Validated| P1_6[P1.6: Verify<br/>Password]
    P1_6 -->|Match| P1_4
    P1_6 -->|No Match| P1_7[P1.7: Return<br/>Error]
    P1_7 -->|Error Message| USER
```

### 2.2 Parking Lot Management Process (P2)

```mermaid
flowchart TB
    DRIVER[Driver] -->|View Request| P2_1[P2.1: Fetch<br/>All Lots]
    P2_1 <-->|Query Lots| D2[(D2: Parking Lots)]
    P2_1 -->|Lot List| DRIVER
    
    ADMIN[Admin] -->|Create Lot| P2_2[P2.2: Validate<br/>Lot Data]
    P2_2 -->|Valid Data| P2_3[P2.3: Create<br/>Lot Record]
    P2_3 -->|Insert| D2
    P2_3 -->|Success| ADMIN
    
    ADMIN -->|Update Lot| P2_4[P2.4: Validate<br/>Update Data]
    P2_4 -->|Valid Data| P2_5[P2.5: Update<br/>Lot Record]
    P2_5 <-->|Update| D2
    P2_5 -->|Success| ADMIN
    
    ADMIN -->|Delete Lot| P2_6[P2.6: Check<br/>Dependencies]
    P2_6 <-->|Check Reservations| D3[(D3: Reservations)]
    P2_6 -->|No Dependencies| P2_7[P2.7: Delete<br/>Lot Record]
    P2_7 -->|Delete| D2
    P2_7 -->|Success| ADMIN
    P2_6 -->|Has Dependencies| P2_8[P2.8: Return<br/>Error]
    P2_8 -->|Error| ADMIN
```

### 2.3 Reservation Management Process (P3)

```mermaid
flowchart TB
    DRIVER[Driver] -->|Reservation Request| P3_1[P3.1: Validate<br/>Request]
    P3_1 -->|Valid| P3_2[P3.2: Begin<br/>Transaction]
    P3_2 -->|Lock Row| P3_3[P3.3: Check<br/>Availability]
    P3_3 <-->|Query| D2[(D2: Parking Lots)]
    
    P3_3 -->|Available| P3_4[P3.4: Decrement<br/>Slots]
    P3_4 -->|Update| D2
    P3_4 -->|Success| P3_5[P3.5: Create<br/>Reservation]
    P3_5 -->|Insert| D3[(D3: Reservations)]
    P3_5 -->|Success| P3_6[P3.6: Commit<br/>Transaction]
    P3_6 -->|Success| P3_7[P3.7: Generate<br/>QR Code]
    P3_7 -->|Confirmation| DRIVER
    
    P3_3 -->|Not Available| P3_8[P3.8: Rollback<br/>Transaction]
    P3_8 -->|Error| DRIVER
    
    DRIVER -->|View Reservations| P3_9[P3.9: Fetch<br/>User Reservations]
    P3_9 <-->|Query| D3
    P3_9 <-->|Lot Info| D2
    P3_9 -->|Reservation List| DRIVER
    
    DRIVER -->|Cancel Request| P3_10[P3.10: Update<br/>Status]
    P3_10 -->|Update| D3
    P3_10 -->|Success| P3_11[P3.11: Increment<br/>Slots]
    P3_11 -->|Update| D2
    P3_11 -->|Confirmation| DRIVER
```

### 2.4 Payment Processing Process (P4)

```mermaid
flowchart TB
    DRIVER[Driver] -->|Payment Request| P4_1[P4.1: Validate<br/>Payment Data]
    P4_1 -->|Valid| P4_2[P4.2: Calculate<br/>Amount]
    P4_2 <-->|Get Reservation| D3[(D3: Reservations)]
    P4_2 -->|Amount| P4_3[P4.3: Process<br/>Payment]
    
    P4_3 -->|Success| P4_4[P4.4: Generate<br/>Transaction Code]
    P4_4 -->|Code| P4_5[P4.5: Create<br/>Payment Record]
    P4_5 -->|Insert| D4[(D4: Payments)]
    P4_5 -->|Success| P4_6[P4.6: Mark<br/>as Paid]
    P4_6 -->|Update| D4
    P4_6 -->|Success| P4_7[P4.7: Update<br/>Reservation]
    P4_7 -->|Update Status| D3
    P4_7 -->|Success| P4_8[P4.8: Generate<br/>Receipt & QR]
    P4_8 -->|Receipt| DRIVER
    
    P4_3 -->|Failed| P4_9[P4.9: Log<br/>Failure]
    P4_9 -->|Error| DRIVER
```

### 2.5 Reporting & Analytics Process (P5)

```mermaid
flowchart TB
    ADMIN[Admin] -->|Daily Revenue Request| P5_1[P5.1: Query<br/>Daily Payments]
    P5_1 <-->|Sum Payments| D4[(D4: Payments)]
    P5_1 -->|Total| P5_2[P5.2: Format<br/>Report]
    P5_2 -->|Report| ADMIN
    
    ADMIN -->|Revenue by Lot| P5_3[P5.3: Query<br/>Lot Revenue]
    P5_3 <-->|Payment Data| D4
    P5_3 <-->|Reservation Data| D3[(D3: Reservations)]
    P5_3 <-->|Lot Data| D2[(D2: Parking Lots)]
    P5_3 -->|Grouped Data| P5_4[P5.4: Generate<br/>Chart Data]
    P5_4 -->|Chart| ADMIN
    
    ADMIN -->|Usage Stats| P5_5[P5.5: Calculate<br/>Occupancy]
    P5_5 <-->|Lot Data| D2
    P5_5 <-->|Reservation Data| D3
    P5_5 -->|Stats| P5_6[P5.6: Generate<br/>Analytics]
    P5_6 -->|Dashboard| ADMIN
```

## Data Store Specifications

### D1: Users

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| name | String | User full name |
| email | String | Unique email address |
| password | String | Hashed password |
| role | String | 'driver' or 'admin' |
| phone_number | String | Contact number |
| created_at | Timestamp | Registration date |

**Inputs**: Registration data, login credentials  
**Outputs**: User profile, authentication data  
**Processes**: P1 (Authentication)

### D2: Parking Lots

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| name | String | Lot name |
| location | String | Physical location |
| total_slots | Integer | Total parking spaces |
| available_slots | Integer | Currently available |
| created_at | Timestamp | Creation date |

**Inputs**: Lot management data, availability updates  
**Outputs**: Available lots, lot details  
**Processes**: P2 (Lot Management), P3 (Reservations), P5 (Reports)

### D3: Reservations

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to users |
| lot_id | Integer | Foreign key to parking_lots |
| slot_number | String | Specific slot |
| start_time | Timestamp | Reservation start |
| end_time | Timestamp | Reservation end |
| status | String | Reservation state |
| created_at | Timestamp | Creation date |

**Inputs**: Reservation requests, status updates  
**Outputs**: Reservation list, confirmation  
**Processes**: P3 (Reservations), P4 (Payments), P5 (Reports)

### D4: Payments

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| reservation_id | Integer | Foreign key to reservations |
| amount | Decimal | Payment amount |
| method | String | Payment method |
| status | String | Payment status |
| transaction_code | String | Unique transaction ID |
| payment_time | Timestamp | Payment timestamp |
| created_at | Timestamp | Creation date |

**Inputs**: Payment information  
**Outputs**: Receipts, revenue data  
**Processes**: P4 (Payments), P5 (Reports)

## Data Flow Summary

### Input Data Flows

1. **User Registration**: name, email, password, phone → System
2. **Login**: email, password → System
3. **Reservation Request**: lot_id, start_time, end_time → System
4. **Payment**: reservation_id, amount, method → System
5. **Lot Management**: name, location, total_slots → System

### Output Data Flows

1. **Authentication**: JWT token → User
2. **Available Lots**: lot list with availability → User
3. **Reservation Confirmation**: reservation details, QR code → User
4. **Receipt**: payment details, QR code → User
5. **Reports**: revenue data, analytics, charts → Admin

### Internal Data Flows

1. **User Data**: P1 ↔ D1
2. **Lot Data**: P2 ↔ D2, P3 ↔ D2
3. **Reservation Data**: P3 ↔ D3, P4 ↔ D3
4. **Payment Data**: P4 ↔ D4, P5 ↔ D4

## Data Transformation Examples

### Example 1: User Registration

**Input**: 
```json
{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "myPassword123",
  "phone": "+250788123456"
}
```

**Transformation**:
1. Validate email format
2. Hash password: `myPassword123` → `$2a$10$...hashed...`
3. Set default role: `driver`

**Output to Database**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "$2a$10$...hashed...",
  "role": "driver",
  "phone_number": "+250788123456",
  "created_at": "2025-12-03T10:00:00Z"
}
```

**Output to User**:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@university.edu",
    "role": "driver"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Example 2: Reservation Creation

**Input**:
```json
{
  "lot_id": 2,
  "start_time": "2025-12-03T08:00:00Z",
  "end_time": "2025-12-03T17:00:00Z",
  "slot_number": "A12"
}
```

**Transformation**:
1. Verify lot exists and has availability
2. Calculate duration: 9 hours
3. Decrement available_slots: 50 → 49
4. Set status: `booked`

**Output to Database (Reservation)**:
```json
{
  "id": 101,
  "user_id": 1,
  "lot_id": 2,
  "slot_number": "A12",
  "start_time": "2025-12-03T08:00:00Z",
  "end_time": "2025-12-03T17:00:00Z",
  "status": "booked",
  "created_at": "2025-12-03T07:30:00Z"
}
```

**Output to User**:
```json
{
  "reservation": {
    "id": 101,
    "lot_name": "Main Campus Parking",
    "location": "Building A",
    "slot_number": "A12",
    "start_time": "2025-12-03T08:00:00Z",
    "end_time": "2025-12-03T17:00:00Z",
    "status": "booked"
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

---

**Note**: These DFDs represent the logical flow of data through the system. Physical implementation may include additional layers like caching, load balancing, and API gateways.
