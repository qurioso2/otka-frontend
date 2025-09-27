import { supabase } from '../lib/supabaseClient';

export default async function Home() {
  const { data, error } = await supabase.from('products').select('*');
  return (
    <div>
      <h1>Welcome to otka.ro</h1>
      <p>Products: {error ? error.message : JSON.stringify(data)}</p>
      <a href="/login">Login as Partner</a>
    </div>
  );
}