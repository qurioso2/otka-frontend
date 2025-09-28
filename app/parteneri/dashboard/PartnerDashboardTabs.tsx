'use client';

import { useState } from 'react';
import PartnerProducts from './PartnerProducts';
import PartnerResources from './PartnerResources';
import NewOrder from './NewOrder';
import OrdersList from './OrdersList';
import PartnerCommissions from './PartnerCommissions';
import ContractCard from './ContractCard';
import DraftsList from './DraftsList';

export default function PartnerDashboardTabs({
  isActivePartner,
  isAdmin,
  agreement,
  initialProducts,
  profile
}: any) {
  const [tab, setTab] = useState('resources');

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-semibold rounded-full border ${tab===id? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-800 hover:bg-neutral-50'}`}>{label}</button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <TabButton id="resources" label="Liste de preț & cataloage" />
        <TabButton id="stock" label="Produse în stoc" />
        <TabButton id="new-order" label="Comandă nouă" />
        <TabButton id="drafts" label="Drafturi" />
        <TabButton id="orders" label="Comenzile mele" />
        <TabButton id="commissions" label="Situație comisioane" />
        <TabButton id="contract" label="Contract comision" />
        <TabButton id="profile" label="Date partener" />
      </div>

      {tab === 'resources' && <PartnerResources />}
      {tab === 'stock' && <PartnerProducts initialProducts={initialProducts} />}
      {tab === 'new-order' && isActivePartner && agreement && <NewOrder />}
      {tab === 'drafts' && <DraftsList />}
      {tab === 'orders' && <OrdersList />}
      {tab === 'commissions' && <PartnerCommissions />}
      {tab === 'contract' && <ContractCard />}
      {tab === 'profile' && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4">Date Partener</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><div className="text-neutral-500">Email</div><div className="font-medium">{profile?.email}</div></div>
            <div><div className="text-neutral-500">Rol</div><div className="font-medium">{profile?.role}</div></div>
            <div><div className="text-neutral-500">Companie</div><div className="font-medium">{profile?.company_name || '-'}</div></div>
            <div><div className="text-neutral-500">CUI</div><div className="font-medium">{profile?.vat_id || '-'}</div></div>
            <div><div className="text-neutral-500">Persoana de contact</div><div className="font-medium">{profile?.contact_name || '-'}</div></div>
            <div><div className="text-neutral-500">Telefon</div><div className="font-medium">{profile?.phone || '-'}</div></div>
            <div className="sm:col-span-2 text-neutral-500">Pentru actualizări (cont bancar, date fiscale complete), te rugăm contactează administratorul.</div>
          </div>
        </div>
      )}
    </div>
  );
}