# OpsFlow – Mini ERP + CRM

OpsFlow is a full-stack **Mini ERP + CRM application** designed for managing customers, follow-ups, products, inventory, stock movements, and sales challans from a centralized role-based dashboard.

The application demonstrates a practical internal business workflow with **JWT authentication, Role-Based Access Control (RBAC), customer relationship management, inventory tracking, challan processing, transactional stock updates, and cloud deployment**.

---

## Live Demo

### Frontend
Replace the URL below with the stable production URL from the Vercel project:

`https://mini-erp-d1jzl7z98-rs-projects-c5448f88.vercel.app/login`

### Backend API

`https://mini-erp-crm-h411.onrender.com`

### API Health Check

`https://mini-erp-crm-h411.onrender.com/api/health`

> Note: The backend is hosted on a free Render instance, so the first request after a period of inactivity may take some time while the service wakes up.

---

## Demo Credentials

The application includes four demo users to demonstrate role-based access control.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `Demo@123` |
| Sales | `sales@demo.com` | `Demo@123` |
| Warehouse | `warehouse@demo.com` | `Demo@123` |
| Accounts | `accounts@demo.com` | `Demo@123` |

These accounts are intended only for demonstration and evaluation.

---

## Features

### Authentication & Authorization

- JWT-based authentication
- Secure password hashing
- Persistent login using stored authentication state
- Protected frontend routes
- Backend authorization middleware
- Role-Based Access Control (RBAC)
- Role-specific navigation and actions
- Logout functionality

Supported roles:

- `ADMIN`
- `SALES`
- `WAREHOUSE`
- `ACCOUNTS`

---

### Customer Management

Authorized users can:

- View customers
- Add new customers
- Edit customer information
- View detailed customer profiles
- Track customer status
- Store customer type and business information
- Add follow-up notes
- View follow-up history

Supported customer types:

- Retail
- Wholesale
- Distributor

Supported customer statuses:

- Lead
- Active
- Inactive

---

### Product & Inventory Management

The inventory module supports:

- Product creation
- Product editing
- SKU-based product identification
- Category management
- Unit pricing
- Current stock tracking
- Minimum stock levels
- Warehouse information
- Manual Stock IN operations
- Manual Stock OUT operations
- Stock movement history
- Inventory audit trail

Each stock modification creates a `StockMovement` record containing information such as:

- Product
- Quantity
- Movement type
- Reason
- User responsible
- Timestamp

---

### Sales Challan Management

Authorized Sales/Admin users can:

- Create sales challans
- Select customers
- Add multiple products
- Specify quantities
- Save challans as drafts
- View challan details
- Confirm draft challans
- View challan history

Supported challan statuses:

- `DRAFT`
- `CONFIRMED`
- `CANCELLED`

---

## Challan & Inventory Business Logic

A key business rule implemented in the application is that **creating a draft challan does not immediately reduce inventory**.

Workflow:

```text
Create Challan
      |
      v
Status = DRAFT
      |
      | No stock deduction
      v
Confirm Challan
      |
      +--> Validate available stock
      |
      +--> Deduct inventory
      |
      +--> Create Stock OUT movement
      |
      v
Status = CONFIRMED
```

This prevents inventory from being modified by incomplete or unconfirmed sales transactions.

When a challan is confirmed:

1. The system verifies that the challan is still in `DRAFT` status.
2. Product availability is validated.
3. Available stock is checked.
4. Product stock quantities are reduced.
5. Corresponding `OUT` stock movement records are created.
6. The challan status changes to `CONFIRMED`.

These related database operations are handled transactionally to reduce the risk of partial inventory updates.

---

## Product Snapshot Design

Challan items store snapshot fields such as:

- Product name
- SKU
- Unit price

This ensures historical challans remain accurate even if the original product information or price changes later.

Example:

```text
Product price today: ₹500
        |
        v
Challan created
Snapshot price: ₹500
        |
        v
Product price later changed to ₹600
        |
        v
Old Challan still shows ₹500
```

This is important for maintaining historical transaction integrity.

---

## Role-Based Access Control

| Feature | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Customers | ✅ | ✅ | ❌ | ❌ |
| Add/Edit Customers | ✅ | ✅ | ❌ | ❌ |
| Add Follow-ups | ✅ | ✅ | ❌ | ❌ |
| View Products | ✅ | ✅ | ✅ | ✅ |
| Add/Edit Products | ✅ | ❌ | ✅ | ❌ |
| Update Stock | ✅ | ❌ | ✅ | ❌ |
| View Stock Movements | ✅ | ❌ | ✅ | ✅ |
| View Challans | ✅ | ✅ | ✅ | ✅ |
| Create Challans | ✅ | ✅ | ❌ | ❌ |
| Confirm Challans | ✅ | ✅ | ❌ | ❌ |

