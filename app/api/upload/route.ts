import { NextResponse } from 'next/server';
import S3Service from '../services/S3Service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const filePath = formData.get('filePath')?.toString() ?? 'uploaded/';

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

    const url = await S3Service.uploadSecretFile(file, filePath);
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

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { filePath } = body;

    if (!filePath || filePath === '') {
      return new NextResponse(
        null,
        { status: 204 },
      );
    }

    await S3Service.deleteSecretFile(filePath);
    return new NextResponse(
      null,
      { status: 204 },
    );
  } catch (error) {
    console.error('DELETE /api/upload failed', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to delete file.',
      },
      { status: 500 },
    );
  }
}
