# Epic 8: UX Polish & Bug Fixes

## Overview
A collection of UX improvements and bug fixes focused on modal behavior, task editing reliability, and visual enhancements for column headers.

## Business Value
- **Improved User Experience**: Modal interactions follow expected patterns (click outside to close)
- **Bug Fix**: Prevents accidental task deletion when editing titles
- **Better UX Flow**: Delete confirmation modal blocks background interaction
- **User Preference**: "Don't ask again" option for power users who want faster workflows
- **Visual Polish**: Enhanced column header styling with subtle color gradients

## Technical Approach

### Architecture Decisions
1. **localStorage for preferences** - Simple, browser-local, no backend changes needed
2. **Subtle gradient styling** - Maintains readability while adding visual distinction
3. **Pointer-events blocking** - CSS-based solution for modal backdrop interaction

### Affected Components
- `Sheet.tsx` - Already supports backdrop click (verified working)
- `TaskTitle.tsx` - Bug fix for blur-on-new-task behavior
- `TaskCard.tsx` - Coordinates with TaskTitle for new task handling
- `ConfirmDialog.tsx` - Add "Don't ask again" option
- `alert-dialog.tsx` - Ensure pointer-events: none on content behind overlay
- `ColumnHeader.tsx` - Enhanced gradient styling

## Stories

| Story | Title | Complexity | Priority |
|-------|-------|------------|----------|
| 8.1 | Task Detail Sheet - Click Outside to Close | Low | P1 |
| 8.2 | Fix Task Title Edit Blur Deletes Task Bug | Medium | P0 (Bug) |
| 8.3 | Delete Confirmation Modal Blocks Background | Low | P1 |
| 8.4 | Add "Don't Ask Again" to Delete Confirmation | Medium | P2 |
| 8.5 | Enhanced Column Header Styling | Low | P2 |

## Dependencies
- None - all stories can be worked independently

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| localStorage "don't ask" could cause accidental deletes | Add visual indicator that confirms are disabled, easy way to re-enable |
| Column gradients might clash with column colors | Test with all color options, use low opacity |

## Definition of Done
- [x] All acceptance criteria met for each story
- [ ] No regressions in existing modal/dialog behavior
- [ ] Tested in both light and dark themes
- [ ] No console errors or warnings
- [x] Code follows existing patterns

## Implementation Summary

All 5 stories implemented:

| Story | Status | Key Changes |
|-------|--------|-------------|
| 8.1 | Ready for Review | Sheet.tsx - pointer-events-none on backdrop |
| 8.2 | Ready for Review | TaskTitle.tsx - isNew prop, conditional delete |
| 8.3 | Ready for Review | alert-dialog.tsx - z-[100] for overlay/content |
| 8.4 | Ready for Review | ConfirmDialog + TaskDetailSheet - localStorage pref |
| 8.5 | Ready for Review | columnColors.ts - enhanced vertical gradient |

## File Change Summary
```
src/components/
├── ui/
│   ├── Sheet.tsx                 # 8.1 - Verify/fix backdrop click
│   ├── alert-dialog.tsx          # 8.3 - Pointer-events fix
│   └── ConfirmDialog.tsx         # 8.4 - Don't ask again option
├── Task/
│   ├── TaskTitle.tsx             # 8.2 - Fix blur delete bug
│   └── TaskCard.tsx              # 8.2 - Coordinate new task state
└── Board/
    └── ColumnHeader.tsx          # 8.5 - Gradient styling

src/store/
└── index.ts                      # 8.4 - Add skipDeleteConfirm preference
```
