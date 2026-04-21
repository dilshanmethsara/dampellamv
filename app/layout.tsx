import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta',
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
})

const baseUrl = 'https://dampellamv.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: 'MR/ Dampella M.V',
  appleWebApp: {
    title: 'MR/ Dampella M.V',
    statusBarStyle: 'default',
    capable: true,
  },
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
  manifest: '/manifest.json',
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
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${playfair.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <Providers>
          {children}
          <PwaRegister />
        </Providers>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "MR/ Dampella M.V",
              "alternateName": ["Dampella Maha Vidyalaya", "Dampella M.V"],
              "url": baseUrl
            })
          }}
        />
      </body>
    </html>
  )
}
