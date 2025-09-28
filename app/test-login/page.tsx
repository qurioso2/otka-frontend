'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@otka.ro');
  const [password, setPassword] = useState('Parola!3');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  const testLogin = async () => {
    setStatus('loading');
    setMessage('');
    setUserInfo(null);

    try {
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus('error');
        setMessage(`Login Error: ${error.message}`);
        return;
      }

      if (data.user) {
        setStatus('success');
        setMessage('Login successful!');
        setUserInfo({
          email: data.user.email,
          id: data.user.id,
          emailConfirmed: data.user.email_confirmed_at !== null
        });

        // Test profile fetch
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role, partner_status, company_name')
          .eq('email', data.user.email!)
          .maybeSingle();

        if (profileError) {
          setMessage(prev => prev + ` | Profile Error: ${profileError.message}`);
        } else if (profile) {
          setUserInfo(prev => ({ ...prev, profile }));
          setMessage(prev => prev + ` | Profile loaded: ${profile.role}`);
        } else {
          setMessage(prev => prev + ' | No profile found in users table');
        }
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`Network Error: ${error.message}`);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setStatus('idle');
    setMessage('Logged out');
    setUserInfo(null);
  };

  const checkCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      setMessage(`Auth Check Error: ${error.message}`);
    } else if (user) {
      setMessage(`Current user: ${user.email}`);
      setUserInfo({
        email: user.email,
        id: user.id,
        emailConfirmed: user.email_confirmed_at !== null
      });
    } else {
      setMessage('No current user');
      setUserInfo(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">🔐 Test Login Admin</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Login Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="admin@otka.ro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Parola!3"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={testLogin}
                disabled={status === 'loading'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {status === 'loading' ? 'Testing...' : 'Test Login'}
              </button>
              
              <button
                onClick={checkCurrentUser}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Check Current User
              </button>
              
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border-2 ${
            status === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : status === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <h3 className="font-semibold mb-2">
              {status === 'error' ? '❌ Error' : status === 'success' ? '✅ Success' : 'ℹ️ Info'}
            </h3>
            <p>{message}</p>
          </div>
        )}

        {userInfo && (
          <div className="p-6 bg-white border-2 border-green-200 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">👤 User Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{userInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User ID:</span>
                <span className="text-xs font-mono">{userInfo.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email Confirmed:</span>
                <span className={userInfo.emailConfirmed ? 'text-green-600' : 'text-red-600'}>
                  {userInfo.emailConfirmed ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              {userInfo.profile && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Profile from Database:</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Role:</strong> {userInfo.profile.role}</div>
                    <div><strong>Status:</strong> {userInfo.profile.partner_status}</div>
                    <div><strong>Company:</strong> {userInfo.profile.company_name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <a href="/debug-auth" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Debug Auth
          </a>
          <a href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Admin Dashboard
          </a>
          <a href="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Official Login
          </a>
        </div>
      </div>
    </div>
  );
}