// DDL (Data Definition Language) Generator
// Converts DataModel to SQL CREATE statements for various databases

import { DataModel, Entity, Attribute, Relationship, DatabaseType } from '@/types/model';

export interface DDLOptions {
  includeDropStatements: boolean;
  includeComments: boolean;
  includeForeignKeys: boolean;
  includeIndexes: boolean;
  schemaName?: string;
}

const DEFAULT_OPTIONS: DDLOptions = {
  includeDropStatements: false,
  includeComments: true,
  includeForeignKeys: true,
  includeIndexes: true,
};

// Type mapping for different databases
const TYPE_MAPPINGS: Record<DatabaseType, Record<string, string>> = {
  postgresql: {
    'INT': 'INTEGER',
    'VARCHAR': 'VARCHAR',
    'TEXT': 'TEXT',
    'BOOLEAN': 'BOOLEAN',
    'DATE': 'DATE',
    'DATETIME': 'TIMESTAMP',
    'TIMESTAMP': 'TIMESTAMP',
    'DECIMAL': 'DECIMAL',
    'FLOAT': 'REAL',
    'DOUBLE': 'DOUBLE PRECISION',
    'BLOB': 'BYTEA',
    'JSON': 'JSONB',
  },
  mysql: {
    'INT': 'INT',
    'INTEGER': 'INT',
    'VARCHAR': 'VARCHAR',
    'TEXT': 'TEXT',
    'BOOLEAN': 'TINYINT(1)',
    'DATE': 'DATE',
    'DATETIME': 'DATETIME',
    'TIMESTAMP': 'TIMESTAMP',
    'DECIMAL': 'DECIMAL',
    'FLOAT': 'FLOAT',
    'DOUBLE': 'DOUBLE',
    'BLOB': 'BLOB',
    'JSON': 'JSON',
    'BYTEA': 'BLOB',
    'JSONB': 'JSON',
  },
  sqlserver: {
    'INT': 'INT',
    'INTEGER': 'INT',
    'VARCHAR': 'NVARCHAR',
    'TEXT': 'NVARCHAR(MAX)',
    'BOOLEAN': 'BIT',
    'DATE': 'DATE',
    'DATETIME': 'DATETIME2',
    'TIMESTAMP': 'DATETIME2',
    'DECIMAL': 'DECIMAL',
    'FLOAT': 'FLOAT',
    'DOUBLE': 'FLOAT',
    'BLOB': 'VARBINARY(MAX)',
    'JSON': 'NVARCHAR(MAX)',
    'BYTEA': 'VARBINARY(MAX)',
    'JSONB': 'NVARCHAR(MAX)',
    'REAL': 'REAL',
  },
  oracle: {
    'INT': 'NUMBER(10)',
    'INTEGER': 'NUMBER(10)',
    'VARCHAR': 'VARCHAR2',
    'TEXT': 'CLOB',
    'BOOLEAN': 'NUMBER(1)',
    'DATE': 'DATE',
    'DATETIME': 'TIMESTAMP',
    'TIMESTAMP': 'TIMESTAMP',
    'DECIMAL': 'NUMBER',
    'FLOAT': 'FLOAT',
    'DOUBLE': 'BINARY_DOUBLE',
    'BLOB': 'BLOB',
    'JSON': 'CLOB',
    'BYTEA': 'BLOB',
    'JSONB': 'CLOB',
  },
  sqlite: {
    'INT': 'INTEGER',
    'INTEGER': 'INTEGER',
    'VARCHAR': 'TEXT',
    'TEXT': 'TEXT',
    'BOOLEAN': 'INTEGER',
    'DATE': 'TEXT',
    'DATETIME': 'TEXT',
    'TIMESTAMP': 'TEXT',
    'DECIMAL': 'REAL',
    'FLOAT': 'REAL',
    'DOUBLE': 'REAL',
    'BLOB': 'BLOB',
    'JSON': 'TEXT',
    'BYTEA': 'BLOB',
    'JSONB': 'TEXT',
  },
};

// Convert type to target database type
function convertType(type: string, targetDb: DatabaseType): string {
  const upperType = type.toUpperCase();
  const mapping = TYPE_MAPPINGS[targetDb];

  // Check for exact match first
  if (mapping[upperType]) {
    return mapping[upperType];
  }

  // Check for type with parameters (e.g., VARCHAR(255))
  const baseType = upperType.split('(')[0];
  if (mapping[baseType]) {
    const params = type.match(/\(.*\)/);
    return mapping[baseType] + (params ? params[0] : '');
  }

  // Return original type if no mapping found
  return type;
}

// Get table name (use physicalName or convert name to snake_case)
function getTableName(entity: Entity, schemaName?: string): string {
  const tableName = entity.physicalName || entity.name.toLowerCase().replace(/\s+/g, '_');
  return schemaName ? `${schemaName}.${tableName}` : tableName;
}

