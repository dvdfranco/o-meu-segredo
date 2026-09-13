import type { Metadata } from 'next';
import './globals.css';
import { getSupabaseAuthClient } from './api/_lib/supabase-auth';
import '@mantine/core/styles.css';
import '@mantine/lightbox/styles.css';
import { ModalsProvider } from '@mantine/modals';
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Meu Segredo',
  description: 'Segredos reais e anônimos, compartilhados com segurança.',
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
    <html lang="ptbr" {...mantineHtmlProps}>
      <head>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-W4ZRPM68ZQ"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-W4ZRPM68ZQ');
        </script>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          <ModalsProvider>
            <div className="site">
              <header className="site-header">
                <div className="site-header__inner">
                  <Link href="/" className="site-title">
                    {metadata.title!.toString()}
                  </Link>
                  <p className="site-tagline">{metadata.description}</p>
                </div>
              </header>

              <main>{children}</main>

              <footer className="site-footer">
                <p>
                  © {new Date().getFullYear()} {metadata.title!.toString()}. Todos
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
      </body>
    </html>
  );
}
