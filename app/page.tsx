'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { ChevronRight, ChevronLeft, Loader2, Sparkles } from 'lucide-react';

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL da sua API
  const API_URL = 'https://linkah-api.onrender.com/api/eventos';

  useEffect(() => {
    async function carregarEventos() {
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);
        }
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarEventos();
  }, []);

  return (
    <div className="bg-[#0B0121] min-h-screen text-white font-sans">
      <Navbar />

      {/* TOP BAR INFO */}
      <div className="bg-[#0B0121] border-b border-white/5 py-2 text-center overflow-hidden">
        <p className="text-[11px] font-medium text-slate-300 tracking-tight whitespace-nowrap">
          Somos o maior mercado secundário de ingressos do Brasil. Os preços são definidos pelos vendedores.
        </p>
      </div>

      {/* HERO SECTION */}
      <section className="relative h-[550px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0121] via-transparent to-[#0B0121] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0121] via-transparent to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070" 
            className="w-full h-full object-cover opacity-60 scale-105"
            alt="Hero Background"
          />
        </div>

        <div className="relative z-20 text-center max-w-4xl px-6">
          <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none italic uppercase">
            Ensaios da Anitta <br/> <span className="text-pink-500 text-glow">Cosmos</span>
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-8">Compre seguro até nas datas sold out!</p>
          <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-xl shadow-white/10">
            Ver Ingressos
          </button>
        </div>

        <button className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hidden md:block">
          <ChevronLeft size={40} />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hidden md:block">
          <ChevronRight size={40} />
        </button>
      </section>

      {/* CATEGORIAS RÁPIDAS (Flutuantes) */}
      <div className="max-w-4xl mx-auto -mt-12 relative z-40 px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
          <button className="flex-1 flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors md:border-r border-slate-100">
             <div className="bg-purple-100 p-2 rounded-lg text-purple-600 font-bold italic text-xl">🕒</div>
             <div className="text-left">
               <p className="text-xs font-black text-slate-900 uppercase">Eventos hoje</p>
               <p className="text-[10px] text-slate-400 font-bold">Programas de última hora</p>
             </div>
          </button>
          <button className="flex-1 flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-600 text-xl">📅</div>
             <div className="text-left">
               <p className="text-xs font-black text-slate-900 uppercase">Neste fim de semana</p>
               <p className="text-[10px] text-slate-400 font-bold">Veja os próximos eventos</p>
             </div>
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="bg-white text-slate-900 py-20 mt-10 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black flex items-center gap-3 italic tracking-tight uppercase">
                <Sparkles className="text-pink-500" /> Eventos em destaque
              </h2>
            </div>
          </div>

          {/* GRID DE EVENTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {loading ? (
              /* MOSTRA SKELETON ENQUANTO CARREGA */
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-100 rounded-[2rem] h-72 mb-4 shadow-inner" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                </div>
              ))
            ) : eventos.length > 0 ? (
              /* MOSTRA EVENTOS REAIS DA API */
              eventos.map((evento: any) => (
                <EventCard key={evento.id} evento={evento} />
              ))
            ) : (
              /* MENSAGEM SE NÃO HOUVER EVENTOS */
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 font-black uppercase tracking-widest">Nenhum evento disponível no momento.</p>
              </div>
            )}
          </div>

          {/* SEÇÃO DE CATEGORIAS */}
          <div className="mt-32">
            <h2 className="text-2xl font-black mb-10 flex items-center gap-3 italic uppercase tracking-tighter">
              Explore por Categorias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="relative h-56 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl">
                  <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                    <p className="text-white font-black text-2xl italic uppercase tracking-tighter">Carnaval 2026</p>
                  </div>
               </div>
               <div className="relative h-56 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl">
                  <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                    <p className="text-white font-black text-2xl italic uppercase tracking-tighter">Festivais</p>
                  </div>
               </div>
               <div className="relative h-56 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl">
                  <img src="https://images.unsplash.com/photo-1514525253361-bee8718a7439" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                    <p className="text-white font-black text-2xl italic uppercase tracking-tighter">Shows Internacionais</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">
          Linkah Ingressos © 2026 - Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}