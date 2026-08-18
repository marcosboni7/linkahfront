'use client';

import React, { useState } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { MapPin, Globe, Navigation, Search, Loader2 } from 'lucide-react';

interface ExploreLocalProps {
  activeCity: string;
  onSelect: (cityId: string) => void;
}

export function ExploreLocal({ activeCity, onSelect }: ExploreLocalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    'Remoto',
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

  // Estilo de pílula compartilhado — mesma linguagem visual do CategoryGrid
  const pillBase =
    'flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full border transition-all duration-200';
  const pillActive = 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/15';
  const pillInactive =
    'bg-white border-slate-200 text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm';

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
          <Navigation size={16} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Explorar por local</h3>
          <p className="text-xs text-slate-400 font-medium">Busca global</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => onSelect('todos')}
          aria-pressed={activeCity === 'todos'}
          className={`px-4 py-2 rounded-full border transition-all duration-200
            ${activeCity === 'todos' ? pillActive : pillInactive}`}
        >
          <span className="text-sm font-semibold">Todos</span>
        </button>

        {QUICK_CITIES.map((city) => {
          const isActive = activeCity === city;
          return (
            <button
              key={city}
              onClick={() => onSelect(city)}
              aria-pressed={isActive}
              className={pillBase + ' ' + (isActive ? pillActive : pillInactive)}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-white/15' : 'bg-slate-100 text-slate-500'}`}
              >
                {city === 'Remoto' ? <Globe size={12} /> : <MapPin size={12} />}
              </span>
              <span className="text-sm font-semibold">{city}</span>
            </button>
          );
        })}

        {/* BOTÃO DE BUSCA GLOBAL */}
        <button
          onClick={() => setIsModalOpen(true)}
          aria-pressed={isCustom}
          className={`${pillBase} border-dashed ${isCustom ? pillActive : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'}`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center
              ${isCustom ? 'bg-white/15' : 'bg-slate-100 text-slate-400'}`}
          >
            <Search size={12} />
          </span>
          <span className="text-sm font-semibold">{isCustom ? activeCity : 'Buscar outra cidade'}</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Onde você quer ir?</h3>

            <div className="relative mb-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                placeholder="Digite o nome de qualquer cidade..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 font-medium outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all"
              />
              {!ready && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-slate-300" size={16} />
              )}
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto -mx-1 px-1">
              {status === 'OK' &&
                data.map(({ place_id, description }) => (
                  <button
                    key={place_id}
                    onClick={() => handleSelect(description)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <MapPin size={14} />
                    </span>
                    <span className="text-sm font-medium text-slate-800">{description}</span>
                  </button>
                ))}

              {value && status !== 'OK' && ready && (
                <div className="p-4 text-center text-slate-400 text-sm font-medium">
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