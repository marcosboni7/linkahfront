import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: true, // Isso faz com que o navegador sempre redirecione da home para o login
      },
    ];
  },
};

export default nextConfig;