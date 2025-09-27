'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('cookies-accepted')) {
        setVisible(true);
      }
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem('cookies-accepted', 'true'); } catch {}
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 bg-black text-white p-4 z-50">
      <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
        <p className="text-sm">Folosim cookies pentru a îmbunătăți experiența ta. <Link href="/cookies" className="underline">Detalii aici</Link></p>
        <button onClick={accept} className="bg-white text-black px-4 py-2 rounded-full text-sm">Accept</button>
      </div>
    </div>
  );
}
