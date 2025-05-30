# Event Management Platform 🌐

## Project Description

A global event management solution enabling users to create, manage, and attend virtual/in-person events with:

- Multi-language support (i18n)
- JWT/OAuth authentication
- Event application system
- Optimistic concurrency control

## 🚀 Installation & Usage

### Prerequisites

- Node.js v18+
- PostgreSQL 15+
- **Test database user:** `testuserem` (create with: `CREATE USER testuserem WITH PASSWORD 'yourpassword'`)

### Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/event-management.git
cd event-management
cp .env.example .env

# 2. Initialize databases
# Development DB
npx prisma migrate dev
# Test DB (one-time setup)
psql -U postgres -h localhost -c "CREATE DATABASE eventmanager_test WITH OWNER testuserem"
DATABASE_URL=postgresql://testuserem:yourpassword@localhost:5432/eventmanager_test npx prisma migrate deploy

# 4. Start dev servers
backend: npm run dev
frontend: npm run dev
```

## Running Tests

```bash
# From project root:
cd backend

# Run complete test suite
npm test
```

## 🛠 Tech Stack

**Frontend:** React, Tailwind CSS, Next.js, i18next, Axios  
**Backend:** Node.js, Express, Prisma ORM, Swagger
**Auth:** JWT, OAuth (e.g., Google)  
**Database:** PostgreSQL  
**Testing:** Jest, Supertest
**DevOps:** ESLint, Prettier
