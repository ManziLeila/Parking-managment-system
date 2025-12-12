# System Architecture Documentation

## Overview

The Smart Parking Management System is built using a modern three-tier architecture that separates concerns and promotes maintainability, scalability, and testability.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer - Browser"
        UI[React Application<br/>Port 3000]
    end
    
    subgraph "Application Layer - Backend Server"
        API[Express.js REST API<br/>Port 5000]
        AUTH[JWT Authentication<br/>Middleware]
        ROUTES[Route Handlers]
        CONTROLLERS[Business Logic<br/>Controllers]
        MIDDLEWARE[Middleware Stack]
    end
    
    subgraph "Data Layer - Database"
        DB[(PostgreSQL<br/>Database)]
        MODELS[Data Models<br/>Repository Pattern]
    end
    
    UI -->|HTTP Requests| API
    API --> MIDDLEWARE
    MIDDLEWARE --> AUTH
    AUTH --> ROUTES
    ROUTES --> CONTROLLERS
    CONTROLLERS --> MODELS
    MODELS --> DB
    DB -->|Query Results| MODELS
    MODELS -->|Data| CONTROLLERS
    CONTROLLERS -->|JSON Response| UI
```

## Component Architecture

### Frontend Architecture (React)

```mermaid
graph LR
    subgraph "React Application"
        MAIN[main.jsx<br/>Entry Point]
        APP[App.jsx<br/>Router Config]
        
        subgraph "Context"
            AUTH_CTX[AuthContext<br/>User State]
        end
        
        subgraph "Components"
            NAVBAR[Navbar]
            PROTECTED[ProtectedRoute]
        end
        
        subgraph "Pages"
            HOME[Home]
            LOGIN[Login/Register]
            PARKING[Parking List]
            RESERVE[Reservations]
            ADMIN[Admin Dashboard]
        end
        
        subgraph "API Layer"
            CLIENT[Axios Client<br/>HTTP Requests]
        end
    end
    
    MAIN --> APP
    APP --> AUTH_CTX
    APP --> NAVBAR
    APP --> PROTECTED
    PROTECTED --> PARKING
    PROTECTED --> RESERVE
    PROTECTED --> ADMIN
    LOGIN --> CLIENT
    PARKING --> CLIENT
    RESERVE --> CLIENT
    ADMIN --> CLIENT
    CLIENT -->|REST API| BACKEND[Backend API]
```

### Backend Architecture (Express.js)

```mermaid
graph TB
    REQUEST[Incoming HTTP Request]
    
    subgraph "Middleware Stack"
        CORS[CORS Handler]
        HELMET[Security Headers]
        JSON[JSON Parser]
        RATE[Rate Limiter]
        LOG[Request Logger]
    end
    
    subgraph "Route Layer"
        AUTH_ROUTE[/api/auth]
        PARKING_ROUTE[/api/parking]
        RESERVE_ROUTE[/api/reservations]
        PAYMENT_ROUTE[/api/payments]
        REPORT_ROUTE[/api/reports]
    end
    
    subgraph "Authentication"
        JWT_VERIFY[JWT Verification]
        ROLE_CHECK[Role Authorization]
    end
    
    subgraph "Controller Layer"
        AUTH_CTRL[AuthController]
        PARKING_CTRL[ParkingLotController]
        RESERVE_CTRL[ReservationController]
        PAYMENT_CTRL[PaymentController]
        REPORT_CTRL[ReportController]
    end
    
    subgraph "Model Layer"
        USER_MODEL[UserModel]
        LOT_MODEL[ParkingLotModel]
        RESERVE_MODEL[ReservationModel]
        PAYMENT_MODEL[PaymentModel]
    end
    
    subgraph "Database"
        POOL[Connection Pool]
        POSTGRES[(PostgreSQL)]
    end
    
    ERROR[Error Handler]
    RESPONSE[JSON Response]
    
    REQUEST --> CORS
    CORS --> HELMET
    HELMET --> JSON
    JSON --> RATE
    RATE --> LOG
    LOG --> AUTH_ROUTE
    LOG --> PARKING_ROUTE
    LOG --> RESERVE_ROUTE
    LOG --> PAYMENT_ROUTE
    LOG --> REPORT_ROUTE
    
    PARKING_ROUTE --> JWT_VERIFY
    RESERVE_ROUTE --> JWT_VERIFY
    PAYMENT_ROUTE --> JWT_VERIFY
    REPORT_ROUTE --> JWT_VERIFY
    
    JWT_VERIFY --> ROLE_CHECK
    ROLE_CHECK --> AUTH_CTRL
    ROLE_CHECK --> PARKING_CTRL
    ROLE_CHECK --> RESERVE_CTRL
    ROLE_CHECK --> PAYMENT_CTRL
    ROLE_CHECK --> REPORT_CTRL
    
    AUTH_CTRL --> USER_MODEL
    PARKING_CTRL --> LOT_MODEL
    RESERVE_CTRL --> RESERVE_MODEL
    PAYMENT_CTRL --> PAYMENT_MODEL
    REPORT_CTRL --> PAYMENT_MODEL
    
    USER_MODEL --> POOL
    LOT_MODEL --> POOL
    RESERVE_MODEL --> POOL
    PAYMENT_MODEL --> POOL
    
    POOL --> POSTGRES
    
    AUTH_CTRL --> RESPONSE
    PARKING_CTRL --> RESPONSE
    RESERVE_CTRL --> RESPONSE
    PAYMENT_CTRL --> RESPONSE
    REPORT_CTRL --> RESPONSE
    
    AUTH_CTRL -.Error.-> ERROR
    PARKING_CTRL -.Error.-> ERROR
    ERROR --> RESPONSE
