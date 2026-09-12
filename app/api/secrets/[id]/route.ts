import { NextResponse } from 'next/server';
import { deleteSecret, updateSecretPublished } from '../../services/secrets';
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

  const body: { is_published?: boolean } = await request
    .json()
    .catch(() => ({}));
  if (typeof body.is_published !== 'boolean') {
    return ValidationErrorResponse('is_published é obrigatório.');
  }

  try {
    await updateSecretPublished(secretId, body.is_published);
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
    await deleteSecret(secretId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/secrets/${id} failed`, error);
    return ErrorResponse('Unable to delete secret.');
  }
}
