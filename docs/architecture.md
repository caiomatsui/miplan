# Miplan - Technical Architecture

## Overview

| Attribute | Value |
|-----------|-------|
| **Project** | Miplan - Personal Kanban & Study Planner |
| **Type** | Single Page Application (SPA) |
| **Architecture** | Client-side only, no backend |
| **Target** | Desktop-first, responsive |

---

## Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Framework** | React | 18.x | Mature ecosystem, developer familiarity |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **State Management** | Zustand | 4.x | Simple, persist built-in, ~1KB |
| **Drag-and-Drop** | @dnd-kit | 6.x | Best a11y, performance, modular |
| **Storage** | Dexie.js | 4.x | IndexedDB simplified |
| **Styling** | Tailwind CSS | 3.x | Utility-first, auto purge |
| **Build Tool** | Vite | 5.x | Fast HMR, optimized bundles |
| **Deployment** | Vercel | - | Zero config, global CDN |

---

## Bundle Size Budget

| Library | Size (gzip) |
|---------|-------------|
| React + ReactDOM | ~45KB |
| Zustand | ~1KB |
| @dnd-kit (core + sortable) | ~15KB |
| Dexie.js | ~10KB |
| Application code | ~15KB |
| **Total** | **~86KB** |

*Note: Tailwind CSS is purged at build time, adds no runtime cost*

**Target:** < 100KB gzipped for fast initial load

---

## Project Structure

```
miplan/
├── public/
│   ├── favicon.ico
│   └── manifest.json              # PWA manifest
├── src/
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx          # Board container with DnD context
│   │   │   ├── Column.tsx         # Droppable column
│   │   │   ├── ColumnHeader.tsx   # Editable column title
│   │   │   └── AddColumn.tsx      # Add new column button
│   │   ├── Task/
│   │   │   ├── TaskCard.tsx       # Draggable task card
│   │   │   ├── TaskTitle.tsx      # Inline editable title
│   │   │   ├── TaskDescription.tsx # Expandable description
│   │   │   ├── TaskTimer.tsx      # Play/pause timer UI
│   │   │   └── TaskActions.tsx    # Delete, favorite actions
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx        # Sidebar container
│   │   │   ├── BoardList.tsx      # List of boards
│   │   │   └── BoardItem.tsx      # Clickable board item
│   │   ├── Import/
│   │   │   ├── ImportModal.tsx    # Import modal container
│   │   │   ├── FileDropzone.tsx   # File drag-and-drop area
│   │   │   └── ImportPreview.tsx  # Preview before import
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Input.tsx
│   │       └── ConfirmDialog.tsx
│   ├── hooks/
│   │   ├── useBoard.ts            # Board CRUD operations
│   │   ├── useTasks.ts            # Task CRUD operations
│   │   ├── useColumns.ts          # Column CRUD operations
│   │   ├── useTimer.ts            # Timer logic
│   │   ├── useDragAndDrop.ts      # @dnd-kit setup
│   │   └── useKeyboardShortcuts.ts # Global shortcuts
│   ├── store/
│   │   ├── index.ts               # Main Zustand store
│   │   ├── boardSlice.ts          # Board state slice
│   │   ├── taskSlice.ts           # Task state slice
│   │   └── uiSlice.ts             # UI state (modals, sidebar)
│   ├── db/
│   │   ├── index.ts               # Dexie database instance
│   │   ├── schema.ts              # Table schemas
│   │   └── migrations.ts          # Version migrations
│   ├── utils/
│   │   ├── url.ts                 # URL detection utilities
│   │   ├── import.ts              # .txt file parser
│   │   ├── time.ts                # Time formatting (HH:MM:SS)
│   │   └── id.ts                  # ID generation (nanoid)
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── constants/
│   │   └── boardTemplates.ts      # Kanban & Study Planner templates
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind imports
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Data Models

### TypeScript Definitions

```typescript
// src/types/index.ts

