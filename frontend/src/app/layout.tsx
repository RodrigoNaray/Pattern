import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '@/components/layout/ClientLayout';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-body',
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Tienda de Ropa',
    template: '%s | Tienda de Ropa',
  },
  description: 'Explora nuestra coleccion de ropa con estilo y calidad. Pedidos faciles por transferencia bancaria.',
  openGraph: {
    type: 'website',
    locale: 'es_UY',
    siteName: 'Tienda de Ropa',
    title: 'Tienda de Ropa',
    description: 'Explora nuestra coleccion de ropa con estilo y calidad. Pedidos faciles por transferencia bancaria.',
    url: baseUrl,
    images: [
      {
        url: '/og-image',
        width: 1200,
        height: 630,
        alt: 'Tienda de Ropa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tienda de Ropa',
    description: 'Explora nuestra coleccion de ropa con estilo y calidad. Pedidos faciles por transferencia bancaria.',
    images: ['/og-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${lora.variable} ${inter.variable}`}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
