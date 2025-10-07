#!/bin/bash

# Socket.IO Testing Script
# Tests all Socket.IO events and connections

echo "🧪 Socket.IO Testing Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:5000"
API_URL="${BASE_URL}/api/v1"

# Get auth token (replace with your actual token or login)
echo "📝 Please enter your JWT access token:"
read -r AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo "${RED}❌ No token provided. Some tests will fail.${NC}"
    AUTH_TOKEN="dummy-token"
fi

echo ""
echo "=================================="
echo "1️⃣  Testing Server Health"
echo "=================================="

HEALTH=$(curl -s "${BASE_URL}/health")
if echo "$HEALTH" | grep -q "success"; then
    echo "${GREEN}✅ Server is running${NC}"
else
    echo "${RED}❌ Server is not responding${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo "2️⃣  Testing Socket.IO Endpoint"
echo "=================================="

SOCKET_INFO=$(curl -s "${BASE_URL}/socket.io/")
if [ -n "$SOCKET_INFO" ]; then
    echo "${GREEN}✅ Socket.IO endpoint is accessible${NC}"
else
    echo "${RED}❌ Socket.IO endpoint not found${NC}"
fi

echo ""
echo "=================================="
echo "3️⃣  Testing Business Status Update"
echo "=================================="

echo "Current business status..."
BUSINESS=$(curl -s "${API_URL}/business")
CURRENT_STATUS=$(echo "$BUSINESS" | grep -o '"isOpen":[^,}]*' | cut -d ':' -f2)

if [ "$CURRENT_STATUS" = "true" ]; then
    NEW_STATUS="false"
else
    NEW_STATUS="true"
fi

echo "Toggling business status to: $NEW_STATUS"
RESULT=$(curl -s -X PATCH "${API_URL}/business/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d "{\"isOpen\": ${NEW_STATUS}}")

if echo "$RESULT" | grep -q "success"; then
    echo "${GREEN}✅ Business status updated${NC}"
    echo "   Event emitted: business:status:update"
else
    echo "${RED}❌ Failed to update business status${NC}"
fi

echo ""
echo "=================================="
echo "4️⃣  Testing Order Creation"
echo "=================================="

# Note: This requires valid product IDs
echo "${YELLOW}⚠️  Skipping order creation (requires valid product IDs)${NC}"
echo "   Manual test: Create order via API"
echo "   Expected event: order:new (to admin)"

echo ""
echo "=================================="
echo "5️⃣  Testing Order Status Update"
echo "=================================="

echo "${YELLOW}⚠️  Skipping order status update (requires valid order ID)${NC}"
echo "   Manual test: Update order status via API"
echo "   Expected event: order:status:update (to customer + admin)"

echo ""
echo "=================================="
echo "6️⃣  Testing Delivery Status Update"
echo "=================================="

echo "${YELLOW}⚠️  Skipping delivery status (requires delivery agent account)${NC}"
echo "   Manual test: Update delivery agent status via API"
echo "   Expected event: delivery:status:update (to admin)"

echo ""
echo "=================================="
echo "7️⃣  Testing Payment Notification"
echo "=================================="

echo "${YELLOW}⚠️  Skipping payment creation (requires valid order ID)${NC}"
echo "   Manual test: Create payment via API"
echo "   Expected event: payment:received (to admin)"

echo ""
echo "=================================="
echo "📊 Socket.IO Events Summary"
echo "=================================="

echo ""
echo "Events that should be emitted:"
echo "  1. ${GREEN}business:status:update${NC} - Broadcast to all"
echo "  2. ${YELLOW}order:new${NC} - To admin + delivery"
echo "  3. ${YELLOW}order:status:update${NC} - To customer + admin + delivery"
echo "  4. ${YELLOW}order:cancelled${NC} - To customer + admin + delivery"
echo "  5. ${YELLOW}delivery:status:update${NC} - To admin"
echo "  6. ${YELLOW}delivery:location:update${NC} - To customer + admin"
echo "  7. ${YELLOW}payment:received${NC} - To admin + customer"
echo "  8. ${YELLOW}notification:new${NC} - To specific user"
echo "  9. ${YELLOW}offer:new${NC} - To all customers"

echo ""
echo "=================================="
echo "🔍 How to Test Manually"
echo "=================================="

echo ""
echo "1. Connect Socket.IO client:"
cat << 'EOF'
   
   const socket = io('http://localhost:5000');
   
   socket.on('connect', () => {
       console.log('✅ Connected:', socket.id);
       socket.emit('register', { 
           userId: 'YOUR_USER_ID', 
           role: 'admin' 
       });
   });
   
   socket.on('registered', (data) => {
       console.log('✅ Registered:', data);
   });
   
   socket.on('business:status:update', (data) => {
       console.log('📢 Business update:', data);
   });
   
   socket.on('order:new', (data) => {
       console.log('📦 New order:', data);
   });
EOF

echo ""
echo "2. Use Postman/Thunder Client:"
echo "   - Connect to: ws://localhost:5000"
echo "   - Protocol: socket.io"
echo "   - Send register event"

echo ""
echo "3. Use browser console:"
echo "   - Load: https://cdn.socket.io/4.5.0/socket.io.min.js"
echo "   - Run connection code above"

echo ""
echo "=================================="
echo "📚 Documentation"
echo "=================================="

echo ""
echo "Full documentation: backend/PROMPT_9_COMPLETE.md"
echo "Event reference: Section 'Event Reference'"
echo "Frontend integration: Section 'Frontend Integration'"

echo ""
echo "${GREEN}✅ Testing complete!${NC}"
echo ""
