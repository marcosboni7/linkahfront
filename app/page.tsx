'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { 
  LayoutGrid, 
  Music, 
  Theater, 
  PartyPopper, 
  Trophy, 
  Sparkles, 
  Search, 
  ChevronRight,
  Zap,
  Ticket,
  Bell
} from 'lucide-react';

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
            const extrairCategorias = dados.map((ev: any) => ev.categoria).filter(Boolean);
            const unicas = Array.from(new Set(extrairCategorias)) as string[];
            setCategoriasExistentes(['Todos', ...unicas]);
          }
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [categoriaAtiva]);

  const getIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'todos': return <LayoutGrid size={18} />;
      case 'shows': return <Music size={18} />;
      case 'teatro': return <Theater size={18} />;
      case 'festas': return <PartyPopper size={18} />;
      case 'esportes': return <Trophy size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen text-slate-900 font-sans selection:bg-[#C22973] selection:text-white">
      
      {/* SIDEBAR BRANCA MINIMALISTA */}
      <aside className="w-64 fixed h-full border-r border-slate-100 bg-white flex flex-col p-8 z-50">
        <div className="mb-12">
          <h1 className="text-2xl font-black tracking-tighter italic text-slate-900">
            LINKAH<span className="text-[#C22973]">.</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 px-3">Menu Principal</p>
          {categoriasExistentes.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                categoriaAtiva === cat 
                ? 'bg-[#C22973] text-white shadow-lg shadow-[#C22973]/20 scale-[1.02]' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#C22973]'
              }`}
            >
              <span className={categoriaAtiva === cat ? 'text-white' : 'text-slate-400'}>
                {getIcon(cat)}
              </span>
              {cat}
            </button>
          ))}
        </nav>

        {/* CARD PROMO SIDEBAR */}
        <div className="mt-auto p-5 bg-pink-50 rounded-[2rem] border border-pink-100">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm text-[#C22973]">
            <Zap size={20} fill="currentColor" />
          </div>
          <p className="text-xs font-black uppercase text-slate-800 mb-1">Linkah PRO</p>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-4">Acesse pré-vendas exclusivas e taxas reduzidas.</p>
          <button className="w-full bg-[#C22973] text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors">
            Saiba Mais
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 ml-64 p-10">
        
        {/* HEADER SUPERIOR */}
        <header className="flex items-center justify-between mb-12">
          <div className="relative w-[400px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C22973] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar eventos..." 
              className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C22973]/5 focus:border-[#C22973] transition-all"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-[#C22973] transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">Bem-vindo</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Explorar Agora</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#C22973]/10 flex items-center justify-center text-[#C22973] font-bold">
                L
              </div>
            </div>
          </div>
        </header>

        {/* HERO BANNER - WHITE/PINK STYLE */}
        <section className="relative h-[380px] rounded-[3rem] overflow-hidden mb-16 shadow-xl shadow-pink-100/50">
          <img 
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2074" 
            className="w-full h-full object-cover"
            alt="Destaque"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent flex flex-col justify-center p-16">
            <div className="flex items-center gap-2 bg-[#C22973] text-white w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles size={12} fill="currentColor" /> Destaque do Mês
            </div>
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase mb-6 leading-tight">
              Tour <br/> <span className="text-[#C22973]">Cosmos 2026</span>
            </h2>
            <button className="flex items-center gap-3 bg-slate-900 text-white w-fit px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#C22973] transition-all transform hover:-translate-y-1">
              Comprar Ingressos <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* SEÇÃO DE EVENTOS */}
        <div className="space-y-10">
          <div className="flex items-end justify-between px-2">
            <div>
              <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-3">
                {categoriaAtiva}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Os melhores momentos começam aqui</p>
            </div>
            <div className="flex gap-2">
               <button className="p-3 rounded-xl bg-white border border-slate-100 text-[#C22973] hover:bg-pink-50 transition-colors">
                  <LayoutGrid size={20} />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-white rounded-[2.5rem] animate-pulse shadow-sm" />
                  <div className="h-4 bg-white rounded-full w-3/4 animate-pulse" />
                </div>
              ))
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <EventCard key={evento.id} evento={evento} />
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm">
                <Ticket className="mx-auto text-slate-100 mb-6" size={60} />
                <p className="text-slate-400 font-black uppercase text-sm tracking-[0.2em]">Nenhum evento nesta categoria.</p>
                <button onClick={() => setCategoriaAtiva('Todos')} className="mt-4 text-[#C22973] font-bold">Ver todos os eventos</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}