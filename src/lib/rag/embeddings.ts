import { OpenAIEmbeddings } from "@langchain/openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

let embeddingsInstance: OpenAIEmbeddings | null = null;

export function createEmbeddingsModel(): OpenAIEmbeddings {
  if (!embeddingsInstance) {
    embeddingsInstance = new OpenAIEmbeddings({
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
    });
  }

  return embeddingsInstance;
}

export async function embedText(text: string): Promise<number[]> {
  const embeddings = createEmbeddingsModel();
  return embeddings.embedQuery(text);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const embeddings = createEmbeddingsModel();
  return embeddings.embedDocuments(texts);
}
