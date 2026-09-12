import { useEffect, useState } from 'react';
import type { Secret } from '@/app/api/types';

export default function useSecrets(
  publishedOnly: boolean = true,
  page: number = 1,
  pageSize: number = 50,
) {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setHasError(false);

      try {
        const query = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (!publishedOnly) query.set('publishedOnly', 'false');

        const response = await fetch(`/api/secrets?${query.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const body: { secrets: Secret[]; total: number } = await response.json();
        setSecrets(body.secrets);
        setTotal(body.total);
        setIsLoading(false);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setIsLoading(false);
        setHasError(true);
      }
    }

    load();
    return () => controller.abort();
  }, [page, pageSize, publishedOnly, refreshKey]);

  async function addSecret(description: string, imageUrl?: string) {
    setIsLoading(true);

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
      setTotal((current) => current + 1);
    }
    setIsLoading(false);

    return true;
  }

  async function setPublished(id: number, isPublished: boolean) {
    setLoadingUpdate(true);
    setHasError(false);

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
      setHasError(true);
    }

    setLoadingUpdate(false);
  }

  async function updateImage(id: number, imageUrl: string) {
    setLoadingUpdate(true);
    setHasError(false);

    try {
      const response = await fetch(`/api/secrets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      setSecrets((current) =>
        current.map((secret) =>
          secret.id === id ? { ...secret, image_url: imageUrl } : secret,
        ),
      );
    } catch (error) {
      console.error(error);
      setHasError(true);
    }

    setLoadingUpdate(false);
  }

  const deleteSecret = async (id: number) => {
    setLoadingUpdate(true);
    setHasError(false);

    const previous = secrets;
    setSecrets(secrets.filter(secret => secret.id !== id));

    try {
      const response = await fetch(`/api/secrets/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'},
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      setTotal((current) => Math.max(0, current - 1));
      setRefreshKey((current) => current + 1);
    } catch (error) {
      console.error(error);
      setSecrets(previous);
      setHasError(true);
    }

    setLoadingUpdate(false);
  }

  return { secrets, total, isLoading, loadingUpdate, hasError, addSecret, setPublished, updateImage, deleteSecret };
}
