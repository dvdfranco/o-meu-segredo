import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function useLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body: { error?: string } = await response.json().catch(() => ({}));
        setError(body.error ?? "Não foi possível iniciar sessão.");
        return;
      }

      router.replace("/admin/home");
      router.refresh();
    } catch {
      setError("Não foi possível iniciar sessão.");
    } finally {
      setSubmitting(false);
    }
  });

  return {
    register: form.register,
    error,
    submitting,
    handleSubmit,
  };
}