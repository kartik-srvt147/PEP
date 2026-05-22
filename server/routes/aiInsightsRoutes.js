import express from 'express';
import {
  generateBusinessInsightsController,
  generateImprovementInsightsController,
  generateInventoryAlertsController,
  generatePricingInsightsController,
  generateTrendingInsightsController,
} from '../controllers/aiInsightsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/summary', protect, generateBusinessInsightsController);
router.post('/pricing', protect, generatePricingInsightsController);
router.post('/trending-products', protect, generateTrendingInsightsController);
router.post('/inventory-alerts', protect, generateInventoryAlertsController);
router.post('/product-improvements', protect, generateImprovementInsightsController);

export default router;
