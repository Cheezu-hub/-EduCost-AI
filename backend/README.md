# EduCost AI — Backend

Production-ready REST API for education cost estimation, loan simulation, ROI analysis, and AI-powered financial advice.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| ORM | Prisma |
| Database | PostgreSQL 14+ |
| Auth | JWT (access + refresh) |
| AI | OpenAI API (gpt-4o-mini) |
| Cache | Redis (optional) |
| Validation | express-validator |
| Logging | Winston |

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional)

### 2. Install
```bash
npm install
```

### 3. Configure
```bash
cp .env.example .env
# Edit .env with your DB credentials, JWT secrets, and OpenAI key
```

### 4. Database Setup
```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed with colleges + demo users
npm run db:seed
```

### 5. Run
```bash
# Development
npm run dev

# Production
npm start
```

API is available at: `http://localhost:3000/api/v1`

---

## Default Seed Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@educost.ai | Admin@1234 |
| Student | demo@educost.ai | Student@1234 |

---

## API Reference

### Auth
```
POST /api/v1/auth/register   { name, email, password }
POST /api/v1/auth/login      { email, password }
POST /api/v1/auth/refresh    { refreshToken }
```

### User
```
GET  /api/v1/user/me
PUT  /api/v1/user/profile    { studentType, country, currency, familyIncome }
```

### Calculations
```
POST /api/v1/calculate/cost
  { tuitionPerYear, duration, rent, food, transport, insurance, equipment, misc, inflation }

POST /api/v1/calculate/loan
  { principal, annualInterestRate, tenureYears, moratoriumMonths }

POST /api/v1/calculate/roi
  { expectedSalary, loanAmount, annualInterestRate, tenureYears, totalCost,
    placementProbability, salaryGrowthRate }
```

### Simulation
```
POST /api/v1/simulate        (full params + adjustment deltas)
GET  /api/v1/simulate        (history)
```

### Reports
```
POST   /api/v1/reports       { title, type, payload }
GET    /api/v1/reports
GET    /api/v1/reports/:id
DELETE /api/v1/reports/:id
```

### Colleges
```
GET  /api/v1/colleges?country=USA&tags=STEM&search=MIT&page=1&limit=20
GET  /api/v1/colleges/:id
POST /api/v1/colleges        (admin only)
```

### AI Chat
```
POST   /api/v1/ai/chat       { message, context: { roi, loan, cost } }
GET    /api/v1/ai/history
DELETE /api/v1/ai/history
```

### Admin
```
GET /api/v1/admin/analytics
```

---

## Calculation Formulas

**EMI Formula:**
```
EMI = P × r × (1+r)^n / ((1+r)^n − 1)
where r = monthly rate, n = total months
```

**Stress Score (0–100):**
- Debt-to-income ratio (35%)
- Placement risk (25%)
- Repayment duration (20%)
- Cost-to-income ratio (20%)

**Risk Levels:**
- LOW: 0–29
- MEDIUM: 30–54
- HIGH: 55–74
- CRITICAL: 75–100

---

## Folder Structure

```
educost-ai/
├── prisma/
│   ├── schema.prisma          # DB models
│   └── seed.js                # Seed data
├── src/
│   ├── app.js                 # Entry point
│   ├── config/index.js        # Env config
│   ├── middleware/
│   │   ├── auth.js            # JWT + RBAC
│   │   ├── errorHandler.js    # Centralized error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── validate.js        # Input validation
│   ├── modules/
│   │   ├── auth/              # Register, login, refresh
│   │   ├── users/             # Profile management
│   │   ├── calculations/      # Cost, loan, ROI engines
│   │   ├── simulations/       # What-if scenarios
│   │   ├── reports/           # Save/retrieve reports
│   │   ├── colleges/          # College data
│   │   ├── ai/                # OpenAI chat advisor
│   │   └── admin/             # Analytics
│   └── utils/
│       ├── jwt.js
│       ├── logger.js
│       ├── prismaClient.js
│       ├── redis.js
│       └── response.js
└── .env.example
```

---

## Security Features
- bcrypt (12 rounds) password hashing
- JWT access (15m) + refresh (7d) tokens
- Role-based access control (STUDENT / ADMIN)
- Helmet HTTP security headers
- CORS with origin whitelist
- Rate limiting (global + per-route)
- Input sanitization via express-validator
- JSON body size limit (10kb)
- Environment-based secrets (no hardcoded values)
