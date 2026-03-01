'use client';

import Link from 'next/link';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export function EventCard({ evento }: { evento: any }) {
  const { language, t }: any = useLanguage();
  
  const locale = language === 'PT' ? 'pt-BR' : 'en-US';

  // --- LÓGICA DE MOEDA COM LOG DE DEPURAÇÃO ---
  const getCurrencySymbol = () => {
    // ESTE LOG VAI MOSTRAR O QUE A AWS ESTÁ ENTREGANDO DE FATO
    console.log(`DEBUG [${evento.nome}]:`, {
      moeda: evento.moeda,
      currency: evento.currency,
      dados_completos: evento
    });

    // Tentamos pegar 'moeda' ou 'currency' e transformamos em maiúsculo
    const m = (evento.moeda || evento.currency || '').toUpperCase();
    
    if (m === 'EUR') return '€';
    if (m === 'USD') return '$';
    if (m === 'BRL') return 'R$';

    // Se a API não enviou nada (undefined), ele usa o padrão do idioma
    return language === 'PT' ? 'R$' : '$';
  };

  const currencySymbol = getCurrencySymbol();
  // -------------------------------------

  const formatarDataVitrine = () => {
    const dataRaw = evento.data_inicio || evento.data;
    if (!dataRaw) return { diaSemana: '', dia: '', mes: '', hora: '' };

    const apenasData = String(dataRaw).split('T')[0];
    const partes = apenasData.split('-');
    
    if (partes.length !== 3) return { diaSemana: '', dia: '', mes: '', hora: '' };

    const ano = parseInt(partes[0]);
    const mesNum = parseInt(partes[1]) - 1; 
    const diaNum = parseInt(partes[2]);

    const d = new Date(ano, mesNum, diaNum);

    if (isNaN(d.getTime())) return { diaSemana: '', dia: '', mes: '', hora: '' };

    const diaSemana = d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase().replace('.', '');
    const dia = d.toLocaleDateString(locale, { day: '2-digit' });
    const mes = d.toLocaleDateString(locale, { month: 'short' }).toUpperCase().replace('.', '');
    
    const horaRaw = evento.horario || evento.hora_inicio || "";
    let horaFormatada = horaRaw.slice(0, 5);
    if (horaFormatada === "00:00" || !horaFormatada) horaFormatada = "";

    return { diaSemana, dia, mes, hora: horaFormatada };
  };

  const { diaSemana, dia, mes, hora } = formatarDataVitrine();

  const traduzirCategoria = (cat: string) => {
    const categorias: Record<string, string> = {
      'Arte & Cultura': t.catArt,
      'Entretenimento': t.catEnt,
      'Negócios': t.catBiz,
      'Educação & Desenvolvimento': t.catEdu,
      'Esportes & Bem-estar': t.catHealth,
      'Experiências & Lifestyle': t.catLife,
      'Família & Comunidade': t.catFamily,
    };
    return categorias[cat] || cat;
  };

  return (
    <Link 
      href={`/evento/${evento.id}`} 
      className="group block w-full bg-white rounded-2xl overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img 
          src={String(evento.imagem_capa || evento.imagem || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4")} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={String(evento.nome || "Evento")}
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
            {traduzirCategoria(String(evento.categoria || 'Evento'))}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-4">
          <Calendar size={14} strokeWidth={2.5} />
          <span>
            {diaSemana}, {dia} {mes}
            {hora && ` • ${hora}`}
          </span>
        </div>

        <h3 className="text-slate-900 font-bold text-lg leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">
          {String(evento.nome || "")}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-400 mb-6">
          <MapPin size={14} className="flex-shrink-0 text-gray-300" />
          <span className="text-xs font-medium truncate">
            {String(evento.local_nome || 'Local')}, {String(evento.cidade || '')}
          </span>
        </div>

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