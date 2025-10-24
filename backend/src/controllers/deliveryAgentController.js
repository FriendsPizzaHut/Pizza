/**
 * Delivery Agent Controller
 * 
 * Handles delivery agent-specific operations:
 * - Online/Offline status management
 * - Status validation based on active orders
 * - Real-time status broadcasting via Socket.IO
 */

import User from '../models/User.js';
import Order from '../models/Order.js';
import { emitDeliveryAgentStatusChange } from '../socket/events.js';

/**
 * Update delivery agent online/offline status
 * 
 * Business Rules:
 * 1. Can go ONLINE anytime
 * 2. Can go OFFLINE only if no active orders (out_for_delivery status)
 * 3. Auto-sets state to 'free' when going online
 * 4. Broadcasts status change via Socket.IO instantly
 * 
 * @route PATCH /api/v1/delivery-agent/status
 * @access Private (Delivery agents only)
 */
export const updateOnlineStatus = async (req, res) => {
    try {
        const deliveryAgentId = req.user.id || req.user._id;
        const { isOnline } = req.body;

        // Validate input
        if (typeof isOnline !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isOnline must be a boolean value'
            });
        }

        // Find delivery agent
        const agent = await User.findById(deliveryAgentId);

        if (!agent || agent.role !== 'delivery') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only delivery agents can update status.'
            });
        }

        // Check if trying to go OFFLINE
        if (!isOnline) {
            // Find active orders assigned to this agent with 'out_for_delivery' status
            const activeOrders = await Order.find({
                deliveryBoy: deliveryAgentId,
                status: 'out_for_delivery'
            });

            if (activeOrders.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot go offline. You have ${activeOrders.length} active delivery(ies) in progress.`,
                    activeOrders: activeOrders.map(order => ({
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        status: order.status
                    }))
                });
            }
        }

        // Update status
        if (!agent.status) {
            agent.status = {
                isOnline: false,
                state: 'offline',
                lastOnline: null
            };
        }

        agent.status.isOnline = isOnline;

        if (isOnline) {
            // Going online - set to 'free' state
            agent.status.state = 'free';
            agent.status.lastOnline = new Date();
        } else {
            // Going offline
            agent.status.state = 'offline';
        }

        await agent.save();

        // Prepare response data
        const statusData = {
            deliveryAgentId: agent._id,
            name: agent.name,
            email: agent.email,
            phone: agent.phone,
            isOnline: agent.status.isOnline,
            state: agent.status.state,
            lastOnline: agent.status.lastOnline,
            vehicleInfo: agent.vehicleInfo,
            rating: agent.rating
        };

        console.log('🎯 ========================================');
        console.log('🎯 EMITTING SOCKET EVENT');
        console.log('🎯 ========================================');
        console.log('📡 Status data to emit:', JSON.stringify(statusData, null, 2));
        console.log('📡 Agent ID:', agent._id);
        console.log('📡 Agent Name:', agent.name);
        console.log('📡 Is Online:', agent.status.isOnline);
        console.log('📡 State:', agent.status.state);

        // ✅ Emit real-time socket event to admin
        emitDeliveryAgentStatusChange(statusData);

        console.log(`✅ Socket event emitted successfully`);
        console.log(`🚴 Delivery agent ${agent.name} is now ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
        console.log('🎯 ========================================');

        return res.status(200).json({
            success: true,
            message: `Status updated successfully. You are now ${isOnline ? 'online' : 'offline'}.`,
            data: statusData
        });

    } catch (error) {
        console.error('❌ Error updating delivery agent status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update status. Please try again.',
            error: error.message
        });
    }
};

/**
 * Get delivery agent's current status
 * 
 * @route GET /api/v1/delivery-agent/status
 * @access Private (Delivery agents only)
 */
