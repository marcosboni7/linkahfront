'use client';

import React, { useMemo, useState } from 'react';
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
    { id: 'Curitiba', name: 'Curitiba' },
    { id: 'Porto Alegre', name: 'Porto Alegre' },
    { id: 'Belo Horizonte', name: 'Belo Horizonte' },
    { id: 'Brasília', name: 'Brasília' },
    { id: 'Salvador', name: 'Salvador' },
    { id: 'Lisboa', name: 'Lisboa' },
    { id: 'Porto', name: 'Porto' },
    { id: 'Remoto', name: 'Remoto' },
  ];

  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const isCustom =
    activeCity !== 'todos' &&
    !CITIES.find((c) => normalizeText(c.id) === normalizeText(activeCity));

  const filteredCities = useMemo(() => {
    const term = normalizeText(searchTerm);

    if (!term) {
      return CITIES.filter((city) => city.id !== 'todos');
    }

    return CITIES.filter(
      (city) =>
        city.id !== 'todos' &&
        normalizeText(city.name).includes(term)
    );
  }, [searchTerm]);

  const handleSelectCity = (city: string) => {
    onSelect(city);
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const handleSubmitSearch = () => {
    const cleaned = searchTerm.trim();

    if (!cleaned) return;

    const exactCity = CITIES.find(
      (city) => normalizeText(city.name) === normalizeText(cleaned)
    );

    onSelect(exactCity ? exactCity.id : cleaned);
    setIsModalOpen(false);
    setSearchTerm('');
  };

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
          <Navigation size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Explorar por Local
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Encontre experiências perto de você
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {CITIES.map((city) => (
          <button
            key={city.id}
            onClick={() => onSelect(city.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300
              ${
                normalizeText(activeCity) === normalizeText(city.id)
                  ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.05] z-10 text-slate-950'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:shadow-md'
              }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                normalizeText(activeCity) === normalizeText(city.id)
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              {city.id === 'Remoto' ? <Globe size={14} /> : <MapPin size={14} />}
            </div>
            <span className="text-sm font-black uppercase tracking-tight">
              {city.name}
            </span>
          </button>
        ))}

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300
            ${
              isCustom
                ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.05] z-10 text-slate-950'
                : 'bg-slate-50 border-dashed border-slate-200 text-slate-400 hover:border-slate-300'
            }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isCustom ? 'bg-violet-600 text-white' : 'bg-white text-slate-300'
            }`}
          >
            <Search size={14} />
          </div>
          <span className="text-sm font-black uppercase tracking-tight">
            {isCustom ? activeCity : 'Outros'}
          </span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false);
              setSearchTerm('');
            }}
          />

          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl max-h-[85vh] overflow-hidden">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSearchTerm('');
              }}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black text-slate-950 uppercase mb-6">
              Buscar Cidade
            </h3>

            <div className="relative mb-4">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                placeholder="Ex: Porto, Lisboa, Curitiba..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitSearch();
                  }
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-12 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto pr-1 space-y-2 mb-5">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city.id)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-transparent hover:border-violet-100 transition text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-500">
                      {city.id === 'Remoto' ? (
                        <Globe size={16} />
                      ) : (
                        <MapPin size={16} />
                      )}
                    </div>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                      {city.name}
                    </span>
                  </button>
                ))
              ) : (
                <div className="bg-slate-50 rounded-2xl px-4 py-5 text-sm text-slate-500 font-semibold">
                  Nenhuma cidade encontrada.
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitSearch}
              disabled={!searchTerm.trim()}
              className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Filtrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}