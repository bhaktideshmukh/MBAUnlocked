import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    // Replace with your actual domain once you link a custom domain
    sitemap: 'https://mba-unlocked.vercel.app/sitemap.xml',
  };
}
