import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Image } from '@mantine/core';
import SecretService from '@/app/api/services/SecretService';

export const dynamic = 'force-dynamic';

type SecretPageProps = {
  params: Promise<{ id: string }>;
};

const getSecret = cache(async (id: string) => {
  const secretId = Number(id);

  if (!Number.isInteger(secretId) || secretId < 1) notFound();

  const secret = await SecretService.getPublishedSecret(secretId);
  if (!secret) notFound();

  return secret;
});

async function loadSecret(params: SecretPageProps['params']) {
  const { id } = await params;
  return getSecret(id);
}

// This is mostly for google indexing, twitter sharing, etc:
export async function generateMetadata({
  params,
}: SecretPageProps): Promise<Metadata> {
  const secret = await loadSecret(params);
  const canonical = `/secret/${secret.id}`;
  const imageUrl = secret.image_url
    ? `${process.env.NEXT_PUBLIC_BUCKET_URL}/${secret.image_url}`
    : '/share-image.jpg';

  return {
    title: secret.description,
    description: secret.description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: secret.description,
      description: secret.description,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: secret.description,
      description: secret.description,
      images: [imageUrl],
    },
  };
}

export default async function SecretPage({ params }: SecretPageProps) {
  const secret = await loadSecret(params);
  const imageUrl = secret.image_url
    ? `${process.env.NEXT_PUBLIC_BUCKET_URL}/${secret.image_url}`
    : undefined;

  return (
    <article className="secret-detail">
      <Link href="/" className="secret-detail__back">
        Todos os segredos
      </Link>

      <h1>Segredo anônimo</h1>
      {imageUrl ? (
        <Image
          className="secret-detail__image"
          src={imageUrl}
          alt={secret.description}
        />
      ) : (
        <p className="secret-detail__text">{secret.description}</p>
      )}
      <p className="secret-detail__meta">
        Pessoa anônima · {new Date(secret.created_at).toLocaleDateString('pt-BR')}
      </p>
    </article>
  );
}
