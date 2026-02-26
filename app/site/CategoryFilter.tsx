'use client';

import { Sparkles, Ticket, Palette, Theater, Briefcase, GraduationCap, Heart, Sparkles as Lifestyle, Users } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  iconMap: Record<string, any>;
}

export function CategoryFilter({ categories, activeCategory, onSelect, iconMap }: CategoryFilterProps) {
  const { t } = useLanguage();

  // Esta função garante que o usuário veja "Business" em inglês, 
  // mas o sistema continue usando "Negócios" para filtrar o banco.
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
    <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-40">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-300/10 p-6 border border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-5">
          <Sparkles size={14} className="text-[#ff0082] animate-pulse" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {t.filterVibe || "Escolha sua vibe"}
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((cat) => {
            // Garantimos que o nome da categoria seja limpo para buscar o ícone
            const categoryKey = String(cat).trim();
            const Icon = iconMap[categoryKey] || Ticket;
            const isAtiva = activeCategory === categoryKey;
            
            return (
              <button
                key={categoryKey}
                onClick={() => onSelect(categoryKey)} // Envia o nome em PT para o filtro
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-300 ${
                  isAtiva 
                  ? 'bg-[#ff0082] border-[#ff0082] text-white shadow-lg shadow-pink-200 -translate-y-1' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-pink-200 hover:text-[#ff0082] hover:shadow-md'
                }`}
              >
                <Icon size={16} strokeWidth={isAtiva ? 3 : 2} />
                <span className="text-[12px] font-bold uppercase tracking-wider">
                  {translateCategory(categoryKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}