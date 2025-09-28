'use client';

import { useState } from 'react';
import ProductsAdmin from './ProductsAdmin';
import UsersAdmin from './UsersAdmin';
import ClientsAdmin from './ClientsAdmin';
import CommissionSummary from './CommissionSummary';
import OrdersAdmin from './OrdersAdmin';
import WorkflowExplainer from './WorkflowExplainer';

const tabs = [
  { id: 'overview', name: 'Prezentare Generală', icon: '📊' },
  { id: 'products', name: 'Produse', icon: '📦' },
  { id: 'users', name: 'Utilizatori & Parteneri', icon: '👥' },
  { id: 'clients', name: 'Clienți & Comenzi', icon: '🛒' },
  { id: 'orders', name: 'Comenzi Parteneri', icon: '📋' },
  { id: 'commissions', name: 'Comisioane', icon: '💰' },
  { id: 'workflow', name: 'Workflow Info', icon: '❓' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'products':
        return <ProductsAdmin />;
      case 'users':
        return <UsersAdmin />;
      case 'clients':
        return <ClientsAdmin />;
      case 'orders':
        return <OrdersAdmin />;
      case 'commissions':
        return <CommissionSummary />;
      case 'workflow':
        return <WorkflowExplainer />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin OTKA</h1>
        <p className="mt-2 text-gray-600">Administrare completă pentru platforma de mobilier & B2B parteneri</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-400'
              } whitespace-nowrap py-3 px-4 border-b-2 font-bold text-sm flex items-center gap-2 rounded-t-lg`}
            >
              <span>{tab.icon}</span>
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
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📦</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Produse</p>
            <p className="text-2xl font-bold text-gray-900" data-testid="total-products">-</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">👥</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Parteneri Activi</p>
            <p className="text-2xl font-bold text-gray-900" data-testid="active-partners">-</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📋</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Comenzi Astăzi</p>
            <p className="text-2xl font-bold text-gray-900" data-testid="orders-today">-</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="lg:col-span-2 xl:col-span-3 bg-white rounded-xl border border-gray-300 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Acțiuni Rapide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('products')}
            className="p-4 border-2 border-gray-400 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-semibold text-gray-800">Adaugă Produs</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className="p-4 border-2 border-gray-400 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-semibold text-gray-800">Invită Partener</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('clients')}
            className="p-4 border-2 border-gray-400 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🛒</div>
              <div className="text-sm font-semibold text-gray-800">Adaugă Comandă</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('workflow')}
            className="p-4 border-2 border-gray-400 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">❓</div>
              <div className="text-sm font-semibold text-gray-800">Vezi Workflow</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}