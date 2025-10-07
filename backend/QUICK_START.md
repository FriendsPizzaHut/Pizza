# 🚀 Quick Start Guide - Prompt 2 Complete

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v18+)
- ✅ MongoDB running (local or Atlas)
- ✅ Redis running (local or cloud)

---

## 🔧 Setup Steps

### 1. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required variables:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pizza_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

### 2. Check Services

**MongoDB (local):**
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Or start MongoDB
mongod
# Or on Linux:
sudo systemctl start mongod
```

**Redis (local):**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Or start Redis
redis-server
# Or on Linux:
sudo systemctl start redis
```

### 3. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

---

## ✅ Expected Output

When you run `npm run dev`, you should see:

```
✅ Redis connected successfully
✅ Redis client is ready to use
✅ Socket.IO initialized successfully
✅ MongoDB Connected: localhost
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server is running in development mode
🌐 Server URL: http://localhost:5000
⚡ Socket.IO is active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Test Endpoints

### Using curl:

```bash
# Test 1: API Health Check (should return { status: "ok" })
curl http://localhost:5000/api/health

# Test 2: Detailed Health Check
curl http://localhost:5000/health

# Test 3: Root Endpoint
curl http://localhost:5000/

# Test 4: 404 Error Handling
curl http://localhost:5000/nonexistent

# Test 5: User Registration
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'
```

### Or run automated tests:

```bash
./test-setup.sh
```

---

## 🌐 Access in Browser

Open your browser and visit:
- http://localhost:5000 - Welcome message
- http://localhost:5000/health - Health check
- http://localhost:5000/api/health - Simple health check

---

## 🐛 Troubleshooting

### Problem: "MongoDB Connection Error"

**Solutions:**
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Start MongoDB
mongod
# Or
sudo systemctl start mongod

# Check .env file has correct MONGODB_URI
```

### Problem: "Redis connection error"

**Solutions:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server
# Or
sudo systemctl start redis

# Check .env file has correct REDIS_HOST and REDIS_PORT
```

### Problem: "Port 5000 already in use"

**Solutions:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env file
PORT=5001
```

### Problem: "Cannot find module..."

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📋 Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run linter
npm run lint

# Run tests (when implemented)
npm test

# Check logs
tail -f logs/app.log  # if logging to file
```

---

## 🔍 Verify Everything Works

Run these checks:

1. **Server Running:** 
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"ok"}`

2. **MongoDB Connected:**
   Check server logs for: `✅ MongoDB Connected`

3. **Redis Connected:**
   Check server logs for: `✅ Redis connected successfully`

4. **Socket.IO Active:**
   Check server logs for: `✅ Socket.IO initialized successfully`

---

## 🎯 What's Ready to Use

### Connections:
- ✅ MongoDB (Mongoose ORM)
- ✅ Redis (ioredis client)
- ✅ Socket.IO (Real-time WebSocket)

### Middleware:
- ✅ Body parser (JSON & URL-encoded)
- ✅ CORS (Cross-origin requests)
- ✅ Helmet (Security headers)
- ✅ Morgan (HTTP logging)
- ✅ Error handler (Centralized)

### Endpoints:
- ✅ GET / - Welcome
- ✅ GET /health - Detailed health
- ✅ GET /api/health - Simple health
- ✅ POST /api/v1/users/register
- ✅ POST /api/v1/users/login
- ✅ GET /api/v1/users/profile (auth required)

---

## 📚 Documentation

- **README.md** - Complete project documentation
- **SETUP_COMPLETE.md** - Initial setup guide
- **PROMPT_2_COMPLETE.md** - Detailed Prompt 2 verification
- **QUICK_START.md** - This guide

---

## 🎉 Success!

If you see all the ✅ checkmarks in your console, you're ready to go!

**Next:** You can now proceed to Prompt 3 for additional features like:
- Authentication & Authorization
- Order Management
- Payment Integration
- And more...

---

**Need Help?** Check the troubleshooting section or review the logs for error messages.
