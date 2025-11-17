#!/bin/bash

# Test script for Favorites Section Fix
# This script helps verify that the favorites data is being fetched correctly

echo "======================================"
echo "Favorites Section - Backend Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing user profile fetch with populated favorites...${NC}"
echo ""

# You'll need to replace USER_ID and AUTH_TOKEN with real values
echo "To test manually, use this curl command:"
echo ""
echo "curl -X GET \\"
echo "  'http://localhost:5000/api/users/YOUR_USER_ID' \\"
echo "  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \\"
echo "  -H 'Content-Type: application/json'"
echo ""

echo -e "${YELLOW}What to check in the response:${NC}"
echo "1. Look for 'orderingBehavior.mostOrderedItems'"
echo "2. Each item should have a populated 'productId' object"
echo "3. productId should contain:"
echo "   - _id"
echo "   - name"
echo "   - imageUrl"
echo "   - category"
echo "   - pricing"
echo "   - isAvailable"
echo ""

echo -e "${GREEN}Expected structure:${NC}"
cat << 'EOF'
{
  "success": true,
  "data": {
    "_id": "user123",
    "name": "John Doe",
    "orderingBehavior": {
      "mostOrderedItems": [
        {
          "productId": {
            "_id": "prod123",
            "name": "Margherita Pizza",
            "imageUrl": "https://...",
            "category": "pizza",
            "pricing": 299,
            "isAvailable": true
          },
          "count": 5,
          "totalSpent": 1495,
          "lastOrdered": "2025-11-15T10:30:00.000Z"
        }
      ]
    }
  }
}
EOF

echo ""
echo -e "${YELLOW}Common Issues & Solutions:${NC}"
echo ""
echo "❌ productId is just a string ID:"
echo "   → Check that User model is being populated correctly"
echo "   → Verify getUserById uses .populate() in userService.js"
echo ""
echo "❌ productId is null:"
echo "   → Product may have been deleted from database"
echo "   → User has no order history yet"
echo ""
echo "❌ Empty mostOrderedItems array:"
echo "   → User hasn't placed any orders"
echo "   → Check if orderingBehavior is being updated on order creation"
echo ""

echo -e "${GREEN}Quick Database Check:${NC}"
echo "Connect to MongoDB and run:"
echo ""
echo "  use pizza_db"
echo "  db.users.findOne("
echo "    { role: 'customer' },"
echo "    { 'orderingBehavior.mostOrderedItems': 1 }"
echo "  )"
echo ""

echo "======================================"
echo "Test script complete!"
echo "======================================"
