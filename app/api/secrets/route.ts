import { NextResponse } from 'next/server';
import { createSecret, listSecrets } from '../services/secrets';
import { getSupabaseAuthClient } from '../_lib/supabase-auth';

export const dynamic = 'force-dynamic';

const rateLimit = new Map<string, number>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get('publishedOnly') !== 'false';

  try {
    if (!publishedOnly) {
      const supabase = await getSupabaseAuthClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
      }
    }

    const secrets = await listSecrets(publishedOnly);
    return NextResponse.json({ secrets });
  } catch (error) {
    console.error('GET /api/secrets failed', error);
    return NextResponse.json(
      { error: 'Unable to retrieve secrets.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const lastRequestAt = rateLimit.get(ip) ?? 0;

  if (now - lastRequestAt < 2000) {
    return NextResponse.json(
      {
        error:
          'Muitas tentativas em pouco tempo. Tente novamente em alguns segundos.',
      },
      { status: 429 },
    );
  }

  const body: { description?: string; imageUrl?: string } = await request
    .json()
    .catch(() => ({}));
  let description = body.description ?? '';
  const imageUrl = body.imageUrl;

  if (imageUrl) {
    description = 'Imagem própria';
  }
  {
    if (typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'description é obrigatória.' },
        { status: 400 },
      );
    }

    if (description.trim().length > 140) {
      return NextResponse.json(
        { error: 'description deve ter no máximo 140 caracteres.' },
        { status: 400 },
      );
    }
  }

  try {
    rateLimit.set(ip, now);
    await createSecret(description, imageUrl);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/secrets failed', error);
    return NextResponse.json(
      { error: 'Unable to create secret.' },
      { status: 500 },
    );
  }
}
