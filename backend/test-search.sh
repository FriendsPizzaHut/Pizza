#!/bin/bash

# 🔍 Search Functionality Test Script
# Tests the product search API with various scenarios

echo "🧪 Testing Product Search API"
echo "================================"
echo ""

# Base URL (adjust if needed)
BASE_URL="http://localhost:5000/api/v1/products"

# Test 1: Simple search
echo "Test 1: Search for 'pizza'"
echo "-------------------------"
curl -s "$BASE_URL?search=pizza&page=1&limit=5" | jq '.total, .page, .limit, .data[0].name'
echo ""

# Test 2: Partial match
echo "Test 2: Search for 'marg' (partial)"
echo "-------------------------"
curl -s "$BASE_URL?search=marg&page=1&limit=5" | jq '.total, .data[].name'
echo ""

# Test 3: Search in description
echo "Test 3: Search for 'cheese' (description)"
echo "-------------------------"
curl -s "$BASE_URL?search=cheese&page=1&limit=5" | jq '.total, .data[].name'
echo ""

# Test 4: Search with category filter
echo "Test 4: Search 'vegetarian' in pizza category"
echo "-------------------------"
curl -s "$BASE_URL?search=vegetarian&category=pizza&page=1&limit=5" | jq '.total, .data[].name'
echo ""

# Test 5: Pagination
echo "Test 5: Search 'a' - Page 1 vs Page 2"
echo "-------------------------"
echo "Page 1:"
curl -s "$BASE_URL?search=a&page=1&limit=3" | jq '.page, .total, .hasMore, .data[].name'
echo ""
echo "Page 2:"
curl -s "$BASE_URL?search=a&page=2&limit=3" | jq '.page, .total, .hasMore, .data[].name'
echo ""

# Test 6: No results
echo "Test 6: Search for gibberish"
echo "-------------------------"
curl -s "$BASE_URL?search=xyzabc123&page=1&limit=5" | jq '.total, .data'
echo ""

# Test 7: Case insensitive
echo "Test 7: Case insensitive (PIZZA vs pizza)"
echo "-------------------------"
curl -s "$BASE_URL?search=PIZZA&page=1&limit=3" | jq '.total'
curl -s "$BASE_URL?search=pizza&page=1&limit=3" | jq '.total'
echo ""

# Test 8: Empty search (all products)
echo "Test 8: Empty search (all products)"
echo "-------------------------"
curl -s "$BASE_URL?page=1&limit=5" | jq '.total, .page, .limit, .hasMore'
echo ""

echo "✅ All tests completed!"
