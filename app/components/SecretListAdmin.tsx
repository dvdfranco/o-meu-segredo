"use client";

import { format } from "date-fns";
import { Switch } from "@mantine/core";
import "./SecretListAdmin.scss";
import useSecrets from "../hooks/useSecrets";

export default function SecretsTable() {
  const { secrets, status, setPublished } = useSecrets(false);

  if (status === "loading") return <p className="state">Carregando…</p>;
  if (status === "error")
    return <p className="state error">Não foi possível carregar os últimos segredos.</p>;
  if (secrets.length === 0) return <p className="state">Ainda não há segredos.</p>;

  return (
    <table className="secret-list-admin-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Descrição</th>
          <th>Imagem</th>
          <th>Publicar</th>
          <th>Opcões</th>
        </tr>
      </thead>
      <tbody>
        {secrets.map((secret) => (
          <tr key={secret.id}>
            <td>{format(new Date(secret.created_at), "dd/MM/yyyy")}</td>
            <td>{secret.description}</td>
            <td>{secret.image_url}</td>
            <td>
              <Switch
                checked={secret.is_published}
                onChange={(event) => setPublished(secret.id, event.currentTarget.checked)}
              />
            </td>
            <td>-</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
