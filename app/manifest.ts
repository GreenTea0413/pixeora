import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pixelket - Free Pixel Art Editor',
    short_name: 'Pixelket',
    description: 'Create beautiful pixel art with our free online editor',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['graphics', 'utilities', 'productivity'],
    screenshots: [
      {
        src: '/opengraph-image.png',
        sizes: '1200x488',
        type: 'image/png',
      },
    ],
  };
}
