import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../services/productService.js';

const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const createProductController = async (req, res, next) => {
  try {
    const product = await createProduct(req.user._id, req.body);

    return sendSuccess(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

const getProductsController = async (req, res, next) => {
  try {
    const { products, pagination } = await getProducts(req.user._id, req.query);

    return sendSuccess(res, 200, 'Products fetched successfully', products, {
      pagination,
      filters: {
        search: req.query.search || null,
        category: req.query.category || null,
        tag: req.query.tag || null,
        inStock: req.query.inStock || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductController = async (req, res, next) => {
  try {
    const product = await getProductById(req.user._id, req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    return sendSuccess(res, 200, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

const updateProductController = async (req, res, next) => {
  try {
    const product = await updateProduct(req.user._id, req.params.id, req.body);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    return sendSuccess(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

const deleteProductController = async (req, res, next) => {
  try {
    const product = await deleteProduct(req.user._id, req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    return sendSuccess(res, 200, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

export {
  createProductController,
  getProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
};
