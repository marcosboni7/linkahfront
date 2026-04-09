'use client';

import React from 'react';
import { MapPin, Globe, Navigation } from 'lucide-react';

interface City {
  id: string;
  name: string;
  count?: number;
}

const CITIES: City[] = [
  { id: 'todos', name: 'Todos' },
  { id: 'São Paulo', name: 'São Paulo' },
  { id: 'Rio de Janeiro', name: 'Rio de Janeiro' },
  { id: 'Remoto', name: 'Remoto' },
  { id: 'Outros', name: 'Outros' },
];

interface ExploreLocalProps {
  activeCity: string;
  onSelect: (cityId: string) => void;
}

export function ExploreLocal({ activeCity, onSelect }: ExploreLocalProps) {
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
        {CITIES.map((city) => {
          const isActive = activeCity === city.id;
          const isRemote = city.id === 'Remoto';

          return (
            <button
              key={city.id}
              onClick={() => onSelect(city.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300 group
                ${isActive 
                  ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.05] z-10' 
                  : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                ${isActive ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}
              `}>
                {isRemote ? <Globe size={14} /> : <MapPin size={14} />}
              </div>
              
              <span className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-slate-950' : 'text-slate-500'}`}>
                {city.name}
              </span>

              {city.id !== 'todos' && (
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-violet-400 animate-pulse' : 'bg-slate-200'}`} />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}