import { NextResponse } from 'next/server';
import SecretService from '../../services/SecretService';
import { ErrorResponse, UnauthorizedResponse, ValidationErrorResponse, checkAuthenticated } from '../../utils';
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await checkAuthenticated()){
    return UnauthorizedResponse;
  }

  const { id } = await params;
  const secretId = Number(id);
  if (!Number.isInteger(secretId)) {
    return ValidationErrorResponse('ID inválido.');
  }

  const body: { is_published?: boolean, image_url?: string } = await request
    .json()
    .catch(() => ({}));
  if (typeof body.is_published !== 'boolean' && typeof body.image_url !== 'string') {
    return ValidationErrorResponse('is_published ou image_url é obrigatório.');
  }

  try {
    await SecretService.updateSecret(secretId, {
      image_url: body.image_url,
      is_published: body.is_published,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`PATCH /api/secrets/${id} failed`, error);
    return ErrorResponse('Unable to update secret.');
  }
}


export async function DELETE(
  _: Request,
  { params } : { params: Promise<{id: string }> },
) {
  if (!await checkAuthenticated()){
    return UnauthorizedResponse;
  }

  const { id } = await params;
  const secretId = Number(id);
  if (!Number.isInteger(secretId)) {
    return ValidationErrorResponse('ID inválido.');
  }

  try {
    await SecretService.deleteSecret(secretId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/secrets/${id} failed`, error);
    return ErrorResponse('Unable to delete secret.');
  }
}
