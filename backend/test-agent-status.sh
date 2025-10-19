#!/bin/bash

# 🚴 Delivery Agent Online/Offline Status Test Script
# Quick test for the complete flow

echo "🧪 Delivery Agent Status System Test"
echo "====================================="
echo ""

API_URL="http://localhost:5000/api/v1"

echo "Please provide delivery agent credentials:"
read -p "Email: " DELIVERY_EMAIL
read -sp "Password: " DELIVERY_PASSWORD
echo ""
echo ""

# Test 1: Login
echo "🔐 Test 1: Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$DELIVERY_EMAIL\", \"password\": \"$DELIVERY_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" == "null" ]; then
    echo "❌ Login failed!"
    exit 1
fi
echo "✅ Login successful!"
echo ""

# Test 2: Get Current Status
echo "📊 Test 2: Current Status"
curl -s -X GET "$API_URL/delivery-agent/status" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 3: Go Online
echo "🟢 Test 3: Go Online"
curl -s -X PATCH "$API_URL/delivery-agent/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isOnline": true}' | jq '.'
echo ""
sleep 1

# Test 4: Go Offline
echo "🔴 Test 4: Go Offline"
curl -s -X PATCH "$API_URL/delivery-agent/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isOnline": false}' | jq '.'
echo ""

echo "✅ Tests complete!"
