import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['migymp-app.com', 'migym-app.com', 'www.migym-app.com', 'localhost:3001', '192.168.1.110:3001']
    }
  },
  allowedDevOrigins: ['migymp-app.com', 'migym-app.com', 'www.migym-app.com'],
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
