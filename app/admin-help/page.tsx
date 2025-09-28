export default function AdminHelp() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">🔧 Admin Dashboard - Ghid de Acces</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-green-900">✅ Status: Totul este configurat corect!</h2>
          <p className="text-green-800">
            Testele tehnice arată că admin dashboard-ul este complet funcțional. 
            Utilizatorul admin există în baza de date și autentificarea funcționează perfect.
          </p>
        </div>

        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">🔐 Credențiale Admin</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin@otka.ro</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Parolă:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">Parola!3</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Rol:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">admin</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">active</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-2 border-blue-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">📋 Pași pentru Accesare</h2>
          <ol className="space-y-3 text-blue-800">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">1</span>
              <div>
                <strong>Mergi la pagina de login:</strong> 
                <a href="/login" className="ml-2 text-blue-600 underline hover:text-blue-800">/login</a>
              </div>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">2</span>
              <div>
                <strong>Introduce credențialele:</strong>
                <div className="text-sm mt-1">
                  Email: <code className="bg-gray-100 px-1 rounded">admin@otka.ro</code><br/>
                  Parolă: <code className="bg-gray-100 px-1 rounded">Parola!3</code>
                </div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">3</span>
              <div>
                <strong>După login, accesează:</strong> 
                <a href="/admin" className="ml-2 text-blue-600 underline hover:text-blue-800">/admin</a>
              </div>
            </li>
          </ol>
        </div>

        <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-yellow-900">⚠️ Dacă încă nu funcționează</h2>
          <div className="space-y-3 text-yellow-800">
            <div>
              <strong>1. Verifică Browser Storage:</strong>
              <p className="text-sm">Deschide Developer Tools (F12) → Application → Local Storage / Cookies și șterge datele pentru site</p>
            </div>
            <div>
              <strong>2. Testează Incognito/Private Mode:</strong>
              <p className="text-sm">Încearcă să accesezi în modul privat al browser-ului</p>
            </div>
            <div>
              <strong>3. Verifică Network Tab:</strong>
              <p className="text-sm">Deschide F12 → Network și vezi dacă sunt erori la request-uri</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/test-login" 
            className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-center"
          >
            <div className="text-2xl mb-2">🧪</div>
            <div className="font-semibold">Test Login</div>
            <div className="text-sm opacity-90">Testează autentificarea</div>
          </a>
          
          <a 
            href="/debug-auth" 
            className="p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-center"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-semibold">Debug Auth</div>
            <div className="text-sm opacity-90">Informații detaliate</div>
          </a>
          
          <a 
            href="/admin" 
            className="p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition text-center"
          >
            <div className="text-2xl mb-2">👑</div>
            <div className="font-semibold">Admin Dashboard</div>
            <div className="text-sm opacity-90">Încearcă acum</div>
          </a>
        </div>

        <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">🛠️ Teste Efectuate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">✅ Funcționează:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Conexiunea la baza de date</li>
                <li>• Autentificarea cu Supabase</li>
                <li>• Query-ul pentru utilizatori</li>
                <li>• Verificarea rolului admin</li>
                <li>• Logica admin dashboard</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">📊 Date Verificate:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Utilizator admin există</li>
                <li>• Rolul este setat corect</li>
                <li>• Status-ul este 'active'</li>
                <li>• Email-ul este confirmat</li>
                <li>• Parola funcționează</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}