import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dampellamv.vercel.app'
  
  const routes = [
    '',
    '/about',
    '/academics',
    '/news',
    '/events',
    '/gallery',
    '/clubs',
    '/contact',
    '/portal/login',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly' as any,
    priority: route === '' ? 1 : 0.8,
  }))
}
