import type { Metadata } from "next";
import "./globals.css";
import { getSupabaseAuthClient } from "./api/_lib/supabase-auth";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps, useMantineTheme } from '@mantine/core';

export const metadata: Metadata = {
  title: "Meu Segredo",
  description: "Segredos reais e anônimos, compartilhados com segurança.",
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
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          <div className="site">
            <header className="site-header">
              <div className="site-header__inner">
                <a href="/" className="site-title">
                  {metadata.title!.toString()}
                </a>
                <p className="site-tagline">
                  {metadata.description}
                </p>
              </div>
            </header>

            <main>{children}</main>

            <footer className="site-footer">
              <p>© {new Date().getFullYear()} {metadata.title!.toString()}. Todos os segredos são anônimos.</p>
              {user && (
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="logout-button">
                    Logout
                  </button>
                </form>
              )}
            </footer>
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
