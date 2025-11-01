/**
 * User Service
 * 
 * Business logic for user management operations.
 * Handles CRUD operations for users.
 */

import User, { DeliveryBoy, Customer, Admin } from '../models/User.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

/**
 * Get all users with pagination     return agents;
};

/**
 * Update user profile image
 * @param {String} userId - User ID
 * @param {String} profileImage - Cloudinary image URL
 * @returns {Object} - Updated user
 */
export const updateProfileImage = async (userId, profileImage) => {
    console.log('🖼️ [USER SERVICE] Updating profile image');
    console.log('  - User ID:', userId);
    console.log('  - Profile Image URL:', profileImage);

    // Find user and update profile image
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { profileImage } },
        {
            new: true,
            runValidators: true,
        }
    ).select('-password');

    if (!user) {
        console.error('❌ [USER SERVICE] User not found');
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    console.log('✅ [USER SERVICE] Profile image updated successfully');
    console.log('  - User:', user.name);
    console.log('  - New Profile Image:', user.profileImage);

    return user;
};

/**
 * @param {Object} query - Query parameters (page, limit, role, search)
 * @returns {Object} - Users and pagination info
 */
export const getAllUsers = async (query = {}) => {
    const { page = 1, limit = 20, role, search } = query;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (role && role !== 'all') {
        filter.role = role;
    }

    // Add search functionality (name, email, phone)
    if (search && search.trim()) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    // Fetch users with basic info
    const users = await User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .lean();

    const total = await User.countDocuments(filter);

    // Enrich user data with stats (only for customers)
    const enrichedUsers = await Promise.all(
        users.map(async (user) => {
            const baseUser = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
                createdAt: user.createdAt,
                isActive: user.isActive,
                isApproved: user.isApproved,
                isRejected: user.isRejected,
            };

            // Add role-specific data
            if (user.role === 'customer') {
                // Get order stats
                const orders = await Order.find({ user: user._id }).select('totalAmount status').lean();
                const totalOrders = orders.length;
                const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

                return {
                    ...baseUser,
                    totalOrders,
                    totalSpent,
                    lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
                };
            } else if (user.role === 'delivery') {
                // Get delivery stats
                const totalDeliveries = await Order.countDocuments({
                    deliveryAgent: user._id,
                    status: 'delivered'
                });

                return {
                    ...baseUser,
                    totalDeliveries,
                    vehicleInfo: user.vehicleInfo,
                    status: user.status,
                };
            } else {
                // Admin or other roles - no stats needed
                return baseUser;
            }
        })
    );

    return {
        users: enrichedUsers,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get user by ID with detailed stats
 * @param {String} userId - User ID
 * @returns {Object} - User data with stats
 */
export const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    // Enrich with role-specific data
    if (user.role === 'customer') {
        // Get order history with details
        const orders = await Order.find({ user: userId })
            .select('orderNumber totalAmount status items createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const totalOrders = await Order.countDocuments({ user: userId });
        const totalSpent = await Order.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Get favorite items (most ordered items)
        const favoriteItems = await Order.aggregate([
            { $match: { user: userId } },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, name: '$_id', orderCount: '$count' } }
        ]);

        return {
            ...user,
            totalOrders,
            totalSpent: totalSpent[0]?.total || 0,
            orderHistory: orders.map(order => ({
                id: order.orderNumber,
                date: order.createdAt,
                items: order.items?.length || 0,
                total: order.totalAmount,
                status: order.status
            })),
            favoriteItems: favoriteItems.map(item => item.name),
            addresses: user.addresses || []
        };
    } else if (user.role === 'delivery') {
        // Get delivery stats
        const totalDeliveries = await Order.countDocuments({
            deliveryAgent: userId,
            status: 'delivered'
        });

        const activeDeliveries = await Order.countDocuments({
            deliveryAgent: userId,
            status: { $in: ['out_for_delivery', 'ready'] }
        });

        return {
            ...user,
            totalDeliveries,
            activeDeliveries,
            vehicleInfo: user.vehicleInfo,
            status: user.status,
        };
    }

    return user;
};

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated user
 */
