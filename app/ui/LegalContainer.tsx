import React from 'react';

export default function LegalContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        <div className="mt-6 space-y-5 text-neutral-800 leading-relaxed text-[16px]">
          {children}
        </div>
      </div>
    </div>
  );
}
