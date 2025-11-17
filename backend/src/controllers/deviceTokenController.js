/**
 * Device Token Controller
 * 
 * Handles device token registration, updates, and removal
 * Used for push notifications
 */

import DeviceToken from '../models/DeviceToken.js';
import logger from '../utils/logger.js';
import { Expo } from 'expo-server-sdk';

/**
 * Register or update a device token
 * POST /api/v1/device-tokens
 * 
 * @body {
 *   token: String (required) - Expo push token
 *   deviceType: String (required) - android | ios | web
 *   platform: String (optional) - expo | fcm (default: expo)
 *   metadata: Object (optional) - Device info
 * }
 */
export const registerDeviceToken = async (req, res) => {
    try {
        const { token, deviceType, platform = 'expo', metadata = {} } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validation
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Device token is required',
            });
        }

        if (!deviceType || !['android', 'ios', 'web'].includes(deviceType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid deviceType is required (android, ios, or web)',
            });
        }

        // Validate token format based on platform
        if (platform === 'expo' && !Expo.isExpoPushToken(token)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Expo push token format',
            });
        }

        // FCM tokens are long alphanumeric strings (typically 140-200 characters)
        if (platform === 'fcm' && (typeof token !== 'string' || token.length < 100)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid FCM push token format',
            });
        }

        logger.info(`[DEVICE_TOKEN] Registering token for user ${userId} (${userRole})`);

        // Check if token already exists
        let deviceToken = await DeviceToken.findOne({ token });

        if (deviceToken) {
            // Update existing token
            deviceToken.userId = userId;
            deviceToken.userRole = userRole;
            deviceToken.deviceType = deviceType;
            deviceToken.platform = platform;
            deviceToken.isActive = true;
            deviceToken.metadata = { ...deviceToken.metadata, ...metadata };
            deviceToken.lastUsed = new Date();

            await deviceToken.save();

            logger.info(`[DEVICE_TOKEN] Updated existing token for user ${userId}`);

            return res.status(200).json({
                success: true,
                message: 'Device token updated successfully',
                data: {
                    id: deviceToken._id,
                    isNew: false,
                },
            });
        }

        // Create new token
        deviceToken = await DeviceToken.create({
            userId,
            userRole,
            token,
            deviceType,
            platform,
            metadata,
            isActive: true,
        });

        logger.info(`[DEVICE_TOKEN] Registered new token for user ${userId}`);

        return res.status(201).json({
            success: true,
            message: 'Device token registered successfully',
            data: {
                id: deviceToken._id,
                isNew: true,
            },
        });

    } catch (error) {
        logger.error('[DEVICE_TOKEN] Error registering token:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Device token already registered',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to register device token',
            error: error.message,
        });
    }
};

/**
 * Remove a device token (logout/uninstall)
 * DELETE /api/v1/device-tokens/:token
 */
export const removeDeviceToken = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user.id;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token parameter is required',
            });
        }

        logger.info(`[DEVICE_TOKEN] Removing token for user ${userId}`);

        // Find and deactivate token (don't delete for analytics)
        const deviceToken = await DeviceToken.findOneAndUpdate(
            { token, userId },
            { isActive: false },
            { new: true }
        );

        if (!deviceToken) {
            return res.status(404).json({
                success: false,
                message: 'Device token not found or already removed',
            });
        }

        logger.info(`[DEVICE_TOKEN] Deactivated token for user ${userId}`);

        return res.status(200).json({
            success: true,
            message: 'Device token removed successfully',
        });

    } catch (error) {
        logger.error('[DEVICE_TOKEN] Error removing token:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove device token',
            error: error.message,
        });
    }
};

/**
 * Get user's active device tokens
 * GET /api/v1/device-tokens
 */
export const getUserDeviceTokens = async (req, res) => {
    try {
        const userId = req.user.id;

        const tokens = await DeviceToken.find({
            userId,
            isActive: true,
        }).select('-token').sort({ lastUsed: -1 });

        return res.status(200).json({
            success: true,
            count: tokens.length,
            data: tokens,
        });

    } catch (error) {
        logger.error('[DEVICE_TOKEN] Error fetching tokens:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch device tokens',
            error: error.message,
        });
    }
};

/**
 * Send test notification to a device
 * POST /api/v1/device-tokens/ping
 * 
 * @body {
 *   token: String (required) - FCM device token
 *   title: String (optional) - Notification title
 *   body: String (optional) - Notification body
 * }
 */
export const pingDeviceToken = async (req, res) => {
    try {
        // Handle POST request (test notification)
        if (req.method === 'POST') {
            const { token, title = '🔔 Test Notification', body = 'This is a test notification from the server' } = req.body;
            const userId = req.user.id;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token is required',
                });
            }

            logger.info(`[DEVICE_TOKEN] Sending test notification to user ${userId}`);

            try {
                // Import Firebase service dynamically
                const { sendToDevices } = await import('../services/notifications/firebaseService.js');

                // Send notification via Firebase
                const result = await sendToDevices(
                    [token],
                    { title, body },
                    {
                        type: 'test',
                        timestamp: new Date().toISOString(),
                        userId
                    }
                );

                logger.info(`[DEVICE_TOKEN] Test notification sent:`, result);

                // Update last used
                await DeviceToken.findOneAndUpdate(
                    { token, userId },
                    { lastUsed: new Date() }
                );

                return res.status(200).json({
                    success: result.success,
                    message: result.success ? 'Test notification sent successfully' : 'Failed to send notification',
                    data: {
                        successCount: result.successCount,
                        failureCount: result.failureCount,
                    },
                });
            } catch (sendError) {
                logger.error('[DEVICE_TOKEN] Error sending test notification:', sendError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send test notification',
                    error: sendError.message,
                });
            }
        }

        // Handle PATCH request (update last used time)
        if (req.method === 'PATCH') {
            const { token } = req.params;
            const userId = req.user.id;

            const deviceToken = await DeviceToken.findOne({ token, userId });

            if (!deviceToken) {
                return res.status(404).json({
                    success: false,
                    message: 'Device token not found',
                });
            }

            await deviceToken.updateLastUsed();

            return res.status(200).json({
                success: true,
                message: 'Token updated',
            });
        }

        return res.status(405).json({
            success: false,
            message: 'Method not allowed',
        });

    } catch (error) {
        logger.error('[DEVICE_TOKEN] Error in pingDeviceToken:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process request',
            error: error.message,
        });
    }
};

export default {
    registerDeviceToken,
    removeDeviceToken,
    getUserDeviceTokens,
    pingDeviceToken,
};
