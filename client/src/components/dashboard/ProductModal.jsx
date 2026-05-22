import { Loader2, PackagePlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import AIGeneratorPanel from './AIGeneratorPanel';

const emptyForm = {
  title: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  tags: '',
  salesCount: '0',
  revenue: '0',
  image: '',
  aiFeatures: '',
};

const getInitialForm = (product) => {
  if (!product) {
    return emptyForm;
  }

  return {
    title: product.title || '',
    description: product.description || '',
    category: product.category || '',
    price: product.price ?? '',
    stock: product.stock ?? '',
    tags: product.tags?.join(', ') || '',
    salesCount: product.salesCount ?? '0',
    revenue: product.revenue ?? '0',
    image: product.image || '',
    aiFeatures: [
      product.category,
      product.description,
      ...(product.tags || []),
    ]
      .filter(Boolean)
      .join(', '),
  };
};

const ProductModal = ({ open, product, onClose, onSubmit, saving, onToast }) => {
  const [form, setForm] = useState(() => getInitialForm(product));
  const [error, setError] = useState('');

  const isEditing = Boolean(product?._id);

  const title = useMemo(() => (isEditing ? 'Edit product' : 'Add product'), [isEditing]);

  if (!open) {
    return null;
  }

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleApplyAiContent = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    onToast?.({
      type: 'success',
      title: 'Applied to form',
      message: field === 'tags' ? 'SEO tags were added.' : 'Description was updated.',
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) {
      setError('Title, description, and category are required.');
      return;
    }

    if (Number(form.price) < 0 || Number(form.stock) < 0) {
      setError('Price and stock cannot be negative.');
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      salesCount: Number(form.salesCount || 0),
      revenue: Number(form.revenue || 0),
      image: form.image.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 px-4 py-4 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-primary">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500">Keep product information accurate and ready to sell.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close product form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-81px)] overflow-y-auto px-5 py-5">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Title</span>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(event) => handleChange('title', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                    placeholder="Classic leather tote"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Category</span>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(event) => handleChange('category', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                    placeholder="Accessories"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Image URL</span>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(event) => handleChange('image', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                    placeholder="https://example.com/image.jpg"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">AI features brief</span>
                  <textarea
                    rows={3}
                    value={form.aiFeatures}
                    onChange={(event) => handleChange('aiFeatures', event.target.value)}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                    placeholder="genuine leather, zip closure, warm lining, premium fit"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Description</span>
                  <textarea
                    required
                    rows={5}
                    value={form.description}
                    onChange={(event) => handleChange('description', event.target.value)}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                    placeholder="Describe the product, material, benefits, and buyer fit."
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(event) => handleChange('price', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                    placeholder="49.99"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Stock</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.stock}
                    onChange={(event) => handleChange('stock', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                    placeholder="25"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Sales count</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.salesCount}
                    onChange={(event) => handleChange('salesCount', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Revenue</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.revenue}
                    onChange={(event) => handleChange('revenue', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Tags</span>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(event) => handleChange('tags', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                    placeholder="fashion, bestseller, seo"
                  />
                </label>
              </div>
            </div>

            <AIGeneratorPanel
              productDraft={{
                title: form.title,
                category: form.category,
                price: form.price || 0,
                features: form.aiFeatures
                  .split(/[\n,]/)
                  .map((feature) => feature.trim())
                  .filter(Boolean),
              }}
              onApply={handleApplyAiContent}
              onToast={onToast}
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
