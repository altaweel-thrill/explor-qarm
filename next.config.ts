import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Keep initial hydration independent of the development debug WebSocket.
    reactDebugChannel: false,
  },
};

export default nextConfig;
