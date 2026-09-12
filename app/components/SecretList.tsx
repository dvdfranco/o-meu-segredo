'use client';

import useSecrets from '@/app/hooks/useSecrets';
import { format } from 'date-fns';

export default function SecretsTable() {
  const S3_URL = process.env.NEXT_PUBLIC_BUCKET_URL;
  const { secrets, isLoading, hasError } = useSecrets(true, 1, 30);

  if (isLoading) return <p className="state">Carregando…</p>;
  if (hasError)
    return (
      <p className="state error">
        Não foi possível carregar os últimos segredos.
      </p>
    );
  if (secrets.length === 0)
    return <p className="state">Ainda não há segredos.</p>;

  return (
    <div className="secret-list">
      {secrets.map((secret) => (
        <article key={secret.id} className="secret-card">
          {secret.image_url ? (
            <img
              className="secret-card__image"
              src={`${S3_URL}/${secret.image_url}`}
              alt={secret.description}
              title={secret.description}
            />
          ) : (
            <p className="secret-card__text">{secret.description}</p>
          )}
          <p className="secret-card__meta">
            Pessoa anônima · {format(new Date(secret.created_at), 'dd/MM/yyyy')}
          </p>
        </article>
      ))}
    </div>
  );
}
