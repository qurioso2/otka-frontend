'use client';

import { useState } from 'react';
import ProductsAdmin from './ProductsAdmin';
import UsersAdmin from './UsersAdmin';
import ClientsAdmin from './ClientsAdmin';
import CommissionSummary from './CommissionSummary';
import OrdersAdmin from './OrdersAdmin';
import ResourcesAdmin from './ResourcesAdmin';
import WorkflowExplainer from './WorkflowExplainer';

const tabs = [
  { id: 'overview', name: 'Prezentare Generală', icon: '📊' },
  { id: 'products', name: 'Produse', icon: '📦' },
  { id: 'users', name: 'Utilizatori & Parteneri', icon: '👥' },
  { id: 'resources', name: 'Resurse Parteneri', icon: '📚' },
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
      case 'users':
        return <UsersAdmin />;
      case 'resources':
        return <ResourcesAdmin />;
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
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin OTKA</h1>
          <p className="mt-2 text-gray-600 font-medium">Administrare completă pentru platforma de mobilier & B2B parteneri</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b-2 border-gray-300 mb-8">
          <nav className="-mb-0.5 flex space-x-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'
                } whitespace-nowrap py-3 px-4 border-b-2 font-bold text-sm flex items-center gap-2 rounded-t-xl transition-all duration-200`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Quick Stats */}
      <div className="otka-card">
        <div className="otka-card-body">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-otka-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="otka-text-sm">Total Produse</p>
              <p className="text-2xl font-bold text-otka-gray-900" data-testid="total-products">-</p>
            </div>
          </div>
        </div>
      </div>

      <div className="otka-card">
        <div className="otka-card-body">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-otka-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="otka-text-sm">Parteneri Activi</p>
              <p className="text-2xl font-bold text-otka-gray-900" data-testid="active-partners">-</p>
            </div>
          </div>
        </div>
      </div>

      <div className="otka-card">
        <div className="otka-card-body">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="otka-text-sm">Comenzi Astăzi</p>
              <p className="text-2xl font-bold text-otka-gray-900" data-testid="orders-today">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="lg:col-span-2 xl:col-span-3 otka-card">
        <div className="otka-card-body">
          <h3 className="otka-heading-3 mb-6">Acțiuni Rapide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveTab('products')}
              className="p-6 border-2 border-dashed border-otka-gray-400 rounded-xl hover:border-otka-blue-500 hover:bg-otka-blue-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                <div className="otka-text-bold">Gestionare Produse</div>
                <div className="otka-text-sm">Adaugă și modifică catalog</div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('users')}
              className="p-6 border-2 border-dashed border-otka-gray-400 rounded-xl hover:border-otka-green-500 hover:bg-otka-green-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <div className="otka-text-bold">Gestionare Parteneri</div>
                <div className="otka-text-sm">Invită și activează</div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('resources')}
              className="p-6 border-2 border-dashed border-otka-gray-400 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
                <div className="otka-text-bold">Resurse Parteneri</div>
                <div className="otka-text-sm">Cataloage și materiale</div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('workflow')}
              className="p-6 border-2 border-dashed border-otka-gray-400 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">❓</div>
                <div className="otka-text-bold">Ghid Utilizare</div>
                <div className="otka-text-sm">Vezi workflow complet</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}