'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { Search, MapPin, Sparkles, Loader2, Ticket } from 'lucide-react';

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
        // 1. Busca eventos (filtrados ou todos)
        const urlFetch = categoriaAtiva === 'Todos' ? API_URL : `${API_URL}?categoria=${categoriaAtiva}`;
        const response = await fetch(urlFetch);
        
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);

          // 2. Extrai categorias únicas dos eventos da Dashboard (apenas no primeiro load)
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
    <div className="bg-[#F2F5F8] min-h-screen text-slate-800 font-sans">
      <Navbar />

      {/* HEADER BUSCA (ESTILO SYMPLA) */}
      <header className="bg-[#0098ff] py-12 px-6 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white text-3xl font-bold mb-8 italic tracking-tighter">
            LINKAH<span className="opacity-50">.</span> Encontre sua próxima experiência
          </h1>
          
          <div className="bg-white rounded-lg p-1.5 shadow-2xl flex flex-col md:flex-row items-center gap-1">
            <div className="flex-1 flex items-center gap-3 px-4 w-full py-3">
              <Search className="text-[#0098ff]" size={20} />
              <input 
                type="text" 
                placeholder="Nome do evento, show ou teatro..." 
                className="w-full outline-none text-sm font-medium" 
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 w-full py-3 border-t md:border-t-0 md:border-l border-slate-100">
              <MapPin className="text-[#0098ff]" size={20} />
              <input 
                type="text" 
                placeholder="Em qual cidade?" 
                className="w-full outline-none text-sm font-medium" 
              />
            </div>
            <button className="bg-[#ff0082] text-white px-10 py-4 rounded-md font-black text-sm w-full md:w-auto hover:bg-[#d6006d] transition-all active:scale-95 uppercase tracking-widest">
              Buscar
            </button>
          </div>
        </div>
      </header>

      {/* NAVBAR DE CATEGORIAS DINÂMICAS (IGUAL ANTES) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto no-scrollbar py-4">
            {categoriasExistentes.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`text-sm font-bold whitespace-nowrap transition-all pb-1 border-b-2 ${
                  categoriaAtiva === cat 
                  ? 'text-[#0098ff] border-[#0098ff]' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* TÍTULO DA SEÇÃO */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase italic tracking-tighter">
            <Sparkles className="text-[#ff0082]" size={24} />
            {categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : categoriaAtiva}
          </h2>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">
            {eventos.length} Eventos
          </div>
        </div>

        {/* GRID DE EVENTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl h-80 shadow-sm border border-slate-100" />
            ))
          ) : eventos.length > 0 ? (
            eventos.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <Ticket className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                Nenhum evento em "{categoriaAtiva}" no momento.
              </p>
              <button 
                onClick={() => setCategoriaAtiva('Todos')} 
                className="mt-4 text-[#0098ff] font-black uppercase text-xs hover:underline"
              >
                Ver todos os eventos
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            © 2026 Linkah Tecnologia em Eventos
          </p>
        </div>
      </footer>
    </div>
  );
}