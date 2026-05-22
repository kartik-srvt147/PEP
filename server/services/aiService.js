const DEFAULT_MODEL = 'gemini-2.5-flash';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const PLACEHOLDER_KEYS = new Set([
  '',
  'your_gemini_api_key_here',
  'your_openai_api_key_here',
  'sk-your-key-here',
]);

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

const getGeminiErrorMessage = (status, payload) => {
  const message = payload?.error?.message || 'AI generation failed';

  if (status === 401) {
    return 'Gemini API key is invalid or expired';
  }

  if (status === 403) {
    return 'Gemini API key does not have access to the selected model or API';
  }

  if (status === 404) {
    return 'Selected Gemini model was not found. Set GEMINI_MODEL to a model available to your account.';
  }

  if (status === 429) {
    return 'Gemini rate limit or quota exceeded. Please check your billing and usage limits.';
  }

  if (status >= 400 && status < 500) {
    return message;
  }

  return 'AI generation failed. Please try again later.';
};

const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

  if (PLACEHOLDER_KEYS.has(apiKey.trim())) {
    throw createHttpError('Gemini API key is not configured', 503);
  }

  return apiKey.trim();
};

const getModel = () => process.env.GEMINI_MODEL || DEFAULT_MODEL;

const normalizeFeatures = (features) => {
  if (Array.isArray(features)) {
    return features.map((feature) => String(feature).trim()).filter(Boolean);
  }

  return String(features || '')
    .split(/[\n,]/)
    .map((feature) => feature.trim())
    .filter(Boolean);
};

const validateProductInput = ({ title, category, features, price }) => {
  const normalized = {
    title: String(title || '').trim(),
    category: String(category || '').trim(),
    features: normalizeFeatures(features),
    price: Number(price),
  };

  if (!normalized.title) {
    throw createHttpError('Product title is required', 400);
  }

  if (!normalized.category) {
    throw createHttpError('Product category is required', 400);
  }

  if (!normalized.features.length) {
    throw createHttpError('At least one product feature is required', 400);
  }

  if (Number.isNaN(normalized.price) || normalized.price < 0) {
    throw createHttpError('Product price must be a valid non-negative number', 400);
  }

  return normalized;
};

const baseInstructions = `
You are an expert ecommerce merchandising assistant for SmartStore AI.
Write accurate, original, conversion-focused product copy.
Use the supplied product facts only; do not invent specifications, guarantees, discounts, awards, or shipping details.
Keep the output polished, specific, and suitable for a professional admin dashboard.
Return only data that matches the requested JSON schema.
`;

const buildProductContext = ({ title, category, features, price }) => `
Product title: ${title}
Category: ${category}
Price: ${price}
Features:
${features.map((feature) => `- ${feature}`).join('\n')}
`;

const prompts = {
  description: (input) => `
Create an SEO-friendly product description for the product below.
Optimize for search intent, readability, and buyer confidence.
Include a concise meta description, a storefront-ready description, and benefit-led bullets.

${buildProductContext(input)}
`,
  tags: (input) => `
Generate searchable ecommerce SEO tags for the product below.
Prioritize buyer search terms, category relevance, material/style/use-case words from the features, and high-intent phrases.
Avoid duplicate, vague, or misleading tags.

${buildProductContext(input)}
`,
  captions: (input) => `
Generate persuasive marketing captions for the product below.
Create options for different channels, each with a clear angle and call to action.
Keep captions punchy, credible, and ready for use in campaigns.

${buildProductContext(input)}
`,
};

const productDescriptionSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    metaDescription: { type: 'STRING' },
    shortDescription: { type: 'STRING' },
    longDescription: { type: 'STRING' },
    bulletPoints: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    primaryKeywords: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
  },
  required: [
    'title',
    'metaDescription',
    'shortDescription',
    'longDescription',
    'bulletPoints',
    'primaryKeywords',
  ],
};

const seoTagsSchema = {
  type: 'OBJECT',
  properties: {
    tags: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    seoKeywords: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    longTailKeywords: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    categorySuggestions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
  },
  required: ['tags', 'seoKeywords', 'longTailKeywords', 'categorySuggestions'],
};

const marketingCaptionsSchema = {
  type: 'OBJECT',
  properties: {
    captions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          channel: { type: 'STRING' },
          angle: { type: 'STRING' },
          caption: { type: 'STRING' },
          callToAction: { type: 'STRING' },
          hashtags: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['channel', 'angle', 'caption', 'callToAction', 'hashtags'],
      },
    },
    shortCaption: { type: 'STRING' },
    adCaption: { type: 'STRING' },
  },
  required: ['captions', 'shortCaption', 'adCaption'],
};

const parseStructuredOutput = (response) => {
  const outputText = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!outputText) {
    throw createHttpError('AI response did not include structured output', 502);
  }

  try {
    return JSON.parse(outputText);
  } catch (error) {
    throw createHttpError('AI response could not be parsed', 502);
  }
};

const fetchGeminiContent = async ({ endpoint, apiKey, body }) => {
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
      getGeminiErrorMessage(response.status, payload) || responseText || 'Gemini request failed',
      response.status < 500 ? response.status : 502
    );
  }

  if (!payload) {
    throw createHttpError('Gemini returned a non-JSON response', 502);
  }

  return payload;
};

const runStructuredGeneration = async ({ task, input, schema }) => {
  const apiKey = getGeminiApiKey();
  const model = getModel();
  const endpoint = `${GEMINI_API_BASE_URL}/models/${model}:generateContent`;

  try {
    const responsePayload = await fetchGeminiContent({
      endpoint,
      apiKey,
      body: {
        systemInstruction: {
          parts: [{ text: baseInstructions }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompts[task](input) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      },
    });

    return {
      model,
      provider: 'gemini',
      result: parseStructuredOutput(responsePayload),
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Gemini generation error:', error);
    throw createHttpError('Gemini generation failed. Please try again later.', 502);
  }
};

const generateProductDescription = async (body) => {
  const input = validateProductInput(body);

  return runStructuredGeneration({
    task: 'description',
    input,
    schema: productDescriptionSchema,
  });
};

const generateSeoTags = async (body) => {
  const input = validateProductInput(body);

  return runStructuredGeneration({
    task: 'tags',
    input,
    schema: seoTagsSchema,
  });
};

const generateMarketingCaptions = async (body) => {
  const input = validateProductInput(body);

  return runStructuredGeneration({
    task: 'captions',
    input,
    schema: marketingCaptionsSchema,
  });
};

export {
  generateProductDescription,
  generateSeoTags,
  generateMarketingCaptions,
};
