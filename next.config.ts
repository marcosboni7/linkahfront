import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Adicionei o domínio da AWS que você está usando para as imagens não quebrarem
    domains: [
      'linkah-api.onrender.com', 
      'images.unsplash.com', 
      'zmn9xuwd4y.us-east-1.awsapprunner.com'
    ],
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/landing', // Aponta para sua nova pasta sem mudar a URL no navegador
      },
    ];
  },
};

export default nextConfig;