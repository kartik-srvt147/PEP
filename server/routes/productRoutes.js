import express from 'express';
import {
  createProductController,
  deleteProductController,
  getProductController,
  getProductsController,
  updateProductController,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, createProductController)
  .get(protect, getProductsController);

router
  .route('/:id')
  .get(protect, getProductController)
  .put(protect, updateProductController)
  .delete(protect, deleteProductController);

export default router;
