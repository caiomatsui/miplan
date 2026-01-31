# Miplan Product Requirements Document (PRD)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-31 | 0.1 | Initial PRD draft | Morgan (PM) |
| 2026-01-31 | 0.2 | Stories expanded by SM (11→14), technical context added | River (SM) |

---

## Goals

- Permitir criação, edição e movimentação de tasks entre colunas estilo Kanban
- Oferecer time tracking individual por task
- Possibilitar importação em massa de tasks via arquivo .txt (uma linha = uma task)
- Suportar múltiplos tipos de board (Kanban tradicional e Study Planner)
- Permitir customização completa de boards e colunas

## Background Context

Miplan surge da necessidade de uma ferramenta de planejamento pessoal que combine a simplicidade do Trello com funcionalidades específicas para planejamento de estudos. O usuário coleta links interessantes durante a semana em arquivos .txt e precisa de uma forma eficiente de importá-los e distribuí-los ao longo dos dias da semana seguinte. Ferramentas existentes como Trello não oferecem importação direta de arquivos de texto nem boards pré-configurados para planejamento semanal de estudos.

### Competitive Intelligence Summary

**Oportunidades de Diferenciação:**
1. **Import .txt nativo** - Nenhum concorrente oferece isso de forma simples
2. **Performance** - Trello está lento após redesign 2025
3. **Study Planner board** - Nicho não atendido por task managers genéricos
4. **Time tracking nativo** - Trello não tem, Todoist depende de integrações
5. **UX limpa e simples** - O oposto do novo Trello "cluttered"

---

## Requirements

### Functional Requirements

| ID | Requisito |
|----|-----------|
| **FR1** | O sistema deve permitir criar, editar (título e descrição) e excluir tasks |
| **FR2** | O sistema deve permitir arrastar e soltar tasks entre colunas (drag-and-drop) |
| **FR3** | O sistema deve suportar múltiplos boards com tipos diferentes (Kanban, Study Planner) |
| **FR4** | O sistema deve permitir criar, renomear, reordenar e excluir colunas |
| **FR5** | O sistema deve oferecer importação de tasks via arquivo .txt (uma linha = uma task) |
| **FR6** | O sistema deve detectar URLs no texto importado e exibi-los como links clicáveis |
| **FR7** | O sistema deve permitir time tracking por task (iniciar/parar cronômetro) |
| **FR8** | O sistema deve exibir tempo total acumulado por task |
| **FR9** | O board Study Planner deve ter colunas pré-configuradas: Planejamento, Seg-Dom, Finalizado, Favoritos |
| **FR10** | O sistema deve persistir dados localmente (localStorage ou IndexedDB) |

### Non-Functional Requirements

| ID | Requisito |
|----|-----------|
| **NFR1** | A interface deve carregar em menos de 2 segundos (performance superior ao Trello) |
| **NFR2** | Drag-and-drop deve ter feedback visual imediato (<100ms) |
| **NFR3** | O sistema deve funcionar offline após primeiro carregamento |
| **NFR4** | A UI deve ser minimalista e não-cluttered (anti-Trello 2025) |
| **NFR5** | O sistema deve ser single-user (sem autenticação no MVP) |
| **NFR6** | O sistema deve rodar 100% no browser (sem backend no MVP) |

---

## User Interface Design Goals

### Overall UX Vision

Uma interface **minimalista e responsiva** que prioriza velocidade e clareza. O oposto do Trello 2025 - sem clutter visual, sem elementos desnecessários, foco total na gestão de tasks. A experiência deve ser **instantânea**: arrastar cards, criar tasks, e navegar entre boards sem latência perceptível.

### Key Interaction Paradigms

| Paradigma | Descrição |
|-----------|-----------|
| **Drag & Drop** | Interação primária - mover tasks entre colunas com feedback visual imediato |
| **Inline Editing** | Click para editar título/descrição diretamente no card (sem modais) |
| **Quick Actions** | Hover revela ações (delete, timer, favorito) sem poluir a UI default |
| **Keyboard First** | Atalhos para power users (N = nova task, T = toggle timer, etc.) |

### Core Screens and Views

| Tela | Propósito |
|------|-----------|
| **Board View** | Tela principal - colunas com cards arrastáveis |
| **Board Selector** | Lista/grid de boards disponíveis (sidebar ou home) |
| **Import Modal** | Upload/paste de arquivo .txt para importação em massa |
| **Settings** | Configurações mínimas (tema, export de dados) |