export const updateUser = async (userId, updateData) => {
    console.log('🔍 [USER SERVICE] Update user called');
    console.log('  - User ID:', userId);
    console.log('  - Update Data (raw):', JSON.stringify(updateData, null, 2));

    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.role;

    console.log('  - Update Data (after security filters):', JSON.stringify(updateData, null, 2));
    console.log('  - Approval fields present:', {
        isApproved: 'isApproved' in updateData ? updateData.isApproved : 'NOT PRESENT',
        isRejected: 'isRejected' in updateData ? updateData.isRejected : 'NOT PRESENT',
        rejectionReason: 'rejectionReason' in updateData ? updateData.rejectionReason : 'NOT PRESENT'
    });

    // Fetch user before update to see current state
    const userBefore = await User.findById(userId).select('-password');
    console.log('  - User BEFORE update:', {
        _id: userBefore?._id,
        name: userBefore?.name,
        role: userBefore?.role,
        isApproved: userBefore?.isApproved,
        isRejected: userBefore?.isRejected,
        rejectionReason: userBefore?.rejectionReason
    });

    // Determine which model to use based on user role
    let UserModel = User;
    if (userBefore?.role === 'delivery') {
        UserModel = DeliveryBoy;
        console.log('  - Using DeliveryBoy discriminator model');
    } else if (userBefore?.role === 'customer') {
        UserModel = Customer;
        console.log('  - Using Customer discriminator model');
    } else if (userBefore?.role === 'admin') {
        UserModel = Admin;
        console.log('  - Using Admin discriminator model');
    }

    // Use $set operator explicitly for discriminator fields
    const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        {
            new: true,
            runValidators: true,
        }
    ).select('-password');

    if (!user) {
        console.error('❌ [USER SERVICE] User not found after update');
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    console.log('  - User AFTER update:', {
        _id: user._id,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved,
        isRejected: user.isRejected,
        rejectionReason: user.rejectionReason
    });

    return user;
};

/**
 * Delete user and associated data
 * @param {String} userId - User ID
 * @returns {Object} - Deletion summary
 */
export const deleteUser = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    // Delete associated data
    const ordersDeleted = await Order.deleteMany({ user: userId });
    const paymentsDeleted = await Payment.deleteMany({ user: userId });
    const notificationsDeleted = await Notification.deleteMany({ user: userId });

    // Delete user
    await user.deleteOne();

    return {
        message: 'User and associated data deleted successfully',
        deletedCounts: {
            orders: ordersDeleted.deletedCount,
            payments: paymentsDeleted.deletedCount,
            notifications: notificationsDeleted.deletedCount,
        },
    };
};

/**
 * Get all delivery agents with their current status and availability
 * @returns {Array} - List of delivery agents with status
 */
export const getDeliveryAgents = async () => {
    console.log('🚚 [GET DELIVERY AGENTS] Fetching all delivery agents...');

    // Find all users with role 'delivery' (get all first to debug)
    const allDeliveryAgents = await User.find({ role: 'delivery' })
        .select('name email phone profileImage vehicleInfo status totalDeliveries assignedOrders isApproved isRejected isActive')
        .lean();

    console.log(`📊 [GET DELIVERY AGENTS] Found ${allDeliveryAgents.length} total delivery agents`);

    // Filter only approved agents
    const deliveryAgents = allDeliveryAgents.filter(agent => agent.isApproved === true);

    console.log(`✅ [GET DELIVERY AGENTS] ${deliveryAgents.length} approved agents`);
    allDeliveryAgents.forEach(agent => {
        console.log(`   - ${agent.name}: isApproved=${agent.isApproved}, isActive=${agent.isActive}, isOnline=${agent.status?.isOnline}`);
    });

    // Calculate current active deliveries for each agent
    const agentsWithStatus = await Promise.all(
        deliveryAgents.map(async (agent) => {
            // Count active deliveries (orders that are assigned or in progress)
            const activeDeliveries = await Order.countDocuments({
                deliveryAgent: agent._id,
                status: { $in: ['out_for_delivery', 'ready'] }
            });

            // Determine agent status
            let agentStatus = 'offline';
            if (agent.status?.isOnline) {
                agentStatus = activeDeliveries > 0 ? 'busy' : 'online';
            }

            // Calculate rating (placeholder - you can implement proper rating system later)
            const rating = 4.5 + (Math.random() * 0.5); // Mock rating between 4.5-5.0

            return {
                id: agent._id,
                name: agent.name,
                email: agent.email,
                phone: agent.phone,
                profileImage: agent.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}`,
                vehicleType: agent.vehicleInfo?.type || 'bike',
                vehicleNumber: agent.vehicleInfo?.number || 'N/A',
                status: agentStatus,
                isOnline: agent.status?.isOnline || false,
                isApproved: agent.isApproved || false, // Include approval status
                isActive: agent.isActive || false,
                activeDeliveries: activeDeliveries,
                maxDeliveries: 3, // Default max capacity
                totalDeliveries: agent.totalDeliveries || 0,
                rating: parseFloat(rating.toFixed(1)),
                lastOnline: agent.status?.lastOnline || null
            };
        })
    );

    // Sort: online first, then by active deliveries (fewer first)
    agentsWithStatus.sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        if (a.status === 'busy' && b.status !== 'busy') return -1;
        if (a.status !== 'busy' && b.status === 'busy') return 1;
        return a.activeDeliveries - b.activeDeliveries;
    });

    console.log(`📤 [GET DELIVERY AGENTS] Returning ${agentsWithStatus.length} agents`);
    agentsWithStatus.forEach(agent => {
        console.log(`   ✈️  ${agent.name}: status=${agent.status}, approved=${agent.isApproved}, online=${agent.isOnline}`);
    });

    return agentsWithStatus;
};

export default {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getDeliveryAgents,
    updateProfileImage,
};
