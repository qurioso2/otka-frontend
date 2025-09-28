'use client';

export default function WorkflowExplainer() {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-3">🏢 Cum Funcționează Platforma OTKA</h3>
        <p className="text-blue-800">
          OTKA este o platformă eCommerce pentru mobilier cu funcționalitate B2B pentru parteneri. 
          Partenerii vând produsele OTKA clienților lor și primesc comisioane pentru fiecare vânzare.
        </p>
      </div>

      {/* Partner-Client Workflow */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Workflow Partener → Client → Comision</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <h4 className="ml-3 font-semibold text-green-900">Partenerul Vinde</h4>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Partenerul găsește un client</li>
              <li>• Vinde produse OTKA la preț public</li>
              <li>• Înregistrează clientul în sistem</li>
              <li>• Adaugă comanda manuală</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <h4 className="ml-3 font-semibold text-blue-900">Sistem Calculează</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Comanda se asociază cu partenerul</li>
              <li>• Se calculează comisionul (5%)</li>
              <li>• Clientul rămâne legat de partener</li>
              <li>• Totul se urmărește automat</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <h4 className="ml-3 font-semibold text-purple-900">Admin Plătește</h4>
            </div>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Admin vede rapoartele de comisioane</li>
              <li>• Exportă CSV pentru contabilitate</li>
              <li>• Plătește comisioanele lunar</li>
              <li>• Totul e transparent și urmărit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Client-Partner Association */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Asocierea Client-Partener</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">❓ Cum se asociază un client cu un partener?</h4>
              <ol className="text-sm text-yellow-800 space-y-2">
                <li><strong>1.</strong> Partenerul merge în secțiunea "Clienți & Comenzi"</li>
                <li><strong>2.</strong> Adaugă un client nou cu email, nume, companie</li>
                <li><strong>3.</strong> Clientul se salvează automat cu <code>partner_email</code></li>
                <li><strong>4.</strong> Toate comenzile viitoare pentru acest client se vor asocia cu partenerul</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">💡 Beneficii pentru Partener</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Preț special partener (fără TVA)</li>
                <li>• Comision 5% din vânzări</li>
                <li>• Acces la resurse (cataloage, imagini)</li>
                <li>• Rapoarte detaliate de vânzări</li>
                <li>• Clientul rămâne al său pentru totdeauna</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Exemplu Practic</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div><strong>Client:</strong> SC Design Studio SRL</div>
                  <div><strong>Partener:</strong> partner1@test.ro</div>
                  <div><strong>Comandă:</strong> 10,000 RON (net)</div>
                  <div><strong>Comision:</strong> 500 RON (5%)</div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Important de Știut</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Un client poate fi asociat doar cu un partener</li>
                <li>• Asocierea se face la prima înregistrare</li>
                <li>• Comisioanele se calculează doar pentru comenzi "completed"</li>
                <li>• Adminii pot vedea toate comisioanele și pot face exporturi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏗️ Arhitectura Sistemului</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">📋 Tabele Principale</h4>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900">users</div>
                <div className="text-sm text-gray-600">Parteneri, admin, vizitatori cu roluri și statusuri</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900">clients</div>
                <div className="text-sm text-gray-600">Clienții partenerilor (asociați prin partner_email)</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900">manual_orders</div>
                <div className="text-sm text-gray-600">Comenzile offline înregistrate de parteneri</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900">partner_orders</div>
                <div className="text-sm text-gray-600">Comenzile B2B create prin formularul de comenzi</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">🔐 Securitate (RLS)</h4>
            <div className="space-y-3">
              <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                <div className="font-medium text-green-900">Admin</div>
                <div className="text-sm text-green-800">Poate vedea și modifica tot</div>
              </div>
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                <div className="font-medium text-blue-900">Parteneri</div>
                <div className="text-sm text-blue-800">Văd doar clienții și comenzile lor</div>
              </div>
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-900">Vizitatori</div>
                <div className="text-sm text-gray-600">Doar produsele publice</div>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="font-medium text-yellow-900 mb-1">🔍 Debugging</div>
              <div className="text-sm text-yellow-800">
                Pentru probleme de acces, folosește <a href="/debug-auth" className="underline">/debug-auth</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Formats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Formate CSV</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📦 Import Produse</h4>
            <div className="bg-gray-50 rounded p-2 text-xs font-mono mb-2">
              sku,name,price_public_ttc,price_partner_net,stock_qty,gallery,description
            </div>
            <p className="text-sm text-gray-600">
              Pentru adăugarea în masă a produselor în catalog
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">💰 Export Comisioane</h4>
            <div className="bg-gray-50 rounded p-2 text-xs font-mono mb-2">
              partner_email,orders_count,total_net,commission_5%
            </div>
            <p className="text-sm text-gray-600">
              Pentru raportarea lunară a comisioanelor către parteneri
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}