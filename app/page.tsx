// app/page.tsx
'use client';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { ChevronRight, ChevronLeft, Map } from 'lucide-react';

export default function BuyTicketHome() {
  return (
    <div className="bg-[#0B0121] min-h-screen text-white">
      <Navbar />

      {/* TOP BAR INFO */}
      <div className="bg-[#0B0121] border-b border-white/5 py-2 text-center overflow-hidden">
        <p className="text-[11px] font-medium text-slate-300 tracking-tight whitespace-nowrap">
          Somos o maior mercado secundário de ingressos do Brasil. Os preços são definidos pelos vendedores.
        </p>
      </div>

      {/* HERO SECTION - O BANNER DA ANITTA */}
      <section className="relative h-[550px] w-full flex items-center justify-center overflow-hidden">
        {/* Background com Gradiente e Imagem */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0121] via-transparent to-[#0B0121] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0121] via-transparent to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070" 
            className="w-full h-full object-cover opacity-60 scale-105"
            alt="Hero Background"
          />
        </div>

        {/* Conteúdo do Banner */}
        <div className="relative z-20 text-center max-w-4xl px-6">
          <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none italic uppercase">
            Ensaios da Anitta <br/> <span className="text-pink-500">Cosmos</span>
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-8">Compre seguro até nas datas sold out!</p>
          <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform">
            Ver Ingressos
          </button>
        </div>

        {/* Setas de Navegação */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50">
          <ChevronLeft size={40} />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50">
          <ChevronRight size={40} />
        </button>
      </section>

      {/* CATEGORIAS RÁPIDAS (As pílulas flutuantes) */}
      <div className="max-w-4xl mx-auto -mt-12 relative z-40 px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
          <button className="flex-1 flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors border-r border-slate-100">
             <div className="bg-purple-100 p-2 rounded-lg text-purple-600 font-bold italic">🕒</div>
             <div className="text-left"><p className="text-xs font-black text-slate-900">Eventos hoje</p><p className="text-[10px] text-slate-400">Programas de última hora</p></div>
          </button>
          <button className="flex-1 flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-600">📅</div>
             <div className="text-left"><p className="text-xs font-black text-slate-900">Neste fim de semana</p><p className="text-[10px] text-slate-400">Veja os próximos eventos</p></div>
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (BRANCO PARA CONTRASTAR) */}
      <main className="bg-white text-slate-900 py-20 mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black flex items-center gap-3 italic tracking-tight">
                🎫 Eventos em destaque
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 text-slate-400"><ChevronLeft size={20}/></button>
              <button className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 text-slate-400"><ChevronRight size={20}/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Aqui entram seus EventCards */}
            {/* Exemplo de Skeleton conforme sua imagem */}
            {[1,2,3,4,5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-100 rounded-2xl h-64 mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>

          {/* SEÇÃO DE CATEGORIAS COM IMAGENS */}
          <div className="mt-24">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">🗺️ Categorias</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                    <p className="text-white font-black text-xl italic uppercase">Carnaval</p>
                  </div>
               </div>
               {/* Adicione outras categorias... */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}