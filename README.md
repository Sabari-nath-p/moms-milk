<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>
<h1 align="center">Mom's Milk API</h1>

<p align="center">
  A platform built with NestJS to connect breast milk donors with parents in need.
</p>

---

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Environment Configuration](#environment-configuration)
  - [Running with Docker (Recommended for Development)](#running-with-docker-recommended-for-development)
  - [Running Locally](#running-locally)
- [Database](#database)
  - [Running Migrations](#running-migrations)
  - [Creating an Admin User](#creating-an-admin-user)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Data Models](#data-models)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [License](#license)

---

## Description

Mom's Milk is a platform that connects breast milk donors with parents in need. Built with NestJS, this API provides secure endpoints for user registration, authentication, donor/buyer profile management, and milk donation requests.

## Features

- 🔐 Secure authentication with JWT and email OTP verification
- 👥 User roles: Donors, Buyers, and Admins
- 📝 Comprehensive profile management for donors and buyers
- 🔍 Search functionality to find donors by location
- ✉️ Email notifications for important updates
- 🤝 Request management system for milk donations
## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized development)
- A Git client

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd momsMilk
```

### 2. Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the root of the project by copying the example below.

```bash
# .env

# Application
NODE_ENV=development
PORT=3000

# Database Configuration (for Docker setup)
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=moms_milk_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_that_is_long

# SMTP Configuration (e.g., for Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM="Moms Milk <your_email@gmail.com>"
```
**Note:** For local development without Docker, you might need to change `DATABASE_HOST` to `localhost` and `DATABASE_PORT` to `5433` (as mapped in `docker-compose.yml`).

### 3. Running with Docker (Recommended for Development)

This is the easiest way to get the application and the database running.

```bash
# Build and start the services in detached mode
docker-compose up --build -d
```

The API will be available at `http://localhost:3000`.

To view logs:
```bash
docker-compose logs -f api
```

To stop the services:
```bash
docker-compose down
```

### 4. Running Locally (without Docker)

If you prefer to run the application directly on your machine, you'll need a running PostgreSQL instance.

```bash
# Install dependencies
npm install

# Run the application in development mode
npm run start:dev
```

The application will start on `http://localhost:3000`.

## Database

### Running Migrations

The project uses TypeORM for database management. After starting the application for the first time, you'll need to run the database migrations to create the necessary tables.

If using Docker, you can run the command inside the `api` container:
```bash
docker-compose exec api npm run migration:run
```

If running locally:
```bash
npm run migration:run
```

### Creating an Admin User

To manage the platform, you need an admin user. You can create one by running the following SQL query against your database.

```sql
INSERT INTO users (id, "fullName", email, password, role, "createdAt", "updatedAt")
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Admin User',
  'admin@momsmilk.com',
  -- Replace with a securely generated bcrypt hash of your password
  '$2b$10$YourHashedPasswordHere',
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```
**Important**: Replace `'$2b$10$YourHashedPasswordHere'` with an actual bcrypt hash of the password you want to use. You can use an online tool or a simple script to generate one.

## API Documentation

A full, interactive API documentation is available via Swagger UI once the application is running.

- **Swagger UI**: http://localhost:3000/api

Here is a quick overview of the available endpoints:

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string",
  "role": "donor" | "buyer",
  "zipCode": "string"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "string",
  "otp": "string"
}
```

### Donor Endpoints

#### Create Donor Profile
```http
POST /donors/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "babyDeliveryDate": "2025-07-26T00:00:00.000Z",
  "bloodGroup": "string",
  "willingToShareTestResults": boolean,
  "healthConditions": "string"
}
```

#### Update Donor Profile
```http
PUT /donors/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "babyDeliveryDate": "2025-07-26T00:00:00.000Z",
  "bloodGroup": "string",
  "willingToShareTestResults": boolean,
  "healthConditions": "string"
}
```

#### Get Donor Profile
```http
GET /donors/profile
Authorization: Bearer <token>
```

#### Toggle Availability
```http
PUT /donors/toggle-availability
Authorization: Bearer <token>
```

#### Find Donors by ZIP Code
```http
GET /donors/available/:zipCode
Authorization: Bearer <token>
```

### Buyer Endpoints

#### Create Buyer Profile
```http
POST /buyers/profile
Authorization: Bearer <token>
```

#### Get Buyer Profile
```http
GET /buyers/profile
Authorization: Bearer <token>
```

### Request Endpoints

#### Create Request
```http
POST /requests/:donorId
Authorization: Bearer <token>
```

#### Update Request Status
```http
PUT /requests/:requestId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted" | "rejected"
}
```

#### Get Buyer Requests
```http
GET /requests/buyer
Authorization: Bearer <token>
```

#### Get Donor Requests
```http
GET /requests/donor
Authorization: Bearer <token>
```

## Data Models

### User
```typescript
{
  id: uuid
  fullName: string
  email: string
  password: string
  phoneNumber: string
  role: "admin" | "donor" | "buyer"
  zipCode: string
  createdAt: Date
  updatedAt: Date
}
```

### Donor
```typescript
{
  id: uuid
  babyDeliveryDate: Date
  bloodGroup: string
  willingToShareTestResults: boolean
  healthConditions: string
  isAvailable: boolean
  userId: uuid
}
```

### Buyer
```typescript
{
  id: uuid
  userId: uuid
}
```

### Request
```typescript
{
  id: uuid
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
  donorId: uuid
  buyerId: uuid
}
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Environment Variables

The application requires the following environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=momsmilk

# JWT Configuration
JWT_SECRET=your-secret-key

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="Moms Milk <noreply@momsmilk.com>"
```

## Docker Deployment

The application includes Docker configuration for easy deployment:

```bash
# Build and start containers
docker-compose up --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

## Error Handling

The API implements a standardized error response format:

```json
{
  "statusCode": number,
  "message": string,
  "error": string
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security Features

1. **JWT Authentication**: All protected routes require a valid JWT token
2. **Email Verification**: New users must verify their email via OTP
3. **Password Hashing**: Passwords are hashed using bcrypt
4. **Rate Limiting**: API endpoints are protected against brute force attacks
5. **Input Validation**: All requests are validated using class-validator

## License

[MIT licensed](LICENSE)
