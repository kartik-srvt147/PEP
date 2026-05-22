const DEFAULT_MODEL = 'gemini-2.5-flash';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const PLACEHOLDER_KEYS = new Set(['', 'your_gemini_api_key_here']);

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseJsonText = (text) => {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

  if (PLACEHOLDER_KEYS.has(apiKey.trim())) {
    throw createHttpError('Gemini insights API key is not configured', 503);
  }

  return apiKey.trim();
};

const getModel = () => process.env.GEMINI_INSIGHTS_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;

const getGeminiErrorMessage = (status, payload) => {
  if (status === 401) return 'Gemini insights API key is invalid or expired';
  if (status === 403) return 'Gemini insights API key cannot access the selected model or API';
  if (status === 404) return 'Selected Gemini insights model was not found';
  if (status === 429) return 'Gemini insights quota or rate limit exceeded';

  return payload?.error?.message || 'Gemini insights generation failed';
};

const parseMetric = (value, fieldName) => {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 0) {
    throw createHttpError(`${fieldName} must be a non-negative number`, 400);
  }

  return parsed;
};

const normalizeProduct = (product, index = 0) => {
  const category = String(product.category || '').trim();

  if (!category) {
    throw createHttpError(`Product category is required for item ${index + 1}`, 400);
  }

  return {
    title: String(product.title || product.name || `Product ${index + 1}`).trim(),
    category,
    sales: parseMetric(product.sales ?? product.salesCount ?? 0, 'Product sales'),
    stock: parseMetric(product.stock ?? 0, 'Product stock'),
    revenue: parseMetric(product.revenue ?? 0, 'Product revenue'),
    pricing: parseMetric(product.pricing ?? product.price ?? 0, 'Product pricing'),
  };
};

const normalizeProducts = (body, { minimum = 1 } = {}) => {
  const products = Array.isArray(body.products) ? body.products : [body.product || body];
  const normalized = products.filter(Boolean).map(normalizeProduct);

  if (normalized.length < minimum) {
    throw createHttpError(`At least ${minimum} product metric record is required`, 400);
  }

  return normalized;
};

const consultantInstructions = `
You are a senior ecommerce business consultant for SmartStore AI.
Base recommendations only on the supplied product metrics: sales, stock, revenue, category, and pricing.
Be practical, commercially realistic, and concise.
Call out uncertainty when metrics are limited, and avoid claiming market facts that were not provided.
Every recommendation must include a concrete action a store operator can take.
Return only JSON that matches the requested schema.
`;

const productMetricsContext = (products) =>
  products
    .map(
      (product) => `
Product: ${product.title}
Category: ${product.category}
Current pricing: ${product.pricing}
Sales: ${product.sales}
Stock: ${product.stock}
Revenue: ${product.revenue}`
    )
    .join('\n');

const prompts = {
  pricing: (products) => `
Review pricing for the product metrics below.
Recommend pricing actions that protect margin signals, demand momentum, and inventory velocity.
Use observed revenue-per-sale, stock pressure, and category context. Do not invent competitor prices.

${productMetricsContext(products)}
`,
  trends: (products) => `
Identify trending product signals from these ecommerce product metrics.
Rank momentum based on sales, revenue, stock pressure, and price context.
Explain what looks promising, what is uncertain, and the next merchandising action.

${productMetricsContext(products)}
`,
  inventory: (products) => `
Assess inventory risk from these ecommerce product metrics.
Flag urgent stockout, low-stock, overstock, and watchlist conditions using current stock, sales, revenue, and pricing.
Write operational alerts that a store manager can act on today.

${productMetricsContext(products)}
`,
  improvements: (products) => `
Suggest product improvements for these ecommerce listings and commercial outcomes.
Use sales, stock, revenue, category, and pricing to infer practical improvement opportunities.
Focus on positioning, pricing tests, merchandising, and inventory-aware promotion actions.

${productMetricsContext(products)}
`,
  summary: (products) => `
Create a compact business insights brief for these ecommerce product metrics.
Return pricing recommendations, trending product signals, inventory alerts, and improvement suggestions in one analysis.
Prioritize the most actionable items for an operator. Keep each recommendation specific and avoid repeating the same action.

${productMetricsContext(products)}
`,
};

const textEnum = (values) => ({ type: 'STRING', enum: values });

const recommendationItem = {
  type: 'OBJECT',
  properties: {
    productTitle: { type: 'STRING' },
    category: { type: 'STRING' },
    priority: textEnum(['low', 'medium', 'high']),
    insight: { type: 'STRING' },
    action: { type: 'STRING' },
    rationale: { type: 'STRING' },
  },
  required: ['productTitle', 'category', 'priority', 'insight', 'action', 'rationale'],
};

