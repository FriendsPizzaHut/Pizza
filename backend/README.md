# 🍕 Pizza Backend API

A production-grade backend built with **Node.js**, **Express**, **MongoDB**, **Redis**, and **Socket.IO** for real-time pizza ordering and delivery management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Real-time Events](#real-time-events)
- [Scripts](#scripts)
- [Best Practices](#best-practices)

## ✨ Features

- 🔐 **Authentication & Authorization**: JWT-based secure authentication
- 🛒 **Order Management**: Complete order lifecycle management
- 🚴 **Real-time Delivery Tracking**: Live location updates via Socket.IO
- 🏪 **Shop Status**: Real-time shop open/close status
- 💳 **Payment Integration**: Secure payment processing
- 📦 **Caching**: Redis for improved performance
- 🔄 **Real-time Updates**: Socket.IO for live notifications
- 🛡️ **Security**: Helmet, CORS, rate limiting
- 📝 **Logging**: Morgan for HTTP request logging
- ⚡ **Scalable Architecture**: Clean, modular, and maintainable code

## 🛠️ Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis with ioredis
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Environment**: dotenv

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (DB, Redis, Socket)
│   │   ├── db.js        # MongoDB connection setup
│   │   ├── redis.js     # Redis client configuration
│   │   └── socket.js    # Socket.IO initialization
│   │
│   ├── controllers/     # Request handlers (business logic)
│   │   # Add your controllers here (e.g., userController.js, orderController.js)
│   │
│   ├── middlewares/     # Custom middleware functions
│   │   ├── errorHandler.js  # Centralized error handling
│   │   └── auth.js          # Authentication & authorization
│   │
│   ├── models/          # Mongoose schemas and models
│   │   # Add your models here (e.g., User.js, Order.js, Shop.js)
│   │
│   ├── routes/          # Express route definitions
│   │   # Add your routes here (e.g., userRoutes.js, orderRoutes.js)
│   │
│   ├── services/        # Business logic & reusable services
│   │   # Add services here (e.g., paymentService.js, emailService.js)
│   │
│   ├── sockets/         # Socket.IO event handlers
│   │   └── eventHandlers.js  # Real-time event emissions
│   │
│   ├── utils/           # Helper functions
│   │   ├── response.js  # Standardized response formatter
│   │   └── token.js     # JWT token generation & verification
│   │
│   ├── jobs/            # Background jobs & cron tasks
│   │   # Add jobs here (e.g., cleanupJob.js, reportJob.js)
│   │
│   └── app.js          # Express app configuration
│
├── server.js           # Server entry point
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── README.md          # Project documentation
```

### 📂 Folder Responsibilities

- **config/**: Handles all external service connections (DB, Redis, Socket.IO)
- **controllers/**: Contains request handling logic, delegates to services
- **middlewares/**: Request processing, authentication, error handling
- **models/**: Database schemas and data models
- **routes/**: API endpoint definitions and route mapping
- **services/**: Reusable business logic, external API integrations
- **sockets/**: Real-time event handling and WebSocket communication
- **utils/**: Helper functions, formatters, generators
- **jobs/**: Scheduled tasks, background workers, queue processors

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Redis (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual configuration values.

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Start Redis** (if running locally)
   ```bash
   redis-server
   ```

6. **Run the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pizza_db` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret for JWT signing | `your_secret_key` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:3000` |

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Health Check
```
GET /health
```

### Authentication Endpoints
```
POST /api/v1/auth/register    - Register new user
POST /api/v1/auth/login       - Login user
POST /api/v1/auth/logout      - Logout user
POST /api/v1/auth/refresh     - Refresh access token
```

### Order Endpoints
```
GET    /api/v1/orders          - Get all orders (admin)
POST   /api/v1/orders          - Create new order
GET    /api/v1/orders/:id      - Get order details
PUT    /api/v1/orders/:id      - Update order status
DELETE /api/v1/orders/:id      - Cancel order
```

*(Add more endpoints as you build them)*

## ⚡ Real-time Events

### Socket.IO Events

#### Client → Server
```javascript
socket.emit('join-room', roomId);
socket.emit('leave-room', roomId);
```

#### Server → Client
```javascript
// Shop status updates
socket.on('shop:status-changed', (data) => {
  // { shopId, isOpen, message, timestamp }
});

// Order updates
socket.on('order:updated', (data) => {
  // { orderId, status, message, orderDetails, timestamp }
});

// Delivery location updates
socket.on('delivery:location-update', (data) => {
  // { orderId, deliveryBoyId, location: {latitude, longitude}, timestamp }
});

// Payment status updates
socket.on('payment:status-update', (data) => {
  // { orderId, paymentId, status, message, timestamp }
});
```

## 📜 Scripts

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Lint code
npm run lint

# Run tests (add test framework later)
npm test
```

## 🎯 Best Practices

### Code Organization
- ✅ Use **ESM** (import/export) syntax throughout
- ✅ Keep files small and focused (Single Responsibility Principle)
- ✅ Use async/await for asynchronous operations
- ✅ Implement proper error handling with try-catch blocks
- ✅ Use middleware for cross-cutting concerns (auth, logging, error handling)

### Security
- ✅ Never commit `.env` files (add to `.gitignore`)
- ✅ Use Helmet for security headers
- ✅ Implement rate limiting for API endpoints
- ✅ Validate and sanitize all user inputs
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

### Performance
- ✅ Use Redis for caching frequently accessed data
- ✅ Implement database indexing
- ✅ Use pagination for large data sets
- ✅ Compress responses with gzip
- ✅ Use connection pooling for database

### Database
- ✅ Define proper schemas with validation
- ✅ Use indexes for frequently queried fields
- ✅ Implement soft deletes instead of hard deletes
- ✅ Use transactions for critical operations

### Real-time Communication
- ✅ Use rooms for targeted message delivery
- ✅ Implement reconnection logic on client side
- ✅ Handle disconnections gracefully
- ✅ Limit event payload size

## 🔄 Next Steps

1. **Add Models**: Create Mongoose schemas in `src/models/`
2. **Add Controllers**: Implement business logic in `src/controllers/`
3. **Add Routes**: Define API endpoints in `src/routes/`
4. **Add Services**: Create reusable services in `src/services/`
5. **Add Validation**: Implement request validation middleware
6. **Add Tests**: Write unit and integration tests
7. **Add Documentation**: Set up Swagger/OpenAPI documentation
8. **Add Rate Limiting**: Implement rate limiting middleware
9. **Add File Upload**: Configure multer for file uploads
10. **Add Notifications**: Implement email/SMS notifications

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributors

- Your Name - Initial work

## 🐛 Issues

If you find any bugs or have suggestions, please open an issue.

---

**Happy Coding! 🚀**
