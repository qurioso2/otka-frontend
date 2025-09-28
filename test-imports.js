// Test script to validate import paths
const fs = require('fs');
const path = require('path');

const editPagePath = './app/parteneri/orders/[id]/edit/page.tsx';
const authServerPath = './app/auth/server.tsx';
const clientEditorPath = './app/parteneri/orders/[id]/edit/ClientEditor.tsx';

console.log('=== Import Path Validation ===');

// Check if files exist
const files = [
  { name: 'Edit Page', path: editPagePath },
  { name: 'Auth Server', path: authServerPath },
  { name: 'Client Editor', path: clientEditorPath }
];

files.forEach(file => {
  const exists = fs.existsSync(file.path);
  console.log(`${file.name}: ${exists ? '✅ EXISTS' : '❌ MISSING'} - ${file.path}`);
});

// Check import content
if (fs.existsSync(editPagePath)) {
  const content = fs.readFileSync(editPagePath, 'utf8');
  const imports = content.split('\n').filter(line => line.startsWith('import'));
  console.log('\n=== Edit Page Imports ===');
  imports.forEach(imp => console.log(imp));
}

console.log('\n=== Path Resolution Test ===');
console.log('tsconfig.json @ mapping should resolve:');
console.log('@/app/auth/server → ./app/auth/server.tsx');
console.log('Actual file exists:', fs.existsSync('./app/auth/server.tsx') ? '✅' : '❌');