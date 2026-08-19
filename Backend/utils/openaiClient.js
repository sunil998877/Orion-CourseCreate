import { OpenAI } from 'openai';

let client = null;

export function getOpenAIClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    });
  }
  return client;
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}
