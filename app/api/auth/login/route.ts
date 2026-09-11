import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from "../../_lib/supabase-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let email: unknown;
  let password: unknown;

  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const supabase = await getSupabaseAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { error: "Credenciais inválidas." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
