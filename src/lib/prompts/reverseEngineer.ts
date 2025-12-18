// Reverse Engineering prompts for AI Data Modeler
// Parses SQL DDL statements and extracts schema structure

export const SYSTEM_PROMPT_REVERSE_ENGINEER = `You are a database schema analyzer. Your task is to parse SQL DDL statements and extract the complete schema structure.

You will receive CREATE TABLE statements and must output a JSON object with:
1. Entities (tables) with all their attributes (columns)
2. Relationships inferred from foreign keys
3. Primary keys, indexes, and constraints

## Output Format (JSON)
{
  "modelName": "descriptive name derived from the schema",
  "description": "brief description of what this database represents",
  "entities": [
    {
      "id": "unique_id",
      "name": "TableName",
      "description": "What this table represents",
      "category": "standard|lookup|junction",
      "attributes": [
        {
          "id": "unique_attr_id",
          "name": "column_name",
          "type": "SQL_DATA_TYPE",
          "isPrimaryKey": boolean,
          "isForeignKey": boolean,
          "isRequired": boolean,
          "isUnique": boolean,
          "isIndexed": boolean,
          "defaultValue": "value or null",
          "description": "Brief description"
        }
      ]
    }
  ],
  "relationships": [
    {
      "id": "unique_rel_id",
      "name": "relationship_name",
      "type": "identifying|non-identifying",
      "sourceEntityId": "entity_id_with_foreign_key",
      "targetEntityId": "referenced_entity_id",
      "sourceCardinality": "M|1|0..1|1..M|0..M",
      "targetCardinality": "1|M|0..1|1..M|0..M"
    }
  ]
}

## Parsing Guidelines

### Entity Extraction
1. Each CREATE TABLE becomes an entity
2. Convert table names to PascalCase for display (e.g., user_accounts -> UserAccounts)
3. Categorize entities:
   - "junction": Tables with composite PK from two FKs (many-to-many joins)
   - "lookup": Small reference tables (status, type, category, with few columns)
   - "standard": All other tables

### Attribute Extraction
1. Extract column name and data type exactly as specified
2. Identify PRIMARY KEY columns
3. Identify FOREIGN KEY constraints and mark columns
4. Check NOT NULL constraints for isRequired
5. Check UNIQUE constraints for isUnique
6. Look for INDEX definitions for isIndexed
7. Extract DEFAULT values if present

### Relationship Inference
1. Each FOREIGN KEY creates a relationship
2. Source entity = table containing the FK
3. Target entity = table being referenced
4. Determine cardinality:
   - If FK is also PK or UNIQUE: one-to-one (1:1)
   - If FK is NOT NULL: one-to-many (1:M)
   - If FK allows NULL: zero-to-many (0..M)
5. Type:
   - "identifying" if FK is part of primary key
   - "non-identifying" otherwise

### Data Type Normalization
Keep the original SQL type but normalize common variations:
- INTEGER, INT -> INT
- CHARACTER VARYING, VARCHAR -> VARCHAR(n)
- TIMESTAMP WITHOUT TIME ZONE -> TIMESTAMP
- NUMERIC -> DECIMAL(p,s)

## Important Notes
- Output ONLY valid JSON, no additional text or markdown
- Generate unique IDs for all entities, attributes, and relationships
- If a table name is used as a reference, use that as the entity ID
- Handle inline REFERENCES and separate FOREIGN KEY constraints
- Support multiple database dialects (PostgreSQL, MySQL, SQL Server, Oracle, SQLite)`;

export function createReverseEngineerPrompt(sqlDDL: string, detectedDatabase: string) {
  const databaseNote = `\n\n## Database Dialect: ${detectedDatabase.toUpperCase()}\nParse the following SQL DDL statements considering ${detectedDatabase} syntax conventions.`;

  return {
    messages: [
      { role: 'system' as const, content: SYSTEM_PROMPT_REVERSE_ENGINEER + databaseNote },
      { role: 'user' as const, content: `Parse this SQL DDL and extract the complete schema:\n\n${sqlDDL}` },
    ],
  };
}

/**
 * Detect database dialect from SQL syntax patterns
 */
export function detectDatabaseDialect(sql: string): string {
  const sqlLower = sql.toLowerCase();

  // MySQL patterns
  if (sqlLower.includes('auto_increment') ||
      sqlLower.includes('engine=innodb') ||
      sqlLower.includes('engine=myisam') ||
      sqlLower.includes('unsigned')) {
    return 'mysql';
  }

  // PostgreSQL patterns
  if (sqlLower.includes('serial') ||
      sqlLower.includes('::') ||
      sqlLower.includes('character varying') ||
      sqlLower.includes('timestamp without time zone') ||
      sqlLower.includes('boolean') ||
      sqlLower.includes('text[]')) {
    return 'postgresql';
  }

  // SQL Server patterns
  if (sqlLower.includes('identity(') ||
      sqlLower.includes('nvarchar') ||
      sqlLower.includes('nchar') ||
      sqlLower.includes('datetime2') ||
      sqlLower.includes('uniqueidentifier') ||
      sqlLower.includes('[dbo]')) {
    return 'sqlserver';
  }

  // Oracle patterns
  if (sqlLower.includes('number(') ||
      sqlLower.includes('varchar2') ||
      sqlLower.includes('clob') ||
      sqlLower.includes('nclob') ||
      sqlLower.includes('raw(') ||
      sqlLower.includes('sysdate')) {
    return 'oracle';
  }

  // SQLite patterns
  if (sqlLower.includes('autoincrement') ||
      sqlLower.includes('integer primary key') ||
      sqlLower.includes('without rowid')) {
    return 'sqlite';
  }

  // Default to PostgreSQL as it's most common
  return 'postgresql';
}

/**
 * Basic validation of SQL content before sending to AI
 */
export function validateSqlContent(sql: string): { valid: boolean; error?: string } {
  const trimmed = sql.trim();

  if (!trimmed) {
    return { valid: false, error: 'The uploaded file is empty' };
  }

  if (trimmed.length < 20) {
    return { valid: false, error: 'The SQL content is too short to contain valid CREATE TABLE statements' };
  }

  const sqlLower = trimmed.toLowerCase();

  if (!sqlLower.includes('create table') && !sqlLower.includes('create ') && !sqlLower.includes('table ')) {
    return { valid: false, error: 'No CREATE TABLE statements found in the SQL file' };
  }

  return { valid: true };
}
