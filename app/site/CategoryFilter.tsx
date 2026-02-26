'use client';

import { Sparkles, Ticket, Palette, Theater, Briefcase, GraduationCap, Trophy, Star, Users } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  // O iconMap agora deve conter as novas chaves
  iconMap: Record<string, any>;
}

export function CategoryFilter({ categories, activeCategory, onSelect, iconMap }: CategoryFilterProps) {
  const { t } = useLanguage();

  const translateCategory = (cat: string) => {
    const map: Record<string, string> = {
      'Arte & Cultura': t.catArt || 'Arte & Cultura',
      'Entretenimento': t.catEnt || 'Entretenimento',
      'Negócios': t.catBiz || 'Negócios',
      'Educação & Desenvolvimento': t.catEdu || 'Educação & Desenv.',
      'Esportes & Bem-estar': t.catHealth || 'Esportes & Bem-estar',
      'Experiências & Lifestyle': t.catLife || 'Experiências & Lifestyle',
      'Família & Comunidade': t.catFamily || 'Família & Comunidade',
      'Todos': t.allCategories || 'Todos',
      'All': t.allCategories || 'All',
    };

    return map[cat] || cat;
  };

  return (
    <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-40">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-300/10 p-5 border border-slate-50 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles size={14} className="text-[#ff0082]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {t.filterVibe || "Escolha sua vibe"}
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            // Se o ícone não estiver no mapa, usamos o Ticket como padrão
            const Icon = iconMap[cat] || Ticket;
            const isAtiva = activeCategory === cat;
            
            return (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${
                  isAtiva 
                  ? 'bg-[#ff0082] border-[#ff0082] text-white shadow-md shadow-pink-200 scale-105' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-pink-200 hover:text-[#ff0082]'
                }`}
              >
                <Icon size={14} strokeWidth={isAtiva ? 3 : 2} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {translateCategory(cat)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}