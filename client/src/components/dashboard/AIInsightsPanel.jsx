import {
  ArrowRight,
  BadgeAlert,
  CircleDollarSign,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  generateImprovementSuggestions,
  generateInventoryAlerts,
  generatePricingInsights,
  generateTrendingInsights,
} from '../../services/aiInsightsApi';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const badgeTone = {
  low: 'bg-slate-100 text-slate-700 ring-slate-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-red-50 text-red-700 ring-red-200',
  critical: 'bg-red-50 text-red-700 ring-red-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  strong: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  steady: 'bg-blue-50 text-blue-700 ring-blue-200',
  emerging: 'bg-violet-50 text-violet-700 ring-violet-200',
  uncertain: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const actionLabel = {
  increase: 'Increase',
  hold: 'Hold',
  discount_test: 'Discount test',
  bundle_test: 'Bundle test',
  review_manually: 'Review',
};

const Badge = ({ value }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
      badgeTone[value] || badgeTone.info
    }`}
  >
    {String(value || 'info').replaceAll('_', ' ')}
  </span>
);

const SectionTitle = ({ icon: Icon, title, summary }) => (
  <div className="flex gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{summary}</p>
    </div>
  </div>
);

const PanelSkeleton = () => (
  <section className="animate-pulse space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="h-5 w-44 rounded bg-slate-100" />
    <div className="h-3 w-96 max-w-full rounded bg-slate-100" />
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="h-44 rounded-lg bg-slate-100" />
      <div className="h-44 rounded-lg bg-slate-100" />
      <div className="h-44 rounded-lg bg-slate-100" />
    </div>
  </section>
);

const PricingCards = ({ data }) => (
  <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <SectionTitle
      icon={CircleDollarSign}
      title="Pricing insights"
      summary={data.summary || 'Recommendations based on pricing, stock pressure, revenue, and sales.'}
    />
    <div className="grid gap-3 lg:grid-cols-2">
      {(data.recommendations || []).slice(0, 4).map((item) => (
        <article key={item.productTitle} className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-950">{item.productTitle}</h4>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Current {currency.format(item.currentPrice || 0)}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge value={item.confidence} />
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {actionLabel[item.recommendedAction] || item.recommendedAction}
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.reason}</p>
          <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase text-slate-400">Test range</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {currency.format(item.suggestedPriceRange?.minimum || 0)} -{' '}
              {currency.format(item.suggestedPriceRange?.maximum || 0)}
            </p>
          </div>
          <p className="mt-3 inline-flex gap-2 text-sm font-semibold text-primary">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            {item.nextStep}
          </p>
        </article>
      ))}
    </div>
  </div>
);

const TrendWidgets = ({ data }) => (
  <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <SectionTitle
      icon={TrendingUp}
      title="Trend analysis"
      summary={data.summary || 'Momentum signals from current ecommerce metrics.'}
    />
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {(data.trendingProducts || []).slice(0, 6).map((item) => (
        <article key={item.productTitle} className="rounded-lg border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-950">{item.productTitle}</h4>
              <p className="mt-1 text-xs font-semibold text-slate-500">{item.category}</p>
            </div>
            <Badge value={item.momentum} />
          </div>
          <p className="mt-3 text-sm text-slate-600">{item.signal}</p>
          <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
            {item.opportunity}
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">{item.action}</p>
        </article>
      ))}
    </div>
  </div>
);

const InventoryCards = ({ data }) => (
  <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <SectionTitle
      icon={BadgeAlert}
      title="Inventory alerts"
      summary={data.summary || 'Risks that need an operator decision.'}
    />
    <div className="grid gap-3 md:grid-cols-2">
      {(data.alerts || []).slice(0, 6).map((item) => (
        <article
          key={`${item.productTitle}-${item.alertType}`}
          className="rounded-lg border border-slate-200 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-950">{item.productTitle}</h4>
              <p className="mt-1 text-xs font-semibold text-slate-500">{item.category}</p>
            </div>
            <div className="flex gap-2">
              <Badge value={item.severity} />
              <Badge value={item.alertType} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.message}</p>
          <p className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
            {item.action}
          </p>
        </article>
      ))}
    </div>
  </div>
);

const ImprovementList = ({ data }) => (
  <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <SectionTitle
      icon={Lightbulb}
      title="AI recommendations"
      summary={data.summary || 'Product improvements worth acting on next.'}
    />
    <div className="grid gap-3 lg:grid-cols-2">
      {(data.suggestions || []).slice(0, 6).map((item) => (
        <article key={`${item.productTitle}-${item.insight}`} className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-950">{item.productTitle}</h4>
              <p className="text-xs font-semibold text-slate-500">{item.category}</p>
            </div>
            <Badge value={item.priority} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">{item.insight}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.rationale}</p>
          <p className="mt-3 inline-flex gap-2 text-sm font-bold text-primary">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            {item.action}
          </p>
        </article>
      ))}
    </div>
  </div>
);

const AIInsightsPanel = ({ products, analyticsLoading, onToast }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const metricProducts = useMemo(
    () => products.filter((product) => product?.title && product?.category).slice(0, 12),
    [products]
  );

  const fetchInsights = useCallback(async () => {
    if (!metricProducts.length) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [pricing, trends, inventory, improvements] = await Promise.all([
        generatePricingInsights(metricProducts),
        generateTrendingInsights(metricProducts),
        generateInventoryAlerts(metricProducts),
        generateImprovementSuggestions(metricProducts),
      ]);

      setInsights({
        pricing: pricing.data,
        trends: trends.data,
        inventory: inventory.data,
        improvements: improvements.data,
        meta: pricing.meta,
      });
      onToast?.({
        type: 'success',
        title: 'AI insights refreshed',
        message: `Consultant signals generated for ${metricProducts.length} products.`,
      });
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Business insights could not be generated.';
      setError(message);
      onToast?.({ type: 'error', title: 'AI insights failed', message });
    } finally {
      setLoading(false);
    }
  }, [metricProducts, onToast]);

  useEffect(() => {
    if (analyticsLoading || !metricProducts.length) {
      return undefined;
    }

    const timer = window.setTimeout(fetchInsights, 250);

    return () => window.clearTimeout(timer);
  }, [analyticsLoading, fetchInsights, metricProducts.length]);

  if (analyticsLoading) {
    return <PanelSkeleton />;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Sparkles className="h-4 w-4" />
            Business insights
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-950">AI recommendations</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Actionable pricing, momentum, and inventory decisions derived from product performance metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchInsights}
          disabled={loading || !metricProducts.length}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh insights
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!metricProducts.length && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Add product performance data before generating business insights.
        </div>
      )}

      {loading && !insights && <PanelSkeleton />}

      {insights && (
        <>
          <ImprovementList data={insights.improvements} />
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <PricingCards data={insights.pricing} />
            <InventoryCards data={insights.inventory} />
          </div>
          <TrendWidgets data={insights.trends} />
        </>
      )}
    </section>
  );
};

export default AIInsightsPanel;
