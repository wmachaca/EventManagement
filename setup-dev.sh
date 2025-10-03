#!/bin/bash

echo "🚀 Starting development setup..."

# Step 1: Ensure .env files are set up
echo "📂 Ensuring .env files are ready..."

# Backend .env setup
if [ ! -f "backend/.env" ]; then
  echo "🔧 Copying backend/.env.test to backend/.env..."
  cp backend/.env.test backend/.env
else
  echo "✅ backend/.env file already exists. Skipping..."
fi

# Frontend .env setup
if [ ! -f "frontend/.env" ]; then
  echo "🔧 Copying frontend/.env to frontend/.env..."
  cp frontend/.env frontend/.env
else
  echo "✅ frontend/.env file already exists. Skipping..."
fi

# Step 2: Install dependencies
echo "📦 Installing dependencies for backend and frontend..."
npm install --prefix backend
npm install --prefix frontend

# Step 3: Initialize databases
echo "🐘 Setting up PostgreSQL databases..."

# Create test user and test database
echo "🔧 Creating test database and user..."
psql -U postgres -h localhost -c "CREATE USER testuserem WITH PASSWORD 'testpasswordem';" || echo "User 'testuserem' already exists. Skipping..."
psql -U postgres -h localhost -c "CREATE DATABASE eventmanager_test WITH OWNER testuserem;" || echo "Database 'eventmanager_test' already exists. Skipping..."

# Run Prisma migrations for development and test databases
echo "🔄 Running Prisma migrations..."
npx prisma migrate dev --schema=backend/prisma/schema.prisma
DATABASE_URL=postgresql://testuserem:testpasswordem@localhost:5432/eventmanager_test npx prisma migrate deploy --schema=backend/prisma/schema.prisma

# Step 4: Seed the database (optional)
echo "🌱 Seeding the database..."
npm run seed --prefix backend || echo "No seed script found. Skipping..."

# Step 5: Provide instructions for starting development servers
echo "🚀 Development setup complete!"
echo "👉 To start the backend: cd backend && npm run dev"
echo "👉 To start the frontend: cd frontend && npm run dev"

echo "✅ All setup steps completed successfully!"
