#!/bin/bash

# Redis Caching Test Script
# Tests all cached endpoints and verifies cache behavior

echo "🚀 Testing Redis Caching Integration"
echo "======================================"
echo ""

BASE_URL="http://localhost:5000/api/v1"
ADMIN_TOKEN="your_admin_token_here"

echo "📌 Test 1: Business Info Caching"
echo "--------------------------------"
echo "First request (cache miss):"
time curl -s "$BASE_URL/business" | jq '{success, fromCache: .data.fromCache}'
echo ""
echo "Second request (cache hit):"
time curl -s "$BASE_URL/business" | jq '{success, fromCache: .data.fromCache}'
echo ""

echo "📌 Test 2: Product List Caching"
echo "--------------------------------"
echo "First request (cache miss):"
time curl -s "$BASE_URL/products" | jq '{success, count: (.data | length), fromCache: .data[0].fromCache}'
echo ""
echo "Second request (cache hit):"
time curl -s "$BASE_URL/products" | jq '{success, count: (.data | length), fromCache: .data[0].fromCache}'
echo ""

echo "📌 Test 3: Active Coupons Caching"
echo "----------------------------------"
echo "First request (cache miss):"
time curl -s "$BASE_URL/coupons?isActive=true" | jq '{success, count: (.data | length)}'
echo ""
echo "Second request (cache hit):"
time curl -s "$BASE_URL/coupons?isActive=true" | jq '{success, count: (.data | length)}'
echo ""

echo "📌 Test 4: Dashboard Stats Caching (requires admin token)"
echo "----------------------------------------------------------"
echo "First request (cache miss):"
time curl -s "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success, fromCache: .data.fromCache}'
echo ""
echo "Second request (cache hit):"
time curl -s "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success, fromCache: .data.fromCache}'
echo ""

echo "📌 Test 5: Top Products Caching (requires admin token)"
echo "-------------------------------------------------------"
echo "First request (cache miss):"
time curl -s "$BASE_URL/dashboard/top-products?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success, fromCache: .data.fromCache}'
echo ""
echo "Second request (cache hit):"
time curl -s "$BASE_URL/dashboard/top-products?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success, fromCache: .data.fromCache}'
echo ""

echo "✅ Cache Testing Complete!"
echo ""
echo "📊 Expected Results:"
echo "- First requests: slower (~20-200ms), fromCache: undefined or false"
echo "- Second requests: faster (~1-5ms), fromCache: true"
echo ""
echo "💡 Tips:"
echo "1. Replace ADMIN_TOKEN with a real admin JWT token"
echo "2. Ensure Redis is running: redis-cli PING"
echo "3. Monitor Redis keys: redis-cli KEYS '*'"
echo "4. Check cache contents: redis-cli GET 'products:all'"
