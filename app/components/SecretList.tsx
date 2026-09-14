'use client';
import { Image } from '@mantine/core';
import useSecrets from '@/app/hooks/useSecrets';
import { format } from 'date-fns';
import type { Secret } from '@/app/api/types';
import Link from 'next/link';
import { Lightbox } from '@mantine/lightbox';

type SecretListProps = {
  page: number;
  pageSize: number;
  initialSecrets: Secret[];
  initialTotal: number;
};

export default function SecretsTable({
  page,
  pageSize,
  initialSecrets,
  initialTotal,
}: SecretListProps) {
  const S3_URL = process.env.NEXT_PUBLIC_BUCKET_URL;
  const { secrets, isLoading, hasError } = useSecrets(
    true,
    page,
    pageSize,
    initialSecrets,
    initialTotal,
  );

  if (isLoading) return <p className="state">Carregando…</p>;
  if (hasError)
    return (
      <p className="state error">
        Não foi possível carregar os últimos segredos.
      </p>
    );
  if (secrets.length === 0)
    return <p className="state">Ainda não há segredos.</p>;

  const secretsWithImage = secrets.filter((secret) => secret.image_url);
  const slides = secretsWithImage.map((secret) => ({
    src: `${S3_URL}/${secret.image_url}`,
    alt: secret.description,
  }));

  return (
    <div className="secret-list">
      {secrets.map((secret) => (
        <article key={secret.id} className="secret-card">
          {secret.image_url ? (
            <Link
              href={`/secret/${secret.id}`}
              className="secret-card__image-link"
              aria-label="Abrir segredo"
              onClick={(event) => {
                event.preventDefault();
                Lightbox.open({
                  slides,
                  startIndex: secretsWithImage.findIndex(
                    (imageSecret) => imageSecret.id === secret.id,
                  ),
                });
              }}
            >
              <Image
                className="secret-card__image"
                src={`${S3_URL}/${secret.image_url}`}
                alt={secret.description}
                title={secret.description}
              />
            </Link>
          ) : (
            <Link
              href={`/secret/${secret.id}`}
              className="secret-card__text secret-card__text-link"
            >
              {secret.description}
            </Link>
          )}
          <p className="secret-card__meta">
            Pessoa anônima · {format(new Date(secret.created_at), 'dd/MM/yyyy')}
          </p>
        </article>
      ))}
    </div>
  );
}
