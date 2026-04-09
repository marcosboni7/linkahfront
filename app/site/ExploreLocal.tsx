'use client';

import React, { useState } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { MapPin, Globe, Navigation, Search, X, Loader2 } from 'lucide-react';

interface ExploreLocalProps {
  activeCity: string;
  onSelect: (cityId: string) => void;
}

export function ExploreLocal({ activeCity, onSelect }: ExploreLocalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cidades rápidas (Favoritos)
// Cidades rápidas (Favoritos - Principais polos de eventos)
  const QUICK_CITIES = [
    'São Paulo', 
    'Rio de Janeiro', 
    'Curitiba', 
    'Belo Horizonte', 
    'Florianópolis',
    'Porto Alegre', 
    'Brasília', 
    'Salvador', 
    'Lisboa', 
    'Porto', 
    'Remoto'
  ];

  // Hook do Google Places
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['(cities)'], // Filtra apenas para aparecer cidades
    },
    debounce: 300,
  });

  const handleSelect = (description: string) => {
    // Pegamos apenas o primeiro nome da cidade antes da vírgula para o filtro
    const cityName = description.split(',')[0];
    onSelect(cityName);
    setValue('');
    clearSuggestions();
    setIsModalOpen(false);
  };

  const isCustom = activeCity !== 'todos' && !QUICK_CITIES.includes(activeCity);

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
          <Navigation size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Explorar por Local</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Search</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onSelect('todos')}
          className={`px-6 py-4 rounded-2xl border transition-all ${activeCity === 'todos' ? 'bg-white border-violet-200 shadow-lg text-slate-950 scale-105' : 'bg-white border-slate-100 text-slate-500'}`}
        >
          <span className="text-sm font-black uppercase">Todos</span>
        </button>

        {QUICK_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => onSelect(city)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all
              ${activeCity === city ? 'bg-white border-violet-200 shadow-lg text-slate-950 scale-105' : 'bg-white border-slate-100 text-slate-500'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeCity === city ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
              {city === 'Remoto' ? <Globe size={14} /> : <MapPin size={14} />}
            </div>
            <span className="text-sm font-black uppercase">{city}</span>
          </button>
        ))}

        {/* BOTÃO DE BUSCA GLOBAL */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl border border-dashed transition-all
            ${isCustom ? 'bg-white border-violet-200 shadow-lg text-slate-950 scale-105' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCustom ? 'bg-violet-600 text-white' : 'bg-white text-slate-300'}`}>
            <Search size={14} />
          </div>
          <span className="text-sm font-black uppercase">{isCustom ? activeCity : 'Buscar outra cidade'}</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-950 uppercase mb-6 tracking-tight">Onde você quer ir?</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                placeholder="Digite o nome de qualquer cidade..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
              {!ready && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-slate-300" />}
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {status === "OK" && data.map(({ place_id, description }) => (
                <button
                  key={place_id}
                  onClick={() => handleSelect(description)}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-50 hover:bg-violet-600 hover:text-white transition-all group text-left"
                >
                  <MapPin size={18} className="text-slate-400 group-hover:text-white/70" />
                  <span className="text-sm font-black uppercase tracking-tight">{description}</span>
                </button>
              ))}
              
              {value && status !== "OK" && ready && (
                 <div className="p-4 text-center text-slate-400 font-bold uppercase text-xs">
                   Nenhum local encontrado.
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}