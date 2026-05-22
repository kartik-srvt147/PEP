import express from 'express';
import {
  getCategoryBreakdownController,
  getDashboardAnalyticsController,
  getInventoryStatsController,
  getProductPerformanceController,
  getRevenueAnalyticsController,
  getSalesTrendsController,
  getTopProductsController,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalyticsController);
router.get('/revenue', protect, getRevenueAnalyticsController);
router.get('/top-products', protect, getTopProductsController);
router.get('/sales-trends', protect, getSalesTrendsController);
router.get('/inventory', protect, getInventoryStatsController);
router.get('/product-performance', protect, getProductPerformanceController);
router.get('/categories', protect, getCategoryBreakdownController);

export default router;
