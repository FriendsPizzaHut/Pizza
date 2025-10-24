#!/bin/bash

# Dashboard API Test Script
# Tests all dashboard endpoints and verifies responses

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 DASHBOARD API TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BASE_URL="http://localhost:5000/api/v1"
AUTH_TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    
    echo "📍 Testing: $name"
    echo "   Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "   ${GREEN}✅ Success (200)${NC}"
        echo "   Response preview: $(echo $body | jq -r '.message // .success // "OK"' 2>/dev/null || echo "Response received")"
    else
        echo -e "   ${RED}❌ Failed ($http_code)${NC}"
        echo "   Error: $(echo $body | jq -r '.message // .error' 2>/dev/null || echo $body)"
    fi
    echo ""
}

echo "🔐 Step 1: Authentication (if needed)"
echo "   Note: Replace with your actual admin auth token"
echo ""

echo "📊 Step 2: Testing Dashboard Endpoints"
echo ""

# Test main overview endpoint
test_endpoint "Dashboard Overview (Main)" "/dashboard/overview"

# Test individual endpoints
test_endpoint "Dashboard Stats" "/dashboard/stats"
test_endpoint "Hourly Sales" "/dashboard/hourly-sales"
test_endpoint "System Status" "/dashboard/system-status"
test_endpoint "Revenue Chart (7 days)" "/dashboard/revenue-chart?days=7"
test_endpoint "Top Products (5)" "/dashboard/top-products?limit=5"
test_endpoint "Recent Activities (20)" "/dashboard/activities?limit=20"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Cache Testing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏱️  First call (should hit MongoDB)..."
time curl -s "$BASE_URL/dashboard/overview" > /dev/null
echo ""

echo "⏱️  Second call (should hit Redis cache)..."
time curl -s "$BASE_URL/dashboard/overview" > /dev/null
echo ""

echo "Note: Second call should be significantly faster!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Performance Testing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Testing 10 concurrent requests to overview endpoint..."
for i in {1..10}; do
    curl -s "$BASE_URL/dashboard/overview" > /dev/null &
done
wait
echo -e "${GREEN}✅ All 10 requests completed${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Redis Cache Inspection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Dashboard cache keys:"
redis-cli KEYS "dashboard:*"
echo ""

echo "Cache TTL for overview:"
redis-cli TTL "dashboard:overview"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Testing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
