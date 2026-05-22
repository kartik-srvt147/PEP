import mongoose from 'mongoose';
import Product from '../models/Product.js';

const allowedSortFields = new Set([
  'title',
  'category',
  'price',
  'stock',
  'salesCount',
  'revenue',
  'createdAt',
  'updatedAt',
]);

const normalizeTags = (tags) => {
  if (!tags) {
    return [];
  }

  const rawTags = Array.isArray(tags) ? tags : String(tags).split(',');

  return [...new Set(rawTags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))];
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseOptionalNumber = (value, fieldName) => {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

const pickProductFields = (body) => {
  const product = {};
  const allowedFields = [
    'title',
    'description',
    'category',
    'price',
    'stock',
    'tags',
    'salesCount',
    'revenue',
    'image',
  ];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      product[field] = body[field];
    }
  });

  if (product.tags !== undefined) {
    product.tags = normalizeTags(product.tags);
  }

  return product;
};

const assertValidProductId = (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error('Invalid product id');
    error.statusCode = 400;
    throw error;
  }
};

const buildProductQuery = (userId, queryParams) => {
  const {
    search,
    category,
    tag,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    inStock,
  } = queryParams;

  const query = { createdBy: userId };

  if (search) {
    const searchRegex = new RegExp(escapeRegex(String(search).trim()), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
      { tags: searchRegex },
    ];
  }

  if (category) {
    query.category = new RegExp(`^${escapeRegex(String(category).trim())}$`, 'i');
  }

  if (tag) {
    query.tags = String(tag).trim().toLowerCase();
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = parseOptionalNumber(minPrice, 'minPrice');
    if (maxPrice !== undefined) query.price.$lte = parseOptionalNumber(maxPrice, 'maxPrice');
  }

  if (minStock !== undefined || maxStock !== undefined) {
    query.stock = {};
    if (minStock !== undefined) query.stock.$gte = parseOptionalNumber(minStock, 'minStock');
    if (maxStock !== undefined) query.stock.$lte = parseOptionalNumber(maxStock, 'maxStock');
  }

  if (inStock === 'true') {
    query.stock = { ...(query.stock || {}), $gt: 0 };
  }

  if (inStock === 'false') {
    query.stock = { ...(query.stock || {}), $eq: 0 };
  }

  return query;
};

const parsePagination = ({ page = 1, limit = 10 }) => {
  const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

const parseSort = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const field = allowedSortFields.has(sortBy) ? sortBy : 'createdAt';
  const direction = sortOrder === 'asc' ? 1 : -1;

  return { [field]: direction };
};

const createProduct = async (userId, body) => {
  const productData = {
    ...pickProductFields(body),
    createdBy: userId,
  };

  return Product.create(productData);
};

const getProducts = async (userId, queryParams) => {
  const filter = buildProductQuery(userId, queryParams);
  const { page, limit, skip } = parsePagination(queryParams);
  const sort = parseSort(queryParams.sortBy, queryParams.sortOrder);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getProductById = async (userId, productId) => {
  assertValidProductId(productId);

  return Product.findOne({ _id: productId, createdBy: userId });
};

const updateProduct = async (userId, productId, body) => {
  assertValidProductId(productId);

  return Product.findOneAndUpdate(
    { _id: productId, createdBy: userId },
    pickProductFields(body),
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteProduct = async (userId, productId) => {
  assertValidProductId(productId);

  return Product.findOneAndDelete({ _id: productId, createdBy: userId });
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
