'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export function EventCard({ evento }: { evento: any }) {
  const { language, t } = useLanguage();
  
  // Configuração de localidade baseada no contexto
  const locale = language === 'PT' ? 'pt-BR' : 'en-US';
  const currency = language === 'PT' ? 'BRL' : 'USD';
  const currencySymbol = language === 'PT' ? 'R$' : '$';

  const data = new Date(evento.data_inicio);
  
  // Formatação de data dinâmica
  const dia = data.toLocaleDateString(locale, { day: '2-digit' });
  const mes = data.toLocaleDateString(locale, { month: 'short' }).toUpperCase().replace('.', '');
  const diaSemana = data.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase().replace('.', '');
  const hora = data.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  // Tradução da categoria (mapeia o que vem do banco para o arquivo de tradução)
  const traduzirCategoria = (cat: string) => {
    const categorias: Record<string, string> = {
      'Música & Show': t.catMusic,
      'Workshop & Palestra': t.catWorkshop,
      'Teatro & Cultura': t.catTheater,
      'Esportes': t.catSports,
      'Gastronomia': t.catFood,
    };
    return categorias[cat] || cat;
  };

  return (
    <Link 
      href={`/evento/${evento.id}`} 
      className="group block w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
    >
      
      {/* IMAGEM */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={evento.nome}
        />
        {/* Tag de Categoria Traduzida */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
            {traduzirCategoria(evento.categoria || 'Evento')}
          </span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* DATA E HORA (Usa o Rose Linkah no Hover) */}
        <p className="text-[#ff0082] text-[11px] font-bold uppercase mb-1">
          {diaSemana}, {dia} {mes} · {hora}
        </p>

        {/* TÍTULO */}
        <h3 className="text-gray-900 font-bold text-base leading-tight mb-2 group-hover:text-[#ff0082] transition-colors line-clamp-2 min-h-[40px]">
          {evento.nome}
        </h3>

        {/* LOCALIZAÇÃO */}
        <div className="flex items-center gap-1 text-gray-500 mb-4">
          <MapPin size={14} className="flex-shrink-0" />
          <span className="text-sm truncate">
            {evento.local_nome || 'Local'}, {evento.cidade}
          </span>
        </div>

        {/* PREÇO (Internacionalizado) */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            {language === 'PT' ? 'A partir de' : 'Starting at'}
          </p>
          <p className="text-lg font-bold text-gray-900">
            {currencySymbol} {evento.preco_minimo 
              ? Number(evento.preco_minimo).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
              : '0.00'}
          </p>
        </div>
      </div>
    </Link>
  );
}