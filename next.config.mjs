/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'localhost:3000',
    'localhost:3001',
    '127.0.0.1:3000',
    '192.168.211.17',
    '192.168.211.17:3000',
    '192.168.211.17:3001',
  ],
}

export default nextConfig
