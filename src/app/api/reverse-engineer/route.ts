import { NextRequest, NextResponse } from 'next/server';
import { callGroqDirect, GENERATION_PARAMS } from '@/lib/groq';
import { createReverseEngineerPrompt, detectDatabaseDialect, validateSqlContent } from '@/lib/prompts/reverseEngineer';
import { smartLayout } from '@/lib/autoLayout';
import { DataModel, Entity, Relationship, generateId, DEFAULT_ENTITY_WIDTH, calculateEntityHeight, DatabaseType } from '@/types/model';

// Force Node.js runtime for Groq SDK compatibility
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { sqlContent } = await request.json();

    // Validate input
    if (!sqlContent || typeof sqlContent !== 'string') {
      return NextResponse.json(
        { error: 'SQL content is required' },
        { status: 400 }
      );
    }

    // Validate SQL content has CREATE TABLE statements
    const validation = validateSqlContent(sqlContent);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Detect database dialect from SQL syntax
    const detectedDatabase = detectDatabaseDialect(sqlContent) as DatabaseType;

    // Create prompt and call AI
    const { messages } = createReverseEngineerPrompt(sqlContent, detectedDatabase);
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
        { error: 'Failed to parse AI response. Please ensure your SQL file contains valid CREATE TABLE statements.' },
        { status: 500 }
      );
    }

    // Validate we got some entities
    if (!parsedResponse.entities || parsedResponse.entities.length === 0) {
      return NextResponse.json(
        { error: 'No tables found in the SQL file. Please ensure it contains CREATE TABLE statements.' },
        { status: 400 }
      );
    }

    // Transform response into DataModel (same pattern as generate)
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
      sourceCardinality: r.sourceCardinality || 'M',
      targetCardinality: r.targetCardinality || '1',
    }));

    // Apply auto-layout to position entities nicely
    const layoutedEntities = smartLayout(entities, relationships);

    // Create the complete data model
    const model: DataModel = {
      id: generateId(),
      name: parsedResponse.modelName || 'Imported Schema',
      description: parsedResponse.description || `Reverse engineered from ${detectedDatabase.toUpperCase()} DDL`,
      entities: layoutedEntities,
      relationships,
      targetDatabase: detectedDatabase,
      notation: 'crowsfoot',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      model,
      detectedDatabase,
    });

  } catch (error: any) {
    console.error('Reverse engineering error:', error);
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
      { error: error.message || 'Failed to reverse engineer SQL' },
      { status: 500 }
    );
  }
}
