'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, Zap, Ticket } from 'lucide-react';

const CATEGORIAS_LISTA = ['Todos', 'Shows', 'Festivais', 'Carnaval', 'Teatro', 'Esportes'];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  useEffect(() => {
    async function carregarEventos() {
      setLoading(true);
      try {
        // Lógica de filtro: Se for 'Todos', chama a vitrine geral. Se não, passa a categoria via query string.
        const url = categoriaAtiva === 'Todos' 
          ? 'https://linkah-api.onrender.com/api/eventos/vitrine'
          : `https://linkah-api.onrender.com/api/eventos/vitrine?categoria=${categoriaAtiva}`;
          
        const response = await fetch(url);
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
  }, [categoriaAtiva]); // Recarrega sempre que a categoria mudar

  return (
    <div className="bg-[#0B0121] min-h-screen text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* TOP BAR INFO */}
      <div className="bg-[#1a0b3d] border-b border-white/5 py-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 flex items-center justify-center gap-2">
          <Zap size={12} fill="currentColor" /> Maior mercado de ingressos do Brasil <Zap size={12} fill="currentColor" />
        </p>
      </div>

      {/* HERO SECTION */}
      <section className="relative h-[650px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0121] via-transparent to-[#0B0121] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0121] via-transparent to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070" 
            className="w-full h-full object-cover opacity-40 scale-105"
            alt="Hero Background"
          />
        </div>

        <div className="relative z-20 text-center max-w-4xl px-6">
          <span className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Destaque da semana</span>
          <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none italic uppercase">
            Ensaios da Anitta <br/> <span className="text-pink-500 text-glow">Cosmos</span>
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-10 opacity-80">Garanta sua presença nas datas mais disputadas do ano.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-white text-[#0B0121] px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-500 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95">
              Ver Ingressos
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIAS DINÂMICAS (SISTEMA DE FILTRO) */}
      <div className="max-w-5xl mx-auto -mt-10 relative z-40 px-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-3 flex flex-wrap justify-center gap-2 border border-slate-100">
          {CATEGORIAS_LISTA.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                categoriaAtiva === cat
                  ? 'bg-[#C22973] text-white shadow-xl shadow-pink-100 scale-105'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="bg-white text-slate-900 py-24 mt-16 rounded-t-[4rem] shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black flex items-center gap-3 italic tracking-tight uppercase">
                <Sparkles className="text-pink-500" /> 
                {categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : `Explorar ${categoriaAtiva}`}
              </h2>
              <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">Os melhores ingressos em um só lugar</p>
            </div>
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-2">
               <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm">Grade</div>
               <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-400">Lista</div>
            </div>
          </div>

          {/* GRID DE EVENTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-100 rounded-[2.5rem] h-72 mb-4" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/4 mb-3" />
                  <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                </div>
              ))
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <EventCard key={evento.id} evento={evento} />
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <Ticket className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-black uppercase tracking-widest">Nenhum evento em {categoriaAtiva} disponível.</p>
                <button onClick={() => setCategoriaAtiva('Todos')} className="mt-4 text-[#C22973] font-bold underline">Voltar para todos</button>
              </div>
            )}
          </div>

          {/* SEÇÃO DE CURADORIA (BANNER) */}
          <div className="mt-32 relative h-80 rounded-[3.5rem] overflow-hidden group cursor-pointer shadow-2xl">
            <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#C22973]/90 to-transparent flex flex-col justify-center p-12">
               <span className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-4">Curadoria Linkah</span>
               <h3 className="text-white text-4xl md:text-5xl font-black italic uppercase tracking-tighter max-w-md leading-none">
                 Os Maiores Festivais do Brasil
               </h3>
               <button className="mt-8 bg-white text-[#C22973] w-fit px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Explorar Lista</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="text-2xl font-black text-[#0B0121] italic mb-8 tracking-tighter">LINKAH<span className="text-pink-500">.</span></div>
          <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.5em]">
            © 2026 Inteligência em Vendas de Ingressos
          </p>
        </div>
      </footer>
    </div>
  );
}