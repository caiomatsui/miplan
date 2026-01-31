# Epic 4: UI Enhancement with shadcn/ui

## Overview

Transform Miplan's MVP UI into a polished, professional experience using shadcn/ui components. This epic focuses on visual polish, theming, and power-user features while maintaining the core functionality.

## Epic Goal

Elevate the Miplan UI from functional MVP to polished product with:
- Modern, consistent design system
- Dark mode support
- Task organization features (priority, labels)
- Power-user productivity tools

## Stories in This Epic

| Story | Title | Points | Priority | Dependencies |
|-------|-------|--------|----------|--------------|
| 4.1 | [shadcn/ui Foundation & Dark Mode](./4.1-shadcn-ui-foundation-dark-mode.md) | 5 | P0 | None |
| 4.2 | [Task Priority Badges](./4.2-task-priority-badges.md) | 3 | P1 | 4.1 |
| 4.3 | [Task Labels/Tags System](./4.3-task-labels-tags.md) | 5 | P1 | 4.1, 4.2 |
| 4.4 | [Task Detail Sheet](./4.4-task-detail-sheet.md) | 5 | P1 | 4.1 |
| 4.5 | [Command Palette](./4.5-command-palette.md) | 5 | P2 | 4.1, 4.4 |

**Total Story Points: 23**

## Recommended Implementation Order

```
4.1 (Foundation) ─┬─> 4.2 (Priority) ──> 4.3 (Labels)
                  │
                  └─> 4.4 (Detail Sheet) ──> 4.5 (Command Palette)
```

**Phase 1 (Foundation):**
- Story 4.1: Install shadcn/ui, set up theming, dark mode

**Phase 2 (Task Enhancements) - Can be parallelized:**
- Story 4.2: Priority badges
- Story 4.4: Task detail sheet

**Phase 3 (Advanced Features):**
- Story 4.3: Labels/tags (builds on priority UI patterns)
- Story 4.5: Command palette (uses detail sheet for task selection)

## Technical Dependencies

### Packages to Install (Story 4.1)
```bash
npm install class-variance-authority clsx tailwind-merge
```

### Database Schema Changes
- **Story 4.2**: Add `priority` field to tasks
- **Story 4.3**: Add `labels` and `taskLabels` tables

### New Components Created
| Component | Story | Location |
|-----------|-------|----------|
| `cn()` utility | 4.1 | `src/lib/utils.ts` |
| `ThemeProvider` | 4.1 | `src/components/ThemeProvider.tsx` |
| `Badge` | 4.2 | `src/components/ui/Badge.tsx` |
| `PriorityBadge` | 4.2 | `src/components/Task/PriorityBadge.tsx` |
| `PrioritySelector` | 4.2 | `src/components/Task/PrioritySelector.tsx` |
| `LabelBadge` | 4.3 | `src/components/Task/LabelBadge.tsx` |
| `LabelPicker` | 4.3 | `src/components/Task/LabelPicker.tsx` |
| `LabelManager` | 4.3 | `src/components/Board/LabelManager.tsx` |
| `Sheet` | 4.4 | `src/components/ui/Sheet.tsx` |
| `TaskDetailSheet` | 4.4 | `src/components/Task/TaskDetailSheet.tsx` |
| `Command` | 4.5 | `src/components/ui/Command.tsx` |
| `CommandPalette` | 4.5 | `src/components/CommandPalette/CommandPalette.tsx` |

## Design Decisions

### Why shadcn/ui?
1. **Ownership**: Components are copied into codebase, not installed as dependency
2. **Customizable**: Full control over styling and behavior
3. **Accessible**: Built on Radix UI primitives
4. **Tailwind-native**: Works seamlessly with existing Tailwind setup
5. **Modern**: CSS variables, oklch colors, dark mode built-in

### Why not full shadcn CLI?
Given Miplan's existing component structure, we'll:
- Manually create shadcn-style components
- Adopt the CSS variable conventions
- Use CVA for variant management
- Skip shadcn CLI to avoid potential conflicts

### Color System
Adopting oklch color format for:
- Perceptually uniform color adjustments
- Better dark mode contrast
- Future-proof CSS color handling

## Success Criteria

- [ ] Dark mode toggle works and persists
- [ ] All existing features work in both themes
- [ ] Tasks have visible priority indicators
- [ ] Labels can be created and assigned
- [ ] Task detail sheet provides full editing experience
- [ ] Command palette enables keyboard-first workflow
- [ ] No accessibility regressions

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| oklch browser support | Medium | Fallback to hex in older browsers |
| Component conflicts | Low | Careful naming, test each integration |
| Performance with labels | Low | Limit visible labels, efficient queries |

## Out of Scope (Future Epics)

- Board-specific accent colors
- Subtasks/checklists
- Attachments
- Due dates
- Notifications
- Keyboard shortcuts beyond Cmd+K

---

*Created: 2026-01-31*
*Author: River (Scrum Master)*
