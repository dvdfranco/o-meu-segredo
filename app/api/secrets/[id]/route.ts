import { NextResponse } from 'next/server';
import { updateSecretPublished } from '../../services/secrets';
import { getSupabaseAuthClient } from '../../_lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const secretId = Number(id);
  if (!Number.isInteger(secretId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const body: { is_published?: boolean } = await request
    .json()
    .catch(() => ({}));
  if (typeof body.is_published !== 'boolean') {
    return NextResponse.json(
      { error: 'is_published é obrigatório.' },
      { status: 400 },
    );
  }

  try {
    await updateSecretPublished(secretId, body.is_published);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`PATCH /api/secrets/${id} failed`, error);
    return NextResponse.json(
      { error: 'Unable to update secret.' },
      { status: 500 },
    );
  }
}
