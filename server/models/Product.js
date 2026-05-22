import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [2, 'Product title must be at least 2 characters'],
      maxlength: [120, 'Product title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Product description must be at least 10 characters'],
      maxlength: [2000, 'Product description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      maxlength: [80, 'Product category cannot exceed 80 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Product stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Product stock must be a whole number',
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(tags) {
          return tags.length <= 20;
        },
        message: 'A product can have at most 20 tags',
      },
    },
    salesCount: {
      type: Number,
      default: 0,
      min: [0, 'Sales count cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Sales count must be a whole number',
      },
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative'],
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
});

productSchema.pre('validate', function () {
  if (Array.isArray(this.tags)) {
    this.tags = this.tags
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean);
    this.tags = [...new Set(this.tags)];
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
