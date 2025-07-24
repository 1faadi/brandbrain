// scripts/addBrandVariable.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { TogetherBGEEmbeddings } from '../lib/embeddings/bgeTogetherEmbeddings';
import 'dotenv/config';

const variables = [
    { key: 'brand_name', value: 'Aurora Cosmetics', description: 'The official name of the brand' },
    { key: 'brand_tone', value: 'Friendly and empowering', description: 'The emotional tone the brand uses' },
    { key: 'target_audience', value: 'Young adults aged 18–35 interested in skincare', description: 'The ideal customer profile' },
    { key: 'slogan', value: 'Glow Naturally', description: 'Brand tagline or motto' },
    { key: 'color_palette', value: 'Soft pinks and earthy greens', description: 'Preferred color themes' },
    { key: 'font_style', value: 'Clean sans-serif like Lato or Open Sans', description: 'Typography preferences' },
    { key: 'voice', value: 'Conversational, optimistic, confident', description: 'How the brand speaks' },
    { key: 'mission', value: 'To empower women with clean and effective skincare', description: 'Why the brand exists' },
    { key: 'vision', value: 'A world where every woman feels confident in her natural skin', description: 'Where the brand is going' },
    { key: 'core_values', value: 'Authenticity, Sustainability, Empowerment', description: 'Guiding principles of the brand' },
    { key: 'do_not_say', value: 'Cheap, whitening, anti-aging', description: 'Phrases or words to avoid in communication' },
    { key: 'preferred_platforms', value: 'Instagram, TikTok, YouTube', description: 'Where the brand primarily shows up' },
    { key: 'customer_promise', value: '100% clean ingredients with real results', description: 'What the brand promises to its customers' },
    { key: 'social_messaging', value: 'Celebrate natural beauty and self-care', description: 'Themes to emphasize in social media' },
    { key: 'product_description_style', value: 'Short, benefit-focused, emotionally appealing', description: 'How product copy should be written' },
    { key: 'email_tone', value: 'Warm and enthusiastic, with a personal touch', description: 'Tone used in email marketing' },
    { key: 'bio_blurb', value: 'Clean skincare made for your glow. ✨', description: '1-liner for bios or summaries' },
  ];
  
  async function run() {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
    });
  
    const embeddings = new TogetherBGEEmbeddings({
      model: 'BAAI/bge-large-en-v1.5',
      apiKey: process.env.TOGETHER_API_KEY!,
    });
  
    const store = await QdrantVectorStore.fromTexts(
      variables.map((v) => `${v.key}: ${v.value}`),
      variables.map((v) => ({ ...v })),
      embeddings,
      {
        client,
        collectionName: 'brand-variables',
      }
    );
  
    console.log('✅ Brand variables inserted to Qdrant!');
  }
  
  run().catch(console.error);