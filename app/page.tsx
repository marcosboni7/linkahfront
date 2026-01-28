'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { Search, MapPin, Sparkles, Ticket } from 'lucide-react';

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
    <div className="bg-white min-h-screen text-slate-800 font-sans">
      <Navbar />

      {/* HEADER BUSCA - FOCO NO BRANCO E ROSA */}
      <header className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-slate-900 text-4xl font-black mb-8 italic tracking-tighter">
            Encontre sua próxima <span className="text-[#ff0082]">experiência</span>
          </h1>
          
          <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-1">
            <div className="flex-[1.5] flex items-center gap-3 px-4 w-full py-4">
              <Search className="text-[#ff0082]" size={20} />
              <input 
                type="text" 
                placeholder="Nome do evento, artista ou lugar..." 
                className="w-full outline-none text-sm font-medium text-slate-600" 
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 w-full py-4 border-t md:border-t-0 md:border-l border-slate-100">
              <MapPin className="text-[#ff0082]" size={20} />
              <input 
                type="text" 
                placeholder="Qual cidade?" 
                className="w-full outline-none text-sm font-medium text-slate-600" 
              />
            </div>
            <button className="bg-[#ff0082] text-white px-12 py-4 rounded-lg font-black text-sm w-full md:w-auto hover:brightness-110 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-[#ff0082]/20">
              Buscar
            </button>
          </div>
        </div>
      </header>

      {/* NAVBAR DE CATEGORIAS (HORIZONTAL) */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-10 overflow-x-auto no-scrollbar py-5">
            {categoriasExistentes.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all relative pb-2 ${
                  categoriaAtiva === cat 
                  ? 'text-[#ff0082]' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {cat}
                {categoriaAtiva === cat && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff0082] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
            <Sparkles className="text-[#ff0082]" size={24} />
            {categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : `Explorar ${categoriaAtiva}`}
          </h2>
        </div>

        {/* GRID DE EVENTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-50 rounded-2xl h-80" />
            ))
          ) : eventos.length > 0 ? (
            eventos.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <Ticket className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Nenhum evento em "{categoriaAtiva}" disponível.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}