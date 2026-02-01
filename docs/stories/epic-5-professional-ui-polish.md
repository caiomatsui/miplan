# Epic 5: Professional UI/UX Polish

## Overview

Elevate Miplan from a functional app to a market-ready SaaS product that rivals Linear, Notion, Todoist, and Asana in visual polish and user experience.

## Epic Goal

Transform the existing UI foundation (Epic 4) into a professional-grade interface with:
- Enhanced color system with semantic visual hierarchy
- Task cards with depth, prominence, and professional feel
- Consistent spacing rhythm and optimal screen utilization
- Polished columns, boards, and visual flow
- Refined sidebar navigation and interaction patterns
- Delightful micro-interactions and feedback systems

## Reference Applications

| App | Key Patterns to Adopt |
|-----|----------------------|
| **Linear** | Clean task cards, indigo primary, subtle shadows, typography |
| **Notion** | Spacing rhythm, hover states, generous whitespace |
| **Todoist** | Priority colors (red/orange/blue/gray), quick actions |
| **Asana** | Column headers, status badges, board layout |

## Stories in This Epic

| Story | Title | Points | Priority | Dependencies |
|-------|-------|--------|----------|--------------|
| 5.1 | [Color System Enhancement](./5.1-color-system-enhancement.md) | 5 | P0 | Epic 4 |
| 5.2 | [Task Card Redesign](./5.2-task-card-redesign.md) | 8 | P0 | 5.1 |
| 5.3 | [Layout & Spacing Refinement](./5.3-layout-spacing-refinement.md) | 5 | P1 | 5.1 |
| 5.4 | [Column & Board Visual Upgrade](./5.4-column-board-visual-upgrade.md) | 5 | P1 | 5.1, 5.3 |
| 5.5 | [Sidebar Polish](./5.5-sidebar-polish.md) | 5 | P1 | 5.1, 5.3 |
| 5.6 | [Micro-interactions & Feedback](./5.6-micro-interactions-feedback.md) | 8 | P2 | 5.1-5.5 |

**Total Story Points: 36**

## Implementation Order

```
5.1 (Colors) ─┬─> 5.2 (Task Cards)
              │
              ├─> 5.3 (Layout) ─┬─> 5.4 (Columns/Board)
              │                 │
              │                 └─> 5.5 (Sidebar)
              │
              └─────────────────────> 5.6 (Micro-interactions)
```

**Phase 1 (Foundation):** Story 5.1 - Color system is the base for all visual changes

**Phase 2 (Core Components):** Stories 5.2, 5.3 - Can be parallelized after 5.1

**Phase 3 (Container Polish):** Stories 5.4, 5.5 - Depend on spacing decisions from 5.3

**Phase 4 (Delight):** Story 5.6 - Final polish layer

## Technical Approach

### CSS Variable Extensions
Building on Epic 4's OKLCH foundation:
```css
/* New semantic tokens */
--status-todo: oklch(0.70 0.15 220);
--status-progress: oklch(0.65 0.20 45);
--status-done: oklch(0.60 0.18 145);

/* Priority spectrum */
--priority-critical: oklch(0.55 0.25 25);
--priority-high: oklch(0.65 0.20 45);
--priority-medium: oklch(0.70 0.15 220);
--priority-low: oklch(0.65 0.08 280);

/* Surface hierarchy */
--surface-elevated: oklch(0.99 0.005 280);
--surface-sunken: oklch(0.96 0.01 280);
```

### Component Updates
| Component | Current Issue | Enhancement |
|-----------|---------------|-------------|
| TaskCard | Flat appearance | Shadow layers, hover elevation, gradient accents |
| Column | Basic container | Header redesign, visual separators, count badges |
| Sidebar | Minimal styling | Active states, smooth collapse, visual hierarchy |
| Badge | Simple colors | Ring borders, icon integration, size variants |

### Animation Enhancements
```css
/* New animation tokens */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
```

## Design Decisions

### Why OKLCH Expansion?
- Perceptually uniform: priorities/statuses appear equally vibrant
- Predictable lightness: ensures contrast ratios in both themes
- Future-ready: native browser support expanding

### Why Not Replace Components?
- Epic 4 established solid component architecture
- Enhancing existing code reduces risk
- Maintains IndexedDB compatibility and state management

### Accessibility Commitments
- WCAG 2.1 AA contrast ratios maintained
- Focus indicators enhanced, not removed
- Motion reduced when `prefers-reduced-motion` enabled
- Screen reader compatibility preserved

## Success Criteria

- [ ] Color palette expanded with semantic meaning
- [ ] Task cards have visual depth and priority prominence
- [ ] Consistent 4px/8px spacing grid applied
- [ ] Columns have polished headers and separators
- [ ] Sidebar feels native and responsive
- [ ] Interactions feel responsive with appropriate feedback
- [ ] Both light and dark themes look professional
- [ ] No accessibility regressions (tested with axe)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual inconsistency across stories | Medium | 5.1 establishes tokens first |
| Performance with more animations | Low | Use CSS transforms, avoid layout thrash |
| Scope creep on "polish" | Medium | Strict acceptance criteria per story |
| Dark mode contrast issues | Medium | Test each color addition in both themes |

## Out of Scope

- New features (this is purely visual enhancement)
- Database schema changes
- New component functionality
- Mobile app styling (web-first)

---

*Created: 2026-01-31*
*Author: Morgan (Product Manager)*
*Delegated to: @sm for story creation, @dev for implementation*
