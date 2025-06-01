/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // ATENÇÃO: Use '**' APENAS PARA DEBUG. Não é seguro para produção.
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Adicionado para desabilitar a otimização de imagem do Next.js
  },
};

export default nextConfig;