export interface Task {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  timeSpent: number;           // in seconds
  timerStartedAt: number | null; // timestamp if active
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Board {
  id: string;
  name: string;
  type: 'kanban' | 'study-planner';
  createdAt: number;
  updatedAt: number;
}

export type BoardTemplate = {
  type: Board['type'];
  name: string;
  columns: string[];
};
```

### Entity Relationships

```
Board (1) ────── (N) Column (1) ────── (N) Task
  │                    │                   │
  ├─ id (PK)          ├─ id (PK)          ├─ id (PK)
  ├─ name             ├─ boardId (FK)     ├─ boardId (FK)
  ├─ type             ├─ title            ├─ columnId (FK)
  ├─ createdAt        └─ order            ├─ title
  └─ updatedAt                            ├─ description
                                          ├─ order
                                          ├─ timeSpent
                                          ├─ timerStartedAt
                                          ├─ createdAt
                                          └─ updatedAt
```

---

## Database Layer (Dexie.js)

### Schema Definition

```typescript
// src/db/index.ts

import Dexie, { Table } from 'dexie';
import { Board, Column, Task } from '../types';

export class MiplanDB extends Dexie {
  boards!: Table<Board>;
  columns!: Table<Column>;
  tasks!: Table<Task>;

  constructor() {
    super('miplan');

    this.version(1).stores({
      boards: 'id, type, createdAt',
      columns: 'id, boardId, order',
      tasks: 'id, boardId, columnId, order, createdAt'
    });
  }
}

export const db = new MiplanDB();
```

### Database Operations

```typescript
// Example CRUD operations

// Create board with columns
async function createBoard(name: string, type: Board['type']) {
  const boardId = nanoid();
  const template = BOARD_TEMPLATES[type];

  await db.transaction('rw', db.boards, db.columns, async () => {
    await db.boards.add({
      id: boardId,
      name,
      type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const columns = template.columns.map((title, index) => ({
      id: nanoid(),
      boardId,
      title,
      order: index,
    }));

    await db.columns.bulkAdd(columns);
  });

  return boardId;
}

// Get board with columns and tasks
async function getBoardData(boardId: string) {
  const [board, columns, tasks] = await Promise.all([
    db.boards.get(boardId),
    db.columns.where('boardId').equals(boardId).sortBy('order'),
    db.tasks.where('boardId').equals(boardId).toArray(),
  ]);

  return { board, columns, tasks };
}
```

---

## State Management (Zustand)

### Store Structure

```typescript
// src/store/index.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  activeBoardId: string | null;
  activeTimerTaskId: string | null;
  sidebarOpen: boolean;
  importModalOpen: boolean;
}

interface UIActions {
  setActiveBoard: (id: string) => void;
  toggleSidebar: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
}

type AppStore = UIState & UIActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // State
      activeBoardId: null,
      activeTimerTaskId: null,
      sidebarOpen: true,
      importModalOpen: false,

      // Actions
      setActiveBoard: (id) => set({ activeBoardId: id }),

      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),

      openImportModal: () => set({ importModalOpen: true }),
      closeImportModal: () => set({ importModalOpen: false }),

      startTimer: (taskId) => {
        const current = get().activeTimerTaskId;
        if (current && current !== taskId) {
          // Stop previous timer before starting new one
          // (handled by task update logic)
        }
        set({ activeTimerTaskId: taskId });
      },

