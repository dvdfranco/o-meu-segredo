import { useEffect, useState } from 'react';
import type { Secret } from '@/app/api/types';

export default function useSecrets(publishedOnly: boolean = true) {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const publishedOnlyParam = publishedOnly ? '' : '?publishedOnly=false';
        const response = await fetch(`/api/secrets${publishedOnlyParam}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const body: { secrets: Secret[] } = await response.json();
        setSecrets(body.secrets);
        setStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setStatus('error');
      }
    }

    load();
    return () => controller.abort();
  }, [publishedOnly]);

  async function addSecret(description: string, imageUrl?: string) {
    const response = await fetch('/api/secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, imageUrl }),
    });

    if (!response.ok) {
      const body: { error?: string } = await response.json().catch(() => ({}));
      throw new Error(body.error ?? `Request failed: ${response.status}`);
    }

    const body: { secret?: Secret } = await response.json().catch(() => ({}));
    const secret = body.secret;

    if (secret) {
      setSecrets((current) => [secret, ...current]);
    }

    return true;
  }

  async function setPublished(id: number, isPublished: boolean) {
    const previous = secrets;
    setSecrets((current) =>
      current.map((secret) =>
        secret.id === id ? { ...secret, is_published: isPublished } : secret,
      ),
    );

    try {
      const response = await fetch(`/api/secrets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: isPublished }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    } catch (error) {
      console.error(error);
      setSecrets(previous);
    }
  }

  return { secrets, status, addSecret, setPublished };
}
