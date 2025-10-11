// LocalStorage helper pentru produse recent vizualizate

export interface RecentProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  viewedAt: number;
}

const STORAGE_KEY = 'otka_recent_viewed';
const MAX_ITEMS = 10;

export function addRecentlyViewed(product: Omit<RecentProduct, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getRecentlyViewed();
    
    // Remove product if already exists
    const filtered = existing.filter(p => p.id !== product.id);
    
    // Add to beginning
    const updated = [
      { ...product, viewedAt: Date.now() },
      ...filtered
    ].slice(0, MAX_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent viewed:', error);
  }
}

export function getRecentlyViewed(): RecentProduct[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const items = JSON.parse(stored) as RecentProduct[];
    
    // Filter out items older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return items.filter(item => item.viewedAt > thirtyDaysAgo);
  } catch (error) {
    console.error('Error loading recent viewed:', error);
    return [];
  }
}

export function clearRecentlyViewed() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recent viewed:', error);
  }
}
