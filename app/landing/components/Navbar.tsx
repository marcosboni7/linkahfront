'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-600 to-orange-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">L</span>
          </div>
          <span className="text-slate-900 font-black text-xl tracking-tighter uppercase">Linkah</span>
        </div>

        {/* LINKS CENTRAIS */}
        <div className="hidden md:flex items-center gap-8">
          {['Início', 'Sobre', 'Segurança', 'Para Organizadores', 'FAQ'].map((item) => (
            <Link 
              key={item} 
              href="#" 
              className="text-slate-500 hover:text-pink-600 font-bold text-sm transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* BOTÃO ACESSAR */}
        <button 
          onClick={() => router.push('/auth/login')}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95"
        >
          Acessar App
        </button>
      </div>
    </nav>
  );
}