#!/bin/bash

# Test Restaurant Settings API Endpoints

echo "🧪 Testing Restaurant Settings API"
echo "=================================="
echo ""

BASE_URL="http://localhost:5000/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Get Public Settings (No Auth Required)
echo "📝 Test 1: GET /restaurant-settings/public"
echo "-------------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/restaurant-settings/public")
HTTP_CODE=$(echo "$RESPONSE" | grep HTTP_CODE | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS${NC} - Status: $HTTP_CODE"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ FAILED${NC} - Status: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Get Admin Settings (Requires Admin Auth)
echo "📝 Test 2: GET /admin/restaurant-settings"
echo "-------------------------------------------"
echo "⚠️  This requires admin authentication"
echo "Use Postman or include auth token to test"
echo ""

# Test 3: Update Settings (Requires Admin Auth)
echo "📝 Test 3: PUT /admin/restaurant-settings"
echo "-------------------------------------------"
echo "⚠️  This requires admin authentication"
echo "Use Postman or include auth token to test"
echo ""

echo "=================================="
echo "✅ Public endpoint test complete!"
echo "🔒 Admin endpoints require authentication"
echo ""
echo "💡 To test admin endpoints:"
echo "   1. Login as admin to get token"
echo "   2. Use: curl -H 'Authorization: Bearer TOKEN' $BASE_URL/admin/restaurant-settings"
