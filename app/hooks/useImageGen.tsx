import { useState } from 'react';

type GenerateImageResponse = {
  ok: boolean;
  description: string;
  imageBase64: string;
  error?: string;
};

export default function useImageGen() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async (description: string): Promise<GenerateImageResponse | null> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const body = (await response.json().catch(() => ({}))) as Partial<GenerateImageResponse>;

      if (!response.ok) {
        throw new Error(body.error ?? 'Não foi possível gerar a imagem.');
      }

      return body as GenerateImageResponse;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível gerar a imagem.';

      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateImage,
    error,
    isLoading,
  };
}
