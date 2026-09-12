import { NextResponse } from 'next/server';
import { createSecret, listSecrets } from '../services/secrets';
import { ErrorResponse, UnauthorizedResponse, ValidationErrorResponse, checkAuthenticated } from '../utils';

export const dynamic = 'force-dynamic';

const rateLimit = new Map<string, number>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get('publishedOnly') !== 'false';
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '10');

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    return ValidationErrorResponse('Parâmetros de paginação inválidos.');
  }

  try {
    if (!publishedOnly && (!await checkAuthenticated()))
        return UnauthorizedResponse;

    const result = await listSecrets(publishedOnly, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/secrets failed', error);
    return ErrorResponse('Unable to retrieve secrets.');
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
  else
  {
    if (description.trim().length === 0) {
      return ValidationErrorResponse('O texto do seu segredo é obrigatório.');
    }

    if (description.trim().length > 140) {
      return ValidationErrorResponse('Seu segredo deve ter no máximo 140 caracteres.');
    }
  }

  try {
    rateLimit.set(ip, now);
    await createSecret(description, imageUrl);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/secrets failed', error);
    return ErrorResponse('Unable to create secret.');
  }
}
