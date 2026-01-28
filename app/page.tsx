'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { Search, MapPin, ChevronDown, Calendar } from 'lucide-react';

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    async function carregarEventos() {
      setLoading(true);
      try {
        const url = categoriaAtiva === 'Todos' ? API_URL : `${API_URL}?categoria=${categoriaAtiva}`;
        const res = await fetch(url);
        const data = await res.json();
        setEventos(data);
      } finally {
        setLoading(false);
      }
    }
    carregarEventos();
  }, [categoriaAtiva]);

  const categorias = ['Todos', 'Shows', 'Festas', 'Teatro', 'Congressos', 'Esportes', 'Gastronomia'];

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans">
      <Navbar />

      {/* SEARCH BAR ESTILO SYMPLA */}
      <div className="bg-[#0098ff] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white text-3xl font-bold mb-8 text-center md:text-left">
            Olá, encontre seu próximo evento
          </h1>
          
          <div className="bg-white rounded-lg p-2 shadow-xl flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 border-b md:border-b-0 md:border-r border-slate-100 w-full py-2">
              <Search className="text-blue-500" size={20} />
              <input type="text" placeholder="Nome do evento, show ou teatro..." className="w-full outline-none text-sm p-2" />
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 w-full py-2">
              <MapPin className="text-blue-500" size={20} />
              <input type="text" placeholder="Sua localização" className="w-full outline-none text-sm p-2" />
            </div>
            <button className="bg-[#ff0082] text-white px-8 py-3 rounded-md font-bold text-sm w-full md:w-auto hover:bg-[#d6006d] transition-colors">
              BUSCAR
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* MENU DE CATEGORIAS (HORIZONTAL CLEAN) */}
        <div className="flex gap-8 border-b border-slate-100 mb-10 overflow-x-auto no-scrollbar">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap ${
                categoriaAtiva === cat 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-slate-500 hover:text-blue-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TÍTULO DA SEÇÃO */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Eventos em <span className="text-blue-500">Destaque</span>
          </h2>
        </div>

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 h-80 rounded-lg" />
            ))
          ) : (
            eventos.map((evento: any) => <EventCard key={evento.id} evento={evento} />)
          )}
        </div>
      </main>
    </div>
  );
}