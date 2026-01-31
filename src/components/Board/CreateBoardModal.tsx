import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useBoardActions } from '../../hooks/useBoard';
import { useColumnActions } from '../../hooks/useColumns';
import { useUIStore } from '../../store';
import { getDefaultColumns } from '../../constants/boardTemplates';
import type { Board } from '../../types';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Board['type']>('kanban');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const { createBoard } = useBoardActions();
  const { createColumn } = useColumnActions();
  const setActiveBoard = useUIStore((state) => state.setActiveBoard);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setType('kanban');
      setError('');
    }
  }, [isOpen]);

  const handleCreate = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Board name is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Create the board
      const boardId = await createBoard(trimmedName, type);

      // Create default columns from template
      const columns = getDefaultColumns(type);
      for (const columnTitle of columns) {
        await createColumn(boardId, columnTitle);
      }

      // Set as active board
      setActiveBoard(boardId);

      // Close modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Board">
      <div className="space-y-4">
        <Input
          label="Board Name"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="My Board"
          error={!!error}
          errorMessage={error}
          disabled={isCreating}
        />

        <div className="w-full">
          <label
            htmlFor="board-type"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Board Type
          </label>
          <select
            id="board-type"
            value={type}
            onChange={(e) => setType(e.target.value as Board['type'])}
            disabled={isCreating}
            className="w-full px-3 py-2 text-base rounded-md border border-input bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:outline-none transition-colors duration-200"
          >
            <option value="kanban">Kanban</option>
            <option value="study-planner">Study Planner</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
