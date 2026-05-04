import { useState, useCallback } from 'react';
import { uploadFile } from '@/lib/file-storage';

export interface UploadProgress {
  file: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export function useFileUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});

  const upload = useCallback(
    async (files: File[], category: string = 'misc') => {
      const results: Record<string, UploadProgress> = {};

      for (const file of files) {
        const key = `${file.name}-${file.size}-${Date.now()}`;
        results[key] = { file: file.name, progress: 0, status: 'uploading' };
        setUploads((prev) => ({ ...prev, [key]: results[key] }));

        try {
          const data = await uploadFile(file, category);
          results[key] = {
            file: file.name,
            progress: 100,
            status: 'success',
            url: data.url,
          };
        } catch (error) {
          results[key] = {
            file: file.name,
            progress: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed',
          };
        }

        setUploads((prev) => ({ ...prev, [key]: results[key] }));
      }

      return results;
    },
    []
  );

  const clearUploads = useCallback(() => {
    setUploads({});
  }, []);

  const removeUpload = useCallback((key: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return {
    uploads,
    upload,
    clearUploads,
    removeUpload,
  };
}
