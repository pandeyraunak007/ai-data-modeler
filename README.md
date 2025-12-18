# AI Data Modeler

An AI-powered data modeling tool inspired by ERwin. Describe your database in natural language and generate professional ER diagrams with entities, relationships, and Crow's foot notation.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Groq API (Llama 3.3 70B)

## Features

- **AI-First Workflow** - Describe your database in plain English, AI generates the complete ERD
- **Interactive Canvas** - SVG-based diagram with pan, zoom, and drag-to-move entities
- **Crow's Foot Notation** - Professional relationship visualization with cardinality markers
- **Persistent Chat** - Modify your model via natural language commands
- **Local Storage** - Auto-saves to browser storage
- **Export** - Download your model as JSON

## Quick Start

### 1. Clone and Install

```bash
cd ai-data-modeler
npm install
```

### 2. Configure Groq API

Get a free API key from [Groq Console](https://console.groq.com/keys).

Edit `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Generate a Model

1. Enter a description like: *"Create an e-commerce database with users, products, orders, and reviews"*
2. Click "Generate ERD"
3. The AI creates entities, attributes, and relationships

### Modify via Chat

Use the chat panel to:
- *"Add a status field to users"*
- *"Create a relationship between orders and products"*
- *"Remove the phone column"*
- *"Add audit fields to all entities"*

### Canvas Controls

| Action | Control |
|--------|---------|
| Pan | Click + drag (with Hand tool) |
| Zoom | Scroll wheel (Ctrl/Cmd + scroll) |
| Select | Click entity/relationship |
| Move | Drag entity (with Select tool) |
| Toggle Grid | Click grid button |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select tool |
| H | Pan tool |
| + / - | Zoom in/out |
| 0 | Reset zoom |

## Project Structure

```
ai-data-modeler/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── workspace/page.tsx    # Main workspace
│   │   └── api/
│   │       ├── generate/route.ts # ERD generation API
│   │       └── chat/route.ts     # Chat modifications API
│   ├── components/
│   │   ├── canvas/               # Canvas components
│   │   │   ├── DiagramCanvas.tsx
│   │   │   ├── EntityCard.tsx
│   │   │   ├── RelationshipLine.tsx
│   │   │   └── CanvasToolbar.tsx
│   │   └── chat/                 # Chat components
│   │       ├── ChatPanel.tsx
│   │       ├── ChatMessage.tsx
│   │       └── ChatInput.tsx
│   ├── context/
│   │   └── ModelContext.tsx      # Global state
│   ├── lib/
│   │   ├── groq.ts               # Groq API client
│   │   ├── prompts/              # AI prompts
│   │   └── autoLayout.ts         # Entity positioning
│   └── types/
│       ├── model.ts              # Data types
│       └── chat.ts               # Chat types
├── .env.local                    # Environment variables
└── package.json
```

## Data Model Types

```typescript
interface Entity {
  id: string;
  name: string;
  x: number;
  y: number;
  attributes: Attribute[];
  category: 'standard' | 'lookup' | 'junction';
}

interface Attribute {
  name: string;
  type: string;           // VARCHAR(255), INT, etc.
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isRequired: boolean;
}

interface Relationship {
  type: 'identifying' | 'non-identifying';
  sourceEntityId: string;
  targetEntityId: string;
  sourceCardinality: '1' | 'M' | '0..1' | '1..M' | '0..M';
  targetCardinality: '1' | 'M' | '0..1' | '1..M' | '0..M';
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate ERD from prompt |
| `/api/chat` | POST | Process chat commands (streaming) |

## License

MIT
