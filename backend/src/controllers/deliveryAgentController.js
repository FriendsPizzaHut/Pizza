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

export default {
    updateOnlineStatus,
    getAgentStatus
};
