import { Embeddings } from '@langchain/core/embeddings';
import axios from 'axios';
import { AsyncCallerParams } from '@langchain/core/utils/async_caller';

interface TogetherBGEEmbeddingsParams extends AsyncCallerParams {
  model?: string;
  apiKey?: string;
}

export class TogetherBGEEmbeddings extends Embeddings {
  model: string;
  apiKey: string;
  baseURL = 'https://api.together.xyz/v1';

  constructor(params: TogetherBGEEmbeddingsParams = {}) {
    super(params); // ✅ Now matches AsyncCallerParams

    this.model = params.model ?? 'BAAI/bge-large-en-v1.5';
    this.apiKey = params.apiKey ?? process.env.TOGETHER_API_KEY!;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const results = await Promise.all(
      texts.map(async (text) => {
        const response = await axios.post(
          `${this.baseURL}/embeddings`,
          {
            model: this.model,
            input: text,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data.data[0].embedding;
      })
    );
    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await this.embedDocuments([text]);
    return embedding;
  }
}
