import express from 'express';
import {
  generateCaptionsController,
  generateDescriptionController,
  generateTagsController,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/description', protect, generateDescriptionController);
router.post('/tags', protect, generateTagsController);
router.post('/captions', protect, generateCaptionsController);

export default router;
