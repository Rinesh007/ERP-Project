# GemLedger ERP — Jewelry Billing & Management System

A production-style full-stack ERP prototype that replaces Excel-based jewelry billing with a modern web application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Routing | React Router DOM v6 |
| Backend | Node.js + Express.js |
| Database | MySQL |
| ORM/Query | mysql2 with raw SQL + prepared statements |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| State | React Context API |
| Forms | React Hook Form |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Toastify |

---

## Project Structure

```
Prototype/
├── backend/           # Express API server
│   ├── config/        # DB connection
│   ├── controllers/   # Route handlers
│   ├── database/      # SQL schema + seed script
│   ├── middleware/     # Auth + error middleware
│   ├── routes/        # Express routes
│   ├── services/      # Business logic (transactional)
│   ├── utils/         # Code generators
│   ├── .env           # Environment config
│   └── server.js      # Entry point
│
└── frontend/          # React + Vite app
    └── src/
        ├── api/        # Axios instance
        ├── components/ # Reusable UI components
        ├── context/    # Auth context
        ├── hooks/      # Custom hooks
        ├── layouts/    # Sidebar + Navbar
        ├── pages/      # 6 application pages
        ├── services/   # API service calls
        └── utils/      # Formatters
```

---

## Prerequisites

- **Node.js** v18 or above
- **MySQL** 8.0 or above
- **npm** v8 or above

---

## Setup Instructions

### Step 1: MySQL Database

Open MySQL and run the schema:

```sql
-- Option A: MySQL CLI
mysql -u root -p < backend/database/schema.sql

-- Option B: MySQL Workbench
-- Open and execute: backend/database/schema.sql
```

### Step 2: Backend Setup

```bash
cd backend

# 1. Install dependencies (already done if using this package)
npm install

# 2. Configure environment variables
# Edit .env file with your MySQL credentials:
```

**backend/.env**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=jewelry_erp
JWT_SECRET=gemledger_jwt_secret_2024_jewelry_erp
JWT_EXPIRES_IN=7d
VAT_RATE=0.13
NODE_ENV=development
```

```bash
# 3. Seed database with admin user + sample data
node database/seed.js

# 4. Start development server
npm run dev
# → API running at http://localhost:5000
```

### Step 3: Frontend Setup

```bash
cd frontend

# 1. Install dependencies (already done)
npm install

# 2. Start development server
npm run dev
# → App running at http://localhost:5173
```

---

## Default Login

| Field | Value |
|-------|-------|
| Email | `admin@gemledger.com` |
| Password | `Admin@1234` |

> **Note:** Run `node database/seed.js` in the backend directory to create this account.

---

## Core Business Flow

```
Login
  → Dashboard (stats overview)
  → Add Customers (CUST-0001, CUST-0002...)
  → Add Products (PROD-0001, PROD-0002...)
  → Create Invoice
      → Select Customer
      → Add Line Items (product → rate auto-loaded)
      → VAT (13%) auto-calculated
      → Save Invoice
  → Sales Register (all invoices, searchable)
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/login         Login, returns JWT
POST   /api/auth/register      Create user
GET    /api/auth/me            Get current user (protected)
```

### Customers (all protected)
```
GET    /api/customers           List / search
POST   /api/customers           Create
PUT    /api/customers/:id       Update
DELETE /api/customers/:id       Delete
```

### Products (all protected)
```
GET    /api/products            List / search
POST   /api/products            Create
PUT    /api/products/:id        Update
DELETE /api/products/:id        Delete
```

### Invoices (all protected)
```
GET    /api/invoices            List (with filters: search, from_date, to_date)
GET    /api/invoices/stats      Dashboard statistics
GET    /api/invoices/monthly    Monthly revenue chart data
GET    /api/invoices/recent     Last 10 invoices
GET    /api/invoices/next-number Next auto-generated invoice #
GET    /api/invoices/:id        Single invoice + items
POST   /api/invoices            Create invoice (transactional)
```

---

## Pages

| Page | Route | Features |
|------|-------|---------|
| Login | `/login` | JWT auth, form validation |
| Dashboard | `/dashboard` | Stats, revenue chart, recent invoices |
| Customers | `/customers` | CRUD, search, modals |
| Products | `/products` | CRUD, search, modals |
| Create Invoice | `/create-invoice` | Dynamic items, auto-calculation, VAT |
| Sales Register | `/sales-register` | Searchable table, date filter, detail modal |

---

## Environment Variables

### Backend (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Express server port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | _(empty)_ | MySQL password |
| `DB_NAME` | `jewelry_erp` | Database name |
| `JWT_SECRET` | _(see .env)_ | JWT signing key |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `VAT_RATE` | `0.13` | VAT rate (13%) |

---

## Development Commands

```bash
# Backend
cd backend
npm run dev          # nodemon (auto-restart)
npm start            # production start

# Frontend
cd frontend
npm run dev          # Vite dev server (HMR)
npm run build        # Production build
npm run preview      # Preview production build
```

---

## Notes

- **VAT Rate:** Configurable via `VAT_RATE` in `backend/.env` (default: 13%)
- **Invoice Numbers:** Auto-generated as `INV-YYYY-NNNN` (year-scoped)
- **Customer Codes:** Auto-generated as `CUST-NNNN`
- **Product Codes:** Auto-generated as `PROD-NNNN`
- **Invoice creation** uses SQL transactions (`BEGIN/COMMIT/ROLLBACK`) for data integrity
- **JWT** is stored in `localStorage` and attached via Axios interceptor on every request

---

© 2024 GemLedger ERP — Jewelry Billing & Management System
