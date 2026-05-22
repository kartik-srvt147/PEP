import OpenAI from 'openai';

const DEFAULT_MODEL = 'gpt-5.2';
const PLACEHOLDER_KEYS = new Set(['', 'your_openai_api_key_here', 'sk-your-key-here']);

let openaiClient = null;

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY || '';

  if (PLACEHOLDER_KEYS.has(apiKey.trim())) {
    throw createHttpError('OpenAI API key is not configured', 503);
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
};

const getModel = () => process.env.OPENAI_MODEL || DEFAULT_MODEL;

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
  type: 'json_schema',
  name: 'product_description_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      metaDescription: { type: 'string' },
      shortDescription: { type: 'string' },
      longDescription: { type: 'string' },
      bulletPoints: {
        type: 'array',
        items: { type: 'string' },
      },
      primaryKeywords: {
        type: 'array',
        items: { type: 'string' },
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
  },
};

const seoTagsSchema = {
  type: 'json_schema',
  name: 'seo_tags_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
      seoKeywords: {
        type: 'array',
        items: { type: 'string' },
      },
      longTailKeywords: {
        type: 'array',
        items: { type: 'string' },
      },
      categorySuggestions: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['tags', 'seoKeywords', 'longTailKeywords', 'categorySuggestions'],
  },
};

const marketingCaptionsSchema = {
  type: 'json_schema',
  name: 'marketing_captions_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      captions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            channel: { type: 'string' },
            angle: { type: 'string' },
            caption: { type: 'string' },
            callToAction: { type: 'string' },
            hashtags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['channel', 'angle', 'caption', 'callToAction', 'hashtags'],
        },
      },
      shortCaption: { type: 'string' },
      adCaption: { type: 'string' },
    },
    required: ['captions', 'shortCaption', 'adCaption'],
  },
};

const parseStructuredOutput = (response) => {
  const outputText = response.output_text;

  if (!outputText) {
    throw createHttpError('AI response did not include structured output', 502);
  }

  try {
    return JSON.parse(outputText);
  } catch (error) {
    throw createHttpError('AI response could not be parsed', 502);
  }
};

const runStructuredGeneration = async ({ task, input, schema }) => {
  const client = getOpenAIClient();
  const model = getModel();

  try {
    const response = await client.responses.create({
      model,
      instructions: baseInstructions,
      input: prompts[task](input),
      text: {
        format: schema,
      },
    });

    return {
      model,
      result: parseStructuredOutput(response),
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error('OpenAI generation error:', error);
    throw createHttpError('AI generation failed. Please try again later.', 502);
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