// Get column name
function getColumnName(attr: Attribute): string {
  return attr.name.toLowerCase().replace(/\s+/g, '_');
}

// Quote identifier based on database
function quoteIdentifier(name: string, targetDb: DatabaseType): string {
  switch (targetDb) {
    case 'mysql':
      return `\`${name}\``;
    case 'sqlserver':
      return `[${name}]`;
    case 'postgresql':
    case 'oracle':
    case 'sqlite':
    default:
      return `"${name}"`;
  }
}

// Generate column definition
function generateColumnDef(
  attr: Attribute,
  targetDb: DatabaseType,
  options: DDLOptions
): string {
  const parts: string[] = [];

  const columnName = getColumnName(attr);
  parts.push(`  ${quoteIdentifier(columnName, targetDb)}`);

  // Type
  parts.push(convertType(attr.type, targetDb));

  // NOT NULL
  if (attr.isRequired && !attr.isPrimaryKey) {
    parts.push('NOT NULL');
  }

  // PRIMARY KEY (inline for SQLite)
  if (attr.isPrimaryKey && targetDb === 'sqlite') {
    parts.push('PRIMARY KEY');
    if (attr.type.toUpperCase().includes('INT')) {
      parts.push('AUTOINCREMENT');
    }
  }

  // UNIQUE
  if (attr.isUnique && !attr.isPrimaryKey) {
    parts.push('UNIQUE');
  }

  // DEFAULT
  if (attr.defaultValue) {
    parts.push(`DEFAULT ${attr.defaultValue}`);
  }

  return parts.join(' ');
}

// Generate CREATE TABLE statement
function generateCreateTable(
  entity: Entity,
  targetDb: DatabaseType,
  options: DDLOptions
): string {
  const lines: string[] = [];
  const tableName = getTableName(entity, options.schemaName);
  const quotedTableName = quoteIdentifier(tableName, targetDb);

  // Comment
  if (options.includeComments && entity.description) {
    lines.push(`-- ${entity.description}`);
  }

  // DROP TABLE
  if (options.includeDropStatements) {
    switch (targetDb) {
      case 'postgresql':
      case 'mysql':
      case 'sqlite':
        lines.push(`DROP TABLE IF EXISTS ${quotedTableName};`);
        break;
      case 'sqlserver':
        lines.push(`IF OBJECT_ID('${tableName}', 'U') IS NOT NULL DROP TABLE ${quotedTableName};`);
        break;
      case 'oracle':
        lines.push(`BEGIN EXECUTE IMMEDIATE 'DROP TABLE ${tableName}'; EXCEPTION WHEN OTHERS THEN NULL; END;`);
        lines.push('/');
        break;
    }
    lines.push('');
  }

  // CREATE TABLE
  lines.push(`CREATE TABLE ${quotedTableName} (`);

  // Columns
  const columnDefs: string[] = entity.attributes.map(attr =>
    generateColumnDef(attr, targetDb, options)
  );

  // Primary Key constraint (for non-SQLite)
  const pkColumns = entity.attributes.filter(a => a.isPrimaryKey);
  if (pkColumns.length > 0 && targetDb !== 'sqlite') {
    const pkColumnNames = pkColumns.map(a => quoteIdentifier(getColumnName(a), targetDb)).join(', ');
    columnDefs.push(`  PRIMARY KEY (${pkColumnNames})`);
  }

  lines.push(columnDefs.join(',\n'));
  lines.push(');');

  // Add table comment for PostgreSQL
  if (options.includeComments && entity.description && targetDb === 'postgresql') {
    lines.push(`COMMENT ON TABLE ${quotedTableName} IS '${entity.description.replace(/'/g, "''")}';`);
  }

  // Add column comments for PostgreSQL
  if (options.includeComments && targetDb === 'postgresql') {
    entity.attributes.forEach(attr => {
      if (attr.description) {
        const columnName = quoteIdentifier(getColumnName(attr), targetDb);
        lines.push(`COMMENT ON COLUMN ${quotedTableName}.${columnName} IS '${attr.description.replace(/'/g, "''")}';`);
      }
    });
  }

  return lines.join('\n');
}

