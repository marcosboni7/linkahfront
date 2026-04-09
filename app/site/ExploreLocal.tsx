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

  // Se a cidade ativa não estiver na lista fixa, ela é uma "Cidade Personalizada"
  const isCustomCity = activeCity !== 'todos' && !CITIES.find(c => c.id === activeCity);

  const handleSelectCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSelect(searchTerm);
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
        {CITIES.map((city) => {
          const isActive = activeCity === city.id;
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
                {city.id === 'Remoto' ? <Globe size={14} /> : <MapPin size={14} />}
              </div>
              <span className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-slate-950' : 'text-slate-500'}`}>
                {city.name}
              </span>
            </button>
          );
        })}

        {/* BOTÃO DINÂMICO "OUTROS" OU CIDADE BUSCADA */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300 group
            ${isCustomCity 
              ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.05] z-10' 
              : 'bg-slate-50 border-dashed border-slate-200 hover:bg-white hover:border-slate-300'
            }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
            ${isCustomCity ? 'bg-violet-600 text-white' : 'bg-white text-slate-400'}
          `}>
            <Search size={14} />
          </div>
          <span className={`text-sm font-black uppercase tracking-tight ${isCustomCity ? 'text-slate-950' : 'text-slate-400'}`}>
            {isCustomCity ? activeCity : 'Outros'}
          </span>
        </button>
      </div>

      {/* MODAL DE BUSCA (ESTILO LUMA) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setIsModalOpen(false)} 
          />
          
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-2">Buscar Local</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Digite o nome da cidade ou país para filtrar eventos.</p>

            <form onSubmit={handleSelectCustom} className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Ex: Curitiba, Portugal, New York..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-200 transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-violet-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
              >
                Aplicar Filtro
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4 text-center">Sugestões</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Curitiba', 'Belo Horizonte', 'Lisboa', 'Miami'].map(sug => (
                  <button 
                    key={sug}
                    onClick={() => { onSelect(sug); setIsModalOpen(false); }}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-bold text-slate-600 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}