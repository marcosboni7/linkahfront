'use client';

import Link from 'next/link';
import { MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export function EventCard({ evento }: { evento: any }) {
  const { language, t }: any = useLanguage();
  
  const locale = language === 'PT' ? 'pt-BR' : 'en-US';
  const currencySymbol = language === 'PT' ? 'R$' : '$';

  // --- CORREÇÃO DE TIMEZONE ---
  // Adicionamos um replace para garantir que o JS não mude a hora por causa do fuso local
  const dataString = evento.data_inicio || "";
  const data = new Date(dataString);
  
  // Se a hora vier zerada do banco, o JS aplica o fuso. 
  // Forçamos a leitura "fiel" aos caracteres da string para evitar o "Efeito 21:00"
  const horaFormatada = data.toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC' // Força a exibição do que está gravado sem descontar fuso local
  });

  const dia = data.getUTCDate().toString().padStart(2, '0');
  const mes = data.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', '');
  const diaSemana = data.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', '');

  const traduzirCategoria = (cat: string) => {
    const categorias: Record<string, string> = {
      'Música & Show': t.catMusic || 'Música',
      'Workshop & Palestra': t.catWorkshop || 'Workshop',
      'Teatro & Cultura': t.catTheater || 'Cultura',
      'Esportes': t.catSports || 'Esportes',
      'Gastronomia': t.catFood || 'Gastronomia',
    };
    return categorias[cat] || cat;
  };

  return (
    <Link 
      href={`/evento/${evento.id}`} 
      className="group block w-full bg-white rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 flex flex-col h-full"
    >
      
      {/* IMAGEM COM OVERLAY GRADIENT */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={evento.nome}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
            {traduzirCategoria(evento.categoria || 'Evento')}
          </span>
        </div>
      </div>

      {/* CONTEÚDO CLEAN */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* DATA E HORA - AGORA CORRIGIDO */}
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-tight mb-3">
          <Calendar size={12} strokeWidth={3} />
          <span>{diaSemana}, {dia} {mes} • {horaFormatada}</span>
        </div>

        {/* TÍTULO - SEM ITÁLICO, MAIS PESADO */}
        <h3 className="text-slate-900 font-bold text-lg leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">
          {evento.nome}
        </h3>

        {/* LOCALIZAÇÃO */}
        <div className="flex items-center gap-1.5 text-gray-400 mb-6">
          <MapPin size={14} className="flex-shrink-0 text-gray-300" />
          <span className="text-xs font-medium truncate">
            {evento.local_nome || 'Local'}, {evento.cidade}
          </span>
        </div>

        {/* PREÇO E BOTÃO DISCRETO */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
              {t.from || 'Tickets'}
            </p>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              <span className="text-sm font-bold mr-0.5">{currencySymbol}</span>
              {evento.preco_minimo 
                ? Number(evento.preco_minimo).toLocaleString(locale, { minimumFractionDigits: 2 }) 
                : '0.00'}
            </p>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
             <Calendar size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
}