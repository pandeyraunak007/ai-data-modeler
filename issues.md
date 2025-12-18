# Issues & Fixes Log

A record of issues encountered during development and deployment of the AI Data Modeler, along with the solutions applied.

---

## Table of Contents

1. [Vercel 500 Error - Generate API](#issue-1-vercel-500-error---generate-api)
2. [ThemeContext SSR Error](#issue-2-themecontext-ssr-error)
3. [Vercel 500 Error - Chat API](#issue-3-vercel-500-error---chat-api)

---

## Issue #1: Vercel 500 Error - Generate API

### Date
December 2024

### Description
After deploying to Vercel, the `/api/generate` endpoint returned a 500 error with "Connection error" when trying to generate data models. The application worked fine locally but failed in the Vercel serverless environment.

### Error Message
```
generate 500 fetch page-f53f44047441 123 B 1.88 s fa89f.js
Connection error
```

### Root Cause
The Groq SDK (`groq-sdk`) has connectivity issues in Vercel's serverless/edge environment. The SDK's internal HTTP client doesn't work reliably in serverless functions.

### Solution
Replaced the Groq SDK calls with native `fetch` API for direct HTTP requests to the Groq API.

### Files Modified
- `src/lib/groq.ts` - Added `callGroqDirect()` function
- `src/app/api/generate/route.ts` - Switched from SDK to direct fetch

### Code Changes

**Added to `src/lib/groq.ts`:**
```typescript
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
```

**Updated `src/app/api/generate/route.ts`:**
```typescript
// Added runtime configuration
export const runtime = 'nodejs';
export const maxDuration = 30;

// Changed from:
const groq = createGroqClient();
const completion = await groq.chat.completions.create({...});

// To:
const completion = await callGroqDirect(messages, GENERATION_PARAMS);
```

### Status
✅ Resolved

---

## Issue #2: ThemeContext SSR Error

### Date
December 2024

### Description
After implementing the light/dark theme toggle, the application crashed during build/SSR with an error about `useTheme` being called outside of `ThemeProvider`.

### Error Message
```
Error: useTheme must be used within a ThemeProvider
```

### Root Cause
During Next.js static page generation (SSG), React components are rendered on the server where the `ThemeProvider` context isn't available. The original implementation threw an error when the context was undefined.

### Solution
Changed the context default value from `undefined` (which threw an error) to provide sensible default values, allowing components to render safely during SSR.

### Files Modified
- `src/context/ThemeContext.tsx`

### Code Changes

**Before (problematic):**
```typescript
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**After (fixed):**
```typescript
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
```

### Status
✅ Resolved

---

## Issue #3: Vercel 500 Error - Chat API

### Date
December 2024

### Description
The chat functionality in the workspace returned "Sorry, I encountered an error processing your request" when users tried to interact with the AI to modify their data models or generate DDL scripts.

### Error Message
```
Sorry, I encountered an error processing your request.
03:59 pm
```

### Root Cause
Same as Issue #1 - the `/api/chat` route was still using the Groq SDK which has connectivity issues in Vercel's serverless environment. This route was missed when fixing the generate API.

### Solution
Updated the chat API to use native `fetch` with streaming support instead of the Groq SDK.

### Files Modified
- `src/app/api/chat/route.ts`

### Code Changes

**Before (using Groq SDK):**
```typescript
import { createGroqClient, CHAT_PARAMS } from '@/lib/groq';

// Create Groq client
const groq = createGroqClient();

// Create streaming response
const stream = await groq.chat.completions.create({
  ...CHAT_PARAMS,
  messages,
  stream: true,
});

// Iterate over SDK stream
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  // ...
}
```

**After (using native fetch with streaming):**
```typescript
import { GROQ_MODEL, CHAT_PARAMS } from '@/lib/groq';

// Use native fetch with streaming for Groq API
const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: GROQ_MODEL,
    messages,
    temperature: CHAT_PARAMS.temperature,
    max_tokens: CHAT_PARAMS.max_tokens,
    response_format: CHAT_PARAMS.response_format,
    stream: true,
  }),
});

// Read from native fetch response body
const reader = groqResponse.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Parse SSE format and forward to client
  // ...
}
```

### Status
✅ Resolved

---

## Prevention Strategies

### For Groq SDK Issues
- Always use native `fetch` for API calls in serverless environments
- Add `export const runtime = 'nodejs'` and `export const maxDuration = 30` to API routes
- Test deployments on Vercel staging before production

### For SSR/SSG Issues
- Provide default values for React contexts instead of throwing errors
- Use `useEffect` for client-only operations
- Add `mounted` state checks before accessing browser APIs

---

## Environment Information

- **Framework:** Next.js 14.2.5
- **Deployment:** Vercel
- **AI Provider:** Groq API (Llama 3.3 70B)
- **Node Version:** 18.x
