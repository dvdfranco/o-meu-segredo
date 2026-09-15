import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from './_lib/supabase-auth';

export const ValidationErrorResponse = (message: string) => NextResponse.json({ error: message }, { status: 400 })

export const ErrorResponse = (message: string) => NextResponse.json({ error: message }, { status: 500 })

export const UnauthorizedResponse = () => NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

export const checkAuthenticated = async () => {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return !!user;
};