### Accessibility

**WCAG AA** - Requisitos básicos:
- Contraste adequado de cores
- Navegação por teclado funcional
- Labels em elementos interativos
- Tamanhos de fonte legíveis

### Branding

| Elemento | Definição |
|----------|-----------|
| **Nome** | Miplan |
| **Estilo** | Clean, moderno, minimalista |
| **Cores** | Paleta neutra com accent color para ações (a definir) |
| **Tipografia** | Sans-serif system fonts (performance) |

### Target Platforms

**Web Responsive** (Desktop-first)
- Desktop: Experiência completa com drag-and-drop
- Tablet: Funcional com touch
- Mobile: Visualização básica (otimização futura)

---

## Technical Assumptions

### Repository Structure

**A definir pelo Architect** - Provável: Monorepo simples (projeto único)

### Service Architecture

| Decisão | Valor | Rationale |
|---------|-------|-----------|
| **Tipo** | SPA (Single Page Application) | 100% browser, sem backend |
| **Backend** | Nenhum (MVP) | Dados locais apenas |
| **Storage** | localStorage ou IndexedDB | Persistência no browser |
| **Hosting** | Static hosting (Vercel/Netlify/GitHub Pages) | Grátis, zero config |

### Testing Requirements

| Tipo | Prioridade | Escopo |
|------|------------|--------|
| **Unit Tests** | Média | Lógica de negócio (import, time tracking) |
| **E2E Tests** | Baixa | Fluxos críticos apenas no MVP |
| **Manual Testing** | Alta | Drag-and-drop, UX |

### Additional Technical Assumptions

- **Framework/Libraries:** A ser definido pelo Architect baseado em trade-offs de performance vs DX
- **Drag-and-drop:** Requer biblioteca com boa acessibilidade e performance
- **Offline-first:** PWA capabilities desejáveis mas não bloqueantes para MVP
- **Bundle size:** Manter mínimo para performance (< 200KB gzipped ideal)
- **Browser support:** Evergreen browsers apenas (Chrome, Firefox, Safari, Edge modernos)

> **Nota para Architect:** Prioridades técnicas: **Performance > Simplicidade > Features**. Usuário quer ser mais rápido que Trello (que está lento pós-redesign 2025). Stack deve permitir desenvolvimento rápido por desenvolvedor solo.

---

## Epic List

| Epic | Título | Goal | Stories |
|------|--------|------|---------|
| **Epic 1** | Foundation & Core Kanban | Estabelecer projeto e entregar Kanban funcional com drag-and-drop, CRUD de tasks/colunas e persistência local | 7 |
| **Epic 2** | Multi-Board & Study Planner | Habilitar múltiplos boards com tipos especializados (Kanban padrão e Study Planner com dias da semana) | 4 |
| **Epic 3** | Import & Time Tracking | Implementar importação de .txt e time tracking por task - os diferenciais competitivos | 3 |

---

## Epic 1: Foundation & Core Kanban

**Goal:** Estabelecer projeto e entregar Kanban funcional com drag-and-drop, CRUD de tasks/colunas e persistência local.

**Valor entregue:** Um Trello básico funcional que pode ser usado imediatamente.

**Stories:** 7 | **Story Points:** 24

---

### Story 1.1: Project Scaffolding

**As a** developer,
**I want** a properly configured React + TypeScript project,
**so that** I can start building features immediately.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Projeto criado com `npm create vite@latest miplan -- --template react-ts` |
| AC2 | Dependências instaladas: `@dnd-kit/core`, `@dnd-kit/sortable`, `zustand`, `dexie`, `nanoid` |
| AC3 | Tailwind CSS configurado e funcionando |
| AC4 | Estrutura de pastas conforme `docs/architecture.md` criada |
| AC5 | TypeScript types definidos em `src/types/index.ts` (Board, Column, Task) |
| AC6 | App.tsx renderiza "Miplan" como placeholder |

**Technical Context:**

```
Arquivos a criar:
├── src/types/index.ts          # Board, Column, Task interfaces
├── src/constants/boardTemplates.ts  # Kanban + Study Planner templates
├── tailwind.config.js          # Config Tailwind
├── src/index.css               # @tailwind directives
└── vite.config.ts              # Config Vite
```

