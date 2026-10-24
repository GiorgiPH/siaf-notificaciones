import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // La raíz es este proyecto: evita que Next tome un lockfile de una carpeta superior como raíz del workspace.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
