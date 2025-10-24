/**
 * Delivery Agent API Service
 * 
 * Handles all delivery agent-specific API calls:
 * - Dashboard stats (today + overall)
 * - Recent deliveries
 * - Active orders count
 */

import axiosInstance from './axiosInstance';

// ==================== TYPES ====================

export interface DeliveryStats {
    today: {
        ordersCompleted: number;
        activeOrders: number;
        earnings: number;
        hoursOnline: number;
        acceptance: number;
    };
    overall: {
        totalDeliveries: number;
        rating: number;
        totalEarnings: number;
    };
}

export interface RecentDelivery {
    _id: string;
    orderNumber: string;
    items: Array<{
        product: {
            name: string;
            image: string;
        };
        quantity: number;
    }>;
    deliveryAddress: {
        street: string;
        city: string;
        formatted?: string;
    };
    deliveredAt: string;
    totalAmount: number;
    rating?: number;
    status: string;
}

export interface DeliveryStatsResponse {
    success: boolean;
    data: DeliveryStats;
}

export interface RecentDeliveriesResponse {
    success: boolean;
    count: number;
    data: RecentDelivery[];
}

// ==================== API METHODS ====================

/**
 * Get delivery agent dashboard statistics
 * 
 * Returns:
 * - Today's stats: orders completed, active orders, earnings, hours online, acceptance rate
 * - Overall stats: total deliveries, rating, total earnings
 * 
 * @returns {Promise<DeliveryStats>} Dashboard statistics
 */
export const getDeliveryStats = async (): Promise<DeliveryStats> => {
    try {
        console.log('📊 Fetching delivery agent stats...');

        const response = await axiosInstance.get<DeliveryStatsResponse>('/delivery-agent/stats');

        if (response.data.success) {
            console.log('✅ Stats fetched successfully:', response.data.data);
            return response.data.data;
        }

        throw new Error('Failed to fetch delivery stats');
    } catch (error: any) {
        console.error('❌ Error fetching delivery stats:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get recent delivered orders for the delivery agent
 * 
 * @param {number} limit - Maximum number of deliveries to return (default: 10)
 * @returns {Promise<RecentDelivery[]>} Array of recent deliveries
 */
export const getRecentDeliveries = async (limit: number = 10): Promise<RecentDelivery[]> => {
    try {
        console.log(`📦 Fetching recent deliveries (limit: ${limit})...`);

        const response = await axiosInstance.get<RecentDeliveriesResponse>(
            `/delivery-agent/recent-deliveries?limit=${limit}`
        );

        if (response.data.success) {
            console.log(`✅ Recent deliveries fetched: ${response.data.count} orders`);
            return response.data.data;
        }

        throw new Error('Failed to fetch recent deliveries');
    } catch (error: any) {
        console.error('❌ Error fetching recent deliveries:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get count of active orders (assigned + out_for_delivery)
 * Note: This is included in the stats endpoint, but provided as a separate method for convenience
 * 
 * @returns {Promise<number>} Number of active orders
 */
export const getActiveOrdersCount = async (): Promise<number> => {
    try {
        const stats = await getDeliveryStats();
        return stats.today.activeOrders;
    } catch (error: any) {
        console.error('❌ Error fetching active orders count:', error.message);
        throw error;
    }
};

// Default export
export default {
    getDeliveryStats,
    getRecentDeliveries,
    getActiveOrdersCount
};
