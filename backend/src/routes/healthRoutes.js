/**
 * Health Check Routes (Prompt 10 - Never-Crashing Strategy)
 * 
 * Comprehensive health monitoring endpoints:
 * - Basic health check
 * - Detailed health check with DB/Redis status
 * - Kubernetes-style readiness probe
 * - Kubernetes-style liveness probe
 * - System metrics
 */

import express from 'express';
import mongoose from 'mongoose';
import redisClient from '../config/redis.js';
import os from 'os';

const router = express.Router();

/**
 * Basic Health Check
 * GET /health
 * Quick check to verify server is running
 */
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

/**
 * Detailed Health Check
 * GET /health/detailed
 * Comprehensive health check including dependencies
 */
router.get('/detailed', async (req, res) => {
    const healthCheck = {
        status: 'success',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        server: {
            status: 'healthy',
            memory: {
                total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
                free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
                usage: `${Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)}%`,
            },
            cpu: {
                cores: os.cpus().length,
                model: os.cpus()[0]?.model || 'Unknown',
                load: os.loadavg(),
            },
            process: {
                memory: {
                    rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
                    heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
                    heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
                    external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`,
                },
                pid: process.pid,
                version: process.version,
                platform: process.platform,
            },
        },
        dependencies: {},
    };

    // Check MongoDB
    try {
        const mongoState = mongoose.connection.readyState;
        const mongoStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        healthCheck.dependencies.mongodb = {
            status: mongoState === 1 ? 'healthy' : 'unhealthy',
            state: mongoStatus[mongoState],
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        };

        // If connected, check database accessibility
        if (mongoState === 1) {
            await mongoose.connection.db.admin().ping();
            healthCheck.dependencies.mongodb.ping = 'success';
        }
    } catch (error) {
        healthCheck.status = 'degraded';
        healthCheck.dependencies.mongodb = {
            status: 'unhealthy',
            error: error.message,
        };
    }

    // Check Redis
    try {
        if (redisClient && typeof redisClient.ping === 'function') {
            const redisPing = await redisClient.ping();
            healthCheck.dependencies.redis = {
                status: redisPing === 'PONG' ? 'healthy' : 'unhealthy',
                ping: redisPing,
                connected: redisClient.isReady || false,
            };
        } else {
            healthCheck.dependencies.redis = {
                status: 'not_configured',
                message: 'Redis client not available',
            };
        }
    } catch (error) {
        healthCheck.status = 'degraded';
        healthCheck.dependencies.redis = {
            status: 'unhealthy',
            error: error.message,
        };
    }

    // Determine overall status
    const hasUnhealthyDependency = Object.values(healthCheck.dependencies).some(
        (dep) => dep.status === 'unhealthy'
    );

    if (hasUnhealthyDependency) {
        healthCheck.status = 'degraded';
    }

    const statusCode = healthCheck.status === 'success' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
});

/**
 * Readiness Probe
 * GET /health/ready
 * Kubernetes-style readiness probe
 * Returns 200 if server is ready to accept traffic
 */
router.get('/ready', async (req, res) => {
    try {
        // Check critical dependencies
        const mongoReady = mongoose.connection.readyState === 1;

        let redisReady = true; // Default to true if Redis is optional
        if (redisClient && typeof redisClient.ping === 'function') {
            try {
                const redisPing = await redisClient.ping();
                redisReady = redisPing === 'PONG';
            } catch (error) {
                redisReady = false;
            }
        }

        if (mongoReady && redisReady) {
            res.status(200).json({
                status: 'ready',
                timestamp: new Date().toISOString(),
                checks: {
                    mongodb: 'ready',
                    redis: 'ready',
                },
            });
        } else {
            res.status(503).json({
                status: 'not_ready',
                timestamp: new Date().toISOString(),
                checks: {
                    mongodb: mongoReady ? 'ready' : 'not_ready',
                    redis: redisReady ? 'ready' : 'not_ready',
                },
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

/**
 * Liveness Probe
 * GET /health/live
 * Kubernetes-style liveness probe
 * Returns 200 if server process is alive (should restart if fails)
 */
router.get('/live', (req, res) => {
    // Simple check - if we can respond, we're alive
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        pid: process.pid,
    });
});

/**
 * System Metrics
 * GET /health/metrics
 * Detailed system metrics for monitoring
 */
router.get('/metrics', (req, res) => {
    const metrics = {
        timestamp: new Date().toISOString(),
        uptime: {
            process: `${Math.round(process.uptime())}s`,
            system: `${Math.round(os.uptime())}s`,
        },
        memory: {
            system: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem(),
                usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
            },
            process: {
                rss: process.memoryUsage().rss,
                heapTotal: process.memoryUsage().heapTotal,
                heapUsed: process.memoryUsage().heapUsed,
                external: process.memoryUsage().external,
                arrayBuffers: process.memoryUsage().arrayBuffers,
            },
        },
        cpu: {
            count: os.cpus().length,
            model: os.cpus()[0]?.model || 'Unknown',
            speed: `${os.cpus()[0]?.speed || 0} MHz`,
            loadAverage: {
                '1min': os.loadavg()[0],
                '5min': os.loadavg()[1],
                '15min': os.loadavg()[2],
            },
        },
        platform: {
            type: os.type(),
            platform: os.platform(),
            arch: os.arch(),
            release: os.release(),
            hostname: os.hostname(),
        },
        process: {
            pid: process.pid,
            version: process.version,
            nodeVersion: process.versions.node,
            v8Version: process.versions.v8,
        },
    };

    res.status(200).json(metrics);
});

/**
 * Database Connection Check
 * GET /health/db
 * Specific database connectivity test
 */
router.get('/db', async (req, res) => {
    try {
        const mongoState = mongoose.connection.readyState;
        const mongoStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        if (mongoState === 1) {
            // Test database accessibility
            await mongoose.connection.db.admin().ping();

            res.status(200).json({
                status: 'healthy',
                state: mongoStatus[mongoState],
                host: mongoose.connection.host,
                name: mongoose.connection.name,
                timestamp: new Date().toISOString(),
            });
        } else {
            res.status(503).json({
                status: 'unhealthy',
                state: mongoStatus[mongoState],
                timestamp: new Date().toISOString(),
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

export default router;
