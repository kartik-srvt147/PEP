import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, TrendingUp, Zap } from 'lucide-react';

const LandingPage = () => {
  const [apiStatus, setApiStatus] = useState('Checking API connection...');

  useEffect(() => {
    const checkApi = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/test');
        setApiStatus(data.message);
      } catch (error) {
        setApiStatus('API connection failed. Ensure server is running.');
      }
    };
    checkApi();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <ShoppingBag className="w-6 h-6" />
            <span>SmartStore AI</span>
          </div>
          <nav>
            <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
              Get Started
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            AI-Powered E-Commerce <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10">
            Manage products, generate SEO tags, track revenue, and get insights with the power of artificial intelligence.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              Start Free Trial
            </button>
            <button className="bg-white text-slate-700 px-8 py-3 rounded-lg font-semibold shadow-md border border-slate-200 hover:bg-slate-50 transition-colors">
              View Demo
            </button>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">AI Descriptions</h3>
            <p className="text-slate-500">Automatically generate catchy product descriptions and SEO tags in seconds.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 text-secondary rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Advanced Analytics</h3>
            <p className="text-slate-500">Track revenue, top products, and receive trending product insights.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Smart Inventory</h3>
            <p className="text-slate-500">Get pricing recommendations and low inventory alerts powered by AI.</p>
          </div>
        </div>

        <div className="mt-20 text-center text-sm font-mono bg-slate-100 py-3 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-700">Backend Status:</span>{' '}
          <span className={apiStatus.includes('failed') ? 'text-red-500' : 'text-green-600'}>
            {apiStatus}
          </span>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
