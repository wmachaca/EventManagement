# Event Management Platform 🌐

## Project Description

A global event management solution enabling users to create, manage, and attend virtual/in-person events with:

- Multi-language support (i18n)
- JWT/OAuth authentication
- Event application system
- Optimistic concurrency control
- API documentation (Swagger)

---

## 📚 API Documentation

Swagger documentation is available for all API endpoints. To explore the API, visit [http://localhost:5000/api-docs/](http://localhost:5000/api-docs/) in your browser.

Features:
- Interactive endpoint testing
- Request/response examples
- Authentication requirements
- Error code explanations

---

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

# 3. Seed the database (optional)
npm run seed

# 4. Start dev servers
backend: npm run dev
frontend: npm run dev
```

---

## 🌱 Seeding the Database

The application includes a seed script to populate the database with sample data, including:
- **2 Users**: Each with unique credentials.
- **4 Events**: Two events per user (virtual and in-person).

### How to Seed the Database
1. Ensure the database is initialized with `npx prisma migrate dev`.
2. Run the seed script:
   ```bash
   npm run seed
   ```
3. Verify the seeded data:
   - Open your database client (e.g., Prisma Studio, pgAdmin).
   - Check the `User` and `Event` tables for the seeded data.

### Seed Script Details
- **Users**:
  - `test1@example.com` with password `test1passwrd`
  - `test2@example.com` with password `test2passwrd`
- **Events**:
  - User 1:
    - "SCOPE Nuclear Conference 2025" (in-person)
    - "AATN Virtual Conference" (virtual)
  - User 2:
    - "AI Workshop" (in-person)
    - "Cloud Computing Webinar" (virtual)

---

## Running Tests

```bash
# From project root:
cd backend

# Run complete test suite
npm test
```

---

## 🛠 Tech Stack

**Frontend:** React, Tailwind CSS, Next.js, i18next, Axios  
**Backend:** Node.js, Express, Prisma ORM, Swagger  
**Auth:** JWT, OAuth (e.g., Google)  
**Database:** PostgreSQL  
**Testing:** Jest, Supertest  
**DevOps:** ESLint, Prettier

---

## 📂 Directory Structure

```
.
├── backend
│   ├── prisma
│   │   ├── schema.prisma       # Prisma schema
│   │   ├── seed.ts             # Database seed script
│   ├── src
│   │   ├── api                 # API routes and controllers
│   │   ├── database            # Prisma client setup
│   │   ├── middleware          # Middleware (e.g., auth, validation)
│   │   ├── server.ts           # Express server entry point
│   ├── tests                   # Unit and integration tests
│   └── package.json            # Backend dependencies and scripts
├── frontend
│   ├── src
│   │   ├── app                 # Next.js app directory
│   │   ├── components          # Reusable components
│   │   ├── hooks               # Custom hooks
│   │   ├── lib                 # Utility libraries (e.g., auth, API)
│   │   ├── pages               # Static and dynamic pages
│   ├── public                  # Static assets (e.g., images)
│   └── package.json            # Frontend dependencies and scripts
└── README.md                   # Project documentation
```

--
