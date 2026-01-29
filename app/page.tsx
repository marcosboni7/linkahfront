'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { Search, MapPin, Sparkles, Ticket, ChevronRight } from 'lucide-react';

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const urlFetch = categoriaAtiva === 'Todos' ? API_URL : `${API_URL}?categoria=${categoriaAtiva}`;
        const response = await fetch(urlFetch);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);

          if (categoriaAtiva === 'Todos') {
            const extrair = dados.map((ev: any) => ev.categoria).filter(Boolean);
            const unicas = Array.from(new Set(extrair)) as string[];
            setCategoriasExistentes(['Todos', ...unicas]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [categoriaAtiva]);

  return (
    <div className="bg-[#FCFCFD] min-h-screen text-slate-800 font-sans">
      <Navbar />

      {/* HERO SECTION - IMPACTO VISUAL PARA QUEBRAR O BRANCO */}
      <section className="relative bg-[#0B0121] py-24 px-6 overflow-hidden">
        {/* Glow Decorativo de Fundo */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff0082] opacity-10 blur-[130px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600 opacity-5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Texto de Chamada */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 bg-[#ff0082] rounded-full animate-pulse" />
                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Season 2026 Live</span>
              </div>
              <h1 className="text-white text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase mb-8">
                Viva o <br/> <span className="text-[#ff0082]">Extraordinário</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
                Conectamos você aos maiores eventos, shows e experiências exclusivas do país.
              </p>
              <button className="group bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#ff0082] hover:text-white transition-all shadow-2xl flex items-center gap-3 mx-auto lg:mx-0 active:scale-95">
                Ver Destaques <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* BOX DE BUSCA INTEGRADO (ESTILO MODERNO) */}
            <div className="w-full max-w-[460px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
              <h3 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-8 flex items-center gap-3">
                <Search size={18} className="text-[#ff0082]" /> Encontre sua próxima parada
              </h3>
              <div className="space-y-5">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">O que você busca?</label>
                  <input 
                    type="text" 
                    placeholder="Nome do evento ou artista" 
                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-[#ff0082] focus:bg-white/20 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Onde?</label>
                  <input 
                    type="text" 
                    placeholder="Cidade ou Estado" 
                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-[#ff0082] focus:bg-white/20 transition-all placeholder:text-slate-600"
                  />
                </div>
                <button className="w-full bg-[#ff0082] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-pink-500/20 hover:brightness-110 hover:-translate-y-1 transition-all active:scale-95 mt-4">
                  Pesquisar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS DE CATEGORIAS (STICKY NAVBAR) */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-12 overflow-x-auto no-scrollbar py-6">
            {categoriasExistentes.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative group pb-1 ${
                  categoriaAtiva === cat 
                  ? 'text-[#ff0082]' 
                  : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat}
                <span className={`absolute -bottom-6 left-0 w-full h-1 bg-[#ff0082] transition-all rounded-full ${
                  categoriaAtiva === cat ? 'opacity-100' : 'opacity-0 scale-x-0 group-hover:opacity-20 group-hover:scale-x-100'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-6 py-24">
        
        {/* TÍTULO DA SEÇÃO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[#ff0082] text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Curadoria Exclusiva</span>
            <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4 uppercase italic tracking-tighter">
              {categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : categoriaAtiva}
              <Sparkles className="text-[#ff0082]" size={32} />
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-4 py-2 rounded-full bg-white shadow-sm">
              {eventos.length} Eventos encontrados
            </span>
          </div>
        </div>

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-[2.5rem] h-[420px] shadow-sm" />
            ))
          ) : eventos.length > 0 ? (
            eventos.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <div className="col-span-full py-48 text-center border-2 border-dashed border-slate-200 rounded-[4rem] bg-white shadow-inner">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                <Ticket size={40} />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm mb-6">
                Nenhum evento em "{categoriaAtiva}" no momento.
              </p>
              <button 
                onClick={() => setCategoriaAtiva('Todos')} 
                className="text-[#ff0082] font-black uppercase text-xs tracking-widest hover:underline decoration-2 underline-offset-8"
              >
                Voltar para todos os eventos
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* RODAPÉ MINIMALISTA */}
      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-8">
          <div className="text-slate-900 text-2xl font-black tracking-tighter italic">
            LINKAH<span className="text-[#ff0082]">.</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] text-center leading-loose">
            © 2026 LINKAH TICKETS - EXPERIÊNCIAS QUE CONECTAM MUNDOS
          </p>
        </div>
      </footer>
    </div>
  );
}