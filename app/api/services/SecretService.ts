import { PostgrestFilterBuilder } from '@supabase/supabase-js';
import { getSupabaseClient } from '../_lib/supabase';
import type { Secret, UpdateSecretData } from '../types';

export type PaginatedSecrets = {
  secrets: Secret[];
  total: number;
};

class SecretService {
  static async listSecrets(
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

  static async getPublishedSecret(id: number): Promise<Secret | null> {
    const { data, error } = await getSupabaseClient()
      .from('secrets')
      .select('id, created_at, description, image_url, is_published')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load secret: ${error.message}`);
    }

    return (data ?? null) as Secret | null;
  }

  static async listPublishedSecretIds(): Promise<Pick<Secret, 'id' | 'created_at'>[]> {
    const { data, error } = await getSupabaseClient()
      .from('secrets')
      .select('id, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load published secret IDs: ${error.message}`);
    }

    return (data ?? []) as Pick<Secret, 'id' | 'created_at'>[];
  }

  static async createSecret(
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

  static async updateSecret(
    id: number,
    data: UpdateSecretData,
  ): Promise<void> {
    const client = getSupabaseClient().from('secrets')

    const thisSecret = (await client
      .select('id, created_at, description, image_url, is_published, is_own_art')
      .eq('id', id)
      .single()
    ).data as Secret;    

    if (data.image_url)
      thisSecret.image_url = data.image_url;

    if (data.is_published !== undefined)
      thisSecret.is_published = data.is_published;

    const { error } = await client.update(thisSecret).eq('id', id);

    if (error) {
      throw new Error(`Failed to update secret: ${error.message}`);
    }
  }


  static async deleteSecret(
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
}

export default SecretService;