import { redirect } from "next/navigation";
import LoginForm from "../components/LoginForm";
import { getSupabaseAuthClient } from "../api/_lib/supabase-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/admin/home");

  return (
    <main>
      <h1>Admin</h1>
      <LoginForm />
    </main>
  );
}
