import { NextRequest, NextResponse } from 'next/server';
import { createGroqClient, GENERATION_PARAMS } from '@/lib/groq';
import { createGeneratePrompt } from '@/lib/prompts/generateERD';
import { smartLayout } from '@/lib/autoLayout';
import { DataModel, Entity, Relationship, generateId, DEFAULT_ENTITY_WIDTH, calculateEntityHeight } from '@/types/model';

// Force Node.js runtime for Groq SDK compatibility
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { prompt, targetDatabase = 'postgresql' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create Groq client
    const groq = createGroqClient();

    // Generate ERD using AI
    const { messages } = createGeneratePrompt(prompt);

    const completion = await groq.chat.completions.create({
      ...GENERATION_PARAMS,
      messages,
    });

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
      description: parsedResponse.description || prompt,
      entities: layoutedEntities,
      relationships,
      targetDatabase,
      notation: 'crowsfoot',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      model,
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
      { error: error.message || 'Failed to generate model' },
      { status: 500 }
    );
  }
}
