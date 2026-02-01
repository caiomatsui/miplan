import React, { useState, useCallback } from 'react';
import { isValidTextFile, readFileAsText } from '../../utils/import';
import { CloudUpload, AlertCircle } from 'lucide-react';

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
          <CloudUpload
            className={`w-12 h-12 mx-auto ${
              isDragging ? 'text-primary' : 'text-muted-foreground'
            }`}
            strokeWidth={1.5}
          />

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
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
