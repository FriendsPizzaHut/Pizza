#!/bin/bash

# 🧪 Delivery Agent Online/Offline System - Test Script
# This script helps test the complete online/offline functionality

echo "🚴 Delivery Agent Status System - Test Script"
echo "=============================================="
echo ""

# Check if AUTH_TOKEN is provided
if [ -z "$1" ]; then
    echo "❌ Error: Delivery agent auth token required"
    echo ""
    echo "Usage: ./test-delivery-status.sh <DELIVERY_AGENT_AUTH_TOKEN>"
    echo ""
    echo "Steps:"
    echo "1. Login as delivery agent"
    echo "2. Copy the auth token"
    echo "3. Run: ./test-delivery-status.sh YOUR_TOKEN"
    exit 1
fi

AUTH_TOKEN="$1"
API_URL="http://localhost:5000/api/v1"

echo "🔑 Using token: ${AUTH_TOKEN:0:20}..."
echo ""

# Test 1: Get Current Status
echo "📋 Test 1: Get Current Status"
echo "GET $API_URL/delivery-agent/status"
echo ""
curl -X GET "$API_URL/delivery-agent/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -s | json_pp
echo ""
echo "---"
echo ""

# Wait for user
read -p "Press Enter to continue to Test 2..."
echo ""

# Test 2: Go ONLINE
echo "🟢 Test 2: Set Status to ONLINE"
echo "PATCH $API_URL/delivery-agent/status"
echo '{ "isOnline": true }'
echo ""
curl -X PATCH "$API_URL/delivery-agent/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOnline": true}' \
  -s | json_pp
echo ""
echo "---"
echo ""

# Wait for user
read -p "Press Enter to continue to Test 3..."
echo ""

# Test 3: Verify Status Changed
echo "✅ Test 3: Verify Status is ONLINE"
echo "GET $API_URL/delivery-agent/status"
echo ""
curl -X GET "$API_URL/delivery-agent/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -s | json_pp
echo ""
echo "---"
echo ""

# Wait for user
read -p "Press Enter to continue to Test 4..."
echo ""

# Test 4: Try to Go OFFLINE (should work if no active orders)
echo "🔴 Test 4: Set Status to OFFLINE"
echo "PATCH $API_URL/delivery-agent/status"
echo '{ "isOnline": false }'
echo ""
curl -X PATCH "$API_URL/delivery-agent/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOnline": false}' \
  -s | json_pp
echo ""
echo "---"
echo ""

# Wait for user
read -p "Press Enter to continue to Test 5..."
echo ""

# Test 5: Final Status Check
echo "📊 Test 5: Final Status Check"
echo "GET $API_URL/delivery-agent/status"
echo ""
curl -X GET "$API_URL/delivery-agent/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -s | json_pp
echo ""
echo "---"
echo ""

echo "✅ All tests completed!"
echo ""
echo "Next Steps:"
echo "1. Open admin panel (AssignDeliveryAgentScreen)"
echo "2. Toggle status in delivery agent app"
echo "3. Watch admin panel update in real-time via Socket.IO"
echo ""
echo "Socket Events to Monitor:"
echo "- delivery:agent:status:update"
echo ""
echo "Expected Behavior:"
echo "✅ Admin sees instant updates (no refresh needed)"
echo "✅ Can go online anytime"
echo "✅ Cannot go offline with active 'out_for_delivery' orders"
echo "✅ Status persists in database"
