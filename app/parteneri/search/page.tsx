import AISearch from '@/components/AISearch';

export const metadata = {
  title: 'Căutare Produse AI | OTKA Parteneri',
  description: 'Căutare inteligentă de produse folosind text sau imagine',
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <AISearch />
      </div>
    </div>
  );
}
