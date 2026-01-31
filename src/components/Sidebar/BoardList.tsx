import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useUIStore } from '../../store';
import { BoardItem } from './BoardItem';
import { AddBoardButton } from './AddBoardButton';
import { CreateBoardModal } from '../Board/CreateBoardModal';

interface BoardListProps {
  isCollapsed?: boolean;
  onBoardSelect?: () => void;
}

export function BoardList({ isCollapsed = false, onBoardSelect }: BoardListProps) {
  const boards = useLiveQuery(() => db.boards.toArray());
  const activeBoardId = useUIStore((state) => state.activeBoardId);
  const setActiveBoard = useUIStore((state) => state.setActiveBoard);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleBoardClick = (boardId: string) => {
    setActiveBoard(boardId);
    onBoardSelect?.();
  };

  return (
    <>
      {(!boards || boards.length === 0) && !isCollapsed && (
        <p className="px-3 py-2 text-sm text-gray-400">No boards yet</p>
      )}

      <ul className="space-y-1">
        {boards?.map((board) => (
          <BoardItem
            key={board.id}
            board={board}
            isActive={board.id === activeBoardId}
            isCollapsed={isCollapsed}
            onClick={() => handleBoardClick(board.id)}
          />
        ))}
      </ul>

      {/* Add Board Button */}
      {!isCollapsed && (
        <div className="mt-2">
          <AddBoardButton onClick={() => setIsCreateModalOpen(true)} />
        </div>
      )}

      {/* Collapsed Add Button */}
      {isCollapsed && (
        <div className="mt-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            title="Add new board"
            className="w-full p-2 rounded-md text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
            aria-label="Add new board"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      )}

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
