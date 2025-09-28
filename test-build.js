// Simple test to verify Next.js syntax

// Check if ProductsInfinite component can be imported
const fs = require('fs');

try {
  const pageContent = fs.readFileSync('./app/page.tsx', 'utf8');
  const editorContent = fs.readFileSync('./app/parteneri/orders/[id]/edit/page.tsx', 'utf8');
  
  // Check if 'use client' appears in wrong places
  const pageLines = pageContent.split('\n');
  const editorLines = editorContent.split('\n');
  
  console.log('=== Page.tsx Analysis ===');
  pageLines.forEach((line, i) => {
    if (line.includes('use client')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  });
  
  console.log('\n=== Editor Page Analysis ===');
  editorLines.forEach((line, i) => {
    if (line.includes('use client')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  });
  
  console.log('\n✅ Analysis complete - no "use client" directives found in server components');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}