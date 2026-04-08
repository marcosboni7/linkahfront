/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 1. Redirecionamentos de Rota */
  async redirects() {
    return [
      {
        // Quando alguém acessar linkah.eu/admin
        source: '/admin',
        // Será enviado para linkah.eu/admin/login
        destination: '/admin/login',
        // permanent: true ajuda no cache e SEO (301 redirect)
        permanent: true,
      },
    ];
  },

  /* 2. Configurações de Imagem (Permitir domínios externos) */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'linkah-api.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'api-linkah.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com', // Importante para o seu AVATAR_FALLBACK do Pinterest
      },
    ],
  },

  /* Você pode manter o suporte antigo de domains se preferir, 
     mas o remotePatterns acima é o padrão moderno do Next.js */
};

export default nextConfig;