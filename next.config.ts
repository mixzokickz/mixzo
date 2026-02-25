import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.stockx.com' },
      { protocol: 'https', hostname: 'stockx-assets.imgix.net' },
      { protocol: 'https', hostname: 'stockx.imgix.net' },
      { protocol: 'https', hostname: 'cdn.goat.com' },
      { protocol: 'https', hostname: 'image.goat.com' },
      { protocol: 'https', hostname: 'afmtwymcqprwaukkpfta.supabase.co' },
    ],
  },
}

export default nextConfig
