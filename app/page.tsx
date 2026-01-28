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
  Ticket
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

  // Função para ícones dinâmicos das categorias
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
    <div className="flex bg-[#030303] min-h-screen text-white font-sans selection:bg-pink-500">
      
      {/* SIDEBAR FIXA */}
      <aside className="w-64 fixed h-full border-r border-white/5 bg-[#080808] flex flex-col p-6 z-50">
        <div className="mb-12 px-2">
          <h1 className="text-2xl font-black tracking-tighter italic">LINKAH<span className="text-pink-600">.</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 px-2">Categorias</p>
          {categoriasExistentes.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                categoriaAtiva === cat 
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20' 
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {getIcon(cat)}
              {cat}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-gradient-to-br from-pink-600/20 to-transparent rounded-2xl border border-pink-600/20">
          <p className="text-xs font-black uppercase mb-2">Venda Conosco</p>
          <p className="text-[10px] text-zinc-400 mb-4">Crie seu evento em minutos e venda mais.</p>
          <button className="w-full bg-white text-black py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-colors">
            Começar
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (COM MARGIN-LEFT PARA A SIDEBAR) */}
      <main className="flex-1 ml-64 p-8">
        
        {/* TOP BAR / SEARCH */}
        <header className="flex items-center justify-between mb-12">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por artistas, eventos ou cidades..." 
              className="w-full bg-[#111] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-pink-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4 hidden md:block">
              <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Premium Access</p>
              <p className="text-xs font-bold text-zinc-400">Olá, Visitante</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600" />
          </div>
        </header>

        {/* HERO BANNER - SLIM & ELEGANT */}
        <section className="relative h-80 rounded-[2.5rem] overflow-hidden mb-16 group">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            alt="Destaque"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-center p-12">
            <span className="flex items-center gap-2 text-pink-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              <Zap size={14} fill="currentColor" /> Recomendado para você
            </span>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-6">
              Ensaios da Anitta: <br/> <span className="text-pink-500">Rio de Janeiro</span>
            </h2>
            <button className="flex items-center gap-2 bg-white text-black w-fit px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-pink-600 hover:text-white transition-all shadow-xl">
              Ver Ingressos <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {/* GRID DE EVENTOS */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <Sparkles size={20} className="text-pink-500" />
              {categoriaAtiva}
            </h3>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{eventos.length} Eventos encontrados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/5 rounded-[2rem] animate-pulse" />
              ))
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <EventCard key={evento.id} evento={evento} />
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-[#080808] rounded-[3rem] border border-white/5">
                <Ticket className="mx-auto text-zinc-800 mb-4" size={48} />
                <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Nenhum evento em destaque no momento.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}