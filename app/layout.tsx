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
    default: 'MR/ Dampella M.V - Official School Website',
    template: '%s | MR/ Dampella M.V',
  },
  description: 'Official website of MR/ Dampella M.V, a prestigious government school in the Southern Province, Sri Lanka. Excellence in education with dedicated faculty and modern facilities.',
  keywords: [
    'MR/ Dampella M.V', 
    'Dampella M.V', 
    'Dampella Maha Vidyalaya', 
    'Dampella School', 
    'Government School Sri Lanka', 
    'Southern Province Schools', 
    'Matara District Schools', 
    'Quality Education Sri Lanka'
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
    title: 'MR/ Dampella M.V - Official School Website',
    description: 'Official website of MR/ Dampella M.V. Empowering students through quality education since decades.',
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
    title: 'MR/ Dampella M.V - Official School Website',
    description: 'Official website of MR/ Dampella M.V. Empowering students through quality education.',
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
}

export const viewport: Viewport = {
  themeColor: '#1e40af',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