Authorization is enforced at both the **frontend UI/route level** and the **backend API level**.

Backend authorization remains the primary security boundary.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- JWT Authentication
- Role-Based Authorization
- Zod validation

### Database & ORM

- PostgreSQL
- Prisma ORM
- Neon PostgreSQL

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon

### Development Tools

- Git
- GitHub
- VS Code
- npm
- Postman
- Prisma Studio

---

## System Architecture

```text
+-----------------------------+
|       React Frontend        |
|     TypeScript + Vite       |
|       Tailwind CSS          |
+-------------+---------------+
              |
              | HTTPS / REST API
              | JWT Authorization
              v
+-----------------------------+
|      Express Backend        |
|    Node.js + TypeScript     |
|                             |
| Authentication Middleware   |
| RBAC Authorization          |
| Controllers & Validation    |
| Business Logic              |
+-------------+---------------+
              |
              | Prisma ORM
              v
+-----------------------------+
|     PostgreSQL Database     |
|           Neon              |
+-----------------------------+
```

Production architecture:

```text
Vercel
React Frontend
      |
      v
Render
Express REST API
      |
      v
Prisma ORM
      |
      v
Neon PostgreSQL
```

---

## Database Models

The main database models are:

### User

Stores:

- Name
- Email
- Hashed password
- Role
- Created/updated timestamps

Roles:

```text
ADMIN
SALES
WAREHOUSE
ACCOUNTS
```

### Customer

Stores:

- Name
- Mobile
- Email
- Business name
- GST number
- Customer type
- Address
- Status
- Follow-up date
- Notes

### FollowUp

Stores customer interaction history:

- Customer reference
- Note
- Created by
- Created timestamp

### Product

Stores:

- Product name
- SKU
- Category
- Unit price
- Current stock
- Minimum stock
- Warehouse

### StockMovement

Maintains an inventory audit trail:

- Product
- Quantity
- Type (`IN` / `OUT`)
- Reason
- Created by
- Timestamp

### Challan

Stores:

- Challan number
- Customer
- Total quantity
- Status
- Created by
- Timestamps

### ChallanItem

Stores individual challan products along with historical snapshot data:

- Product reference
- Product name snapshot
- SKU snapshot
- Unit price snapshot
- Quantity

---

## Project Structure

```text
mini-erp-crm/
|
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── layout/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── customers/
│   │   │   ├── products/
│   │   │   └── challans/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   |
│   ├── package.json
│   └── vercel.json
|
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   |
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── generated/
│   │   └── server.ts
│   |
│   ├── package.json
│   ├── prisma.config.ts
│   └── tsconfig.json
|
└── README.md
```

---

## API Overview

Base production API:

`https://mini-erp-crm-h411.onrender.com/api`

### Authentication

```http
POST /api/auth/login
```

Authenticates a user and returns a JWT token with user information.

---

### Customers

```http
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
POST   /api/customers/:id/follow-ups
```

Customer operations are restricted primarily to:

- ADMIN
- SALES

---

### Products

```http
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
POST   /api/products/:id/stock
GET    /api/products/:id/movements
```

Product creation, editing, and inventory modification are restricted to:

- ADMIN
- WAREHOUSE

Product information can be viewed by authorized ERP roles.

---

### Challans

```http
GET    /api/challans
POST   /api/challans
GET    /api/challans/:id
PATCH  /api/challans/:id/confirm
```

Creating and confirming challans is restricted to:

- ADMIN
- SALES

Other authorized roles may view challan information according to their permissions.

---

### Dashboard

```http
GET /api/dashboard
```

Provides dashboard information for authenticated users.

---

### Health Check

```http
GET /api/health
```

Used to verify that the backend service is running.

Example response:

```json
{
  "success": true,
  "message": "Mini ERP CRM API is running"
}
```

---

## Local Development Setup

### Prerequisites

Install:

- Node.js
- npm
- PostgreSQL or a PostgreSQL cloud database
- Git

---

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd mini-erp-crm
```

---

### 2. Backend Setup

Navigate to:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file.

Example:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secure-jwt-secret"
CLIENT_URL="http://localhost:5173"
PORT=5000
```

Do not commit the real `.env` file.

Generate Prisma Client:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate dev
```

Start development server:

```bash
npm run dev
```

Backend runs locally at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

### 3. Frontend Setup

Open another terminal:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create a `.env` file if required:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs locally at:

```text
http://localhost:5173
```

---

## Production Build

### Backend

```bash
cd server
npm run build
npm start
```

The TypeScript backend compiles to the `dist` directory.

---

### Frontend

```bash
cd client
npm run build
```

Vite creates the production build inside:

```text
client/dist
```

---

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens |
| `CLIENT_URL` | Allowed frontend origin for CORS |
| `PORT` | Backend server port |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

Production example:

```env
VITE_API_URL=https://mini-erp-crm-h411.onrender.com/api
```

Never commit real secrets or production credentials inside `.env` files.

---

## Deployment

### Backend – Render

The Express API is deployed on Render.

Production configuration:

```text
Root Directory:
server

