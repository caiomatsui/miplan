interface AddBoardButtonProps {
  onClick: () => void;
}

export function AddBoardButton({ onClick }: AddBoardButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2"
      aria-label="Add new board"
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
          d="M12 4v16m8-8H4"
        />
      </svg>
      New Board
    </button>
  );
}
