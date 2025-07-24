// app/api/brand/route.ts
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { TogetherBGEEmbeddings } from '../../../lib/embeddings/bgeTogetherEmbeddings';
import { QdrantClient } from '@qdrant/js-client-rest';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { LangChainAdapter } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages, brandVariables } = await req.json();
    
    const question = messages[messages.length - 1].content;
    console.log('Chat API: Received question:', question);

    const client = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
    });

    const embeddings = new TogetherBGEEmbeddings({
      model: 'BAAI/bge-large-en-v1.5',
      apiKey: process.env.TOGETHER_API_KEY!,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      client,
      collectionName: 'brand-variables',
    });

    const retriever = vectorStore.asRetriever({
      k: 6,
    });

    const relevantDocs = await retriever.getRelevantDocuments(question);
    const context = relevantDocs.map((doc) => doc.pageContent).join('\n');
    console.log('Chat API: Retrieved context from vector store');

    // Get stored brand variables from Qdrant if not provided in request
    let finalBrandVariables = brandVariables;
    if (!finalBrandVariables || Object.keys(finalBrandVariables).length === 0) {
      try {
        console.log('Chat API: No brand variables in request, fetching from Qdrant...');
        
        const brandVariablesResults = await client.scroll('brand-variables', {
          limit: 100,
          with_payload: true
        });

        const userVariables = brandVariablesResults.points?.find(point => 
          point.payload?.type === 'user_brand_variables'
        );

        if (userVariables) {
          finalBrandVariables = userVariables.payload?.variables || {};
          console.log('Chat API: Loaded brand variables from Qdrant:', Object.keys(finalBrandVariables));
        } else {
          console.log('Chat API: No user brand variables found in Qdrant');
        }
      } catch (error) {
        console.error('Chat API: Error retrieving brand variables from Qdrant:', error);
      }
    } else {
      console.log('Chat API: Using brand variables from request:', Object.keys(finalBrandVariables));
    }

    // Create dynamic brand context from user variables
    let brandContext = context;
    if (finalBrandVariables && Object.keys(finalBrandVariables).length > 0) {
      const userBrandContext = Object.entries(finalBrandVariables)
        .filter(([key, value]) => typeof value === 'string' && value.trim() !== '')
        .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
        .join('\n');
      
      if (userBrandContext) {
        brandContext = `USER BRAND VARIABLES:\n${userBrandContext}\n\nADDITIONAL BRAND CONTEXT:\n${context}`;
        console.log('Chat API: Enhanced context with user brand variables');
      }
    }

    // Convert messages to LangChain format
    const history = messages.slice(0, -1).map((msg: any) => {
      return msg.role === 'user' 
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content);
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are a helpful brand assistant that provides brand-consistent answers based on the following brand information and guidelines:

{context}

IMPORTANT INSTRUCTIONS:
- Always prioritize the USER BRAND VARIABLES when they are provided
- Use the user's specific brand voice, tone, and personality in your responses
- Ensure all recommendations align with the user's brand values and target audience
- If user brand variables are provided, reference them specifically in your responses
- Maintain consistency with the brand's communication style and key messages
- Provide actionable, brand-aligned advice and suggestions
- If no specific brand variables are provided, give general brand advice but mention that responses could be more personalized with brand configuration

Please provide responses that are personalized to the user's brand and maintain consistency with their brand guidelines.`],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);

    const model = new ChatTogetherAI({
      temperature: 0.5,
      modelName: 'mistralai/Mistral-7B-Instruct-v0.1',
      apiKey: process.env.TOGETHER_API_KEY!,
      streaming: true,
    });

    const chain = RunnableSequence.from([
      {
        input: (input: any) => input.input,
        context: async () => brandContext,
        history: async () => history,
      },
      prompt,
      model,
    ]);

    console.log('Chat API: Generating response...');
    const stream = await chain.stream({ input: question });
    
    return LangChainAdapter.toDataStreamResponse(stream);
    
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}