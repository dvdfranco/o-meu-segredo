import { NextResponse } from "next/server";
import { listSecrets } from "../_lib/secrets";
import { getSupabaseAuthClient } from "../_lib/supabase-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("publishedOnly") !== "false";

  try {
    if (!publishedOnly) {
      const supabase = await getSupabaseAuthClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }
    }

    const secrets = await listSecrets(publishedOnly);
    return NextResponse.json({ secrets });
  } catch (error) {
    console.error("GET /api/secrets failed", error);
    return NextResponse.json(
      { error: "Unable to retrieve secrets." },
      { status: 500 }
    );
  }
}
