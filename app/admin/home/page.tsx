import { redirect } from "next/navigation";
import { getSupabaseAuthClient } from "../../api/_lib/supabase-auth";
import SecretListAdmin from "@/app/components/SecretListAdmin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin");

  return (
    <main>
      <h1>Admin</h1>

      <SecretListAdmin />
    </main>
  );
}
