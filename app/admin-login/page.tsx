'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@otka.ro');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Încearcă să se logheze
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(`Eroare login: ${signInError.message}`);
        return;
      }

      if (data.user) {
        setSuccess(`✅ Logat cu succes ca ${data.user.email}`);
        
        // Verifică profilul în tabela users
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', data.user.email)
          .maybeSingle();

        if (profileError) {
          setError(`Eroare la verificarea profilului: ${profileError.message}`);
          return;
        }

        if (!profile) {
          setError(`Profilul pentru ${data.user.email} nu există în tabela users. Rulează setup_admin_users_fixed.sql`);
          return;
        }

        if (profile.role !== 'admin') {
          setError(`Rolul tău este "${profile.role}" în loc de "admin". Actualizează în baza de date.`);
          return;
        }

        setSuccess(`✅ Logat ca admin! Redirecting...`);
        setTimeout(() => {
          router.push('/debug-auth'); // Verifică din nou debug
        }, 2000);
      }
    } catch (err) {
      setError(`Eroare neașteptată: ${String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@otka.ro',
        password: 'admin123!', // Parolă temporară
      });

      if (signUpError) {
        setError(`Eroare creare cont: ${signUpError.message}`);
        return;
      }

      setSuccess('✅ Cont creat! Verifică email-ul pentru confirmare sau încearcă să te loghezi.');
    } catch (err) {
      setError(`Eroare neașteptată: ${String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">Admin Login - OTKA</h1>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Parolă</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Introdu parola pentru admin@otka.ro"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white rounded py-2 hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login ca Admin'}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600 mb-2">
          Nu ai cont pentru admin@otka.ro? 
        </p>
        <button
          onClick={handleSignUp}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          Creează Cont Admin
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <h3 className="font-medium mb-2">💡 Instrucțiuni:</h3>
        <ol className="text-xs space-y-1">
          <li>1. Dacă nu ai cont, apasă "Creează Cont Admin"</li>
          <li>2. Verifică email-ul pentru link de confirmare</li>
          <li>3. Loghează-te cu parola setată</li>
          <li>4. Dacă merge, mergi la <a href="/debug-auth" className="underline">/debug-auth</a></li>
          <li>5. Apoi încearcă <a href="/admin" className="underline">/admin</a></li>
        </ol>
      </div>
    </div>
  );
}