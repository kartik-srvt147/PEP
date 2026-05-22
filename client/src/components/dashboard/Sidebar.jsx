import {
  Boxes,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
  PackageSearch,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

const Sidebar = ({ filters, onFilterChange, onReset, categories, collapsed, onToggle }) => {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <aside
      className={`w-full border-b border-slate-200 bg-white transition-all duration-300 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r ${
        collapsed ? 'lg:w-20' : 'lg:w-72'
      }`}
    >
      <div className="sticky top-16 space-y-6 p-4 sm:p-6 lg:px-4">
        <div className={collapsed ? 'lg:text-center' : ''}>
          <div className={`flex items-center gap-2 text-primary ${collapsed ? 'lg:justify-center' : ''}`}>
            <Boxes className="h-5 w-5" />
            <span className={`text-sm font-bold uppercase tracking-wide ${collapsed ? 'lg:hidden' : ''}`}>
              Inventory
            </span>
          </div>
          <p className={`mt-2 text-sm text-slate-500 ${collapsed ? 'lg:hidden' : ''}`}>
            Manage product listings, stock, pricing, and performance from one workspace.
          </p>
          <button
            type="button"
            onClick={onToggle}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:h-10 lg:w-10 lg:px-0"
            title={collapsed ? 'Expand filters' : 'Collapse filters'}
            aria-label={collapsed ? 'Expand filter sidebar' : 'Collapse filter sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            <span className="lg:hidden">{collapsed ? 'Expand filters' : 'Collapse filters'}</span>
          </button>
        </div>

        <div className={`space-y-4 ${collapsed ? 'lg:hidden' : ''}`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </span>
            <div className="relative">
              <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => handleChange('search', event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                placeholder="Name, tag, category"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category
            </span>
            <select
              value={filters.category}
              onChange={(event) => handleChange('category', event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tag
            </span>
            <input
              type="text"
              value={filters.tag}
              onChange={(event) => handleChange('tag', event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
              placeholder="seo, summer, sale"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Min price
              </span>
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(event) => handleChange('minPrice', event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                placeholder="0"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Max price
              </span>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(event) => handleChange('maxPrice', event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                placeholder="1000"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Availability
            </span>
            <select
              value={filters.inStock}
              onChange={(event) => handleChange('inStock', event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All stock levels</option>
              <option value="true">In stock</option>
              <option value="false">Out of stock</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sort
            </span>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <select
                value={filters.sortBy}
                onChange={(event) => handleChange('sortBy', event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
              >
                <option value="createdAt">Newest</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
                <option value="salesCount">Sales</option>
                <option value="revenue">Revenue</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                title={`Sort ${filters.sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                aria-label="Toggle sort order"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </label>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset filters
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
