# TicoAutos — Backend API

> REST API for the TicoAutos vehicle marketplace platform, built with NestJS, MongoDB and JWT authentication.

---

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Data Models](#data-models)

---

## About

TicoAutos is a Costa Rican vehicle marketplace REST API that allows users to publish, search and inquire about vehicles for sale. It follows a Service-Oriented Architecture with REST as the architectural style.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **NestJS** | Backend framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT + Passport** | Authentication |
| **bcryptjs** | Password hashing |
| **class-validator** | DTO validation |

---

## Project Structure

```
src/
├── auth/               # JWT authentication (login, register, strategy)
├── users/              # User schema, service, DTOs
├── vehicles/           # Vehicle CRUD, filters, pagination
├── questions/          # Q&A system — questions per vehicle
├── answers/            # Answers to questions (owner only)
├── common/
│   ├── guards/         # JwtAuthGuard
│   └── decorators/     # @CurrentUser() decorator
├── app.module.ts       # Root module
└── main.ts             # Bootstrap, global pipes, CORS
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on port `27017`

### Installation

```bash
# Clone the repository
git clone https://github.com/Gerald-JGG/ticoautos-api
cd ticonautos-api

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your values (see below)

# Run in development mode
npm run start:dev
```

The API will be available at: `http://localhost:3001/api`

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ticonautos
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:3000
```

---

## API Endpoints

### 🔓 Public (no authentication required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/vehicles` | List vehicles with filters & pagination |
| `GET` | `/api/vehicles/:id` | Get vehicle detail |
| `GET` | `/api/vehicles/:vehicleId/questions` | Get all questions for a vehicle (with answers) |
| `GET` | `/api/questions/:questionId/answer` | Get answer for a specific question |

### 🔒 Private (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles/my` | Get authenticated user's vehicles |
| `POST` | `/api/vehicles` | Create a new vehicle listing |
| `PUT` | `/api/vehicles/:id` | Update vehicle (owner only) |
| `PATCH` | `/api/vehicles/:id/sold` | Mark vehicle as sold (owner only) |
| `DELETE` | `/api/vehicles/:id` | Delete vehicle (owner only) |
| `POST` | `/api/vehicles/:vehicleId/questions` | Ask a question about a vehicle |
| `GET` | `/api/questions/my` | Get questions asked by the current user |
| `GET` | `/api/questions/inbox` | Get all questions for user's vehicles |
| `POST` | `/api/questions/:questionId/answer` | Answer a question (owner only) |

### Vehicle Filters (Query Params)

```
GET /api/vehicles?brand=Toyota&minPrice=5000&maxPrice=15000&minYear=2015&maxYear=2023&status=available&page=1&limit=10
```

| Param | Type | Description |
|---|---|---|
| `brand` | string | Filter by brand (partial match) |
| `model` | string | Filter by model (partial match) |
| `minYear` / `maxYear` | number | Year range |
| `minPrice` / `maxPrice` | number | Price range in USD |
| `status` | `available` \| `sold` | Vehicle status |
| `search` | string | Full-text search (brand, model, description) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10, max: 50) |

---

## Authentication

The API uses **JWT Bearer tokens**. After login or register, include the token in all protected requests:

```
Authorization: Bearer <your_token>
```

Tokens expire after **7 days**.

---

## Data Models

### User
```
name, email (unique), password (hashed), phone (optional)
```

### Vehicle
```
brand, model, year, price, description, status (available/sold),
mileage, color, transmission, fuel, images[], owner → User
```

### Question
```
content, vehicle → Vehicle, askedBy → User, createdAt
```

### Answer
```
content, question → Question (unique), answeredBy → User, createdAt
```

---

## Business Rules

- Only authenticated users can ask questions
- Only the vehicle owner can answer questions
- Each question can only have one answer
- Questions cannot be modified once sent
- Only the vehicle owner can edit, delete or mark as sold
- Passwords are never returned in API responses

---

## Course Info

**Course:** Programación en Ambiente Web II (ISW-711)  
**University:** Universidad Técnica Nacional  
**Professor:** Bladimir Arroyo
