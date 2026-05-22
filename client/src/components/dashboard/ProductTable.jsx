import { Edit3, ImageIcon, Trash2 } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const ProductTable = ({ products, onEdit, onDelete, loading }) => {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              Product
            </th>
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              Category
            </th>
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              Price
            </th>
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              Stock
            </th>
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              Sales
            </th>
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              Revenue
            </th>
            <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-slate-100" />
                      <div className="space-y-2">
                        <div className="h-3 w-36 rounded bg-slate-100" />
                        <div className="h-3 w-52 rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="h-3 w-24 rounded bg-slate-100" /></td>
                  <td className="px-5 py-4"><div className="h-3 w-16 rounded bg-slate-100" /></td>
                  <td className="px-5 py-4"><div className="h-3 w-12 rounded bg-slate-100" /></td>
                  <td className="px-5 py-4"><div className="h-3 w-12 rounded bg-slate-100" /></td>
                  <td className="px-5 py-4"><div className="h-3 w-20 rounded bg-slate-100" /></td>
                  <td className="px-5 py-4"><div className="ml-auto h-8 w-20 rounded bg-slate-100" /></td>
                </tr>
              ))
            : products.map((product) => (
                <tr key={product._id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {product.title}
                        </p>
                        <p className="mt-1 line-clamp-1 max-w-md text-sm text-slate-500">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.stock > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{product.salesCount}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-primary"
                        aria-label={`Edit ${product.title}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${product.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
