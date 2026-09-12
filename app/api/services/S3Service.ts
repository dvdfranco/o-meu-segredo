import { createClient } from '@supabase/supabase-js';

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'sec-images';

class S3Service {
  static async deleteSecretFile(filePath: string): Promise<void> {
    const url = process.env.SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or Supabase storage credentials.');
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    console.log("Will delete", filePath);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  static async uploadSecretFile(file: File, filePath = 'uploaded/'): Promise<string> {
    const url = process.env.SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or Supabase storage credentials.');
    }

    const extension = file.name.includes('.')
      ? file.name.slice(file.name.lastIndexOf('.'))
      : '';

    const prefix = filePath === '/' ? 'generated' : 'uploaded';
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;
    const path = `${filePath}${fileName}`;

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const publicUrl = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data?.path ?? path);

    if (!publicUrl.data?.publicUrl) {
      throw new Error('Failed to generate the uploaded file URL.');
    }

    return publicUrl.data.publicUrl;
  }
}
export default S3Service;
