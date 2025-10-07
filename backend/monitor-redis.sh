#!/bin/bash

# Redis Cache Monitoring Script
# Provides real-time insights into cache performance

echo "🔍 Redis Cache Monitoring Dashboard"
echo "===================================="
echo ""

# Check if Redis is running
if ! redis-cli PING > /dev/null 2>&1; then
    echo "❌ Redis is not running!"
    echo "Start Redis: sudo systemctl start redis"
    exit 1
fi

echo "✅ Redis is running"
echo ""

echo "📊 Cache Statistics"
echo "-------------------"

# Get all keys count
TOTAL_KEYS=$(redis-cli DBSIZE | awk '{print $2}')
echo "Total Keys: $TOTAL_KEYS"

# Memory usage
MEMORY=$(redis-cli INFO memory | grep used_memory_human | cut -d: -f2)
echo "Memory Usage: $MEMORY"

# Hit rate (if tracking)
HITS=$(redis-cli GET cache:hits 2>/dev/null || echo "0")
MISSES=$(redis-cli GET cache:misses 2>/dev/null || echo "0")
if [ "$HITS" != "0" ] || [ "$MISSES" != "0" ]; then
    TOTAL=$((HITS + MISSES))
    HIT_RATE=$(awk "BEGIN {printf \"%.2f\", ($HITS / $TOTAL) * 100}")
    echo "Cache Hit Rate: ${HIT_RATE}%"
    echo "Hits: $HITS, Misses: $MISSES"
fi

echo ""

echo "🔑 Cached Keys by Type"
echo "----------------------"
redis-cli KEYS 'business:*' | wc -l | xargs echo "Business Keys:"
redis-cli KEYS 'products:*' | wc -l | xargs echo "Product Keys:"
redis-cli KEYS 'coupons:*' | wc -l | xargs echo "Coupon Keys:"
redis-cli KEYS 'dashboard:*' | wc -l | xargs echo "Dashboard Keys:"

echo ""

echo "📝 Current Cached Keys"
echo "----------------------"
redis-cli KEYS '*' | head -20

if [ "$TOTAL_KEYS" -gt 20 ]; then
    echo "... and $((TOTAL_KEYS - 20)) more"
fi

echo ""

echo "⏱️  Key TTLs (Time To Live)"
echo "---------------------------"
for key in $(redis-cli KEYS '*' | head -10); do
    TTL=$(redis-cli TTL "$key")
    if [ "$TTL" -eq -1 ]; then
        echo "$key: No expiry (manual invalidation)"
    elif [ "$TTL" -eq -2 ]; then
        echo "$key: Key doesn't exist"
    else
        echo "$key: ${TTL}s remaining"
    fi
done

echo ""

echo "💾 Top 10 Largest Keys"
echo "----------------------"
redis-cli --bigkeys --no-auth-warning 2>/dev/null | grep -A 10 "Biggest"

echo ""

echo "📈 Redis Server Info"
echo "--------------------"
redis-cli INFO server | grep -E "redis_version|uptime_in_seconds"
redis-cli INFO stats | grep -E "total_connections_received|total_commands_processed"

echo ""

echo "🛠️  Useful Commands:"
echo "--------------------"
echo "Monitor real-time: redis-cli MONITOR"
echo "Clear all cache: redis-cli FLUSHALL"
echo "Clear specific pattern: redis-cli KEYS 'products:*' | xargs redis-cli DEL"
echo "Get key value: redis-cli GET 'business:info'"
echo "View key type: redis-cli TYPE 'products:all'"

echo ""
echo "✅ Monitoring Complete!"