// Generate foreign key constraints
function generateForeignKeys(
  model: DataModel,
  targetDb: DatabaseType,
  options: DDLOptions
): string {
  if (!options.includeForeignKeys) return '';

  const lines: string[] = [];

  model.relationships.forEach((rel, index) => {
    const sourceEntity = model.entities.find(e => e.id === rel.sourceEntityId);
    const targetEntity = model.entities.find(e => e.id === rel.targetEntityId);

    if (!sourceEntity || !targetEntity) return;

    const sourceTable = getTableName(sourceEntity, options.schemaName);
    const targetTable = getTableName(targetEntity, options.schemaName);

    // Find FK column in source entity
    const fkAttr = sourceEntity.attributes.find(a => a.isForeignKey);
    // Find PK column in target entity
    const pkAttr = targetEntity.attributes.find(a => a.isPrimaryKey);

    if (!fkAttr || !pkAttr) return;

    const constraintName = `fk_${sourceEntity.name.toLowerCase()}_${targetEntity.name.toLowerCase()}_${index + 1}`.replace(/\s+/g, '_');
    const sourceColumn = quoteIdentifier(getColumnName(fkAttr), targetDb);
    const targetColumn = quoteIdentifier(getColumnName(pkAttr), targetDb);

    const quotedSourceTable = quoteIdentifier(sourceTable, targetDb);
    const quotedTargetTable = quoteIdentifier(targetTable, targetDb);

    lines.push(`ALTER TABLE ${quotedSourceTable}`);
    lines.push(`  ADD CONSTRAINT ${quoteIdentifier(constraintName, targetDb)}`);
    lines.push(`  FOREIGN KEY (${sourceColumn})`);
    lines.push(`  REFERENCES ${quotedTargetTable} (${targetColumn});`);
    lines.push('');
  });

  return lines.join('\n');
}

// Generate indexes
function generateIndexes(
  model: DataModel,
  targetDb: DatabaseType,
  options: DDLOptions
): string {
  if (!options.includeIndexes) return '';

  const lines: string[] = [];

  model.entities.forEach(entity => {
    const tableName = getTableName(entity, options.schemaName);

    entity.attributes.forEach(attr => {
      if (attr.isIndexed && !attr.isPrimaryKey && !attr.isUnique) {
        const indexName = `idx_${entity.name.toLowerCase()}_${attr.name.toLowerCase()}`.replace(/\s+/g, '_');
        const columnName = quoteIdentifier(getColumnName(attr), targetDb);
        const quotedTableName = quoteIdentifier(tableName, targetDb);

        lines.push(`CREATE INDEX ${quoteIdentifier(indexName, targetDb)} ON ${quotedTableName} (${columnName});`);
      }
    });
  });

  return lines.join('\n');
}

// Main DDL generation function
export function generateDDL(
  model: DataModel,
  targetDb: DatabaseType = 'postgresql',
  options: Partial<DDLOptions> = {}
): string {
  const opts: DDLOptions = { ...DEFAULT_OPTIONS, ...options };
  const lines: string[] = [];

  // Header comment
  lines.push('-- ============================================');
  lines.push(`-- DDL Generated by AI Data Modeler`);
  lines.push(`-- Model: ${model.name}`);
  lines.push(`-- Database: ${targetDb.toUpperCase()}`);
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('-- ============================================');
  lines.push('');

  // Schema creation (if specified)
  if (opts.schemaName) {
    switch (targetDb) {
      case 'postgresql':
        lines.push(`CREATE SCHEMA IF NOT EXISTS ${opts.schemaName};`);
        break;
      case 'sqlserver':
        lines.push(`IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = '${opts.schemaName}')`);
        lines.push(`  EXEC('CREATE SCHEMA ${opts.schemaName}');`);
        lines.push('GO');
        break;
      case 'mysql':
        lines.push(`CREATE DATABASE IF NOT EXISTS ${opts.schemaName};`);
        lines.push(`USE ${opts.schemaName};`);
        break;
    }
    lines.push('');
  }

  // Sort entities to handle dependencies (entities without FK first)
  const sortedEntities = [...model.entities].sort((a, b) => {
    const aHasFK = a.attributes.some(attr => attr.isForeignKey);
    const bHasFK = b.attributes.some(attr => attr.isForeignKey);
    if (aHasFK && !bHasFK) return 1;
    if (!aHasFK && bHasFK) return -1;
    return 0;
  });

  // Generate CREATE TABLE statements
  lines.push('-- ============================================');
  lines.push('-- Tables');
  lines.push('-- ============================================');
  lines.push('');

  sortedEntities.forEach(entity => {
    lines.push(generateCreateTable(entity, targetDb, opts));
    lines.push('');
  });

  // Generate foreign key constraints
  if (opts.includeForeignKeys && model.relationships.length > 0) {
    lines.push('-- ============================================');
    lines.push('-- Foreign Key Constraints');
    lines.push('-- ============================================');
    lines.push('');
    lines.push(generateForeignKeys(model, targetDb, opts));
  }

  // Generate indexes
  const indexDDL = generateIndexes(model, targetDb, opts);
  if (opts.includeIndexes && indexDDL) {
    lines.push('-- ============================================');
    lines.push('-- Indexes');
    lines.push('-- ============================================');
    lines.push('');
    lines.push(indexDDL);
  }

  return lines.join('\n');
}

// Database display names
export const DATABASE_NAMES: Record<DatabaseType, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  sqlserver: 'SQL Server',
  oracle: 'Oracle',
  sqlite: 'SQLite',
};
