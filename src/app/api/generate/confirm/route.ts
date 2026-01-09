import { NextRequest, NextResponse } from 'next/server';
import { callGroqDirect, GENERATION_PARAMS } from '@/lib/groq';
import { createGenerateFullPrompt } from '@/lib/prompts/generateERD';
import { smartLayout } from '@/lib/autoLayout';
import { DataModel, Entity, Relationship, generateId, DEFAULT_ENTITY_WIDTH, calculateEntityHeight } from '@/types/model';
import { ConfirmGenerationRequest } from '@/types/proposal';

// Force Node.js runtime for Groq SDK compatibility
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmGenerationRequest = await request.json();
    const { originalPrompt, selectedVariantId, selectedEntityIds, targetDatabase = 'postgresql', notation = 'crowsfoot' } = body;

    if (!originalPrompt || !selectedVariantId || !selectedEntityIds || selectedEntityIds.length === 0) {
      return NextResponse.json(
        { error: 'Original prompt, selected variant, and at least one entity are required' },
        { status: 400 }
      );
    }

    // We need to pass context about what was selected
    // In a real scenario, we'd have the variant stored, but we'll reconstruct the request
    const { messages } = createGenerateFullPrompt(
      originalPrompt,
      { name: selectedVariantId, description: '' },
      selectedEntityIds
    );

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

    // Validate and transform response into DataModel
    const entities: Entity[] = (parsedResponse.entities || []).map((e: any) => ({
      id: e.id || generateId(),
      name: e.name || 'Untitled',
      physicalName: e.name?.toLowerCase().replace(/\s+/g, '_'),
      description: e.description || '',
      category: e.category || 'standard',
      x: 0,
      y: 0,
      width: DEFAULT_ENTITY_WIDTH,
      height: calculateEntityHeight((e.attributes || []).length),
      attributes: (e.attributes || []).map((a: any) => ({
        id: a.id || generateId(),
        name: a.name || 'column',
        type: a.type || 'VARCHAR(255)',
        isPrimaryKey: a.isPrimaryKey || false,
        isForeignKey: a.isForeignKey || false,
        isRequired: a.isRequired ?? true,
        isUnique: a.isUnique || false,
        isIndexed: a.isIndexed || false,
        defaultValue: a.defaultValue,
        description: a.description || '',
      })),
    }));

    const relationships: Relationship[] = (parsedResponse.relationships || []).map((r: any) => ({
      id: r.id || generateId(),
      name: r.name || '',
      type: r.type || 'non-identifying',
      sourceEntityId: r.sourceEntityId,
      targetEntityId: r.targetEntityId,
      sourceCardinality: r.sourceCardinality || '1',
      targetCardinality: r.targetCardinality || 'M',
    }));

    // Apply auto-layout to position entities
    const layoutedEntities = smartLayout(entities, relationships);

    // Create the complete data model
    const model: DataModel = {
      id: generateId(),
      name: parsedResponse.modelName || 'Generated Model',
      description: parsedResponse.description || originalPrompt,
      entities: layoutedEntities,
      relationships,
      targetDatabase: targetDatabase as any,
      notation: notation as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      model,
    });

  } catch (error: any) {
    console.error('Generation confirm error:', error);
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
      { error: error.message || 'Failed to generate model' },
      { status: 500 }
    );
  }
}
