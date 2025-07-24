// scripts/setupBrandVariables.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { TogetherBGEEmbeddings } from '../lib/embeddings/bgeTogetherEmbeddings';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

async function setupBrandVariablesCollection() {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
  });

  const embeddings = new TogetherBGEEmbeddings({
    model: 'BAAI/bge-large-en-v1.5',
    apiKey: process.env.TOGETHER_API_KEY!,
  });

  try {
    // Check if collection exists
    try {
      await client.getCollection('brand-variables');
      console.log('📦 Collection "brand-variables" already exists');
    } catch (error) {
      // Collection doesn't exist, create it
      console.log('🔧 Creating "brand-variables" collection...');
      
      await client.createCollection('brand-variables', {
        vectors: {
          size: 1024, // BGE-large embedding size
          distance: 'Cosine'
        }
      });
      
      console.log('✅ Created "brand-variables" collection');
    }

    // Add some default brand context (optional - can be removed if you prefer empty)
    const defaultBrandContext = [
      {
        content: 'Brand guidelines should include voice, tone, messaging, and visual identity elements.',
        metadata: { type: 'brand_guideline', category: 'general' }
      },
      {
        content: 'Consistent brand voice helps build trust and recognition with your audience.',
        metadata: { type: 'brand_guideline', category: 'voice' }
      },
      {
        content: 'Target audience definition should include demographics, psychographics, and pain points.',
        metadata: { type: 'brand_guideline', category: 'audience' }
      },
      {
        content: 'Brand values should guide all communication and decision-making processes.',
        metadata: { type: 'brand_guideline', category: 'values' }
      }
    ];

    console.log('📝 Adding default brand guidelines...');

    // Add default context to help with brand advice
    for (const item of defaultBrandContext) {
      const vector = await embeddings.embedQuery(item.content);
      
      await client.upsert('brand-variables', {
        points: [
          {
            id: uuidv4(), // Use proper UUID
            vector: vector,
            payload: {
              content: item.content,
              ...item.metadata,
              createdAt: new Date().toISOString()
            }
          }
        ]
      });
    }

    console.log('✅ Added default brand guidelines to collection');
    console.log('🎯 Collection is ready for user brand variables!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit /brand-variables to add your brand information');
    console.log('2. Visit /brand to start chatting with brand-aware AI');

  } catch (error) {
    console.error('❌ Error setting up collection:', error);
  }
}

setupBrandVariablesCollection();