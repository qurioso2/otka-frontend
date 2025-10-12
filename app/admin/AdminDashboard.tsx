'use client';

import { useState, useEffect } from 'react';
import ProductsAdmin from './ProductsAdmin';
import UsersAdmin from './UsersAdmin';
import ClientsAdmin from './ClientsAdmin';
import CommissionSummary from './CommissionSummary';
import OrdersAdmin from './OrdersAdmin';
import ResourcesAdmin from './ResourcesAdmin';
import PublicAssetsAdmin from './PublicAssetsAdmin';
import ArticlesAdmin from './ArticlesAdmin';
import ImportCatalog from './ImportCatalog';
import ImportPDF from './ImportPDF';
import CategoriesManager from './CategoriesManager';
import BrandsManager from './BrandsManager';
import WorkflowExplainer from './WorkflowExplainer';
import TaxRatesManager from './TaxRatesManager';
import CompanySettingsManager from './CompanySettingsManager';
import ProformaManager from './ProformaManager';

const tabs = [
  { id: 'overview', name: 'Prezentare Generală', icon: '📊' },
  { id: 'products', name: 'Produse', icon: '📦' },
  { id: 'categories', name: 'Categorii', icon: '🏷️' },
  { id: 'brands', name: 'Branduri', icon: '⭐' },
  { id: 'tax-rates', name: 'Cote TVA', icon: '📊' },
  { id: 'proforme', name: 'Proforme', icon: '🧾' },
  { id: 'company-settings', name: 'Setări Firmă', icon: '⚙️' },
  { id: 'import', name: 'Import CSV/Excel', icon: '📥' },
  { id: 'import-pdf', name: 'Import PDF (AI)', icon: '✨' },
  { id: 'users', name: 'Utilizatori & Parteneri', icon: '👥' },
  { id: 'resources', name: 'Resurse Parteneri', icon: '📚' },
  { id: 'public-assets', name: 'Imagini Publice', icon: '🖼️' },
  { id: 'articles', name: 'Articole', icon: '📝' },
  { id: 'clients', name: 'Clienți & Comenzi', icon: '🛒' },
  { id: 'orders', name: 'Comenzi Parteneri', icon: '📋' },
  { id: 'commissions', name: 'Comisioane', icon: '💰' },
  { id: 'workflow', name: 'Ghid Utilizare', icon: '❓' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab setActiveTab={setActiveTab} />;
      case 'products':
        return <ProductsAdmin />;
      case 'categories':
        return <CategoriesManager />;
      case 'brands':
        return <BrandsManager />;
      case 'tax-rates':
        return <TaxRatesManager />;
      case 'proforme':
        return <ProformaManager />;
      case 'company-settings':
        return <CompanySettingsManager />;
      case 'import':
        return <ImportCatalog />;
      case 'import-pdf':
        return <ImportPDF />;
      case 'users':
        return <UsersAdmin />;
      case 'resources':
        return <ResourcesAdmin />;
      case 'public-assets':
        return <PublicAssetsAdmin />;
      case 'articles':
        return <ArticlesAdmin />;
      case 'clients':
        return <ClientsAdmin />;
      case 'orders':
        return <OrdersAdmin />;
      case 'commissions':
        return <CommissionSummary />;
      case 'workflow':
        return <WorkflowExplainer />;
      default:
        return <OverviewTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50" data-testid="admin-dashboard">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950" data-testid="admin-title">Dashboard Admin OTKA</h1>
            <p className="mt-2 text-neutral-800 font-semibold">Administrare completă pentru platforma de mobilier & B2B parteneri</p>
          </div>
          <div className="flex gap-3">
            <a 
              href="/parteneri/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <span className="mr-2">👥</span>
              Dashboard Partener
            </a>
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <span className="mr-2">🏠</span>
              Site Public
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b-2 border-neutral-400 mb-8" data-testid="admin-tabs">
          <nav className="-mb-0.5 flex space-x-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`admin-tab-${tab.id}-button`}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-900 bg-blue-100'
                    : 'border-transparent text-neutral-800 hover:text-neutral-950 hover:border-neutral-500'
                } whitespace-nowrap py-3 px-4 border-b-2 font-extrabold text-sm flex items-center gap-2 rounded-t-xl transition-all duration-200`}
              >
                <span className="text-lg" aria-hidden>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-screen">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activePartners: 0,
    ordersToday: 0,
    loading: true
  });

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // Load stats in parallel
        const [productsRes, partnersRes, ordersRes] = await Promise.all([
          fetch('/api/admin/products/list', { cache: 'no-store' }),
          fetch('/api/admin/users/list', { cache: 'no-store' }),
          fetch('/api/admin/orders/list', { cache: 'no-store' })
        ]);

        const productsData = await productsRes.json();
        const partnersData = await partnersRes.json();
        const ordersData = await ordersRes.json();

        // Calculate stats
        const totalProducts = productsData.products?.length || 0;
        const activePartners = partnersData.users?.filter((u: any) => u.role === 'partner')?.length || 0;
        
        // Calculate orders today
        const today = new Date().toISOString().split('T')[0];
        const ordersToday = ordersData.orders?.filter((o: any) => 
          o.created_at?.startsWith(today)
        )?.length || 0;

        setStats({
          totalProducts,
          activePartners,
          ordersToday,
          loading: false
        });

        console.log('Dashboard stats loaded:', { totalProducts, activePartners, ordersToday });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardStats();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Quick Stats */}
      <div className="bg-white border-2 border-neutral-500 rounded-2xl shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📦</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-neutral-800 font-semibold">Total Produse</p>
            <p className="text-2xl font-extrabold text-neutral-950" data-testid="total-products">-</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-neutral-500 rounded-2xl shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">👥</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-neutral-800 font-semibold">Parteneri Activi</p>
            <p className="text-2xl font-extrabold text-neutral-950" data-testid="active-partners">-</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-neutral-500 rounded-2xl shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📋</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-neutral-800 font-semibold">Comenzi Astăzi</p>
            <p className="text-2xl font-extrabold text-neutral-950" data-testid="orders-today">-</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="lg:col-span-2 xl:col-span-3 bg-white border-2 border-neutral-500 rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-extrabold text-neutral-950 mb-6">Acțiuni Rapide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => setActiveTab('products')} data-testid="quick-action-products" className="p-6 border-2 border-dashed border-neutral-600 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
              <div className="text-neutral-950 font-extrabold">Gestionare Produse</div>
              <div className="text-sm text-neutral-800 font-semibold">Adaugă și modifică catalog</div>
            </div>
          </button>
          <button onClick={() => setActiveTab('users')} data-testid="quick-action-users" className="p-6 border-2 border-dashed border-neutral-600 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
              <div className="text-neutral-950 font-extrabold">Gestionare Parteneri</div>
              <div className="text-sm text-neutral-800 font-semibold">Invită și activează</div>
            </div>
          </button>
          <button onClick={() => setActiveTab('resources')} data-testid="quick-action-resources" className="p-6 border-2 border-dashed border-neutral-600 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
              <div className="text-neutral-950 font-extrabold">Resurse Parteneri</div>
              <div className="text-sm text-neutral-800 font-semibold">Cataloage și materiale</div>
            </div>
          </button>
          <button onClick={() => setActiveTab('public-assets')} data-testid="quick-action-public-assets" className="p-6 border-2 border-dashed border-neutral-600 rounded-xl hover:border-pink-600 hover:bg-pink-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
              <div className="text-neutral-950 font-extrabold">Imagini Publice</div>
              <div className="text-sm text-neutral-800 font-semibold">Hero, OG, bannere</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}