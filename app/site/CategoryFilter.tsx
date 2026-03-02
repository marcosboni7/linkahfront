'use client';

import { Sparkles, Ticket } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  iconMap: Record<string, any>;
}

export function CategoryFilter({ categories, activeCategory, onSelect, iconMap }: CategoryFilterProps) {
  const { t }: any = useLanguage();

  const translateCategory = (cat: string) => {
    const map: Record<string, string> = {
      'Arte & Cultura': t.catArt,
      'Entretenimento': t.catEnt,
      'Negócios': t.catBiz,
      'Educação & Desenvolvimento': t.catEdu,
      'Esportes & Bem-estar': t.catHealth,
      'Experiências & Lifestyle': t.catLife,
      'Família & Comunidade': t.catFamily,
      'Todos': t.allCategories || 'Todos',
    };

    return map[cat] || cat;
  };

  return (
    <div className="w-full">
      {/* Título da Vibe */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {/* Alterado para #ff4d4d */}
        <Sparkles size={14} className="text-[#ff4d4d] animate-pulse" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {t.filterVibe || "Escolha sua vibe"}
        </h3>
      </div>
      
      {/* Container dos Botões */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {categories.map((cat) => {
          const categoryKey = String(cat).trim();
          const Icon = iconMap[categoryKey] || Ticket;
          const isAtiva = activeCategory === categoryKey;
          
          return (
            <button
              key={categoryKey}
              onClick={() => onSelect(categoryKey)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-300 whitespace-nowrap ${
                isAtiva 
                // Cores alteradas para #ff4d4d e sombra ajustada para vermelho
                ? 'bg-[#ff4d4d] border-[#ff4d4d] text-white shadow-lg shadow-red-100 -translate-y-1' 
                : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-red-200 hover:text-[#ff4d4d] hover:shadow-md'
              }`}
            >
              <Icon size={16} strokeWidth={isAtiva ? 3 : 2} />
              <span className="text-[11px] font-black uppercase tracking-wider">
                {translateCategory(categoryKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}