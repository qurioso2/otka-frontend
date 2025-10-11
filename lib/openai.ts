import OpenAI from 'openai';

// Singleton instance
let openaiInstance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    openaiInstance = new OpenAI({
      apiKey,
    });
  }

  return openaiInstance;
}

// Helper pentru generare embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

// Helper pentru procesare batch embeddings
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
    dimensions: 1536,
  });

  return response.data.map((item) => item.embedding);
}

// Helper pentru construire text pentru embedding
export function buildProductEmbeddingText(product: any): string {
  const parts = [
    product.name,
    product.description,
    product.category ? `Categorie: ${product.category}` : '',
    product.subcategory ? `Subcategorie: ${product.subcategory}` : '',
    product.finish ? `Finisaj: ${product.finish}` : '',
    product.color ? `Culoare: ${product.color}` : '',
    product.material ? `Material: ${product.material}` : '',
    product.brand ? `Brand: ${product.brand}` : '',
    product.width && product.length && product.height
      ? `Dimensiuni: ${product.width}x${product.length}x${product.height} cm`
      : '',
    product.specifications
      ? `Specificații: ${JSON.stringify(product.specifications)}`
      : '',
  ];

  return parts.filter(Boolean).join('\n').trim();
}
