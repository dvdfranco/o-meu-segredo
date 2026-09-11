"use client";

import { Button, PasswordInput, TextInput } from "@mantine/core";
import useLogin from "@/app/hooks/useLogin";

export default function LoginForm() {
  const { register, error, submitting, handleSubmit } = useLogin();

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <TextInput
        label="Usuário"
        type="email"
        autoComplete="username"
        required
        {...register("email")}
      />

      <PasswordInput
        label="Senha"
        autoComplete="current-password"
        required
        {...register("password")}
      />

      <Button type="submit" loading={submitting}>
        Entrar
      </Button>

      {error && <p className="state error">{error}</p>}
    </form>
  );
}
