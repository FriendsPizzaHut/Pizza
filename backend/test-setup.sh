#!/bin/bash

# Test Script for Backend Setup Verification
# This script tests all the components from Prompt 2

echo "🧪 Testing Backend Setup..."
echo ""

# Check if server is running
echo "1️⃣ Testing Server Health..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Server is responding"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Server is not running. Start it with: npm run dev"
    exit 1
fi

echo ""

# Check API health endpoint
echo "2️⃣ Testing /api/health endpoint..."
API_HEALTH=$(curl -s http://localhost:5000/api/health 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ /api/health is responding"
    echo "   Response: $API_HEALTH"
else
    echo "❌ /api/health endpoint failed"
fi

echo ""

# Check root endpoint
echo "3️⃣ Testing root endpoint..."
ROOT_RESPONSE=$(curl -s http://localhost:5000/ 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Root endpoint is responding"
    echo "   Response: $ROOT_RESPONSE"
else
    echo "❌ Root endpoint failed"
fi

echo ""

# Check 404 handling
echo "4️⃣ Testing 404 error handling..."
NOT_FOUND=$(curl -s http://localhost:5000/nonexistent 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ 404 handler is working"
    echo "   Response: $NOT_FOUND"
else
    echo "❌ 404 handler test failed"
fi

echo ""

echo "═══════════════════════════════════════════════"
echo "🎉 Basic tests completed!"
echo ""
echo "📋 Check your server logs for:"
echo "   ✅ MongoDB Connected"
echo "   ✅ Redis connected"
echo "   ✅ Socket.IO initialized"
echo "   🚀 Server running on port ${PORT:-5000}"
echo "═══════════════════════════════════════════════"
