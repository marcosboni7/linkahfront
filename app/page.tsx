'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { 
  Search, MapPin, LayoutGrid, Music, 
  Theater, PartyPopper, Trophy, Sparkles, Bell 
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

          // Puxa as categorias reais que você cadastrou na Dashboard
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
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <div className="flex bg-[#F2F5F8] min-h-screen text-slate-800 font-sans">
      
      {/* SIDEBAR (CATEGORIAS DA DASHBOARD) */}
      <aside className="w-64 fixed h-full bg-white border-r border-slate-200 flex flex-col p-6 z-50">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">LINKAH</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Categorias</p>
          {categoriasExistentes.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                categoriaAtiva === cat 
                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={categoriaAtiva === cat ? 'text-blue-600' : 'text-slate-400'}>
                {getIcon(cat)}
              </span>
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 ml-64">
        {/* HEADER BUSCA (ESTILO SYMPLA) */}
        <header className="bg-blue-600 p-8 shadow-inner">
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-white text-2xl font-bold">Encontre seu próximo evento</h2>
            <div className="bg-white rounded-lg p-1.5 shadow-2xl flex flex-col md:flex-row gap-1">
              <div className="flex-1 flex items-center gap-3 px-4 py-2">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Nome do evento, artista..." className="w-full outline-none text-sm" />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-2 border-t md:border-t-0 md:border-l border-slate-100">
                <MapPin size={18} className="text-slate-400" />
                <input type="text" placeholder="Sua cidade" className="w-full outline-none text-sm" />
              </div>
              <button className="bg-[#FF0082] text-white px-8 py-3 rounded-md font-bold text-sm hover:brightness-110 transition-all">
                BUSCAR
              </button>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <h3 className="text-xl font-bold text-slate-800">
              {categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : `Resultados para ${categoriaAtiva}`}
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {eventos.length} eventos encontrados
            </span>
          </div>

          {/* GRID DE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-72 animate-pulse shadow-sm" />
              ))
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => <EventCard key={evento.id} evento={evento} />)
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">Nenhum evento encontrado nesta categoria.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}