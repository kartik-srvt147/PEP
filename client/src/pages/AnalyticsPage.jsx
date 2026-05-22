import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import ToastStack from '../components/dashboard/ToastStack';
import { getAnalyticsDashboard } from '../services/analyticsApi';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type: 'info', ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAnalyticsDashboard({ days: 30, limit: 6, performanceLimit: 12 });
      setAnalytics(response.data);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not load analytics',
        message: error.response?.data?.message || 'Analytics data is unavailable right now.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const timer = window.setTimeout(fetchAnalytics, 250);

    return () => window.clearTimeout(timer);
  }, [fetchAnalytics]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <ToastStack
        toasts={toasts}
        onDismiss={(toastId) => setToasts((current) => current.filter((toast) => toast.id !== toastId))}
      />

      <main className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <BarChart3 className="h-4 w-4" />
              Analytics dashboard
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Business intelligence</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track revenue, product momentum, inventory health, and performance trends.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAnalytics}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh analytics
          </button>
        </section>

        <AnalyticsDashboard analytics={analytics} loading={loading} />
        <AIInsightsPanel
          products={analytics?.productPerformance || []}
          analyticsLoading={loading}
          onToast={addToast}
        />
      </main>
    </div>
  );
};

export default AnalyticsPage;