export const getAgentStatus = async (req, res) => {
    try {
        console.log('🔍 DEBUG - req.user:', req.user);
        const deliveryAgentId = req.user.id || req.user._id;
        console.log('🔍 DEBUG - deliveryAgentId:', deliveryAgentId);

        const agent = await User.findById(deliveryAgentId).select('name email phone status vehicleInfo rating totalDeliveries role');
        console.log('🔍 DEBUG - agent found:', agent ? { id: agent._id, role: agent.role } : 'null');

        if (!agent || agent.role !== 'delivery') {
            console.log('❌ DEBUG - Authorization failed. Agent role:', agent?.role);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only delivery agents can view status.'
            });
        }

        // Count active orders
        const activeOrders = await Order.countDocuments({
            deliveryBoy: deliveryAgentId,
            status: 'out_for_delivery'
        });

        return res.status(200).json({
            success: true,
            data: {
                deliveryAgentId: agent._id,
                name: agent.name,
                email: agent.email,
                phone: agent.phone,
                status: agent.status || { isOnline: false, state: 'offline' },
                vehicleInfo: agent.vehicleInfo,
                rating: agent.rating,
                totalDeliveries: agent.totalDeliveries || 0,
                activeOrders
            }
        });

    } catch (error) {
        console.error('❌ Error fetching delivery agent status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch status.',
            error: error.message
        });
    }
};

/**
 * Get delivery agent dashboard stats
 *
 * @route GET /api/v1/delivery-agent/stats
 * @access Private (Delivery agents only)
 */
export const getDeliveryStats = async (req, res) => {
    try {
        const deliveryAgentId = req.user.id || req.user._id;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Get today's delivered orders for this agent
        const todayOrders = await Order.find({
            deliveryBoy: deliveryAgentId,
            status: 'delivered',
            deliveredAt: { $gte: todayStart }
        }).select('totalAmount deliveredAt orderNumber rating');

        // Count active orders (out_for_delivery)
        const activeOrders = await Order.countDocuments({
            deliveryBoy: deliveryAgentId,
            status: 'out_for_delivery'
        });

        // Sum today's earnings (sum of totalAmount)
        const todayEarnings = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Fetch agent overall stats
        const agent = await User.findById(deliveryAgentId).select('rating totalDeliveries totalEarnings');

        // Placeholder: hoursOnline and acceptance may require status logs/tracking
        const hoursOnline = 0; // TODO: compute from status logs
        const acceptance = 0; // TODO: compute from offers/acceptance tracking

        return res.status(200).json({
            success: true,
            data: {
                today: {
                    ordersCompleted: todayOrders.length,
                    activeOrders,
                    earnings: todayEarnings,
                    hoursOnline,
                    acceptance
                },
                overall: {
                    totalDeliveries: agent?.totalDeliveries || 0,
                    rating: agent?.rating || 0,
                    totalEarnings: agent?.totalEarnings || 0
                }
            }
        });

    } catch (error) {
        console.error('❌ Error fetching delivery stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery stats.',
            error: error.message
        });
    }
};


/**
 * Get recent delivered orders for delivery agent
 *
 * @route GET /api/v1/delivery-agent/recent-deliveries
 * @access Private (Delivery agents only)
 */
export const getRecentDeliveries = async (req, res) => {
    try {
        const deliveryAgentId = req.user.id || req.user._id;
        const limit = parseInt(req.query.limit, 10) || 10;

        const recentDeliveries = await Order.find({
            deliveryBoy: deliveryAgentId,
            status: 'delivered'
        })
            .populate({ path: 'items.product', select: 'name images price' })
            .select('orderNumber items deliveryAddress deliveredAt totalAmount rating status')
            .sort({ deliveredAt: -1 })
            .limit(limit);

        const formatted = recentDeliveries.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            items: order.items.map(i => ({
                product: {
                    name: i.product?.name || 'Item',
                    image: (i.product?.images && i.product.images[0]) || ''
                },
                quantity: i.quantity
            })),
            deliveryAddress: {
                street: order.deliveryAddress?.street || '',
                city: order.deliveryAddress?.city || '',
                formatted: order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}` : ''
            },
            deliveredAt: order.deliveredAt,
            totalAmount: order.totalAmount,
            rating: order.rating,
            status: order.status
        }));

        return res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted
        });

    } catch (error) {
        console.error('❌ Error fetching recent deliveries:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch recent deliveries.',
            error: error.message
        });
    }
};

export default {
    updateOnlineStatus,
    getAgentStatus,
    getDeliveryStats,
    getRecentDeliveries
};
