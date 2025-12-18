# AI Data Modeler - Complete Guide

> An AI-powered data modeling tool that transforms natural language descriptions into professional Entity-Relationship Diagrams (ERDs) using Groq's Llama 3.3 70B model.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Features](#features)
6. [Tech Stack](#tech-stack)
7. [Getting Started](#getting-started)
8. [Deployment](#deployment)
9. [Roadmap](#roadmap)
10. [Troubleshooting](#troubleshooting)

---

## Overview

AI Data Modeler is a modern web application that revolutionizes database design by allowing users to describe their data requirements in plain English. The AI interprets these descriptions and generates complete ERDs with:

- **Entities** (tables) with appropriate attributes
- **Relationships** with proper cardinality
- **Crow's Foot Notation** for professional visualization
- **Interactive Canvas** for visual editing

```mermaid
graph LR
    A[👤 User] -->|Describes database| B[🤖 AI Engine]
    B -->|Generates| C[📊 ERD Model]
    C -->|Renders| D[🎨 Interactive Canvas]
    D -->|Exports| E[📁 JSON/SQL]
```

### Key Capabilities

| Capability | Description |
|------------|-------------|
| Natural Language Input | Describe databases in plain English |
| AI-Powered Generation | Llama 3.3 70B via Groq API |
| Real-time Chat | Modify models conversationally |
| Visual Editor | Drag, pan, zoom entities |
| Auto-Layout | Smart entity positioning |
| Persistence | Auto-save to browser storage |

---

## Architecture

### High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client (Browser)"]
        UI[React UI Components]
        Context[Model Context]
        Canvas[SVG Canvas]
        Chat[Chat Panel]
    end

    subgraph Server["⚙️ Next.js Server"]
        API[API Routes]
        Generate["/api/generate"]
        ChatAPI["/api/chat"]
    end

    subgraph External["☁️ External Services"]
        Groq[Groq API]
        LLM[Llama 3.3 70B]
    end

    subgraph Storage["💾 Storage"]
        LocalStorage[Browser LocalStorage]
        Vercel[Vercel Platform]
    end

    UI --> Context
    Context --> Canvas
    Context --> Chat
    UI -->|HTTP POST| API
    Generate --> Groq
    ChatAPI --> Groq
    Groq --> LLM
    Context -->|Auto-save| LocalStorage
    Server -->|Deployed on| Vercel
```

### Component Architecture

```mermaid
flowchart TB
    subgraph Pages["📄 Pages"]
        Landing["/ (Landing)"]
        Workspace["/workspace"]
    end

    subgraph Components["🧩 Components"]
        subgraph CanvasComponents["Canvas"]
            DiagramCanvas
            EntityCard
            RelationshipLine
            CanvasToolbar
        end

        subgraph ChatComponents["Chat"]
            ChatPanel
            ChatMessage
            ChatInput
            SuggestionChips
        end
    end

    subgraph State["🔄 State Management"]
        ModelContext[ModelContext Provider]
    end

    subgraph API["🔌 API Layer"]
        GenerateRoute["/api/generate"]
        ChatRoute["/api/chat"]
    end

    Landing --> ModelContext
    Workspace --> ModelContext
    Workspace --> DiagramCanvas
    Workspace --> ChatPanel
    DiagramCanvas --> EntityCard
    DiagramCanvas --> RelationshipLine
    DiagramCanvas --> CanvasToolbar
    ChatPanel --> ChatMessage
    ChatPanel --> ChatInput
    ChatPanel --> SuggestionChips
    ModelContext --> API
```

---

## Core Components

### 1. Model Context (`src/context/ModelContext.tsx`)

The central state management hub using React Context API.

```mermaid
classDiagram
    class ModelContext {
        +DataModel model
        +string selectedEntityId
        +string selectedRelationshipId
        +boolean isGenerating
        +string error
        +setModel(model)
        +updateModel(updates)
        +addEntity(entity)
        +updateEntity(id, updates)
        +deleteEntity(id)
        +addRelationship(relationship)
        +saveToLocalStorage()
        +loadFromLocalStorage()
    }

    class DataModel {
        +string id
        +string name
        +Entity[] entities
        +Relationship[] relationships
        +DatabaseType targetDatabase
        +NotationType notation
    }

    class Entity {
        +string id
        +string name
        +number x, y
        +number width, height
        +Attribute[] attributes
        +EntityCategory category
    }

    class Relationship {
        +string id
        +RelationType type
        +string sourceEntityId
        +string targetEntityId
        +Cardinality sourceCardinality
        +Cardinality targetCardinality
    }

    ModelContext --> DataModel
    DataModel --> Entity
    DataModel --> Relationship
```

### 2. Diagram Canvas (`src/components/canvas/DiagramCanvas.tsx`)

SVG-based interactive canvas with pan, zoom, and drag capabilities.

| Feature | Implementation |
|---------|----------------|
| Zoom | Ctrl/Cmd + Scroll wheel (0.1x - 3x) |
| Pan | Hand tool + drag |
| Select | Click on entity/relationship |
| Move | Select tool + drag entity |
| Grid | Toggle-able 20px grid pattern |

### 3. Entity Card (`src/components/canvas/EntityCard.tsx`)

Visual representation of database tables.

```mermaid
flowchart TB
    subgraph EntityCard["Entity Card"]
        Header["🏷️ Header (Entity Name)"]
        Divider["───────────"]
        Attrs["📋 Attributes List"]
    end

    subgraph Attribute["Each Attribute"]
        PK["🔑 Primary Key Icon"]
        FK["🔗 Foreign Key Icon"]
        Name["Column Name"]
        Type["Data Type"]
    end

    EntityCard --> Attribute
```

### 4. Chat Panel (`src/components/chat/ChatPanel.tsx`)

Conversational interface for model modifications.

```mermaid
sequenceDiagram
    participant U as User
    participant CP as ChatPanel
    participant API as /api/chat
    participant AI as Groq/Llama
    participant MC as ModelContext

    U->>CP: Types modification request
    CP->>API: POST {message, currentModel}
    API->>AI: Stream request
    AI-->>API: Stream response chunks
    API-->>CP: SSE stream
    CP->>CP: Parse JSON changes
    CP->>MC: Apply model updates
    MC->>CP: Re-render canvas
```

---

## Data Flow

### Generation Flow

```mermaid
flowchart LR
    subgraph Input
        A[User Prompt]
    end

    subgraph Processing
        B["/api/generate"]
        C[Create System Prompt]
        D[Groq API Call]
        E[Parse JSON Response]
        F[Smart Auto-Layout]
    end

    subgraph Output
        G[DataModel Object]
        H[Canvas Render]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

### Chat Modification Flow

```mermaid
flowchart TB
    A[User Message] --> B{Message Type}

    B -->|Add Entity| C[Parse ADD command]
    B -->|Modify| D[Parse MODIFY command]
    B -->|Delete| E[Parse DELETE command]
    B -->|Question| F[Return explanation]

    C --> G[Update Model State]
    D --> G
    E --> G

    G --> H[Re-render Canvas]
    G --> I[Auto-save to LocalStorage]
```

### State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Empty: App Load
    Empty --> Loading: User submits prompt
    Loading --> Generated: API success
    Loading --> Error: API failure
    Generated --> Editing: User interacts
    Editing --> Generated: Changes applied
    Generated --> Saved: Auto-save (1s debounce)
    Saved --> Generated: Continue editing
    Generated --> Exported: User exports
    Exported --> Generated: Continue working
```

---

## Features

### Current Features

```mermaid
mindmap
    root((AI Data Modeler))
        Generation
            Natural Language Input
            AI-Powered ERD Creation
            Smart Auto-Layout
        Visualization
            Interactive SVG Canvas
            Crow's Foot Notation
            Pan & Zoom Controls
            Grid Toggle
        Editing
            Drag & Drop Entities
            Chat-based Modifications
            Real-time Updates
        Persistence
            Auto-save to LocalStorage
            JSON Export
            Model Reload
        UX
            Dark Theme
            Keyboard Shortcuts
            Example Prompts
            Loading States
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Select tool |
| `H` | Pan/Hand tool |
| `+` / `=` | Zoom in |
| `-` / `_` | Zoom out |
| `0` | Reset zoom |
| `Ctrl + Scroll` | Zoom |

### Entity Categories

```mermaid
graph LR
    subgraph Categories
        A[🟦 Standard] -->|Regular tables| A1[Users, Products]
        B[🟨 Lookup] -->|Reference data| B1[Status, Types]
        C[🟩 Junction] -->|Many-to-many| C1[OrderItems]
        D[🟪 View] -->|Virtual tables| D1[Reports]
    end
```

---

## Tech Stack

```mermaid
graph TB
    subgraph Frontend["Frontend"]
        Next[Next.js 14]
        React[React 18]
        TS[TypeScript]
        Tailwind[Tailwind CSS]
        Framer[Framer Motion]
        Lucide[Lucide Icons]
    end

    subgraph Backend["Backend"]
        NextAPI[Next.js API Routes]
        GroqSDK[Groq SDK]
    end

    subgraph AI["AI Layer"]
        Groq[Groq Cloud]
        Llama[Llama 3.3 70B]
    end

    subgraph Infra["Infrastructure"]
        Vercel[Vercel Platform]
        Edge[Edge Functions]
    end

    Frontend --> Backend
    Backend --> AI
    Frontend --> Infra
    Backend --> Infra
```

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.2.5 | React framework |
| react | ^18.3.1 | UI library |
| groq-sdk | ^0.5.0 | AI API client |
| framer-motion | ^11.0.0 | Animations |
| lucide-react | ^0.263.1 | Icons |
| uuid | ^9.0.0 | ID generation |
| tailwindcss | ^3.4.4 | Styling |
| typescript | ^5.5.3 | Type safety |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Groq API key (free at [console.groq.com](https://console.groq.com/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/pandeyraunak007/ai-data-modeler.git
cd ai-data-modeler

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your GROQ_API_KEY

# Start development server
npm run dev
```

### Environment Variables

```env
# Required
GROQ_API_KEY=gsk_your_api_key_here

# Optional (defaults shown)
# GROQ_MODEL=llama-3.3-70b-versatile
```

### Project Structure

```
ai-data-modeler/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── workspace/page.tsx    # Main workspace
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── api/
│   │       ├── generate/route.ts # ERD generation
│   │       └── chat/route.ts     # Chat modifications
│   ├── components/
│   │   ├── canvas/               # Canvas components
│   │   └── chat/                 # Chat components
│   ├── context/
│   │   └── ModelContext.tsx      # Global state
│   ├── lib/
│   │   ├── groq.ts               # Groq client
│   │   ├── autoLayout.ts         # Entity positioning
│   │   └── prompts/              # AI prompts
│   └── types/
│       ├── model.ts              # Data types
│       └── chat.ts               # Chat types
├── .env.local                    # Environment variables
├── package.json
└── tailwind.config.ts
```

---

## Deployment

### Vercel Deployment (Recommended)

```mermaid
flowchart LR
    A[Local Code] -->|git push| B[GitHub]
    B -->|Auto-deploy| C[Vercel]
    C -->|Build| D[Next.js Build]
    D -->|Deploy| E[Production URL]

    subgraph Vercel Config
        F[Environment Variables]
        G[GROQ_API_KEY]
    end

    F --> C
```

#### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   ```bash
   # Using Vercel CLI
   vercel --prod

   # Or connect via Vercel Dashboard
   # https://vercel.com/new
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add GROQ_API_KEY production
   ```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Roadmap

```mermaid
timeline
    title AI Data Modeler Roadmap

    section Phase 1 - Foundation
        Core Features : Natural language generation
                      : Interactive canvas
                      : Chat modifications
                      : JSON export

    section Phase 2 - Enhanced Export
        SQL Generation : PostgreSQL DDL
                       : MySQL DDL
                       : SQL Server DDL
        Format Support : PNG/SVG export
                       : PDF documentation

    section Phase 3 - Collaboration
        Multi-user : Real-time collaboration
                   : Share links
                   : Comments
        History    : Version control
                   : Undo/redo

    section Phase 4 - Advanced
        Import     : Reverse engineer from DB
                   : Import from SQL
        Templates  : Industry templates
                   : Custom patterns
```

### Planned Features

| Priority | Feature | Status |
|----------|---------|--------|
| High | SQL DDL export | Planned |
| High | PNG/SVG image export | Planned |
| Medium | Undo/Redo system | Planned |
| Medium | Entity color customization | Planned |
| Medium | Relationship labels | Planned |
| Low | Real-time collaboration | Future |
| Low | Database reverse engineering | Future |
| Low | Template library | Future |

---

## Troubleshooting

### Common Issues

#### 1. "AI service not configured" Error

```mermaid
flowchart TD
    A[Error: AI service not configured] --> B{Check .env.local}
    B -->|Missing| C[Add GROQ_API_KEY]
    B -->|Present| D{Valid key?}
    D -->|Invalid| E[Get new key from console.groq.com]
    D -->|Valid| F{Server restarted?}
    F -->|No| G[Restart: npm run dev]
    F -->|Yes| H[Check Vercel env vars]
```

**Solution:**
```bash
# Verify .env.local exists and contains
GROQ_API_KEY=gsk_your_actual_key_here

# Restart development server
npm run dev
```

#### 2. Canvas Not Rendering

| Symptom | Cause | Solution |
|---------|-------|----------|
| Blank canvas | No model loaded | Generate a model first |
| Entities off-screen | Pan offset | Press `0` to reset view |
| Relationships missing | Invalid entity IDs | Regenerate model |

#### 3. Chat Not Responding

**Check streaming connection:**
- Ensure no ad-blockers blocking SSE
- Check browser console for errors
- Verify API route is accessible

#### 4. LocalStorage Issues

```javascript
// Clear stored model (in browser console)
localStorage.removeItem('ai-data-modeler-model');

// Reload page
location.reload();
```

#### 5. Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Debug Mode

Enable verbose logging:
```typescript
// In src/lib/groq.ts
console.log('API Request:', messages);
console.log('API Response:', response);
```

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/pandeyraunak007/ai-data-modeler/issues)
- **Discussions**: Feature requests and questions

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with Next.js & Groq AI**

[Live Demo](https://ai-data-modeler.vercel.app) | [GitHub](https://github.com/pandeyraunak007/ai-data-modeler)

</div>
