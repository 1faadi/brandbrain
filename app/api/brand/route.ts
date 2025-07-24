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
    const { messages } = await req.json();
    
    const question = messages[messages.length - 1].content;

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

    // Convert messages to LangChain format
    const history = messages.slice(0, -1).map((msg: any) => {
      return msg.role === 'user' 
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content);
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are a helpful assistant that gives brand-consistent answers based on the following brand variables and guidelines:\n\n{context}\n\nPlease provide responses that align with these brand guidelines and maintain consistency with the brand's voice, tone, and messaging strategy.`],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);

    const model = new ChatTogetherAI({
      temperature: 0.5,
      modelName: 'mistralai/Mistral-7B-Instruct-v0.1',
      apiKey: process.env.TOGETHER_API_KEY!,
      streaming: true, // Enable streaming
    });

    const chain = RunnableSequence.from([
      {
        input: (input: any) => input.input,
        context: async () => context,
        history: async () => history,
      },
      prompt,
      model,
    ]);

    // Use LangChainAdapter to convert to streaming response
    const stream = await chain.stream({ input: question });
    
    return LangChainAdapter.toDataStreamResponse(stream);
    
  } catch (error) {
    console.error('API Error:', error);
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