import { useUIStore } from '../../store';

export function Header() {
  const { toggleSidebar, openImportModal } = useUIStore();

  return (
    <header className="h-12 flex-shrink-0 border-b border-gray-200 bg-white flex items-center px-4 z-30">
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Toggle sidebar"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* App Title */}
      <h1 className="ml-4 font-semibold text-gray-900">Miplan</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Import Button (placeholder) */}
      <button
        onClick={openImportModal}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        Import
      </button>
    </header>
  );
}
