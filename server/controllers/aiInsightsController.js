import {
  generateBusinessInsightsSummary,
  generateInventoryAlerts,
  generatePricingRecommendations,
  generateProductImprovementSuggestions,
  generateTrendingProductInsights,
} from '../services/aiInsightsService.js';

const sendInsightsResponse = (res, message, payload) => {
  res.status(200).json({
    success: true,
    message,
    data: payload.result,
    meta: {
      provider: payload.provider,
      model: payload.model,
      inputCount: payload.inputCount,
    },
  });
};

const generatePricingInsightsController = async (req, res, next) => {
  try {
    const payload = await generatePricingRecommendations(req.body);

    sendInsightsResponse(res, 'Pricing recommendations generated successfully', payload);
  } catch (error) {
    next(error);
  }
};

const generateTrendingInsightsController = async (req, res, next) => {
  try {
    const payload = await generateTrendingProductInsights(req.body);

    sendInsightsResponse(res, 'Trending product insights generated successfully', payload);
  } catch (error) {
    next(error);
  }
};

const generateInventoryAlertsController = async (req, res, next) => {
  try {
    const payload = await generateInventoryAlerts(req.body);

    sendInsightsResponse(res, 'Inventory alerts generated successfully', payload);
  } catch (error) {
    next(error);
  }
};

const generateImprovementInsightsController = async (req, res, next) => {
  try {
    const payload = await generateProductImprovementSuggestions(req.body);

    sendInsightsResponse(res, 'Product improvement suggestions generated successfully', payload);
  } catch (error) {
    next(error);
  }
};

const generateBusinessInsightsController = async (req, res, next) => {
  try {
    const payload = await generateBusinessInsightsSummary(req.body);

    sendInsightsResponse(res, 'Business insights generated successfully', payload);
  } catch (error) {
    next(error);
  }
};

export {
  generateBusinessInsightsController,
  generatePricingInsightsController,
  generateTrendingInsightsController,
  generateInventoryAlertsController,
  generateImprovementInsightsController,
};
