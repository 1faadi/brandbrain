import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { TogetherBGEEmbeddings } from '../lib/embeddings/bgeTogetherEmbeddings';
import dotenv from 'dotenv';

dotenv.config();

const COLLECTION_NAME = 'brand-variables';

async function getBrandVariables(query: string, topK = 5) {
  const client = new QdrantClient({ url: process.env.QDRANT_URL! });

  const embeddings = new TogetherBGEEmbeddings();

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    client,
    collectionName: COLLECTION_NAME,
  });

  const results = await vectorStore.similaritySearch(query, topK);

  console.log('🔍 Retrieved Brand Variables:\n');
  results.forEach((result, i) => {
    console.log(`#${i + 1}`);
    console.log(`📌 Name: ${result.metadata?.name}`);
    console.log(`📄 Content: ${result.pageContent}`);
    console.log(`🏷️ Category: ${result.metadata?.category}`);
    console.log('---');
  });
}

// Run with: npx tsx scripts/getBrandVariables.ts "Your query here"
const query = process.argv[2] || 'What is the brand tone?';
getBrandVariables(query);