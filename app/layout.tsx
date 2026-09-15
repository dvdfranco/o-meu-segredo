import type { Metadata } from 'next';
import './globals.css';
import { getSupabaseAuthClient } from './api/_lib/supabase-auth';
import '@mantine/core/styles.css';
import '@mantine/lightbox/styles.css';
import { LightboxProviderComponent } from '@mantine/lightbox';
import { ModalsProvider } from '@mantine/modals';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next"
import { MantineProvider, mantineHtmlProps } from '@mantine/core';
import Link from 'next/link';

const SITE_NAME = 'Meu Segredo';
const SITE_DESCRIPTION =
  'Segredos reais e anônimos, compartilhados com segurança.';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/share-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/share-image.jpg'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="pt-BR" {...mantineHtmlProps}>
      <head>
        <meta name="google-site-verification" content="hJGds8d7nZg97qyU5Vl0ZV-nsUmFRqRJxHhBT_HnAe4" />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-W4ZRPM68ZQ"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W4ZRPM68ZQ');
          `}
        </Script>
        <Script id="mantine-color-scheme" strategy="beforeInteractive">
          {`
            try {
              var _colorScheme = window.localStorage.getItem("mantine-color-scheme-value");
              var colorScheme = _colorScheme === "light" || _colorScheme === "dark" || _colorScheme === "auto" ? _colorScheme : "dark";
              var computedColorScheme = colorScheme !== "auto" ? colorScheme : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              document.documentElement.setAttribute("data-mantine-color-scheme", computedColorScheme);
            } catch (e) {}
          `}
        </Script>
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          <LightboxProviderComponent />
          <ModalsProvider>
            <div className="site">
              <header className="site-header">
                <div className="site-header__inner">
                  <h1>
                    <Link href="/" className="site-title">
                      {SITE_NAME}
                    </Link>
                  </h1>
                  <p className="site-tagline">{SITE_DESCRIPTION}</p>
                </div>
              </header>

              <main>{children}</main>

              <footer className="site-footer">
                <p>
                  © {new Date().getFullYear()} {SITE_NAME}. Todos
                  os segredos são anônimos.
                </p>
                {user && (
                  <form action="/api/auth/logout" method="post">
                    <button type="submit" className="logout-button">
                      Logout
                    </button>
                  </form>
                )}
              </footer>
            </div>
          </ModalsProvider>
        </MantineProvider>
        <Analytics />
      </body>
    </html>
  );
}