const pricingSchema = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    recommendations: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          productTitle: { type: 'STRING' },
          currentPrice: { type: 'NUMBER' },
          recommendedAction: textEnum([
            'increase',
            'hold',
            'discount_test',
            'bundle_test',
            'review_manually',
          ]),
          suggestedPriceRange: {
            type: 'OBJECT',
            properties: {
              minimum: { type: 'NUMBER' },
              maximum: { type: 'NUMBER' },
            },
            required: ['minimum', 'maximum'],
          },
          confidence: textEnum(['low', 'medium', 'high']),
          reason: { type: 'STRING' },
          nextStep: { type: 'STRING' },
        },
        required: [
          'productTitle',
          'currentPrice',
          'recommendedAction',
          'suggestedPriceRange',
          'confidence',
          'reason',
          'nextStep',
        ],
      },
    },
  },
  required: ['summary', 'recommendations'],
};

const trendSchema = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    trendingProducts: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          productTitle: { type: 'STRING' },
          category: { type: 'STRING' },
          momentum: textEnum(['emerging', 'steady', 'strong', 'uncertain']),
          signal: { type: 'STRING' },
          opportunity: { type: 'STRING' },
          action: { type: 'STRING' },
        },
        required: ['productTitle', 'category', 'momentum', 'signal', 'opportunity', 'action'],
      },
    },
  },
  required: ['summary', 'trendingProducts'],
};

const inventorySchema = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    alerts: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          productTitle: { type: 'STRING' },
          category: { type: 'STRING' },
          severity: textEnum(['info', 'warning', 'critical']),
          alertType: textEnum(['stockout', 'low_stock', 'overstock', 'watchlist']),
          message: { type: 'STRING' },
          action: { type: 'STRING' },
        },
        required: ['productTitle', 'category', 'severity', 'alertType', 'message', 'action'],
      },
    },
  },
  required: ['summary', 'alerts'],
};

const improvementsSchema = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    suggestions: {
      type: 'ARRAY',
      items: recommendationItem,
    },
  },
  required: ['summary', 'suggestions'],
};

const businessInsightsSchema = {
  type: 'OBJECT',
  properties: {
    pricing: pricingSchema,
    trends: trendSchema,
    inventory: inventorySchema,
    improvements: improvementsSchema,
  },
  required: ['pricing', 'trends', 'inventory', 'improvements'],
};

const parseStructuredOutput = (response) => {
  const outputText = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!outputText) {
    throw createHttpError('Gemini insights response did not include structured output', 502);
  }

  try {
    return JSON.parse(outputText);
  } catch {
    throw createHttpError('Gemini insights response could not be parsed', 502);
  }
};

const fetchGeminiInsights = async ({ endpoint, apiKey, body }) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  const payload = parseJsonText(responseText);

  if (!response.ok) {
    throw createHttpError(
      getGeminiErrorMessage(response.status, payload),
      response.status < 500 ? response.status : 502
    );
  }

  if (!payload) {
    throw createHttpError('Gemini insights returned a non-JSON response', 502);
  }

  return payload;
};

const generateStructuredInsights = async ({ task, products, schema }) => {
  const apiKey = getGeminiApiKey();
  const model = getModel();
  const endpoint = `${GEMINI_API_BASE_URL}/models/${model}:generateContent`;

  try {
    const response = await fetchGeminiInsights({
      endpoint,
      apiKey,
      body: {
        systemInstruction: {
          parts: [{ text: consultantInstructions }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompts[task](products) }],
          },
        ],
        generationConfig: {
          temperature: 0.45,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      },
    });

    return {
      provider: 'gemini',
      model,
      inputCount: products.length,
      result: parseStructuredOutput(response),
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Gemini insights generation error:', error);
    throw createHttpError('Gemini insights generation failed. Please try again later.', 502);
  }
};

const generatePricingRecommendations = async (body) => {
  const products = normalizeProducts(body);

  return generateStructuredInsights({ task: 'pricing', products, schema: pricingSchema });
};

const generateTrendingProductInsights = async (body) => {
  const products = normalizeProducts(body);

  return generateStructuredInsights({ task: 'trends', products, schema: trendSchema });
};

const generateInventoryAlerts = async (body) => {
  const products = normalizeProducts(body);

  return generateStructuredInsights({ task: 'inventory', products, schema: inventorySchema });
};

const generateProductImprovementSuggestions = async (body) => {
  const products = normalizeProducts(body);

  return generateStructuredInsights({
    task: 'improvements',
    products,
    schema: improvementsSchema,
  });
};

const generateBusinessInsightsSummary = async (body) => {
  const products = normalizeProducts(body);

  return generateStructuredInsights({
    task: 'summary',
    products,
    schema: businessInsightsSchema,
  });
};

export {
  generateBusinessInsightsSummary,
  generatePricingRecommendations,
  generateTrendingProductInsights,
  generateInventoryAlerts,
  generateProductImprovementSuggestions,
};