      stopTimer: () => set({ activeTimerTaskId: null }),
    }),
    {
      name: 'miplan-ui',
      partialize: (state) => ({
        activeBoardId: state.activeBoardId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Zustand Store (UI State)                │    │
│  │  - activeBoardId                                     │    │
│  │  - activeTimerTaskId                                 │    │
│  │  - sidebarOpen                                       │    │
│  │  - importModalOpen                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Custom Hooks (Data Layer)               │    │
│  │  - useBoard()  → Dexie queries                       │    │
│  │  - useTasks()  → Dexie queries                       │    │
│  │  - useTimer()  → Timer logic                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Dexie.js (IndexedDB)                    │    │
│  │  - boards table                                      │    │
│  │  - columns table                                     │    │
│  │  - tasks table                                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (optional - board name, import button)              │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│   Sidebar   │                 Board                         │
│             │                                               │
│  ┌───────┐  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ Board │  │  │ Column │ │ Column │ │ Column │ │  Add   │ │
│  │ List  │  │  │        │ │        │ │        │ │ Column │ │
│  │       │  │  │┌──────┐│ │┌──────┐│ │┌──────┐│ │        │ │
│  │ - Bd1 │  │  ││ Task ││ ││ Task ││ ││ Task ││ │   +    │ │
│  │ - Bd2 │  │  │└──────┘│ │└──────┘│ │└──────┘│ │        │ │
│  │       │  │  │┌──────┐│ │┌──────┐│ │        │ │        │ │
│  │ + New │  │  ││ Task ││ ││ Task ││ │ + Add  │ │        │ │
│  │       │  │  │└──────┘│ │└──────┘│ │  Task  │ │        │ │
│  └───────┘  │  │ + Add  │ │ + Add  │ │        │ │        │ │
│             │  │  Task  │ │  Task  │ │        │ │        │ │
│             │  └────────┘ └────────┘ └────────┘ └────────┘ │
└─────────────┴───────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Sidebar
│   ├── BoardList
│   │   └── BoardItem (multiple)
│   └── AddBoardButton
├── Board
│   ├── DndContext (@dnd-kit)
│   │   ├── SortableContext (columns)
│   │   │   └── Column (multiple)
│   │   │       ├── ColumnHeader
│   │   │       ├── SortableContext (tasks)
│   │   │       │   └── TaskCard (multiple)
│   │   │       │       ├── TaskTitle
│   │   │       │       ├── TaskTimer
│   │   │       │       └── TaskActions
│   │   │       └── AddTaskButton
│   │   └── AddColumnButton
│   └── DragOverlay
└── ImportModal (portal)
    ├── FileDropzone
    └── ImportPreview
```

---

## Drag-and-Drop Implementation

### @dnd-kit Setup

```typescript
// src/hooks/useDragAndDrop.ts

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

export const useDragSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
};

// Collision detection for cross-column moves
export const collisionDetection = closestCorners;
```

### Drag Event Handlers

```typescript
// In Board.tsx

const handleDragStart = (event: DragStartEvent) => {
  const { active } = event;
  setActiveId(active.id as string);
  setActiveType(active.data.current?.type); // 'task' or 'column'
};

const handleDragOver = (event: DragOverEvent) => {
  const { active, over } = event;
  if (!over) return;

  // Handle cross-column task movement
  if (active.data.current?.type === 'task') {
    const activeColumnId = active.data.current.columnId;
    const overColumnId = over.data.current?.columnId || over.id;

    if (activeColumnId !== overColumnId) {
      // Move task to new column (optimistic update)
      moveTaskToColumn(active.id, overColumnId);
    }
  }
};

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  setActiveId(null);

  if (!over) return;

  if (active.id !== over.id) {
    // Reorder within same container
    reorderItem(active.id, over.id);
  }

  // Persist to IndexedDB
  persistChanges();
};
```

---

## Utility Functions

### URL Detection

```typescript
// src/utils/url.ts

const URL_REGEX = /https?:\/\/[^\s<>\"']+|www\.[^\s<>\"']+/gi;

export const detectUrls = (text: string): string[] => {
  return text.match(URL_REGEX) || [];
};

export const hasUrl = (text: string): boolean => {
  return URL_REGEX.test(text);
};

export const normalizeUrl = (url: string): string => {
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  return url;
};
```

### Text Import Parser

```typescript
// src/utils/import.ts

export interface ParsedLine {
  title: string;
  hasUrl: boolean;
}

export const parseTextFile = (content: string): ParsedLine[] => {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => ({
      title: line,
      hasUrl: hasUrl(line),
    }));
};

export const createTasksFromParsed = (
  parsed: ParsedLine[],
  boardId: string,
  columnId: string,
  startOrder: number
): Omit<Task, 'id'>[] => {
  return parsed.map((item, index) => ({
    boardId,
    columnId,
    title: item.title,
    description: '',
    order: startOrder + index,
    timeSpent: 0,
    timerStartedAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
};
```

### Time Formatting

```typescript
// src/utils/time.ts

export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
};

export const calculateElapsedTime = (
  timeSpent: number,
  timerStartedAt: number | null
): number => {
  if (!timerStartedAt) return timeSpent;
  const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
  return timeSpent + elapsed;
};
```

---

## Board Templates

```typescript
// src/constants/boardTemplates.ts

import { BoardTemplate } from '../types';

export const BOARD_TEMPLATES: Record<string, BoardTemplate> = {
  kanban: {
    type: 'kanban',
    name: 'Kanban Board',
    columns: ['To Do', 'In Progress', 'Done'],
  },
  'study-planner': {
    type: 'study-planner',
    name: 'Study Planner',
    columns: [
      'Planejamento',
      'Seg',
      'Ter',
      'Qua',
      'Qui',
      'Sex',
      'Sab',
      'Dom',
      'Finalizado',
      'Favoritos',
    ],
  },
};

export const getDefaultColumns = (type: Board['type']): string[] => {
  return BOARD_TEMPLATES[type]?.columns || BOARD_TEMPLATES.kanban.columns;
};
```

---

## Keyboard Shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| `N` | Create new task in first column | Board |
| `T` | Toggle timer on selected task | Task selected |
| `E` | Edit selected task | Task selected |
| `Delete` / `Backspace` | Delete selected task | Task selected |
| `Escape` | Close modal / Cancel edit | Global |
| `Ctrl+I` / `Cmd+I` | Open import modal | Global |
| `Ctrl+B` / `Cmd+B` | Toggle sidebar | Global |
| `Arrow keys` | Navigate between tasks | Board |

### Implementation

```typescript
// src/hooks/useKeyboardShortcuts.ts

import { useEffect } from 'react';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          createNewTask();
          break;
        case 't':
          toggleTimer();
          break;
        case 'e':
          editSelectedTask();
          break;
        case 'delete':
        case 'backspace':
          deleteSelectedTask();
          break;
        case 'escape':
          closeActiveModal();
          break;
        case 'i':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            openImportModal();
          }
          break;
        case 'b':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleSidebar();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

---

## Performance Optimizations

### React Optimizations

| Technique | Where Applied |
|-----------|---------------|
| `React.memo` | TaskCard, Column, BoardItem |
| `useMemo` | Filtered/sorted lists, computed values |
| `useCallback` | Event handlers passed as props |
| `React.lazy` | ImportModal (code splitting) |

### Rendering Optimizations

```typescript
// Memoized TaskCard
export const TaskCard = React.memo(({ task, onUpdate, onDelete }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison for shallow equality
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.updatedAt === nextProps.task.updatedAt;
});

// Virtualization for large lists (if needed)
// Using @tanstack/react-virtual for 100+ items
```

### Storage Optimizations

```typescript
// Debounced auto-save
const debouncedSave = useMemo(
  () => debounce((data) => db.tasks.put(data), 300),
  []
);

// Batch updates for bulk operations
await db.transaction('rw', db.tasks, async () => {
  for (const task of tasks) {
    await db.tasks.put(task);
  }
});
```

---

## PWA Configuration

### Manifest

```json
// public/manifest.json
{
  "name": "Miplan",
  "short_name": "Miplan",
  "description": "Personal Kanban & Study Planner",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker (Vite PWA Plugin)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
```

---

## Testing Strategy

### Unit Tests (Vitest)

| Area | Coverage Target |
|------|-----------------|
| Utils (url, import, time) | 100% |
| Store actions | 90% |
| Custom hooks | 80% |

### Integration Tests

| Flow | Priority |
|------|----------|
| Create board with columns | High |
| Drag task between columns | High |
| Import from .txt | High |
| Timer start/stop/persist | Medium |

### E2E Tests (Playwright) - Future

| Scenario | Priority |
|----------|----------|
| Full user flow | Medium |
| Offline functionality | Low |

---

## Deployment

### Vercel Configuration

```json
// vercel.json (optional)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Deploy Commands

```bash
# Initial deploy
npx vercel

# Production deploy
npx vercel --prod

# Or connect GitHub for auto-deploy
```

### Environment Variables

None required for MVP (no backend).

---

## Future Considerations

### Potential Backend Migration

If sync/collaboration needed:

| Component | Current | Future |
|-----------|---------|--------|
| Auth | None | Supabase Auth |
| Database | IndexedDB | Supabase PostgreSQL |
| Sync | None | Supabase Realtime |
| Storage | Local | Keep local + sync |

### Migration Path

1. Add Supabase client
2. Create remote tables matching local schema
3. Implement sync layer (conflict resolution)
4. Keep IndexedDB as offline cache

---

## Dependencies

### Production

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "zustand": "^4.5.0",
  "dexie": "^4.0.0",
  "dexie-react-hooks": "^1.1.7",
  "nanoid": "^5.0.0"
}
```

### Development

```json
{
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0"
}
```

---

## Quick Start

```bash
# Create project
npm create vite@latest miplan -- --template react-ts

# Install dependencies
cd miplan
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install zustand dexie dexie-react-hooks nanoid
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p

# Start development
npm run dev
```

---

*Synkra AIOS - Architecture by Aria (Architect Agent)*
*Version: 1.0.0 | Date: 2026-01-31*
