import { getSupabaseClient } from "./supabase";
import type { Secret } from "./types";

export async function listSecrets(onlyPublished: boolean = true): Promise<Secret[]> {
  let query = getSupabaseClient()
  .from("secrets")
  .select("id, created_at, description, image_url, is_published")
  .order("created_at", { ascending: false });

  if (onlyPublished)
    query = query.eq("is_published", true)
  
  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load secrets: ${error.message}`);
  }

  return (data ?? []) as Secret[];
}

export async function updateSecretPublished(id: number, isPublished: boolean): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("secrets")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update secret: ${error.message}`);
  }
}
