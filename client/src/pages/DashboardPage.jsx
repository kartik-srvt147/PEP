import useAuthStore from '../store/useAuthStore';
import { LayoutDashboard, ShoppingCart, TrendingUp, Settings } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👋
            </h1>
            <p className="text-slate-500 mt-1">Here's what's happening with your store today.</p>
          </div>
          <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Generate AI Insights
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900">$24,562.00</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-secondary rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Products</p>
                <h3 className="text-2xl font-bold text-slate-900">142</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">AI Tokens Used</p>
                <h3 className="text-2xl font-bold text-slate-900">8,401</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
          <LayoutDashboard className="w-16 h-16 text-slate-200 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Dashboard functionality coming in next phases</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Your authentication system is working perfectly. Soon, this area will feature AI product generation, charts, and more.
          </p>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
