import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

export default async function EmbedLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <html lang={locale}>
      <body className="bg-transparent font-sans m-0 p-4">
        {/* No Header or Footer, pure content for iframe injection */}
        <main className="w-full max-w-4xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
