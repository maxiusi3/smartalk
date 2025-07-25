import { Router } from 'express';
import analyticsController from '../controllers/AnalyticsController';

const router = Router();

/**
 * @route POST /api/v1/analytics/events
 * @desc Record a single analytics event
 * @access Public
 */
router.post('/events', analyticsController.recordEvent);

/**
 * @route POST /api/v1/analytics/events/batch
 * @desc Record multiple analytics events
 * @access Public
 */
router.post('/events/batch', analyticsController.recordBatchEvents);

/**
 * @route GET /api/v1/analytics/events/:userId
 * @desc Get analytics events for a specific user
 * @access Public
 */
router.get('/events/:userId', analyticsController.getUserEvents);

/**
 * @route GET /api/v1/analytics/stats/:userId
 * @desc Get learning statistics for a specific user
 * @access Public
 */
router.get('/stats/:userId', analyticsController.getUserStats);

/**
 * @route GET /api/v1/analytics/system
 * @desc Get system-wide analytics data
 * @access Public
 */
router.get('/system', analyticsController.getSystemAnalytics);

/**
 * @route GET /api/v1/analytics/funnel
 * @desc Get conversion funnel analytics
 * @access Public
 */
router.get('/funnel', analyticsController.getFunnelAnalytics);

/**
 * @route GET /api/v1/analytics/health
 * @desc Health check for analytics service
 * @access Public
 */
router.get('/health', analyticsController.healthCheck);

export default router;