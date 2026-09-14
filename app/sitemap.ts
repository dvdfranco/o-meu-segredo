import type { MetadataRoute } from 'next';
import SecretService from './api/services/SecretService';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const secrets = await SecretService.listPublishedSecretIds();

  return [
    {
      url: siteUrl,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...secrets.map((secret) => ({
      url: `${siteUrl}/secret/${secret.id}`,
      lastModified: new Date(secret.created_at),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}