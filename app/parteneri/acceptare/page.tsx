'use client';
import { useState } from 'react';

export default function AcceptareTermeni() {
  const [form, setForm] = useState({ accept_terms: false, accept_gdpr: false, confirm_data: false });
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!form.accept_terms || !form.accept_gdpr || !form.confirm_data) return alert('Bifați toate căsuțele');
    setLoading(true);
    try {
      const res = await fetch('/api/partners/agreements/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, version: 'v1' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare');
      setPdfUrl(data.pdfUrl);
    } catch (e:any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const sendEmail = async () => {
    if (!pdfUrl || !emailTo) return;
    setSending(true);
    try {
      const subject = 'Contract Partener OTKA (semnat)';
      const html = `<p>Vă mulțumim! Contractul semnat este atașat.</p><p>Link: <a href="${pdfUrl}">${pdfUrl}</a></p>`;
      const res = await fetch('/api/mail/proforma', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: emailTo, subject, html, pdfUrl }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare trimitere email');
      alert('Trimis!');
    } catch (e:any) { alert(e.message); }
    finally { setSending(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Acceptare Termeni Parteneriat</h1>
      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.accept_terms} onChange={e=>setForm({...form, accept_terms:e.target.checked})} /> Am citit și accept integral Termenii și Condițiile</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.accept_gdpr} onChange={e=>setForm({...form, accept_gdpr:e.target.checked})} /> Accept procesarea datelor personale conform Politicii de Confidențialitate</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.confirm_data} onChange={e=>setForm({...form, confirm_data:e.target.checked})} /> Confirm că datele furnizate sunt reale și am dreptul legal</label>
        <button onClick={submit} disabled={loading} className="rounded-full bg-black text-white px-5 py-2.5 text-sm hover:bg-neutral-800">{loading?'Se generează...':'Generează și salvează contractul'}</button>
        {pdfUrl && (
          <div className="text-sm space-y-2">
            <div>Contract generat: <a href={pdfUrl} className="underline" target="_blank">Descarcă PDF</a></div>
            <div className="flex items-center gap-2">
              <input placeholder="Email destinatar" value={emailTo} onChange={e=>setEmailTo(e.target.value)} className="rounded-xl border border-neutral-300 px-3 py-2" />
              <button onClick={sendEmail} disabled={sending || !emailTo} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">{sending?'Se trimite...':'Trimite pe email'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
