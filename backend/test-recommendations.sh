#!/bin/bash

# User Preference System Testing Script
# Tests all recommendation endpoints

echo "🧪 Testing User Preference & Recommendation System"
echo "=================================================="
echo ""

# Base URL
BASE_URL="http://localhost:5000/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local token=$4
    
    echo -e "${YELLOW}Testing: ${name}${NC}"
    
    if [ "$token" = "" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ PASS${NC} - HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - HTTP $http_code"
        echo "$body"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

echo "📝 Please provide a customer authentication token:"
read -p "Token: " CUSTOMER_TOKEN

echo ""
echo "Starting tests..."
echo ""

# Test 1: Get Personalized Recommendations
test_endpoint \
    "Get Personalized Recommendations" \
    "GET" \
    "/recommendations/personalized?limit=10" \
    "$CUSTOMER_TOKEN"

# Test 2: Get Reorder Suggestions
test_endpoint \
    "Get Reorder Suggestions" \
    "GET" \
    "/recommendations/reorder?limit=5" \
    "$CUSTOMER_TOKEN"

# Test 3: Get Category Recommendations (Pizza)
test_endpoint \
    "Get Pizza Category Recommendations" \
    "GET" \
    "/recommendations/category/pizza?limit=10" \
    "$CUSTOMER_TOKEN"

# Test 4: Get Category Recommendations (Beverages)
test_endpoint \
    "Get Beverages Category Recommendations" \
    "GET" \
    "/recommendations/category/beverages?limit=10" \
    "$CUSTOMER_TOKEN"

# Test 5: Get User Ordering Stats
test_endpoint \
    "Get User Ordering Statistics" \
    "GET" \
    "/recommendations/stats" \
    "$CUSTOMER_TOKEN"

# Test 6: Get Frequently Bought Together (public endpoint)
echo "Enter a product ID to test 'Frequently Bought Together':"
read -p "Product ID: " PRODUCT_ID

if [ ! -z "$PRODUCT_ID" ]; then
    test_endpoint \
        "Get Frequently Bought Together" \
        "GET" \
        "/recommendations/frequently-bought/$PRODUCT_ID?limit=3" \
        ""
fi

echo ""
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi
