import { NextResponse } from 'next/server';
import ImageService from '../services/ImageService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body: { description?: string } = await request.json().catch(() => ({}));
    const description = body.description ?? '';

    if (!description.trim()) {
      return NextResponse.json(
        { error: 'A descrição é obrigatória.' },
        { status: 400 },
      );
    }

    const imageBase64 = await ImageService.generateSecretImage(description);

    return NextResponse.json({
      ok: true,
      description,
      imageBase64,
    });
  } catch (error) {
    console.error('POST /api/image failed', error);

    return NextResponse.json(
      { error: 'Não foi possível gerar a imagem.' },
      { status: 500 },
    );
  }
}
