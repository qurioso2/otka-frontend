'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type UserRow = { email: string; role: 'visitor'|'partner'|'admin'; partner_status: 'pending'|'active'|'suspended'|null; company_name?: string|null; vat_id?: string|null; contact_name?: string|null; phone?: string|null };

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCompany, setInviteCompany] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/list');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Load failed');
      setUsers(data.users || []);
    } catch (e:any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const update = async (row: Partial<UserRow> & { email: string }) => {
    try {
      const res = await fetch('/api/admin/users/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      toast.success('Salvat');
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  const invite = async () => {
    try {
      const res = await fetch('/api/partners/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail, company_name: inviteCompany }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invite failed');
      toast.success('Invitație trimisă prin Supabase (magic link)');
      setInviteEmail(''); setInviteCompany('');
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  return (
    <div className="mt-10 rounded-2xl border-2 border-gray-400 bg-white shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900">Gestionare Parteneri</h2>
      <p className="text-sm font-medium text-gray-700 mt-1">Invită parteneri noi și gestionează statusurile existente</p>
      
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Email partener</label>
          <input 
            value={inviteEmail} 
            onChange={(e)=>setInviteEmail(e.target.value)} 
            className="rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
            placeholder="email@firma.ro" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Companie</label>
          <input 
            value={inviteCompany} 
            onChange={(e)=>setInviteCompany(e.target.value)} 
            className="rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
            placeholder="Nume companie" 
          />
        </div>
        <button 
          onClick={invite} 
          className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-bold hover:bg-blue-700 shadow-md"
          disabled={loading}
        >
          {loading ? 'Se trimite...' : 'Trimite invitație'}
        </button>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-sm border-2 border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Companie</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {users.map((u, index) => (
              <tr key={u.email} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-300`}>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{u.email}</td>
                <td className="px-4 py-3">
                  <select 
                    value={u.role} 
                    onChange={(e)=>update({ email: u.email, role: e.target.value as any })} 
                    className="rounded-lg border-2 border-gray-400 px-3 py-1 text-sm font-bold text-gray-900 focus:border-blue-500"
                  >
                    <option value="visitor">visitor</option>
                    <option value="partner">partner</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select 
                    value={u.partner_status || 'pending'} 
                    onChange={(e)=>update({ email: u.email, partner_status: e.target.value as any })} 
                    className="rounded-lg border-2 border-gray-400 px-3 py-1 text-sm font-bold text-gray-900 focus:border-blue-500"
                  >
                    <option value="pending">pending</option>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{u.company_name || '-'}</td>
                <td className="px-4 py-3">
                  <button 
                    onClick={()=>update({ email: u.email, partner_status: 'active' })} 
                    className="text-sm font-bold text-green-700 hover:text-green-900 bg-green-100 px-3 py-1 rounded-full"
                  >
                    Activează
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-700 font-bold">Nu există utilizatori înregistrați</p>
          </div>
        )}
      </div>
    </div>
  );
}