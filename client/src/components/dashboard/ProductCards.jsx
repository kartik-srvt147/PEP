import { Edit3, ImageIcon, Package, Trash2 } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const ProductCards = ({ products, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-40 rounded-lg bg-slate-100" />
            <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <article
          key={product._id}
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex aspect-[16/10] items-center justify-center bg-slate-100">
            {product.image ? (
              <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-10 w-10 text-slate-300" />
            )}
          </div>
          <div className="space-y-4 p-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">{product.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{product.category}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    product.stock > 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {product.stock > 0 ? 'In stock' : 'Out'}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-500">{product.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Price</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(product.price)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stock</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{product.stock}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sales</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{product.salesCount}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags?.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {tag}
                </span>
              ))}
              {!product.tags?.length && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                  <Package className="h-4 w-4" />
                  No tags
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(product)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ProductCards;
