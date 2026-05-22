import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { BarChart3, PackageCheck, TrendingUp, Wallet, Warehouse } from 'lucide-react';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US');

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));
const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 850,
    easing: 'easeOutQuart',
  },
  plugins: {
    legend: {
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        color: '#475569',
        font: {
          size: 12,
          weight: 600,
        },
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 12,
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 7,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#e2e8f0',
      },
      ticks: {
        color: '#64748b',
      },
    },
  },
};

const SkeletonCard = ({ tall = false }) => (
  <div className={`animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${tall ? 'min-h-80' : ''}`}>
    <div className="h-4 w-32 rounded bg-slate-100" />
    <div className="mt-4 h-8 w-24 rounded bg-slate-100" />
    <div className="mt-4 h-3 w-full rounded bg-slate-100" />
    <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
  </div>
);

const AnimatedStatCard = ({ icon: Icon, label, value, helper, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-50 text-primary ring-blue-100',
    emerald: 'bg-emerald-50 text-secondary ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  };

  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 transition-all duration-500">
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500">{helper}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <div className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-5">
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
    {children}
  </div>
);

const TopProductsList = ({ products }) => (
  <div className="space-y-3">
    {products.slice(0, 5).map((product, index) => (
      <div key={product._id || product.title} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-700 ring-1 ring-slate-200">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{product.title}</p>
          <p className="text-xs text-slate-500">{product.category}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-950">{formatCurrency(product.revenue)}</p>
          <p className="text-xs text-slate-500">{formatNumber(product.salesCount)} sold</p>
        </div>
      </div>
    ))}
    {!products.length && (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        No product sales yet.
      </div>
    )}
  </div>
);

const AnalyticsDashboard = ({ analytics, loading }) => {
  if (loading) {
    return (
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <SkeletonCard tall />
          <SkeletonCard tall />
          <SkeletonCard tall />
        </div>
      </section>
    );
  }

  const revenue = analytics?.revenue || {};
  const trends = analytics?.salesTrends || [];
  const inventory = analytics?.inventory || { summary: {}, byCategory: [] };
  const topProducts = analytics?.topProducts || [];
  const performance = analytics?.productPerformance || [];

  const trendLabels = trends.map((item) =>
    new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const revenueTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Revenue',
        data: trends.map((item) => item.revenue),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.38,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Sales',
        data: trends.map((item) => item.sales),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.38,
        pointRadius: 2,
        pointHoverRadius: 5,
        yAxisID: 'y1',
      },
    ],
  };

  const revenueTrendOptions = {
    ...baseChartOptions,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        ticks: {
          ...baseChartOptions.scales.y.ticks,
          callback: (value) => formatCurrency(value),
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#64748b',
        },
      },
    },
  };

  const topProductsData = {
    labels: topProducts.slice(0, 6).map((product) => product.title),
    datasets: [
      {
        label: 'Revenue',
        data: topProducts.slice(0, 6).map((product) => product.revenue),
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'],
        borderRadius: 6,
      },
    ],
  };

  const inventoryData = {
    labels: inventory.byCategory.map((item) => item.category),
    datasets: [
      {
        label: 'Inventory value',
        data: inventory.byCategory.map((item) => item.value),
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'],
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  };

  const performanceData = {
    labels: performance.slice(0, 8).map((item) => item.title),
    datasets: [
      {
        label: 'Performance score',
        data: performance.slice(0, 8).map((item) => item.performanceScore),
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        borderRadius: 6,
      },
    ],
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Store performance</h2>
          <p className="text-sm text-slate-500">Revenue, inventory, and product performance at a glance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnimatedStatCard
          icon={Wallet}
          label="Total revenue"
          value={formatCurrency(revenue.totalRevenue)}
          helper={`${formatNumber(revenue.totalSales)} sales recorded`}
          tone="blue"
        />
        <AnimatedStatCard
          icon={TrendingUp}
          label="Average order value"
          value={formatCurrency(revenue.averageOrderValue)}
          helper="Revenue per sale"
          tone="emerald"
        />
        <AnimatedStatCard
          icon={Warehouse}
          label="Inventory value"
          value={formatCurrency(inventory.summary?.inventoryValue)}
          helper={`${formatNumber(inventory.summary?.totalStock)} units in stock`}
          tone="amber"
        />
        <AnimatedStatCard
          icon={PackageCheck}
          label="Stock health"
          value={`${formatNumber(inventory.summary?.lowStock)} low`}
          helper={`${formatNumber(inventory.summary?.outOfStock)} out of stock`}
          tone="violet"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Revenue analytics"
          subtitle="Daily revenue and sales movement"
          className="xl:col-span-2"
        >
          <div className="h-80">
            <Line data={revenueTrendData} options={revenueTrendOptions} />
          </div>
        </ChartCard>

        <ChartCard title="Top products" subtitle="Best sellers by revenue">
          <TopProductsList products={topProducts} />
        </ChartCard>

        <ChartCard title="Sales trends" subtitle="Top product revenue comparison" className="xl:col-span-2">
          <div className="h-80">
            <Bar data={topProductsData} options={baseChartOptions} />
          </div>
        </ChartCard>

        <ChartCard title="Inventory overview" subtitle="Inventory value by category">
          <div className="h-80">
            <Doughnut
              data={inventoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: baseChartOptions.animation,
                plugins: baseChartOptions.plugins,
                cutout: '62%',
              }}
            />
          </div>
        </ChartCard>

        <ChartCard title="Product performance" subtitle="Score combines sell-through, sales, and revenue" className="xl:col-span-3">
          <div className="h-72">
            <Bar
              data={performanceData}
              options={{
                ...baseChartOptions,
                indexAxis: 'y',
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: {
                      color: '#e2e8f0',
                    },
                    ticks: {
                      color: '#64748b',
                    },
                  },
                  y: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: '#64748b',
                    },
                  },
                },
              }}
            />
          </div>
        </ChartCard>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
