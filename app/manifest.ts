import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MR/ Dampella M.V',
    short_name: 'Dampella LMS',
    description: 'Official portal and website for MR/ Dampella M.V.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      {
        src: '/dmvlogo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/dmvlogo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      }
    ],
  }
}
