import { NextRequest, NextResponse } from 'next/server';
import { callGroqDirect, GENERATION_PARAMS } from '@/lib/groq';
import { createGenerateVariantsPrompt } from '@/lib/prompts/generateERD';
import { ModelVariant, EntityPreview, RelationshipPreview } from '@/types/proposal';
import { generateId } from '@/types/model';

// Force Node.js runtime for Groq SDK compatibility
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate model variants using AI
    const { messages } = createGenerateVariantsPrompt(prompt);

    const completion = await callGroqDirect(messages, GENERATION_PARAMS);

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse AI response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Validate and transform variants
    const variants: ModelVariant[] = (parsedResponse.variants || []).map((v: any, index: number) => {
      const entities: EntityPreview[] = (v.entities || []).map((e: any) => ({
        id: e.id || generateId(),
        name: e.name || 'Untitled',
        description: e.description || '',
        category: e.category || 'standard',
        estimatedAttributeCount: e.estimatedAttributeCount || 5,
        isSelected: true, // All entities selected by default
      }));

      const relationships: RelationshipPreview[] = (v.relationships || []).map((r: any) => ({
        id: r.id || generateId(),
        sourceEntityId: r.sourceEntityId,
        targetEntityId: r.targetEntityId,
        type: r.type || 'non-identifying',
        sourceCardinality: r.sourceCardinality || '1',
        targetCardinality: r.targetCardinality || 'M',
        description: r.description || '',
      }));

      return {
        id: v.id || `variant_${index + 1}`,
        name: v.name || `Option ${index + 1}`,
        description: v.description || '',
        complexity: v.complexity || 'standard',
        entities,
        relationships,
        estimatedTables: entities.length,
        useCases: v.useCases || [],
      };
    });

    // Ensure we have at least one variant
    if (variants.length === 0) {
      return NextResponse.json(
        { error: 'AI did not generate any model variants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      proposal: {
        variants,
      },
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);

    // Handle specific error types
    if (error.message?.includes('GROQ_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set GROQ_API_KEY.' },
        { status: 500 }
      );
    }

    // Handle connection errors
    if (error.message?.includes('Connection') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Failed to connect to AI service. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate model variants' },
      { status: 500 }
    );
  }
}
