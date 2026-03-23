import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
})

const baseUrl = 'https://dampellamv.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'MR/ Dampella M.V | Dampella Maha Vidyalaya - Official Website',
    template: '%s | MR/ Dampella M.V',
  },
  description: 'Official website of MR/ Dampella M.V (Dampella Maha Vidyalaya), a prestigious government school in the Southern Province, Sri Lanka. Excellence in education since decades.',
  keywords: [
    'Dampella Maha Vidyalaya', 
    'MR/ Dampella M.V', 
    'Dampella M.V', 
    'Dampella School', 
    'Government School Matara',
    'Southern Province Schools', 
    'Matara District Schools', 
    'Best Schools in Southern Province Sri Lanka'
  ],
  authors: [{ name: 'MR/ Dampella M.V' }],
  creator: 'Dilshan Methsara',
  publisher: 'MR/ Dampella M.V',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'MR/ Dampella M.V | Dampella Maha Vidyalaya - Official Website',
    description: 'Welcome to the official website of MR/ Dampella M.V (Dampella Maha Vidyalaya). Empowering students through quality education in Sri Lanka.',
    siteName: 'MR/ Dampella M.V',
    images: [
      {
        url: '/dmvlogo.jpg',
        width: 1200,
        height: 630,
        alt: 'MR/ Dampella M.V Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MR/ Dampella M.V | Dampella Maha Vidyalaya',
    description: 'Official website of MR/ Dampella M.V (Dampella Maha Vidyalaya). Empowering students through quality education.',
    images: ['/dmvlogo.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/dmvlogo.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/dmvlogo.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/dmvlogo.jpg',
        type: 'image/jpeg',
      },
    ],
    apple: '/dmvlogo.jpg',
    shortcut: '/dmvlogo.jpg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YwHETmhUVfEBYMyuKH5MqHT4rgx-MjNT6X77yYxnfbc',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e40af',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
