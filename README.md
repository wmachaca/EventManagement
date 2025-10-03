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

- **Node.js** v18+
- **PostgreSQL** 15+
- Ensure you have a PostgreSQL superuser account (default: `postgres`).

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/event-management.git
cd event-management

# 2. Make the setup script executable
chmod +x setup-dev.sh

# 3. Run the setup script
./setup-dev.sh
```

The `setup-dev.sh` script will:
1. **Set up environment files**:
   - Copies `backend/.env.test` to `backend/.env`.
   - Copies `frontend/.env` to `frontend/.env`.
2. **Install dependencies**:
   - Installs `npm` dependencies for both the backend and frontend.
3. **Initialize the database**:
   - Creates a PostgreSQL user `testuserem` with the password `testpasswordem`.
   - Creates a database `eventmanager_test` owned by `testuserem`.
   - Runs Prisma migrations to set up the database schema.
4. **Seed the database**:
   - Populates the database with sample data (users and events).
5. **Provide instructions**:
   - Displays commands to start the backend and frontend development servers.

---

## 🌱 Seeding the Database

The application includes a seed script to populate the database with sample data, including:
- **2 Users**: Each with unique credentials.
- **4 Events**: Two events per user (virtual and in-person).

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

## 🧪 Running Tests

### Backend Tests
To run the backend test suite:
```bash
cd backend
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

---

## 🛠️ GitHub Actions for Backend

The backend is configured with a GitHub Actions workflow for testing. The workflow is located at `.github/workflows/backend-tests.yml`.

### Workflow Overview
- **Trigger**: Runs on every push or pull request to the `develop` branch.
- **Steps**:
  1. Checkout the repository.
  2. Set up Node.js and install dependencies.
  3. Set up a PostgreSQL service.
  4. Run Prisma migrations.
  5. Execute the test suite.

### Running the Workflow
To trigger the workflow:
1. Push changes to the `develop` branch:
   ```bash
   git push origin develop
   ```
2. Open a pull request to `develop`.

You can monitor the workflow in the "Actions" tab of your GitHub repository.


