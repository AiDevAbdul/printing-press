'use client';

import { useRef, useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { getFileSizeLabel } from '@/lib/file-storage';
import { clsx } from 'clsx';

interface FileUploadProps {
  category?: string;
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  onUploadComplete?: (urls: string[]) => void;
  onError?: (error: string) => void;
}

export function FileUpload({
  category = 'misc',
  maxSize = 50 * 1024 * 1024,
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  multiple = true,
  onUploadComplete,
  onError,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploads, upload, clearUploads } = useFileUpload();

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.size > maxSize) {
        const error = `${file.name} is too large. Max ${getFileSizeLabel(maxSize)}`;
        onError?.(error);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        const error = `${file.name} type not allowed`;
        onError?.(error);
        return;
      }
    }

    const results = await upload(fileArray, category);
    const successUrls = Object.values(results)
      .filter((r) => r.status === 'success')
      .map((r) => r.url!)
      .filter((url) => url);

    if (successUrls.length > 0) {
      onUploadComplete?.(successUrls);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max {getFileSizeLabel(maxSize)}
        </p>
      </div>

      {Object.entries(uploads).length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">Uploads</p>
            <button
              onClick={clearUploads}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>

          {Object.entries(uploads).map(([key, upload]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
            >
              {upload.status === 'uploading' && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              {upload.status === 'success' && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {upload.status === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {upload.file}
                </p>
                {upload.error && (
                  <p className="text-xs text-red-500">{upload.error}</p>
                )}
              </div>

              <button
                onClick={() => {
                  // Remove upload from state if needed
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