Build Command:
npm ci --include=dev && npx prisma generate && npm run build

Start Command:
npm start

Health Check:
/api/health
```

Required environment variables:

```text
DATABASE_URL
JWT_SECRET
CLIENT_URL
NODE_ENV=production
```

---

### Frontend – Vercel

The React/Vite frontend is deployed on Vercel.

Configuration:

```text
Root Directory:
client

Build Command:
npm run build

Output Directory:
dist
```

Environment variable:

```text
VITE_API_URL=https://mini-erp-crm-h411.onrender.com/api
```

Because the application uses React Router, `vercel.json` provides an SPA fallback so routes such as:

```text
/login
/dashboard
/customers
/products
/challans
```

continue to work when accessed directly or refreshed.

---

## Security Considerations

### Password Security

Passwords are stored as hashes rather than plain-text passwords.

### JWT Authentication

Protected API requests require a valid JWT.

Typical authorization header:

```http
Authorization: Bearer <token>
```

### Backend RBAC

Sensitive operations are protected by backend role authorization middleware.

Frontend button hiding alone is not treated as a security mechanism.

### Input Validation

Incoming request data is validated before executing core business operations.

### Environment Variables

Sensitive configuration such as database credentials and JWT secrets is stored in environment variables and excluded from source control.

---

## Why There Is No Public Signup

Public signup is intentionally not implemented.

This application represents an **internal ERP/CRM system**, where employees should not be able to self-register or assign privileged roles such as `ADMIN`, `WAREHOUSE`, or `ACCOUNTS`.

For demonstration purposes, predefined role-based accounts are provided.

In a production environment, user provisioning would normally be handled through an **Admin-only User Management module or invitation workflow**.

---

## Key Design Decisions

### Draft Challans Do Not Modify Stock

Inventory is modified only after a challan is confirmed.

This prevents incomplete sales transactions from affecting real inventory.

### Inventory Audit Trail

Stock changes generate dedicated movement records instead of only modifying the current stock value.

This improves traceability.

### Product Snapshots in Challans

Product name, SKU, and price are stored as snapshots inside challan items.

This protects historical transaction data from future product modifications.

### Backend-Enforced Authorization

The UI hides unauthorized actions for usability, but authorization is also enforced by backend middleware.

This prevents users from bypassing frontend restrictions by directly calling APIs.

---

## Assumptions

- The application is intended for internal organizational use.
- Users are provisioned by the organization rather than through public signup.
- Demo accounts represent different departments.
- Inventory is reduced when a challan is confirmed, not when it is created.
- Stock changes should be traceable through movement history.
- Product information used in historical challans should remain unchanged through snapshots.

---

## Known Limitations

This project is a Mini ERP/CRM implementation and currently does not include:

- Admin user-management UI
- Email invitations
- Password reset flow
- Email/OTP verification
- Advanced reporting and analytics
- PDF challan generation
- Invoice/payment processing
- Automated notifications
- Multi-warehouse stock allocation
- Advanced search/export features
- Automated test suite

These can be added as future enhancements.

---

## Future Improvements

Potential future improvements include:

- Admin-controlled employee management
- Password reset and account recovery
- PDF challan and invoice generation
- Advanced analytics dashboard
- Low-stock notifications
- Multi-warehouse inventory
- Customer activity timeline
- Sales reports
- CSV/Excel export
- Audit logs
- Automated unit/integration tests
- CI/CD pipeline
- Refresh-token based authentication

---

## Testing Checklist

The following workflows should be verified before production submission:

- Login with all four roles
- Persistent authentication after refresh
- Logout
- Customer creation and editing
- Customer follow-up creation
- Product creation and editing
- Stock IN
- Stock OUT
- Stock movement history
- Draft challan creation
- Challan confirmation
- Inventory deduction after confirmation
- Insufficient-stock handling
- Role-based UI restrictions
- Role-based backend API restrictions
- Direct route refresh on Vercel
- Production API health check

---

## Author

**Rishabh Chouhan**

Computer Science & Engineering

GitHub: `RishabhChouhan18`

---

## Project Status

**Core implementation complete and deployed.**

The project currently includes:

- Full-stack ERP/CRM workflow
- Authentication
- Role-Based Access Control
- Customer CRM
- Follow-up tracking
- Product management
- Inventory management
- Stock movement history
- Sales challans
- Transactional stock updates
- PostgreSQL database
- Production frontend deployment
- Production backend deployment
