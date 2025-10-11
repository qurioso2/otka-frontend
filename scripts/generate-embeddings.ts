#!/usr/bin/env ts-node
/**
 * Script pentru generare embeddings pentru produse existente
 * Usage: tsx scripts/generate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, buildProductEmbeddingText } from '../lib/openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbeddingsForProducts() {
  console.log('🚀 Starting embedding generation...\n');

  // Fetch produse fără embedding
  const { data: products, error } = await supabase
    .from('products')
    .select('id, sku, name, description, category, subcategory, finish, color, material, brand, width, length, height, specifications')
    .is('embedding', null)
    .limit(100);

  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.log('✅ All products already have embeddings!');
    return;
  }

  console.log(`📦 Found ${products.length} products without embeddings\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      // Construiește text pentru embedding
      const textForEmbedding = buildProductEmbeddingText(product);

      console.log(`Processing: ${product.name} (${product.sku})...`);

      // Generează embedding
      const embedding = await generateEmbedding(textForEmbedding);

      // Update în baza de date
      const { error: updateError } = await supabase
        .from('products')
        .update({ embedding })
        .eq('id', product.id);

      if (updateError) {
        console.error(`  ❌ Error updating product ${product.id}:`, updateError);
        errorCount++;
      } else {
        console.log(`  ✅ Generated embedding`);
        successCount++;
      }

      // Rate limiting (5000 requests/min pentru OpenAI)
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error: any) {
      console.error(`  ❌ Error processing product ${product.id}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📦 Total: ${products.length}`);
}

// Run
generateEmbeddingsForProducts()
  .then(() => {
    console.log('\n✨ Batch processing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
