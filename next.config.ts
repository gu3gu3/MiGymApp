import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['migym-app.com', 'www.migym-app.com', 'localhost:3001', '192.168.1.110:3001']
    }
  },
  allowedDevOrigins: ['migym-app.com', 'www.migym-app.com']
};

export default nextConfig;
