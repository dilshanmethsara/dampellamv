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

export const metadata: Metadata = {
  title: {
    default: 'MR/ Dampella M.V - Government School',
    template: '%s | MR/ Dampella M.V',
  },
  description: 'Welcome to MR/ Dampella M.V, a prestigious government school in the Southern Province, Sri Lanka. Providing quality education with 60+ students and 25 dedicated teachers.',
  keywords: ['school', 'education', 'government school', 'Southern Province', 'Sri Lanka', 'Dampella'],
  authors: [{ name: 'MR/ Dampella M.V' }],
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
