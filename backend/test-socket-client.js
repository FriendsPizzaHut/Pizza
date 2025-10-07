/**
 * Simple Socket.IO Test Client
 * 
 * Run this to test Socket.IO connection and events
 * Usage: node test-socket-client.js
 */

// Note: Install socket.io-client if not already installed
// npm install socket.io-client

import { io } from 'socket.io-client';

// Configuration
const SERVER_URL = 'http://localhost:5000';
const TEST_USER_ID = '507f1f77bcf86cd799439011'; // Example MongoDB ObjectId
const TEST_ROLE = 'admin'; // admin, delivery, or customer

console.log('🧪 Socket.IO Test Client');
console.log('========================\n');

// Connect to server
const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
});

// Connection events
socket.on('connect', () => {
    console.log('✅ Connected to server');
    console.log(`   Socket ID: ${socket.id}\n`);

    // Register user
    console.log('📝 Registering user...');
    socket.emit('register', {
        userId: TEST_USER_ID,
        role: TEST_ROLE
    });
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
    console.log(`\n❌ Disconnected: ${reason}`);
});

socket.on('registered', (data) => {
    console.log('✅ Registration successful');
    console.log('   Data:', data);
    console.log('\n📡 Now listening for events...\n');
});

// Business events
socket.on('business:status:update', (data) => {
    console.log('📢 [BUSINESS STATUS UPDATE]');
    console.log('   Open:', data.isOpen);
    console.log('   Message:', data.message);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

// Order events
socket.on('order:new', (data) => {
    console.log('🔔 [NEW ORDER]');
    console.log('   Order ID:', data.orderId);
    console.log('   Customer:', data.customerName);
    console.log('   Total:', data.totalAmount);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

socket.on('order:status:update', (data) => {
    console.log('📦 [ORDER STATUS UPDATE]');
    console.log('   Order ID:', data.orderId);
    console.log('   Status:', data.status);
    console.log('   Message:', data.message);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

socket.on('order:status:changed', (data) => {
    console.log('📦 [ORDER STATUS CHANGED - ADMIN VIEW]');
    console.log('   Order ID:', data.orderId);
    console.log('   New Status:', data.status);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

socket.on('order:cancelled', (data) => {
    console.log('❌ [ORDER CANCELLED]');
    console.log('   Order ID:', data.orderId);
    console.log('   Order Number:', data.orderNumber);
    console.log('   Reason:', data.reason);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

socket.on('order:assigned', (data) => {
    console.log('📦 [ORDER ASSIGNED - DELIVERY]');
    console.log('   Order ID:', data.orderId);
    console.log('   Order Number:', data.orderNumber);
    console.log('   Customer:', data.customerName);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

// Delivery events
socket.on('delivery:status:update', (data) => {
    console.log('🚴 [DELIVERY STATUS UPDATE]');
    console.log('   Delivery Boy:', data.deliveryBoyName);
    console.log('   Status:', data.status);
    console.log('   Message:', data.message);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

socket.on('delivery:location:update', (data) => {
    console.log('📍 [DELIVERY LOCATION UPDATE]');
    console.log('   Order ID:', data.orderId);
    console.log('   Location:', `${data.location.latitude}, ${data.location.longitude}`);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

// Payment events
socket.on('payment:received', (data) => {
    console.log('💰 [PAYMENT RECEIVED - ADMIN]');
    console.log('   Order ID:', data.orderId);
    console.log('   Amount:', data.amount);
    console.log('   Method:', data.paymentMethod);
    console.log('   Status:', data.status);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

socket.on('payment:status:update', (data) => {
    console.log('💳 [PAYMENT STATUS UPDATE - CUSTOMER]');
    console.log('   Order ID:', data.orderId);
    console.log('   Payment ID:', data.paymentId);
    console.log('   Status:', data.status);
    console.log('   Message:', data.message);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

// Notification events
socket.on('notification:new', (data) => {
    console.log('🔔 [NEW NOTIFICATION]');
    console.log('   Title:', data.title);
    console.log('   Message:', data.message);
    console.log('   Type:', data.type);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

// Offer events
socket.on('offer:new', (data) => {
    console.log('🎉 [NEW OFFER]');
    console.log('   Code:', data.code);
    console.log('   Description:', data.description);
    console.log('   Discount:', data.discountValue);
    console.log('   Valid Until:', data.validUntil);
    console.log('   Time:', new Date(data.timestamp).toLocaleTimeString());
    console.log('');
});

// Error handling
socket.on('error', (data) => {
    console.error('❌ [ERROR]');
    console.error('   Message:', data.message);
    console.error('   Code:', data.code);
    console.error('');
});

// Catch all events (for debugging)
socket.onAny((event, ...args) => {
    if (!event.includes('connect') && !event.includes('registered')) {
        console.log(`📨 [RAW EVENT: ${event}]`, args);
    }
});

// Keep process alive
console.log('✅ Test client running...');
console.log('   Press Ctrl+C to exit\n');
console.log('🔧 To test events:');
console.log('   1. Toggle business status via API');
console.log('   2. Create/update orders');
console.log('   3. Update delivery agent status');
console.log('   4. Create payments\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Disconnecting...');
    socket.disconnect();
    process.exit(0);
});

// Ping server every 30 seconds to keep connection alive
setInterval(() => {
    socket.emit('ping');
}, 30000);

socket.on('pong', (data) => {
    console.log(`💓 Pong received (latency: ${Date.now() - data.timestamp}ms)`);
});
