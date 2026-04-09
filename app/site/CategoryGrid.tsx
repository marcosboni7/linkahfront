'use client';

import React from 'react';

// Mapeamento de cores e ícones para o estilo Luma
const categoryStyles: Record<string, { icon: string; bg: string; text: string }> = {
  'Todos': { icon: '🎫', bg: 'bg-slate-100', text: 'text-slate-600' },
  'Arte & Cultura': { icon: '🎨', bg: 'bg-orange-50', text: 'text-orange-600' },
  'Entretenimento': { icon: '🎭', bg: 'bg-pink-50', text: 'text-pink-600' },
  'Negócios': { icon: '💼', bg: 'bg-blue-50', text: 'text-blue-600' },
  'Educação & Desenvolvimento': { icon: '🎓', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  'Esportes & Bem-estar': { icon: '🧘', bg: 'bg-green-50', text: 'text-green-600' },
  'Experiências & Lifestyle': { icon: '✨', bg: 'bg-amber-50', text: 'text-amber-600' },
  'Família & Comunidade': { icon: '👥', bg: 'bg-purple-50', text: 'text-purple-600' },
};

interface CategoryGridProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryGrid({ categories, activeCategory, onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {categories.map((cat) => {
        const style = categoryStyles[cat] || categoryStyles['Todos'];
        const isActive = activeCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all duration-300 group text-left
              ${isActive 
                ? 'bg-white border-violet-200 shadow-lg shadow-violet-100 scale-[1.02]' 
                : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
              }`}
          >
            {/* Ícone com fundo colorido */}
            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-xl shadow-inner ${style.bg}`}>
              {style.icon}
            </div>

            <div className="overflow-hidden">
              <h4 className={`font-black text-sm truncate ${isActive ? 'text-violet-600' : 'text-slate-900'}`}>
                {cat}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Explorar
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}