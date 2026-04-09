'use client';

import React, { useState } from 'react';
import { MapPin, Globe, Navigation, Search, X } from 'lucide-react';

interface ExploreLocalProps {
  activeCity: string;
  onSelect: (cityId: string) => void;
}

export function ExploreLocal({ activeCity, onSelect }: ExploreLocalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const CITIES = [
    { id: 'todos', name: 'Todos' },
    { id: 'São Paulo', name: 'São Paulo' },
    { id: 'Rio de Janeiro', name: 'Rio de Janeiro' },
    { id: 'Remoto', name: 'Remoto' },
  ];

  const isCustom = activeCity !== 'todos' && !CITIES.find(c => c.id === activeCity);

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
          <Navigation size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Explorar por Local</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Encontre experiências perto de você</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {CITIES.map((city) => (
          <button
            key={city.id}
            onClick={() => onSelect(city.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300
              ${activeCity === city.id ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.05] z-10 text-slate-950' : 'bg-white border-slate-100 text-slate-500'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeCity === city.id ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
              {city.id === 'Remoto' ? <Globe size={14} /> : <MapPin size={14} />}
            </div>
            <span className="text-sm font-black uppercase tracking-tight">{city.name}</span>
          </button>
        ))}

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300
            ${isCustom ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.05] z-10 text-slate-950' : 'bg-slate-50 border-dashed border-slate-200 text-slate-400'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCustom ? 'bg-violet-600 text-white' : 'bg-white text-slate-300'}`}>
            <Search size={14} />
          </div>
          <span className="text-sm font-black uppercase tracking-tight">{isCustom ? activeCity : 'Outros'}</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-950 uppercase mb-6">Buscar Cidade</h3>
            <input 
              autoFocus
              placeholder="Ex: Porto, Lisboa, Curitiba..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-900 font-bold mb-4 outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <button 
              onClick={() => { onSelect(searchTerm); setIsModalOpen(false); setSearchTerm(''); }}
              className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-violet-600 transition-all"
            >
              Filtrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}