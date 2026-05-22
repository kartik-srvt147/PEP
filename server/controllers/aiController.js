import {
  generateMarketingCaptions,
  generateProductDescription,
  generateSeoTags,
} from '../services/aiService.js';

const sendAiResponse = (res, message, payload) => {
  res.status(200).json({
    success: true,
    message,
    data: payload.result,
    meta: {
      model: payload.model,
    },
  });
};

const generateDescriptionController = async (req, res, next) => {
  try {
    const payload = await generateProductDescription(req.body);

    sendAiResponse(res, 'Product description generated successfully', payload);
  } catch (error) {
    next(error);
  }
};

const generateTagsController = async (req, res, next) => {
  try {
    const payload = await generateSeoTags(req.body);

    sendAiResponse(res, 'SEO tags generated successfully', payload);
  } catch (error) {
    next(error);
  }
};

const generateCaptionsController = async (req, res, next) => {
  try {
    const payload = await generateMarketingCaptions(req.body);

    sendAiResponse(res, 'Marketing captions generated successfully', payload);
  } catch (error) {
    next(error);
  }
};

export {
  generateDescriptionController,
  generateTagsController,
  generateCaptionsController,
};
