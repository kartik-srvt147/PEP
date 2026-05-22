import {
  getAnalyticsDashboard,
  getCategoryBreakdown,
  getInventoryStats,
  getProductPerformance,
  getRevenueSummary,
  getSalesTrends,
  getTopSellingProducts,
} from '../services/analyticsService.js';

const sendSuccess = (res, message, data, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(200).json(response);
};

const getDashboardAnalyticsController = async (req, res, next) => {
  try {
    const data = await getAnalyticsDashboard(req.user._id, req.query);

    sendSuccess(res, 'Analytics dashboard fetched successfully', data, {
      generatedAt: new Date().toISOString(),
      trendDays: Number.parseInt(req.query.days, 10) || 30,
    });
  } catch (error) {
    next(error);
  }
};

const getRevenueAnalyticsController = async (req, res, next) => {
  try {
    const data = await getRevenueSummary(req.user._id);

    sendSuccess(res, 'Revenue analytics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

const getTopProductsController = async (req, res, next) => {
  try {
    const data = await getTopSellingProducts(req.user._id, req.query.limit);

    sendSuccess(res, 'Top selling products fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

const getSalesTrendsController = async (req, res, next) => {
  try {
    const data = await getSalesTrends(req.user._id, req.query.days);

    sendSuccess(res, 'Sales trends fetched successfully', data, {
      days: Number.parseInt(req.query.days, 10) || 30,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryStatsController = async (req, res, next) => {
  try {
    const data = await getInventoryStats(req.user._id);

    sendSuccess(res, 'Inventory stats fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

const getProductPerformanceController = async (req, res, next) => {
  try {
    const data = await getProductPerformance(req.user._id, req.query.limit);

    sendSuccess(res, 'Product performance fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

const getCategoryBreakdownController = async (req, res, next) => {
  try {
    const data = await getCategoryBreakdown(req.user._id);

    sendSuccess(res, 'Category breakdown fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

export {
  getDashboardAnalyticsController,
  getRevenueAnalyticsController,
  getTopProductsController,
  getSalesTrendsController,
  getInventoryStatsController,
  getProductPerformanceController,
  getCategoryBreakdownController,
};
