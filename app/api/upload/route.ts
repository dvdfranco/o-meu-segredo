import { NextResponse } from 'next/server';
import { uploadSecretFile } from '../services/s3';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Arquivo obrigatório.' },
        { status: 400 },
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use jpg, jpeg, png ou webp.' },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. O limite é 10MB.' },
        { status: 400 },
      );
    }

    const url = await uploadSecretFile(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('POST /api/upload failed', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to upload file.',
      },
      { status: 500 },
    );
  }
}
