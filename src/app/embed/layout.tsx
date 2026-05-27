import { ReactNode } from 'react';


export default async function EmbedLayout({
  children,
  params
}: {
  children: ReactNode;
  params: any;
}) {
  
  
  return (
    <html lang="en">
      <body className="bg-transparent font-sans m-0 p-4">
        {/* No Header or Footer, pure content for iframe injection */}
        <main className="w-full max-w-4xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
