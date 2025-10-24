/**
 * Dashboard Data Verification Script
 * 
 * This script verifies all dashboard calculations by:
 * 1. Fetching raw data directly from the database
 * 2. Performing calculations manually
 * 3. Comparing with dashboard service calculations
 * 4. Reporting any discrepancies
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';
import Payment from './src/models/Payment.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import dashboardService from './src/services/dashboardService.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza-app';

console.log('🔍 Dashboard Data Verification');
console.log('='.repeat(80));

// Connect to MongoDB
async function connect() {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        console.log('');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
}

// Calculate today's date range
function getTodayRange() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
}

// Verify Today's Revenue
async function verifyTodaysRevenue() {
    console.log('\n📊 VERIFYING TODAY\'S REVENUE');
    console.log('-'.repeat(80));

    const { startOfDay, endOfDay } = getTodayRange();

    // Manual calculation
    const manualRevenue = await Payment.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                paymentStatus: 'completed',
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
    ]);

    const manualTotal = manualRevenue[0]?.total || 0;
    const manualCount = manualRevenue[0]?.count || 0;

    // Dashboard service calculation
    const dashboardStats = await dashboardService.getDashboardStats();

    console.log('Manual Calculation:');
    console.log(`  Revenue: ₹${manualTotal.toFixed(2)}`);
    console.log(`  Payments: ${manualCount}`);
    console.log('');
    console.log('Dashboard Service:');
    console.log(`  Revenue: ₹${dashboardStats.todayRevenue.toFixed(2)}`);
    console.log('');

    const match = Math.abs(manualTotal - dashboardStats.todayRevenue) < 0.01;
    console.log(match ? '✅ MATCH' : '❌ MISMATCH');

    if (!match) {
        console.log(`  Difference: ₹${Math.abs(manualTotal - dashboardStats.todayRevenue).toFixed(2)}`);
    }

    return match;
}

// Verify Today's Orders
async function verifyTodaysOrders() {
    console.log('\n📦 VERIFYING TODAY\'S ORDERS');
    console.log('-'.repeat(80));

    const { startOfDay, endOfDay } = getTodayRange();

    // Manual calculation
    const manualCount = await Order.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Get actual orders for detailed verification
    const actualOrders = await Order.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).select('orderNumber status totalAmount createdAt');

    // Dashboard service calculation
    const dashboardStats = await dashboardService.getDashboardStats();

    console.log('Manual Calculation:');
    console.log(`  Total Orders Today: ${manualCount}`);
    console.log('');
    console.log('Orders by Status:');
    const statusCount = {};
    actualOrders.forEach(order => {
        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });
    Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
    });
    console.log('');
    console.log('Dashboard Service:');
    console.log(`  Total Orders Today: ${dashboardStats.todayOrders}`);
    console.log('');

    const match = manualCount === dashboardStats.todayOrders;
    console.log(match ? '✅ MATCH' : '❌ MISMATCH');

    if (!match) {
        console.log(`  Difference: ${Math.abs(manualCount - dashboardStats.todayOrders)}`);
    }

    return match;
}

// Verify Active Deliveries
async function verifyActiveDeliveries() {
    console.log('\n🚚 VERIFYING ACTIVE DELIVERIES');
    console.log('-'.repeat(80));

    // Manual calculation - orders with status 'out-for-delivery'
    const manualCount = await Order.countDocuments({
        status: 'out-for-delivery',
    });

    // Get actual active delivery orders
    const activeDeliveries = await Order.find({
        status: 'out-for-delivery',
    }).select('orderNumber customer deliveryAgent totalAmount createdAt');

    // Dashboard service calculation
    const dashboardStats = await dashboardService.getDashboardStats();

    console.log('Manual Calculation:');
    console.log(`  Out-for-Delivery Orders: ${manualCount}`);
    console.log('');
    console.log('Active Deliveries:');
    activeDeliveries.forEach(order => {
        console.log(`  Order ${order.orderNumber}: ₹${order.totalAmount.toFixed(2)} (${new Date(order.createdAt).toLocaleTimeString()})`);
    });
    console.log('');
    console.log('Dashboard Service:');
    console.log(`  Active Deliveries: ${dashboardStats.activeDeliveries}`);
    console.log('');

    const match = manualCount === dashboardStats.activeDeliveries;
    console.log(match ? '✅ MATCH' : '❌ MISMATCH');

    if (!match) {
        console.log(`  Difference: ${Math.abs(manualCount - dashboardStats.activeDeliveries)}`);
        console.log('  This could indicate a logic mismatch in the "Active Deliveries" calculation!');
    }

    return match;
}

// Verify Weekly Revenue Chart
async function verifyWeeklyRevenue() {
    console.log('\n📈 VERIFYING WEEKLY REVENUE CHART');
    console.log('-'.repeat(80));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    // Manual calculation
    const manualRevenue = await Payment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                paymentStatus: 'completed',
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                revenue: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Get order counts
    const manualOrders = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Dashboard service calculation
    const dashboardChart = await dashboardService.getRevenueChart(7);

    console.log('Manual Calculation:');
    console.log('Date         | Revenue      | Orders');
    console.log('-'.repeat(45));
    manualRevenue.forEach(day => {
        const orderCount = manualOrders.find(o => o._id === day._id)?.orders || 0;
        console.log(`${day._id} | ₹${day.revenue.toFixed(2).padStart(10)} | ${orderCount}`);
    });
    console.log('');
    console.log('Dashboard Service:');
    console.log('Date         | Revenue      | Orders');
    console.log('-'.repeat(45));
    dashboardChart.chart.forEach(day => {
        console.log(`${day.date} | ₹${day.revenue.toFixed(2).padStart(10)} | ${day.orders}`);
    });
    console.log('');

    // Check if all dates match
    const manualDates = new Set(manualRevenue.map(d => d._id));
    const dashboardDates = new Set(dashboardChart.chart.map(d => d.date));

    let match = true;
    manualRevenue.forEach(day => {
        const dashDay = dashboardChart.chart.find(d => d.date === day._id);
        if (!dashDay) {
            console.log(`❌ Missing date in dashboard: ${day._id}`);
            match = false;
        } else if (Math.abs(day.revenue - dashDay.revenue) > 0.01) {
            console.log(`❌ Revenue mismatch for ${day._id}: Manual ₹${day.revenue.toFixed(2)} vs Dashboard ₹${dashDay.revenue.toFixed(2)}`);
            match = false;
        }
    });

    console.log(match ? '✅ MATCH' : '❌ MISMATCH');

    return match;
}

// Verify Hourly Sales
async function verifyHourlySales() {
    console.log('\n⏰ VERIFYING HOURLY SALES');
    console.log('-'.repeat(80));

    const { startOfDay, endOfDay } = getTodayRange();

    // Manual calculation
    const manualHourly = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                status: { $nin: ['cancelled'] },
            },
        },
        {
            $lookup: {
                from: 'payments',
                localField: '_id',
                foreignField: 'order',
                as: 'payment',
            },
        },
        {
            $unwind: {
                path: '$payment',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: { $hour: '$createdAt' },
                orders: { $sum: 1 },
                revenue: {
                    $sum: {
                        $cond: [
                            { $eq: ['$payment.paymentStatus', 'completed'] },
                            '$payment.amount',
                            0,
                        ],
                    },
                },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Dashboard service calculation
    const dashboardHourly = await dashboardService.getHourlySales();

    console.log('Manual Calculation (All Hours):');
    console.log('Hour | Revenue      | Orders');
    console.log('-'.repeat(35));
    manualHourly.forEach(hour => {
        const hourLabel = hour._id === 0 ? '12AM' : hour._id < 12 ? `${hour._id}AM` : hour._id === 12 ? '12PM' : `${hour._id - 12}PM`;
        console.log(`${hourLabel.padEnd(4)} | ₹${hour.revenue.toFixed(2).padStart(10)} | ${hour.orders}`);
    });
    console.log('');
    console.log('Dashboard Service (Business Hours 9AM-9PM):');
    console.log('Hour | Revenue      | Orders');
    console.log('-'.repeat(35));
    dashboardHourly.hourlySales.forEach(hour => {
        console.log(`${hour.hour.padEnd(4)} | ₹${hour.revenue.toFixed(2).padStart(10)} | ${hour.orders}`);
    });
    console.log('');

    // Check if business hours filtering is correct
    const businessHoursManual = manualHourly.filter(h => h._id >= 9 && h._id <= 21);
    let match = businessHoursManual.length === dashboardHourly.hourlySales.length;

    businessHoursManual.forEach(hour => {
        const dashHour = dashboardHourly.hourlySales.find(h => h.hourValue === hour._id);
        if (!dashHour) {
            console.log(`❌ Missing hour in dashboard: ${hour._id}`);
            match = false;
        } else if (Math.abs(hour.revenue - dashHour.revenue) > 0.01) {
            console.log(`❌ Revenue mismatch for hour ${hour._id}: Manual ₹${hour.revenue.toFixed(2)} vs Dashboard ₹${dashHour.revenue.toFixed(2)}`);
            match = false;
        }
    });

    console.log(match ? '✅ MATCH' : '❌ MISMATCH');

    return match;
}

// Verify Total Customers
async function verifyTotalCustomers() {
    console.log('\n👥 VERIFYING TOTAL CUSTOMERS');
    console.log('-'.repeat(80));

    // Manual calculation
    const manualCount = await User.countDocuments({
        role: 'customer',
        isActive: true,
    });

    // Get sample customers
    const sampleCustomers = await User.find({
        role: 'customer',
        isActive: true,
    }).select('name email createdAt').limit(5);

    // Dashboard service calculation
    const dashboardStats = await dashboardService.getDashboardStats();

    console.log('Manual Calculation:');
    console.log(`  Active Customers: ${manualCount}`);
    console.log('');
    console.log('Sample Customers:');
    sampleCustomers.forEach(customer => {
        console.log(`  ${customer.name} (${customer.email})`);
    });
    console.log('');
    console.log('Dashboard Service:');
    console.log(`  Total Customers: ${dashboardStats.totalCustomers}`);
    console.log('');

    const match = manualCount === dashboardStats.totalCustomers;
    console.log(match ? '✅ MATCH' : '❌ MISMATCH');

    if (!match) {
        console.log(`  Difference: ${Math.abs(manualCount - dashboardStats.totalCustomers)}`);
    }

    return match;
}

// Main verification function
async function runVerification() {
    await connect();

    const results = [];

    try {
        results.push(await verifyTodaysRevenue());
        results.push(await verifyTodaysOrders());
        results.push(await verifyActiveDeliveries());
        results.push(await verifyWeeklyRevenue());
        results.push(await verifyHourlySales());
        results.push(await verifyTotalCustomers());

        console.log('\n');
        console.log('='.repeat(80));
        console.log('VERIFICATION SUMMARY');
        console.log('='.repeat(80));

        const passed = results.filter(r => r).length;
        const total = results.length;

        console.log(`\nTotal Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${total - passed}`);

        if (passed === total) {
            console.log('\n✅ ALL DASHBOARD CALCULATIONS ARE CORRECT!');
        } else {
            console.log('\n❌ SOME DASHBOARD CALCULATIONS HAVE ISSUES!');
            console.log('\nRecommendations:');
            console.log('1. Check the dashboard service logic for mismatches');
            console.log('2. Verify database queries and aggregations');
            console.log('3. Clear Redis cache and retry');
            console.log('4. Check if status filters match exactly');
        }

    } catch (error) {
        console.error('\n❌ Verification failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    }
}

// Run the verification
runVerification();
