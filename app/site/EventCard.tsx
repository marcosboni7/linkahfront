'use client';

import Link from 'next/link';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export function EventCard({ evento }: { evento: any }) {
  const { language, t }: any = useLanguage();
  
  const locale = language === 'PT' ? 'pt-BR' : 'en-US';
  const currencySymbol = language === 'PT' ? 'R$' : '$';

  // --- LÓGICA DE DATA PARA MOSTRAR HORÁRIO REAL ---
  const formatarDataVitrine = () => {
    const dataRaw = evento.data_inicio || evento.data;
    if (!dataRaw) return { diaSemana: '', dia: '', mes: '', hora: '--:--' };

    // Criamos o objeto de data
    const d = new Date(dataRaw);

    if (isNaN(d.getTime())) return { diaSemana: '', dia: '', mes: '', hora: '--:--' };

    // FORÇAMOS O TIMEZONE PARA BRASÍLIA
    // Isso garante que se no banco for 20:00, ele mostre 20:00 em qualquer lugar
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Sao_Paulo',
      hour12: false
    };

    const diaSemana = d.toLocaleDateString(locale, { ...options, weekday: 'short' }).toUpperCase().replace('.', '');
    const dia = d.toLocaleDateString(locale, { ...options, day: '2-digit' });
    const mes = d.toLocaleDateString(locale, { ...options, month: 'short' }).toUpperCase().replace('.', '');
    
    // Aqui pegamos a hora real ajustada ao fuso de Brasília
    const hora = d.toLocaleTimeString(locale, { 
      ...options,
      hour: '2-digit', 
      minute: '2-digit'
    });

    return { diaSemana, dia, mes, hora };
  };

  const { diaSemana, dia, mes, hora } = formatarDataVitrine();

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
      className="group block w-full bg-white rounded-2xl overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 flex flex-col h-full"
    >
      
      {/* IMAGEM */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img 
          src={String(evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4")} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={String(evento.nome || "Evento")}
        />
        
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
            {traduzirCategoria(String(evento.categoria || 'Evento'))}
          </span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* DATA E HORA COM AJUSTE REAL */}
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-4">
          <Calendar size={14} strokeWidth={2.5} />
          <span>{diaSemana}, {dia} {mes} • {hora}</span>
        </div>

        {/* TÍTULO */}
        <h3 className="text-slate-900 font-bold text-lg leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">
          {String(evento.nome || "")}
        </h3>

        {/* LOCALIZAÇÃO */}
        <div className="flex items-center gap-1.5 text-gray-400 mb-6">
          <MapPin size={14} className="flex-shrink-0 text-gray-300" />
          <span className="text-xs font-medium truncate">
            {String(evento.local_nome || 'Local')}, {String(evento.cidade || '')}
          </span>
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {String(t?.from || 'Tickets')}
            </p>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              <span className="text-sm font-bold mr-0.5">{currencySymbol}</span>
              {evento.preco_minimo 
                ? Number(evento.preco_minimo).toLocaleString(locale, { minimumFractionDigits: 2 }) 
                : '0.00'}
            </p>
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-45 transition-all duration-500">
             <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}