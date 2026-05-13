import { MetadataRoute } from 'next';
import { SUPPORTED_COLLEGES } from '../../scripts/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mba-unlocked.vercel.app';

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/add-experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Dynamic college routes
  const collegeRoutes = SUPPORTED_COLLEGES.map((college) => ({
    url: `${baseUrl}/colleges/${college.id}/transcripts`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...routes, ...collegeRoutes];
}
