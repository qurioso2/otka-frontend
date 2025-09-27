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
    <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-4">
      <h2 className="font-medium text-neutral-900">Parteneri</h2>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm">Email partener</label>
          <input value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} className="rounded-xl border border-neutral-300 px-3 py-2" placeholder="email@firma.ro" />
        </div>
        <div>
          <label className="block text-sm">Companie</label>
          <input value={inviteCompany} onChange={(e)=>setInviteCompany(e.target.value)} className="rounded-xl border border-neutral-300 px-3 py-2" placeholder="Nume companie" />
        </div>
        <button onClick={invite} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">Trimite invitație</button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-neutral-50">
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email} className="border-t border-neutral-200">
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <select value={u.role} onChange={(e)=>update({ email: u.email, role: e.target.value as any })} className="rounded border border-neutral-300 px-2 py-1">
                    <option value="visitor">visitor</option>
                    <option value="partner">partner</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select value={u.partner_status || 'pending'} onChange={(e)=>update({ email: u.email, partner_status: e.target.value as any })} className="rounded border border-neutral-300 px-2 py-1">
                    <option value="pending">pending</option>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button onClick={()=>update({ email: u.email, partner_status: 'active' })} className="text-sm text-emerald-700">Activează</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
