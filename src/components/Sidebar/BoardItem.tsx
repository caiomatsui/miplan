import React, { useState, useEffect, useRef } from 'react';
import { Board } from '../../types';
import { useBoardActions, useBoards } from '../../hooks/useBoard';
import { useUIStore } from '../../store';
import { ConfirmDialog } from '../ui/ConfirmDialog';

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

  // Reset edit value when board name changes
  useEffect(() => {
    setEditValue(board.name);
  }, [board.name]);

  // Focus input when entering edit mode
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

    // Find another board to navigate to
    const remainingBoards = boards.filter((b) => b.id !== board.id);
    const nextBoard = remainingBoards[0];

    await deleteBoard(board.id);
    setShowDeleteConfirm(false);

    // Navigate to another board
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
          className={`w-full p-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center justify-center ${
            isActive
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold">
            {board.name.charAt(0).toUpperCase()}
          </span>
        </button>
      </li>
    );
  }

  return (
    <>
      <li
        className={`relative group flex items-center w-full rounded-md transition-colors duration-150 ${
          isActive ? 'bg-blue-50' : 'hover:bg-gray-100'
        }`}
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
            className="flex-1 mx-1 px-2 py-1.5 text-sm font-medium bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Board name"
          />
        ) : (
          <>
            <button
              onClick={onClick}
              onDoubleClick={handleDoubleClick}
              className={`flex-1 text-left px-3 py-2 text-sm font-medium flex items-center gap-2 ${
                isActive ? 'text-blue-700' : 'text-gray-700'
              }`}
              title={`${board.name} (double-click to rename)`}
            >
              <span className="text-xs">{isActive ? '●' : '○'}</span>
              <span className="truncate">{board.name}</span>
            </button>
            {isHovered && !isLastBoard && (
              <button
                onClick={handleDeleteClick}
                className="absolute right-1 p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                aria-label="Delete board"
                title="Delete board"
              >
                <svg
                  className="w-4 h-4"
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
