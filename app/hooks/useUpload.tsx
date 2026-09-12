'use client';

export default function useUpload() {
  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

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

    return body.url;
  }

  return { uploadFile };
}
