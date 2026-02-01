import React, { useState, useEffect, useRef } from 'react';
import { Board } from '../../types';
import { useBoardActions, useBoards } from '../../hooks/useBoard';
import { useUIStore } from '../../store';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { cn } from '@/lib/utils';

interface BoardItemProps {
  board: Board;
  isActive: boolean;
  isCollapsed?: boolean;
  onClick: () => void;
}

export function BoardItem({
  board,
  isActive,
  isCollapsed = false,
  onClick,
}: BoardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(board.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const boards = useBoards();
  const { updateBoard, deleteBoard } = useBoardActions();
  const setActiveBoard = useUIStore((state) => state.setActiveBoard);

  useEffect(() => {
    setEditValue(board.name);
  }, [board.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(board.name);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== board.name) {
      await updateBoard(board.id, { name: trimmedValue });
    } else {
      setEditValue(board.name);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(board.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!boards || boards.length <= 1) {
      setShowDeleteConfirm(false);
      return;
    }

    const remainingBoards = boards.filter((b) => b.id !== board.id);
    const nextBoard = remainingBoards[0];

    await deleteBoard(board.id);
    setShowDeleteConfirm(false);

    if (nextBoard) {
      setActiveBoard(nextBoard.id);
    }
  };

  const isLastBoard = !boards || boards.length <= 1;

  // Collapsed view
  if (isCollapsed) {
    return (
      <li>
        <button
          onClick={onClick}
          title={board.name}
          className={cn(
            'w-full p-2 rounded-lg',
            'flex items-center justify-center',
            'transition-all duration-150',
            isActive
              ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          )}
        >
          <span className={cn(
            'w-7 h-7 flex items-center justify-center',
            'text-xs font-semibold rounded-lg',
            isActive ? 'bg-primary/20' : 'bg-muted'
          )}>
            {board.name.charAt(0).toUpperCase()}
          </span>
        </button>
      </li>
    );
  }

  return (
    <>
      <li
        className={cn(
          'group relative flex items-center w-full rounded-lg',
          'transition-all duration-150',
          isActive
            ? 'bg-primary/10'
            : 'hover:bg-sidebar-accent'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex-1 mx-1 px-2.5 py-2',
              'text-sm font-medium',
              'bg-card border border-primary/30 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary/30',
              'shadow-sm'
            )}
            aria-label="Board name"
          />
        ) : (
          <>
            <button
              onClick={onClick}
              onDoubleClick={handleDoubleClick}
              className={cn(
                'flex-1 text-left px-2.5 py-2',
                'text-sm font-medium',
                'flex items-center gap-2.5',
                'transition-colors duration-150',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-sidebar-foreground'
              )}
              title={`${board.name} (double-click to rename)`}
            >
              {/* Board indicator dot */}
              <span
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'
                )}
              />
              <span className="truncate">{board.name}</span>
            </button>

            {/* Delete button - visible on hover */}
            {isHovered && !isLastBoard && (
              <button
                onClick={handleDeleteClick}
                className={cn(
                  'absolute right-1.5 p-1.5 rounded-md',
                  'text-muted-foreground',
                  'hover:text-destructive hover:bg-destructive/10',
                  'transition-all duration-150',
                  'opacity-0 group-hover:opacity-100'
                )}
                aria-label="Delete board"
                title="Delete board"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </>
        )}
      </li>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Board"
        message={`Are you sure you want to delete "${board.name}" and all its tasks? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}
