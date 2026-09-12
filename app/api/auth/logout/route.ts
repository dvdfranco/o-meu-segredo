import { NextResponse } from 'next/server';
import { getSupabaseAuthClient } from '../../_lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await getSupabaseAuthClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
