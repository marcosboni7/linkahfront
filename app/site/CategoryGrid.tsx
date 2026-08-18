'use client';

import React from 'react';

// Paleta pastel por categoria — cada badge de emoji usa um "banho" de cor suave,
// igual ao padrão visual do Luma (fundo quase branco, cor só no ícone)
const categoryStyles: Record<string, { icon: string; bg: string }> = {
  'Todos': { icon: '🎫', bg: 'bg-slate-100' },
  'Arte & Cultura': { icon: '🎨', bg: 'bg-orange-100' },
  'Entretenimento': { icon: '🎭', bg: 'bg-pink-100' },
  'Negócios': { icon: '💼', bg: 'bg-blue-100' },
  'Educação & Desenvolvimento': { icon: '🎓', bg: 'bg-indigo-100' },
  'Esportes & Bem-estar': { icon: '🧘', bg: 'bg-green-100' },
  'Experiências & Lifestyle': { icon: '✨', bg: 'bg-amber-100' },
  'Família & Comunidade': { icon: '👥', bg: 'bg-purple-100' },
};

interface CategoryGridProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryGrid({ categories, activeCategory, onSelect }: CategoryGridProps) {
  return (
    <div className="w-full">
      {/* MOBILE — trilho horizontal com scroll-snap, igual ao filtro de categorias do Luma */}
      <div
        className="flex md:hidden gap-2 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => {
          const style = categoryStyles[cat] || categoryStyles['Todos'];
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 shrink-0 snap-start pl-1.5 pr-4 py-1.5 rounded-full border
                         transition-all duration-200 active:scale-95
                ${isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white border-slate-200 text-slate-700'
                }`}
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm
                  ${isActive ? 'bg-white/15' : style.bg}`}
              >
                {style.icon}
              </span>
              <span className="text-sm font-semibold whitespace-nowrap">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* DESKTOP — chips em pílula que quebram linha (flex-wrap), não grid rígido */}
      <div className="hidden md:flex flex-wrap gap-3">
        {categories.map((cat) => {
          const style = categoryStyles[cat] || categoryStyles['Todos'];
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              aria-pressed={isActive}
              className={`group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full border
                         transition-all duration-200 ease-out
                ${isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/15'
                  : 'bg-white border-slate-200 text-slate-800 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5'
                }`}
            >
              <span
                className={`w-9 h-9 flex items-center justify-center rounded-full text-lg
                           transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6
                  ${isActive ? 'bg-white/15' : style.bg}`}
              >
                {style.icon}
              </span>
              <span className="text-[13px] font-bold tracking-tight">{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}