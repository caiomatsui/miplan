import React, { useState, useCallback, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { FileDropzone } from './FileDropzone';
import { ImportPreview } from './ImportPreview';
import { parseTextFile, ParsedLine } from '../../utils/import';
import { useColumns } from '../../hooks/useColumns';
import { useTaskActions } from '../../hooks/useTasks';
import { useUIStore } from '../../store';

type Step = 'upload' | 'preview';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [textContent, setTextContent] = useState('');
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);

  const { activeBoardId } = useUIStore();
  const columns = useColumns(activeBoardId);
  const { createTask } = useTaskActions();

  // Set default column when columns load
  React.useEffect(() => {
    if (columns && columns.length > 0 && !selectedColumnId) {
      setSelectedColumnId(columns[0].id);
    }
  }, [columns, selectedColumnId]);

  const handleFileRead = useCallback((content: string) => {
    setTextContent(content);
  }, []);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextContent(e.target.value);
    },
    []
  );

  const handleNext = useCallback(() => {
    const lines = parseTextFile(textContent);
    setParsedLines(lines);
    setStep('preview');
  }, [textContent]);

  const handleBack = useCallback(() => {
    setStep('upload');
    setParsedLines([]);
  }, []);

  const handleToggleLine = useCallback((id: string) => {
    setParsedLines((lines) =>
      lines.map((line) =>
        line.id === id ? { ...line, selected: !line.selected } : line
      )
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setParsedLines((lines) => lines.map((line) => ({ ...line, selected: true })));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setParsedLines((lines) =>
      lines.map((line) => ({ ...line, selected: false }))
    );
  }, []);

  const handleImport = useCallback(async () => {
    const selectedLines = parsedLines.filter((line) => line.selected);
    if (selectedLines.length === 0 || !selectedColumnId) return;

    setIsImporting(true);

    try {
      // Create tasks sequentially to maintain order
      for (const line of selectedLines) {
        await createTask(selectedColumnId, line.title);
      }

      onSuccess(selectedLines.length);
      handleClose();
    } catch (error) {
      console.error('Failed to import tasks:', error);
    } finally {
      setIsImporting(false);
    }
  }, [parsedLines, selectedColumnId, createTask, onSuccess]);

  const handleClose = useCallback(() => {
    // Reset state
    setStep('upload');
    setTextContent('');
    setParsedLines([]);
    setSelectedColumnId(columns?.[0]?.id || '');
    onClose();
  }, [onClose, columns]);

  const selectedCount = useMemo(
    () => parsedLines.filter((line) => line.selected).length,
    [parsedLines]
  );

  const canProceed = textContent.trim().length > 0;
  const canImport = selectedCount > 0 && selectedColumnId;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Tasks">
      <div className="space-y-6">
        {step === 'upload' && (
          <>
            {/* Step 1: Upload or Paste */}
            <div className="space-y-4">
              {/* File Dropzone */}
              <FileDropzone onFileRead={handleFileRead} />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    or paste text below
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={textContent}
                onChange={handleTextChange}
                placeholder="Paste your tasks here (one per line)..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 'preview' && columns && (
          <>
            {/* Step 2: Preview */}
            <ImportPreview
              lines={parsedLines}
              columns={columns}
              selectedColumnId={selectedColumnId}
              onColumnChange={setSelectedColumnId}
              onToggleLine={handleToggleLine}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={isImporting}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={!canImport || isImporting}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting
                  ? 'Importing...'
                  : `Import ${selectedCount} task${selectedCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
