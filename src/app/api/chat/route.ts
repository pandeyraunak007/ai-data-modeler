import { NextRequest, NextResponse } from 'next/server';
import { createGroqClient, CHAT_PARAMS } from '@/lib/groq';
import { createModifyPrompt } from '@/lib/prompts/modifyModel';
import { DataModel } from '@/types/model';

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

    // Create Groq client
    const groq = createGroqClient();

    // Create prompt with current model context
    const { messages } = createModifyPrompt(currentModel as DataModel, message);

    // Create streaming response
    const stream = await groq.chat.completions.create({
      ...CHAT_PARAMS,
      messages,
      stream: true,
    });

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          // Send completion signal with the full response
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

    if (error.message?.includes('GROQ_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
