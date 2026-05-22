import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Grid3X3,
  LayoutDashboard,
  List,
  Loader2,
  PackagePlus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import ProductCards from '../components/dashboard/ProductCards';
import ProductModal from '../components/dashboard/ProductModal';
import ProductTable from '../components/dashboard/ProductTable';
import Sidebar from '../components/dashboard/Sidebar';
import ToastStack from '../components/dashboard/ToastStack';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/productApi';
import useAuthStore from '../store/useAuthStore';

const defaultFilters = {
  search: '',
  category: '',
  tag: '',
  minPrice: '',
  maxPrice: '',
  inStock: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 100,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const StatCard = ({ icon: Icon, label, value, helper, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-50 text-primary',
    emerald: 'bg-emerald-50 text-secondary',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onAddProduct, hasFilters }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
      <ShoppingCart className="h-6 w-6" />
    </div>
    <h3 className="mt-4 text-lg font-bold text-slate-900">
      {hasFilters ? 'No products match these filters' : 'No products yet'}
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
      {hasFilters
        ? 'Try adjusting search, category, stock, or price filters to widen the results.'
        : 'Create your first product to start tracking stock, revenue, and storefront readiness.'}
    </p>
    {!hasFilters && (
      <button
        type="button"
        onClick={onAddProduct}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
      >
        <PackagePlus className="h-4 w-4" />
        Add product
      </button>
    )}
  </div>
);

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type: 'info', ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = (toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProducts(filters);
      setProducts(response.data || []);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not load products',
        message: error.response?.data?.message || 'Check that the backend server is running.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, filters]);

  useEffect(() => {
    const timer = window.setTimeout(fetchProducts, 250);

    return () => window.clearTimeout(timer);
  }, [fetchProducts]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products]
  );

  const stats = useMemo(() => {
    const totalRevenue = products.reduce((sum, product) => sum + Number(product.revenue || 0), 0);
    const totalStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
    const totalSales = products.reduce((sum, product) => sum + Number(product.salesCount || 0), 0);
    const lowStock = products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5).length;

    return {
      totalRevenue,
      totalStock,
      totalSales,
      lowStock,
    };
  }, [products]);

  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (['sortBy', 'sortOrder', 'page', 'limit'].includes(key)) {
      return false;
    }

    return value !== '';
  });

  const handleFilterChange = (nextFilters) => {
    setFilters({ ...nextFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSubmitProduct = async (payload) => {
    setSaving(true);
    try {
      if (editingProduct?._id) {
        await updateProduct(editingProduct._id, payload);
        addToast({ type: 'success', title: 'Product updated', message: `${payload.title} is up to date.` });
      } else {
        await createProduct(payload);
        addToast({ type: 'success', title: 'Product created', message: `${payload.title} has been added.` });
      }

      setModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save failed',
        message: error.response?.data?.message || 'Please review the product details and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete "${product.title}"? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(product._id);
      addToast({ type: 'success', title: 'Product deleted', message: `${product.title} was removed.` });
      await fetchProducts();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: error.response?.data?.message || 'Please try again.',
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      {modalOpen && (
        <ProductModal
          open={modalOpen}
          product={editingProduct}
          saving={saving}
          onToast={addToast}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSubmitProduct}
        />
      )}

      <div className="flex flex-col lg:flex-row">
        <Sidebar
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <LayoutDashboard className="h-4 w-4" />
                  Product management
                </div>
                <h1 className="mt-2 text-2xl font-bold text-slate-950">
                  Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Create, refine, and monitor every product in your store catalog.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                >
                  <PackagePlus className="h-4 w-4" />
                  Add product
                </button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={ShoppingCart}
                label="Products"
                value={products.length}
                helper={hasFilters ? 'Matching current filters' : 'Total catalog items'}
              />
              <StatCard
                icon={TrendingUp}
                label="Revenue"
                value={formatCurrency(stats.totalRevenue)}
                helper={`${stats.totalSales} total sales`}
                tone="emerald"
              />
              <StatCard
                icon={Warehouse}
                label="Inventory"
                value={stats.totalStock}
                helper={`${stats.lowStock} low-stock products`}
                tone="amber"
              />
              <StatCard
                icon={BarChart3}
                label="Avg. price"
                value={formatCurrency(products.length ? products.reduce((sum, product) => sum + Number(product.price || 0), 0) / products.length : 0)}
                helper="Across visible products"
                tone="slate"
              />
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Catalog</h2>
                  <p className="text-sm text-slate-500">
                    {loading ? 'Loading products...' : `${products.length} products shown`}
                  </p>
                </div>
                <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition ${
                      viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    aria-label="Table view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition ${
                      viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    aria-label="Card view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!loading && products.length === 0 ? (
                <EmptyState onAddProduct={handleOpenCreate} hasFilters={hasFilters} />
              ) : (
                <>
                  {viewMode === 'table' && (
                    <>
                      <ProductTable
                        products={products}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                      <div className="lg:hidden">
                        <ProductCards
                          products={products}
                          loading={loading}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </div>
                    </>
                  )}

                  {viewMode === 'cards' && (
                    <ProductCards
                      products={products}
                      loading={loading}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
