import { NextRequest, NextResponse } from 'next/server';
import { GROQ_MODEL, CHAT_PARAMS } from '@/lib/groq';
import { createModifyPrompt } from '@/lib/prompts/modifyModel';
import { DataModel } from '@/types/model';

// Force Node.js runtime for compatibility
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { message, currentModel } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!currentModel) {
      return NextResponse.json(
        { error: 'Current model is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Create prompt with current model context
    const { messages } = createModifyPrompt(currentModel as DataModel, message);

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

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errorText);
      return NextResponse.json(
        { error: `AI service error: ${groqResponse.status}` },
        { status: 500 }
      );
    }

    if (!groqResponse.body) {
      return NextResponse.json(
        { error: 'No response stream from AI service' },
        { status: 500 }
      );
    }

    // Create a ReadableStream to forward the SSE response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = groqResponse.body.getReader();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

              if (trimmedLine.startsWith('data: ')) {
                try {
                  const json = JSON.parse(trimmedLine.slice(6));
                  const content = json.choices?.[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
