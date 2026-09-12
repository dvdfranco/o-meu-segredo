import { getSupabaseClient } from '../_lib/supabase';
import type { Secret } from '../types';

export type PaginatedSecrets = {
  secrets: Secret[];
  total: number;
};

export async function listSecrets(
  onlyPublished: boolean = true,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedSecrets> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = getSupabaseClient()
    .from('secrets')
    .select('id, created_at, description, image_url, is_published', {
      count: 'exact',
    })
    .order('created_at', { ascending: false });

  if (onlyPublished) query = query.eq('is_published', true);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Failed to load secrets: ${error.message}`);
  }

  return {
    secrets: (data ?? []) as Secret[],
    total: count ?? 0,
  };
}

export async function createSecret(
  description: string,
  imageUrl?: string,
): Promise<void> {
  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    throw new Error('Description is required.');
  }

  const { error } = await getSupabaseClient().from('secrets').insert({
    description: trimmedDescription,
    image_url: imageUrl,
    is_own_art: !!imageUrl,
    is_published: false,
  });

  if (error) {
    throw new Error(`Failed to create secret: ${error.message}`);
  }
}

export async function updateSecretPublished(
  id: number,
  isPublished: boolean,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('secrets')
    .update({ is_published: isPublished })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update secret: ${error.message}`);
  }
}


export async function deleteSecret(
  id: number
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('secrets')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete secret: ${error.message}`);
  }
}