'use client';

import React, { useState } from 'react';
import { MapPin, Globe, Navigation, Search, X } from 'lucide-react';

interface City {
  id: string;
  name: string;
}

const CITIES: City[] = [
  { id: 'todos', name: 'Todos' },
  { id: 'São Paulo', name: 'São Paulo' },
  { id: 'Rio de Janeiro', name: 'Rio de Janeiro' },
  { id: 'Remoto', name: 'Remoto' },
];

interface ExploreLocalProps {
  activeCity: string;
  onSelect: (cityId: string) => void;
}

export function ExploreLocal({ activeCity, onSelect }: ExploreLocalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isCustomCity = activeCity !== 'todos' && !CITIES.find(c => c.id === activeCity);

  const handleSelectCustom = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      onSelect(searchTerm.trim());
      setIsModalOpen(false);
      setSearchTerm('');
    }
  };

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
              ${activeCity === city.id 
                ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.05] z-10 text-slate-950' 
                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
              ${activeCity === city.id ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
              {city.id === 'Remoto' ? <Globe size={14} /> : <MapPin size={14} />}
            </div>
            <span className="text-sm font-black uppercase tracking-tight">{city.name}</span>
          </button>
        ))}

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300
            ${isCustomCity 
              ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.05] z-10 text-slate-950' 
              : 'bg-slate-50 border-dashed border-slate-200 hover:bg-white text-slate-400'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center
            ${isCustomCity ? 'bg-violet-600 text-white' : 'bg-white text-slate-300'}`}>
            <Search size={14} />
          </div>
          <span className="text-sm font-black uppercase tracking-tight">
            {isCustomCity ? activeCity : 'Outros'}
          </span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-950">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-2">Onde você está?</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Filtre por qualquer cidade, estado ou país.</p>
            
            <form onSubmit={handleSelectCustom} className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  autoFocus
                  placeholder="Ex: Curitiba, Lisboa, Remoto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <button type="submit" className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-violet-600 transition-all">
                Filtrar agora
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}