# Quick Start Guide - Running the Parking System

## Prerequisites ✅
- ✅ Node.js installed
- ✅ PostgreSQL installed

## Step-by-Step Setup

### Step 1: Create Database

Open **pgAdmin** or **SQL Shell (psql)** and run:

```sql
CREATE DATABASE parking_system;
```

### Step 2: Run Database Migrations

In pgAdmin or psql, connect to `parking_system` database and run:

```sql
-- Copy and paste the contents of:
-- parking-backend/database/migrations/001_initial_schema.sql
```

Or using psql command line:
```bash
psql -U postgres -d parking_system -f parking-backend/database/migrations/001_initial_schema.sql
```

### Step 3: (Optional) Load Sample Data

```sql
-- Copy and paste the contents of:
-- parking-backend/database/seeds/001_seed_data.sql
```

Or using psql:
```bash
psql -U postgres -d parking_system -f parking-backend/database/seeds/001_seed_data.sql
```

**Sample Accounts Created:**
- Admin: `admin@parking.com` / `admin123`
- Test User: `john@university.edu` / `password123`

### Step 4: Configure Backend Environment

Create `.env` file in `parking-backend/` folder:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=parking_system
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password!

### Step 5: Install Backend Dependencies

```bash
cd parking-backend
npm install
```

### Step 6: Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server is running on http://localhost:5000
```

### Step 7: Install Frontend Dependencies

Open a **new terminal** and run:

```bash
cd parking-frontend
npm install
```

### Step 8: Start Frontend

```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

### Step 9: Access the Application

Open your browser and go to:
**http://localhost:3000**

## Testing the Application

### As a Driver (Student/Staff):

1. **Register a new account** or use test account:
   - Email: `john@university.edu`
   - Password: `password123`

2. **View parking lots** - See available spaces in real-time

3. **Make a reservation**:
   - Select a parking lot
   - Choose start and end time
   - Get QR code confirmation

4. **Make payment**:
   - Go to "My Reservations"
   - Click "Pay Now"
   - Select payment method
   - Get receipt with QR code

### As an Admin:

1. **Login with admin account**:
   - Email: `admin@parking.com`
   - Password: `admin123`

2. **View Dashboard** - See revenue and statistics

3. **Manage Parking Lots**:
   - Create new parking lots
   - Update existing lots
   - View all reservations

4. **View Reports**:
   - Daily revenue
   - Revenue by parking lot
   - Usage analytics

## Troubleshooting

### Backend won't start - Database connection error

**Error:** `❌ Database connection error`

**Solution:**
1. Check PostgreSQL is running
2. Verify `.env` file has correct database credentials
3. Make sure database `parking_system` exists
4. Test connection in pgAdmin

### Frontend can't connect to backend

**Error:** Network errors or 404

**Solution:**
1. Make sure backend is running on port 5000
2. Check `parking-frontend/src/api/client.js` has correct API URL
3. Verify CORS is enabled in backend

### Port already in use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Find and kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```
2. Or change the port in `.env` file

### Database tables don't exist

**Error:** `relation "users" does not exist`

**Solution:**
Run the migration script again:
```bash
psql -U postgres -d parking_system -f parking-backend/database/migrations/001_initial_schema.sql
```

## Quick Commands Reference

### Backend
```bash
cd parking-backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
```

### Frontend
```bash
cd parking-frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
# Create database
createdb parking_system

# Run migrations
psql -U postgres -d parking_system -f parking-backend/database/migrations/001_initial_schema.sql

# Load seed data
psql -U postgres -d parking_system -f parking-backend/database/seeds/001_seed_data.sql

# Backup database
pg_dump -U postgres parking_system > backup.sql

# Restore database
psql -U postgres -d parking_system < backup.sql
```

## What's Running?

When everything is set up correctly, you should have:

1. **PostgreSQL** - Database server (usually port 5432)
2. **Backend API** - http://localhost:5000
3. **Frontend** - http://localhost:3000

## Next Steps

1. ✅ Test user registration and login
2. ✅ Create a parking reservation
3. ✅ Process a payment
4. ✅ Login as admin and view dashboard
5. ✅ Create a new parking lot
6. ✅ View reports and analytics

## Need Help?

Check the detailed documentation:
- [README.md](../README.md) - Full project documentation
- [API.md](../docs/API.md) - API endpoints reference
- [DATABASE.md](../docs/DATABASE.md) - Database schema details

---

**Quick Start Created:** December 3, 2025  
**Estimated Setup Time:** 10-15 minutes
