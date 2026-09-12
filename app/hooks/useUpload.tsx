'use client';
import { useState } from 'react';

export default function useUpload() {
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = async (file: File, filePath = 'uploaded/'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filePath', filePath);

    setIsLoading(true);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const body: { error?: string } = await response.json().catch(() => ({}));
      throw new Error(body.error ?? `Request failed: ${response.status}`);
    }

    const body: { url?: string } = await response.json().catch(() => ({}));

    if (!body.url) {
      throw new Error('Upload falhou.');
    }

    setIsLoading(false);

    return body.url;
  }

  const deleteFile = async (filePath: string): Promise<void> => {
    setIsLoading(true);

    const response = await fetch('/api/upload', {
      method: 'DELETE',
      body: JSON.stringify({ filePath }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setIsLoading(false);

    if (!response.ok) {
      const body: { error?: string } = await response.json().catch(() => ({}));
      throw new Error(body.error ?? `Request failed: ${response.status}`);
    }
  };

  return { uploadFile, deleteFile, isLoading };
}
