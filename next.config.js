/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
    // Allow larger images for 4K displays
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Higher quality
    quality: 85,
  },
}

module.exports = nextConfig
