// Groq API client configuration

import Groq from 'groq-sdk';

// Create Groq client instance
export function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  return new Groq({
    apiKey,
    timeout: 30000,
    maxRetries: 2,
  });
}

// Direct fetch-based Groq API call (fallback for serverless environments)
export async function callGroqDirect(messages: any[], params: any) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model || GROQ_MODEL,
      messages,
      temperature: params.temperature || 0.3,
      max_tokens: params.max_tokens || 4096,
      response_format: params.response_format,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorData}`);
  }

  return response.json();
}

// Model configuration
export const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Default parameters for different use cases
export const GENERATION_PARAMS = {
  model: GROQ_MODEL,
  temperature: 0.3,        // Lower for more consistent output
  max_tokens: 4096,
  response_format: { type: 'json_object' as const },
};

export const CHAT_PARAMS = {
  model: GROQ_MODEL,
  temperature: 0.2,        // Even lower for precise modifications
  max_tokens: 2048,
  response_format: { type: 'json_object' as const },
};

export const DDL_PARAMS = {
  model: GROQ_MODEL,
  temperature: 0.1,        // Very low for deterministic SQL
  max_tokens: 4096,
};

export const SUGGESTION_PARAMS = {
  model: GROQ_MODEL,
  temperature: 0.4,        // Slightly higher for creative suggestions
  max_tokens: 1024,
  response_format: { type: 'json_object' as const },
};