**Definition of Done:**
- [ ] `npm run dev` inicia sem erros
- [ ] `npm run build` compila sem erros
- [ ] TypeScript sem erros de tipo
- [ ] Tailwind classes funcionando

**Story Points:** 2

---

### Story 1.2: Base UI Components

**As a** developer,
**I want** reusable UI components,
**so that** I can build features with consistent styling.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | `Button` component com variants: primary, secondary, danger, ghost |
| AC2 | `Input` component com states: default, focus, error, disabled |
| AC3 | `Modal` component com backdrop, close button, animação fade |
| AC4 | `ConfirmDialog` component para confirmações de delete |
| AC5 | Todos os components são TypeScript com props tipadas |
| AC6 | Todos seguem design tokens de `docs/wireframes.md` |

**Technical Context:**

```
Arquivos a criar:
├── src/components/ui/Button.tsx
├── src/components/ui/Input.tsx
├── src/components/ui/Modal.tsx
├── src/components/ui/ConfirmDialog.tsx
└── src/components/ui/index.ts    # Re-exports
```

**Design Tokens:**
```css
--accent: #3B82F6
--danger: #EF4444
--radius-md: 0.5rem
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
```

**Definition of Done:**
- [ ] Cada componente renderiza corretamente
- [ ] Props TypeScript sem erros
- [ ] Variants funcionando
- [ ] Modal abre/fecha com animação

**Story Points:** 3

---

### Story 1.3: Database & Store Setup

**As a** developer,
**I want** Dexie database and Zustand store configured,
**so that** data persists and state is managed consistently.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Dexie database com tabelas: boards, columns, tasks |
| AC2 | Schema com indexes corretos (boardId, columnId, order) |
| AC3 | Zustand store para UI state (activeBoardId, sidebarOpen, etc.) |
| AC4 | Zustand persist middleware configurado |
| AC5 | Custom hooks: `useBoard()`, `useTasks()`, `useColumns()` |
| AC6 | CRUD operations funcionando (create, read, update, delete) |

**Technical Context:**

```
Arquivos a criar:
├── src/db/index.ts             # Dexie instance
├── src/db/schema.ts            # Table definitions
├── src/store/index.ts          # Zustand store
├── src/hooks/useBoard.ts       # Board CRUD hook
├── src/hooks/useTasks.ts       # Task CRUD hook
└── src/hooks/useColumns.ts     # Column CRUD hook
```

**Dexie Schema:**
```typescript
this.version(1).stores({
  boards: 'id, type, createdAt',
  columns: 'id, boardId, order',
  tasks: 'id, boardId, columnId, order, createdAt'
});
```

**Definition of Done:**
- [ ] Criar board persiste no IndexedDB
- [ ] Criar task persiste no IndexedDB
- [ ] Refresh da página mantém dados
- [ ] Zustand state persiste (localStorage)

**Story Points:** 3

---

### Story 1.4: Board Layout & Initial Render

**As a** user,
**I want** to see a Kanban board when I open the app,
**so that** I can start organizing my tasks immediately.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Board exibido com 3 colunas default: "To Do", "In Progress", "Done" |
| AC2 | Layout responsivo: sidebar (180px) + board (flex) |
| AC3 | Colunas dispostas horizontalmente com scroll se necessário |
| AC4 | Cada coluna exibe header com título |
| AC5 | Botão "+ Add task" no final de cada coluna (visual apenas) |
| AC6 | Botão "+ Add column" no final do board (visual apenas) |
| AC7 | App carrega em menos de 2 segundos |

**Technical Context:**

```
Arquivos a criar:
├── src/components/Board/Board.tsx
├── src/components/Board/Column.tsx
├── src/components/Board/ColumnHeader.tsx
├── src/components/Board/AddColumn.tsx
├── src/components/Sidebar/Sidebar.tsx
└── src/App.tsx                 # Layout principal
```

**Layout:**
```
┌────────────┬─────────────────────────────────────────┐
│  Sidebar   │              Board                      │
│   180px    │         flex, overflow-x-auto           │
│            │  ┌────────┐ ┌────────┐ ┌────────┐      │
│            │  │ Column │ │ Column │ │ Column │      │
└────────────┴─────────────────────────────────────────┘
```

