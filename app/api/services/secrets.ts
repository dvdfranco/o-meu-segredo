import { getSupabaseClient } from '../_lib/supabase';
import type { Secret } from '../types';

export async function listSecrets(
  onlyPublished: boolean = true,
): Promise<Secret[]> {
  let query = getSupabaseClient()
    .from('secrets')
    .select('id, created_at, description, image_url, is_published')
    .order('created_at', { ascending: false });

  if (onlyPublished) query = query.eq('is_published', true);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load secrets: ${error.message}`);
  }

  return (data ?? []) as Secret[];
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
