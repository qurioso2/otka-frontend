'use client';

import { useState } from 'react';

export default function SetupAdmin() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'creating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [adminData, setAdminData] = useState<any>(null);

  const checkAdmins = async () => {
    setStatus('checking');
    try {
      const response = await fetch('/api/setup-admin');
      const data = await response.json();
      
      if (response.ok) {
        setAdminData(data);
        if (data.adminCount > 0) {
          setMessage(`Found ${data.adminCount} admin user(s) already configured.`);
        } else {
          setMessage('No admin users found. Click "Create Admin User" to set up the first admin.');
        }
        setStatus('success');
      } else {
        setMessage(`Error: ${data.error} - ${data.details}`);
        setStatus('error');
      }
    } catch (error: any) {
      setMessage(`Network error: ${error.message}`);
      setStatus('error');
    }
  };

  const createAdmin = async () => {
    setStatus('creating');
    try {
      const response = await fetch('/api/setup-admin', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        setAdminData(data);
        setMessage(data.message);
        setStatus('success');
      } else {
        setMessage(`Error: ${data.error} - ${data.details}`);
        setStatus('error');
      }
    } catch (error: any) {
      setMessage(`Network error: ${error.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">🛠️ Admin Setup</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Admin User Configuration</h2>
          <p className="text-gray-600 mb-4">
            This page helps you set up the initial admin user for the OTKA dashboard.
            Use this if you're getting "Access denied" errors when trying to access the admin panel.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={checkAdmins}
              disabled={status === 'checking'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {status === 'checking' ? 'Checking...' : 'Check Admin Users'}
            </button>
            
            <button
              onClick={createAdmin}
              disabled={status === 'creating'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {status === 'creating' ? 'Creating...' : 'Create Admin User'}
            </button>
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

        {adminData && (
          <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Admin Users Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Total Admin Users:</span>
                <span className="font-bold">{adminData.adminCount || 0}</span>
              </div>
              
              {adminData.admins && adminData.admins.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Admin Users:</h4>
                  {adminData.admins.map((admin: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{admin.email}</div>
                      <div className="text-sm text-gray-600">
                        Status: {admin.partner_status} | Company: {admin.company_name || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <h3 className="text-lg font-semibold mb-3 text-yellow-900">📋 Default Admin User</h3>
          <p className="text-yellow-800 mb-2">
            The default admin user that will be created:
          </p>
          <div className="text-sm text-yellow-700 space-y-1">
            <div><strong>Email:</strong> admin@otka.ro</div>
            <div><strong>Role:</strong> admin</div>
            <div><strong>Company:</strong> MERCURY VC S.R.L.</div>
            <div><strong>Status:</strong> active</div>
          </div>
          <p className="text-yellow-800 text-sm mt-3">
            <strong>Note:</strong> After creating the admin user, you'll need to set up authentication 
            in Supabase Auth for this email address to be able to log in.
          </p>
        </div>

        <div className="flex gap-4">
          <a href="/debug-auth" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Debug Auth
          </a>
          <a href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Admin Dashboard
          </a>
          <a href="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}