**Definition of Done:**
- [ ] Board renderiza com 3 colunas
- [ ] Sidebar visível à esquerda
- [ ] Layout não quebra em diferentes larguras
- [ ] Lighthouse Performance > 90

**Story Points:** 3

---

### Story 1.5: Task Cards & Drag-and-Drop

**As a** user,
**I want** to drag tasks between columns,
**so that** I can update their status visually.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Tasks exibidas como cards dentro das colunas |
| AC2 | Cards são draggable usando @dnd-kit |
| AC3 | Colunas são droppable zones |
| AC4 | Drag-and-drop funcional entre todas as colunas |
| AC5 | Feedback visual durante drag (card elevado, placeholder) |
| AC6 | Reordenação de tasks dentro da mesma coluna |
| AC7 | Latência do drag < 100ms |
| AC8 | Funciona com mouse e touch |
| AC9 | Mudanças persistem no database |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/components/Task/TaskCard.tsx    # Draggable card
├── src/components/Board/Column.tsx     # Droppable zone (update)
├── src/components/Board/Board.tsx      # DndContext (update)
└── src/hooks/useDragAndDrop.ts         # Sensors, handlers
```

**@dnd-kit Setup:**
```typescript
import { DndContext, closestCorners, PointerSensor, useSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
```

**Definition of Done:**
- [ ] Drag task de "To Do" para "Done" funciona
- [ ] Reordenar tasks na mesma coluna funciona
- [ ] Após drag, ordem persiste no refresh
- [ ] Touch drag funciona em tablet

**Story Points:** 5

---

### Story 1.6: Task Creation & Inline Editing

**As a** user,
**I want** to create and edit tasks quickly,
**so that** I can capture and refine my thoughts without friction.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Click em "+ Add task" cria nova task em modo edição |
| AC2 | Foco automático no input de título |
| AC3 | Enter salva task, Esc cancela |
| AC4 | Tasks vazias (sem título) não são salvas |
| AC5 | Click no título da task permite edição inline |
| AC6 | Click no card expande para mostrar descrição |
| AC7 | Descrição é editável (textarea) |
| AC8 | Mudanças salvam automaticamente (debounce 300ms) |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/components/Task/TaskCard.tsx      # Update with expand
├── src/components/Task/TaskTitle.tsx     # Inline editable
├── src/components/Task/TaskDescription.tsx
└── src/components/Board/AddTaskButton.tsx
```

**Estados do Card:**
- Default: título + timer display
- Hover: mostra ações
- Expanded: mostra descrição editável

**Definition of Done:**
- [ ] Criar nova task funciona
- [ ] Editar título inline funciona
- [ ] Expandir card mostra descrição
- [ ] Tasks vazias são descartadas
- [ ] Dados persistem após edição

**Story Points:** 4

---

### Story 1.7: Task Delete & Column Management

**As a** user,
**I want** to manage tasks and columns,
**so that** I can customize my workflow.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Botão delete em cada task (visível no hover) |
| AC2 | ConfirmDialog antes de deletar task |
| AC3 | Click em "+ Add column" adiciona nova coluna |
| AC4 | Nova coluna criada com nome "New Column" em modo edição |
| AC5 | Click no título da coluna permite renomear |
| AC6 | Menu de coluna com opção "Delete column" |
| AC7 | Deletar coluna move tasks para coluna anterior ou deleta junto |
| AC8 | Drag-and-drop para reordenar colunas |
| AC9 | Mínimo de 1 coluna (não pode deletar a última) |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/components/Task/TaskActions.tsx   # Delete, favorite buttons
├── src/components/Board/ColumnHeader.tsx # Editable + menu
├── src/components/Board/ColumnMenu.tsx   # Dropdown menu
├── src/components/Board/AddColumn.tsx    # Functional
└── src/hooks/useColumns.ts               # Delete with task handling
```

**Definition of Done:**
- [ ] Deletar task com confirmação funciona
- [ ] Criar nova coluna funciona
- [ ] Renomear coluna funciona
- [ ] Deletar coluna funciona (com tasks)
- [ ] Reordenar colunas funciona
- [ ] Não pode deletar última coluna

**Story Points:** 4

---

## Epic 2: Multi-Board & Study Planner

**Goal:** Habilitar múltiplos boards com tipos especializados (Kanban padrão e Study Planner com dias da semana).

**Valor entregue:** Capacidade de ter múltiplos boards, incluindo o Study Planner para planejamento semanal de estudos.

**Stories:** 4 | **Story Points:** 13

---

### Story 2.1: Multi-Board Data Model & Selector

**As a** user,
**I want** to have multiple boards,
**so that** I can organize different projects or contexts separately.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Data model suporta múltiplos boards independentes |
| AC2 | Sidebar exibe lista de boards disponíveis |
| AC3 | Click no nome do board alterna para ele |
| AC4 | Board ativo é visualmente destacado (bullet preenchido) |
| AC5 | Primeiro board criado automaticamente na primeira visita |
| AC6 | Trocar de board carrega columns e tasks corretas |
| AC7 | State do board ativo persiste (reabrir app volta ao último) |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/components/Sidebar/BoardList.tsx
├── src/components/Sidebar/BoardItem.tsx
├── src/store/index.ts          # activeBoardId
└── src/hooks/useBoard.ts       # switchBoard, getActiveBoard
```

**Zustand State:**
```typescript
interface AppState {
  activeBoardId: string | null;
  setActiveBoard: (id: string) => void;
}
```

**Definition of Done:**
- [ ] Múltiplos boards aparecem na sidebar
- [ ] Clicar em board diferente alterna view
- [ ] Cada board tem suas próprias columns/tasks
- [ ] Último board ativo restaura no refresh

**Story Points:** 3

---

### Story 2.2: Board CRUD

**As a** user,
**I want** to create, rename, and delete boards,
**so that** I can manage my workspaces.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Botão "+ New Board" no final da lista de boards |
| AC2 | Modal para criar board com: nome e tipo (dropdown) |
| AC3 | Tipos disponíveis: "Kanban" (default) e "Study Planner" |
| AC4 | Board criado com colunas default do template |
| AC5 | Double-click no nome do board permite renomear |
| AC6 | Menu de contexto ou botão para deletar board |
| AC7 | Confirmação antes de deletar board |
| AC8 | Não é possível deletar o último board |
| AC9 | Após deletar, navega para outro board |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/components/Sidebar/AddBoardButton.tsx
├── src/components/Sidebar/BoardItem.tsx    # Rename, delete menu
├── src/components/Board/CreateBoardModal.tsx
└── src/constants/boardTemplates.ts         # Templates
```

**Board Templates:**
```typescript
const TEMPLATES = {
  kanban: ['To Do', 'In Progress', 'Done'],
  'study-planner': ['Planejamento', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Finalizado', 'Favoritos']
};
```

**Definition of Done:**
- [ ] Criar board Kanban funciona
- [ ] Criar board Study Planner funciona
- [ ] Renomear board funciona
- [ ] Deletar board com confirmação funciona
- [ ] Não pode deletar último board

**Story Points:** 4

---

### Story 2.3: Study Planner Board Type

**As a** user,
**I want** a pre-configured Study Planner board,
**so that** I can plan my weekly study sessions by day.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Board tipo "Study Planner" cria 10 colunas automaticamente |
| AC2 | Colunas: Planejamento, Seg, Ter, Qua, Qui, Sex, Sáb, Dom, Finalizado, Favoritos |
| AC3 | Colunas de dias têm largura menor (160px vs 280px) |
| AC4 | Usuário pode customizar colunas após criação |
| AC5 | Tasks novas vão para "Planejamento" por default |
| AC6 | Drag-and-drop funciona identicamente ao Kanban |
| AC7 | Scroll horizontal smooth para navegar entre colunas |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/constants/boardTemplates.ts
├── src/components/Board/Board.tsx      # Column width logic
└── src/components/Board/Column.tsx     # Dynamic width prop
```

**Larguras das Colunas:**
```typescript
const getColumnWidth = (board: Board, columnTitle: string) => {
  if (board.type === 'study-planner') {
    if (['Planejamento', 'Finalizado'].includes(columnTitle)) return 220;
    if (columnTitle === 'Favoritos') return 120;
    return 160; // Dias da semana
  }
  return 280; // Kanban default
};
```

**Definition of Done:**
- [ ] Study Planner cria com 10 colunas corretas
- [ ] Colunas de dias são mais estreitas
- [ ] Scroll horizontal funciona suavemente
- [ ] Todas as funcionalidades de Kanban funcionam

**Story Points:** 3

---

### Story 2.4: Sidebar Toggle (Mobile/Desktop)

**As a** user,
**I want** to collapse the sidebar,
**so that** I have more space for my board on smaller screens.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Botão hamburger (☰) no header toggle sidebar |
| AC2 | Sidebar colapsada mostra apenas ícones |
| AC3 | Sidebar expandida mostra nome + tipo do board |
| AC4 | Transição suave (200ms) entre estados |
| AC5 | Estado da sidebar persiste (localStorage) |
| AC6 | Em mobile (<768px), sidebar é overlay com backdrop |
| AC7 | Keyboard shortcut: Ctrl+B toggle sidebar |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/components/Sidebar/Sidebar.tsx      # Collapsed state
├── src/components/Header/Header.tsx        # Hamburger button
├── src/store/index.ts                      # sidebarOpen state
└── src/hooks/useKeyboardShortcuts.ts
```

**Estados:**
- Expanded: 180px, nome + tipo
- Collapsed: 48px, ícones apenas
- Mobile: overlay com backdrop escuro

**Definition of Done:**
- [ ] Click no hamburger toggle sidebar
- [ ] Animação suave funciona
- [ ] Estado persiste no refresh
- [ ] Mobile mostra como overlay
- [ ] Ctrl+B funciona

**Story Points:** 3

---

## Epic 3: Import & Time Tracking

**Goal:** Implementar importação de .txt e time tracking por task - os diferenciais competitivos do Miplan.

**Valor entregue:** Killer features que diferenciam Miplan do Trello e concorrentes.

**Stories:** 3 | **Story Points:** 13

---

### Story 3.1: Import Tasks from .txt File

**As a** user,
**I want** to import tasks from a .txt file,
**so that** I can quickly create multiple tasks from my saved links/notes.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Botão "Import" no header abre modal |
| AC2 | Modal com área de drag-and-drop para arquivo .txt |
| AC3 | Alternativa: textarea para colar texto diretamente |
| AC4 | Parser: cada linha vira uma task (título = conteúdo) |
| AC5 | Linhas vazias são ignoradas |
| AC6 | Step 2: preview das tasks com checkboxes |
| AC7 | Seletor de coluna destino (default: primeira coluna) |
| AC8 | Indicador visual de URLs detectadas (🔗) |
| AC9 | Botão "Import X tasks" cria tasks |
| AC10 | Toast de sucesso: "X tasks importadas" |

**Technical Context:**

```
Arquivos a criar:
├── src/components/Import/ImportModal.tsx
├── src/components/Import/FileDropzone.tsx
├── src/components/Import/ImportPreview.tsx
├── src/components/Import/ImportItem.tsx
├── src/utils/import.ts                    # parseTextFile()
└── src/components/ui/Toast.tsx
```

**Parser Logic:**
```typescript
export const parseTextFile = (content: string): ParsedLine[] => {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => ({
      title: line,
      hasUrl: /https?:\/\/|www\./i.test(line),
      selected: true
    }));
};
```

**Definition of Done:**
- [ ] Upload de arquivo .txt funciona
- [ ] Colar texto funciona
- [ ] Preview mostra todas as linhas
- [ ] URLs são identificadas com ícone
- [ ] Import cria tasks na coluna selecionada
- [ ] Toast de sucesso aparece

**Story Points:** 5

---

### Story 3.2: URL Detection & Clickable Links

**As a** user,
**I want** URLs in my tasks to be clickable,
**so that** I can quickly access the links I saved for study.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | URLs no título são detectadas automaticamente |
| AC2 | URLs renderizadas como links (azul, hover underline) |
| AC3 | Click no link abre em nova aba (target="_blank") |
| AC4 | Ícone 🔗 indica task com link (no card) |
| AC5 | URLs na descrição também são detectadas |
| AC6 | Suporta: http://, https://, www. |
| AC7 | Click no link NÃO expande o card |
| AC8 | rel="noopener noreferrer" por segurança |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/utils/url.ts                       # detectUrls, linkifyText
├── src/components/Task/TaskCard.tsx       # Link icon
├── src/components/Task/TaskTitle.tsx      # Linkified text
└── src/components/Task/TaskDescription.tsx
```

**URL Detection:**
```typescript
const URL_REGEX = /https?:\/\/[^\s<>\"']+|www\.[^\s<>\"']+/gi;

export const hasUrl = (text: string): boolean => URL_REGEX.test(text);

export const linkifyText = (text: string): ReactNode => {
  // Split text and wrap URLs in <a> tags
};
```

**Definition of Done:**
- [ ] URLs no título são clicáveis
- [ ] URLs na descrição são clicáveis
- [ ] Links abrem em nova aba
- [ ] Ícone 🔗 aparece em cards com URL
- [ ] Click no link não conflita com card expand

**Story Points:** 3

---

### Story 3.3: Time Tracking per Task

**As a** user,
**I want** to track time spent on each task,
**so that** I can measure my study/work sessions.

**Acceptance Criteria:**

| # | Critério |
|---|----------|
| AC1 | Botão play/pause em cada task card (hover reveal) |
| AC2 | Timer exibe tempo em formato MM:SS ou HH:MM:SS |
| AC3 | Apenas uma task pode ter timer ativo por vez |
| AC4 | Iniciar timer em nova task pausa a anterior automaticamente |
| AC5 | Timer continua mesmo se card não está visível |
| AC6 | Badge "● TRACKING" em task com timer ativo |
| AC7 | Tempo total persiste entre sessões |
| AC8 | Timer persiste se fechar/reabrir browser |
| AC9 | Botão reset (no card expandido) com confirmação |
| AC10 | Tempo exibido mesmo quando timer parado |

**Technical Context:**

```
Arquivos a criar/modificar:
├── src/components/Task/TaskTimer.tsx
├── src/components/Task/TaskCard.tsx       # Timer integration
├── src/hooks/useTimer.ts                  # Timer logic
├── src/store/index.ts                     # activeTimerTaskId
└── src/utils/time.ts                      # formatTime()
```

**Timer Logic:**
```typescript
// Task has: timeSpent (seconds), timerStartedAt (timestamp | null)

export const calculateElapsedTime = (task: Task): number => {
  if (!task.timerStartedAt) return task.timeSpent;
  const elapsed = Math.floor((Date.now() - task.timerStartedAt) / 1000);
  return task.timeSpent + elapsed;
};

// On start: set timerStartedAt = Date.now()
// On stop: timeSpent += elapsed, timerStartedAt = null
```

**Definition of Done:**
- [ ] Play/pause funciona
- [ ] Timer conta corretamente
- [ ] Apenas 1 timer ativo por vez
- [ ] Badge "TRACKING" aparece
- [ ] Tempo persiste no refresh
- [ ] Reset funciona com confirmação

**Story Points:** 5

---

## Summary

| Epic | Stories | Story Points | Entregável |
|------|---------|--------------|------------|
| **Epic 1** | 7 stories | 24 pts | Kanban básico funcional |
| **Epic 2** | 4 stories | 13 pts | Multi-board + Study Planner |
| **Epic 3** | 3 stories | 13 pts | Import .txt + Time Tracking |
| **Total** | **14 stories** | **50 pts** | **MVP Completo** |

### Sequência de Implementação

```
Epic 1 (Foundation):
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7

Epic 2 (Multi-Board):
2.1 → 2.2 → 2.3 → 2.4

Epic 3 (Import & Timer):
3.1 → 3.2 → 3.3
```

---

## Checklist Results

| Métrica | Valor |
|---------|-------|
| **Completude do PRD** | 95% |
| **Escopo MVP** | Just Right |
| **Prontidão para Dev** | READY |
| **Bloqueadores** | 0 |

### Category Status

| Categoria | Status |
|-----------|--------|
| Problem Definition & Context | PASS |
| MVP Scope Definition | PASS |
| User Experience Requirements | PASS |
| Functional Requirements | PASS |
| Non-Functional Requirements | PARTIAL (N/A for single-user) |
| Epic & Story Structure | PASS |
| Technical Guidance | PASS |
| Story Technical Context | PASS |
| Definition of Done | PASS |

**Decision: READY FOR DEVELOPMENT**

---

## Next Steps

### Start Development

```
@dev Implementar Story 1.1: Project Scaffolding

Referências:
- PRD: docs/prd.md
- Arquitetura: docs/architecture.md
- Wireframes: docs/wireframes.md

Siga os Acceptance Criteria e Definition of Done da story.
```

---

*Synkra AIOS - PRD Generated by Morgan (PM) | Stories Expanded by River (SM)*