```

## Database Schema

```mermaid
erDiagram
    USERS ||--o{ RESERVATIONS : makes
    PARKING_LOTS ||--o{ RESERVATIONS : has
    RESERVATIONS ||--o{ PAYMENTS : requires
    
    USERS {
        int id PK
        string name
        string email UK
        string password
        string role
        string phone_number
        timestamp created_at
    }
    
    PARKING_LOTS {
        int id PK
        string name
        string location
        int total_slots
        int available_slots
        timestamp created_at
    }
    
    RESERVATIONS {
        int id PK
        int user_id FK
        int lot_id FK
        string slot_number
        timestamp start_time
        timestamp end_time
        string status
        timestamp created_at
    }
    
    PAYMENTS {
        int id PK
        int reservation_id FK
        decimal amount
        string method
        string status
        string transaction_code
        timestamp payment_time
        timestamp created_at
    }
```

## Data Flow

### User Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Fill registration form
    Frontend->>Frontend: Validate input
    Frontend->>Backend: POST /api/auth/register
    Backend->>Backend: Validate request
    Backend->>Backend: Hash password
    Backend->>Database: INSERT INTO users
    Database-->>Backend: User record
    Backend->>Backend: Generate JWT token
    Backend-->>Frontend: {user, token}
    Frontend->>Frontend: Store token
    Frontend-->>User: Redirect to dashboard
```

### Parking Reservation Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Select parking lot
    Frontend->>Backend: GET /api/parking
    Backend->>Database: SELECT * FROM parking_lots
    Database-->>Backend: Parking lots data
    Backend-->>Frontend: Available lots
    Frontend-->>User: Display lots
    
    User->>Frontend: Make reservation
    Frontend->>Backend: POST /api/reservations<br/>{lot_id, start_time, end_time}
    Backend->>Backend: Verify JWT token
    Backend->>Database: BEGIN TRANSACTION
    Backend->>Database: SELECT ... FOR UPDATE
    Database-->>Backend: Lock parking lot
    Backend->>Database: UPDATE available_slots - 1
    Backend->>Database: INSERT INTO reservations
    Backend->>Database: COMMIT
    Database-->>Backend: Reservation created
    Backend-->>Frontend: {reservation}
    Frontend-->>User: Show confirmation
```

### Payment Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: View reservation
    Frontend->>Backend: GET /api/reservations/my
    Backend->>Database: SELECT reservations
    Database-->>Backend: User reservations
    Backend-->>Frontend: Reservation list
    
    User->>Frontend: Click "Pay Now"
    Frontend->>Frontend: Navigate to payment page
    User->>Frontend: Select payment method
    Frontend->>Backend: POST /api/payments<br/>{reservation_id, amount, method}
    Backend->>Database: INSERT INTO payments
    Database-->>Backend: Payment record
    Backend->>Backend: Generate QR code
    Backend-->>Frontend: {payment, qrCode}
    Frontend-->>User: Show receipt with QR
```

## Technology Stack Details

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 5.1.0 | Web framework |
| PostgreSQL | 14+ | Relational database |
| pg | 8.16.3 | PostgreSQL client |
| jsonwebtoken | 9.0.2 | JWT authentication |
| bcryptjs | 3.0.2 | Password hashing |
| cors | 2.8.5 | Cross-origin requests |
| dotenv | 17.2.1 | Environment variables |
| qrcode | 1.5.4 | QR code generation |
| dayjs | 1.11.13 | Date manipulation |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| Vite | 5.4.10 | Build tool |
| React Router | 6.26.2 | Client-side routing |
| Axios | 1.7.7 | HTTP client |
| Bootstrap | 5.3.3 | CSS framework |
| React Bootstrap | 2.10.6 | React components |
| Recharts | 2.13.3 | Charts and graphs |
| React Toastify | 10.0.5 | Notifications |
| jwt-decode | 4.0.0 | JWT parsing |

## Design Patterns Implementation

### 1. MVC Pattern

**Model**: Data access layer
- `models/userModel.js`
- `models/parkingLotModel.js`
- `models/reservationModel.js`
- `models/paymentModel.js`

**View**: React components
- `pages/` - Page components
- `components/` - Reusable UI components

**Controller**: Business logic
- `controllers/authController.js`
- `controllers/parkingLotController.js`
- `controllers/reservationController.js`
- `controllers/paymentController.js`

### 2. Repository Pattern

Models act as repositories, abstracting database operations:

```javascript
// Example: UserModel as Repository
const UserModel = {
  async findByEmail(email) { /* ... */ },
  async findById(id) { /* ... */ },
  async create(userData) { /* ... */ }
};
```

### 3. Factory Pattern

Database connection factory:

```javascript
// config/db.js - Factory for creating connections
const pool = new Pool(config);
module.exports = pool; // Single pool instance
```

### 4. Middleware Pattern

Express middleware chain:

```javascript
app.use(cors());           // CORS handling
app.use(express.json());   // JSON parsing
app.use(authenticate);     // JWT verification
app.use(authorize);        // Role-based access
app.use(errorHandler);     // Error handling
```

### 5. Singleton Pattern

Configuration manager ensures single instance:

```javascript
class ConfigManager {
  static instance;
  
  static getInstance() {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
}
```

## Security Architecture

### Authentication Flow

```mermaid
graph LR
    LOGIN[User Login] --> VALIDATE[Validate Credentials]
    VALIDATE --> HASH[Compare Password Hash]
    HASH --> TOKEN[Generate JWT Token]
    TOKEN --> STORE[Store in LocalStorage]
    STORE --> REQUEST[Include in Requests]
    REQUEST --> VERIFY[Verify JWT]
    VERIFY --> AUTHORIZE[Check Role]
    AUTHORIZE --> ACCESS[Grant Access]
```

### Security Measures

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Never store plain text passwords

2. **JWT Authentication**
   - Signed tokens with secret key
   - 7-day expiration
   - Role-based claims

3. **SQL Injection Prevention**
   - Parameterized queries
   - No string concatenation

4. **CORS Configuration**
   - Controlled origin access
   - Credential handling

5. **Rate Limiting**
   - Prevent brute force attacks
   - API abuse protection

## Scalability Considerations

### Horizontal Scaling

- Stateless API design
- JWT tokens (no session storage)
- Database connection pooling
- Load balancer ready

### Vertical Scaling

- Efficient database queries
- Indexed columns
- Connection pool optimization
- Caching strategies

### Database Optimization

- Indexes on foreign keys
- Transaction management
- Row-level locking for concurrency
- Query optimization

## Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Environment"
        NGINX[Nginx Container<br/>Frontend Server]
        NODE[Node.js Container<br/>Backend API]
        PG[PostgreSQL Container<br/>Database]
        
        NGINX -->|API Requests| NODE
        NODE -->|SQL Queries| PG
    end
    
    subgraph "Volumes"
        DB_VOL[Database Volume<br/>Persistent Storage]
    end
    
    PG --> DB_VOL
    
    USER[Users] -->|HTTPS| NGINX
```

## Monitoring and Logging

### Logging Strategy

- **Request Logging**: All API requests logged
- **Error Logging**: Stack traces and error details
- **Database Logging**: Query performance tracking
- **Authentication Logging**: Login attempts and failures

### Log Levels

- `ERROR`: Application errors
- `WARN`: Warning conditions
- `INFO`: Informational messages
- `DEBUG`: Debugging information

## Performance Optimization

1. **Frontend**
   - Code splitting with React Router
   - Lazy loading components
   - Optimized bundle size with Vite
   - Asset compression

2. **Backend**
   - Connection pooling
   - Efficient database queries
   - Response caching
   - Compression middleware

3. **Database**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Transaction management

## Future Enhancements

- Real-time updates with WebSockets
- Mobile application (React Native)
- Payment gateway integration
- IoT sensor integration
- Machine learning for demand prediction
- Multi-language support
- Advanced analytics dashboard

---

**Last Updated**: December 2025  
**Version**: 1.0.0
