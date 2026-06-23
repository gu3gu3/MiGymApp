import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['migymapp.websavvy-solutions.com', 'localhost:3001', '192.168.1.110:3001']
    }
  },
  allowedDevOrigins: ['migymapp.websavvy-solutions.com']
};

export default nextConfig;
