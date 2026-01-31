import React, { useState, useCallback } from 'react';
import { isValidTextFile, readFileAsText } from '../../utils/import';

interface FileDropzoneProps {
  onFileRead: (content: string) => void;
}

export function FileDropzone({ onFileRead }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!isValidTextFile(file)) {
        setError('Please upload a .txt file');
        return;
      }

      try {
        const content = await readFileAsText(file);
        onFileRead(content);
      } catch {
        setError('Failed to read file');
      }
    },
    [onFileRead]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-ring/50 hover:bg-accent/50'
          }
        `}
      >
        <input
          type="file"
          accept=".txt,text/plain"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-2">
          {/* Upload Icon */}
          <svg
            className={`w-12 h-12 mx-auto ${
              isDragging ? 'text-primary' : 'text-muted-foreground'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div className="text-muted-foreground">
            {isDragging ? (
              <span className="text-primary font-medium">
                Drop your file here
              </span>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  Drop .txt file here
                </span>
                <span className="text-muted-foreground"> or click to browse</span>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">Only .txt files are supported</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
