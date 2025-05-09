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

### Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/event-management.git
cd event-management
cp .env.example .env

# 2. Run migrations
cd backend && npx prisma migrate dev

# 4. Start dev servers
backend: npm run dev
frontend: npm run dev
```

## 🛠 Tech Stack

**Frontend:** React, Tailwind CSS, Next.js  
**Backend:** Node.js, Express, Prisma ORM  
**Auth:** JWT, OAuth (e.g., Google)  
**Database:** PostgreSQL  
**DevOps:** Docker, ESLint, Prettier
