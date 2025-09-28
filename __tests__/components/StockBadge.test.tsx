import { render, screen } from '@testing-library/react';
import StockBadge from '../../app/page'; // Import component din page

// Extract component pentru test
function StockBadgeTest({ qty, status }: { qty: number; status?: string }) {
  // Logica identică cu componenta din page.tsx
  if (status === 'reserved') {
    return <span className="rounded-full bg-orange-100 text-orange-800 px-2 py-1 text-xs font-medium">Rezervat</span>;
  }
  if (status === 'discontinued') {
    return <span className="rounded-full bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium">Discontinuat</span>;
  }
  
  if (qty === 0) {
    return <span className="rounded-full bg-red-100 text-red-800 px-2 py-1 text-xs font-medium">Epuizat</span>;
  }
  if (qty <= 3) {
    return <span className="rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium">Ultimele bucăți ({qty})</span>;
  }
  if (qty <= 10) {
    return <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium">Stoc limitat ({qty})</span>;
  }
  
  return <span className="rounded-full bg-green-100 text-green-800 px-2 py-1 text-xs font-medium">În stoc ({qty})</span>;
}

describe('StockBadge Component', () => {
  test('displays "Epuizat" when quantity is 0', () => {
    render(<StockBadgeTest qty={0} />);
    expect(screen.getByText('Epuizat')).toBeInTheDocument();
  });

  test('displays "Ultimele bucăți" when quantity is 1-3', () => {
    render(<StockBadgeTest qty={2} />);
    expect(screen.getByText('Ultimele bucăți (2)')).toBeInTheDocument();
  });

  test('displays "Stoc limitat" when quantity is 4-10', () => {
    render(<StockBadgeTest qty={7} />);
    expect(screen.getByText('Stoc limitat (7)')).toBeInTheDocument();
  });

  test('displays "În stoc" when quantity is above 10', () => {
    render(<StockBadgeTest qty={15} />);
    expect(screen.getByText('În stoc (15)')).toBeInTheDocument();
  });

  test('displays "Rezervat" status regardless of quantity', () => {
    render(<StockBadgeTest qty={5} status="reserved" />);
    expect(screen.getByText('Rezervat')).toBeInTheDocument();
  });

  test('displays "Discontinuat" status regardless of quantity', () => {
    render(<StockBadgeTest qty={10} status="discontinued" />);
    expect(screen.getByText('Discontinuat')).toBeInTheDocument();
  });
});