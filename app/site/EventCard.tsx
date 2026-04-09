'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowUpRight } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <div className="h-24 w-full bg-slate-50 animate-pulse rounded-2xl mb-4" />;

  const imgUrl = evento?.imagem_capa || evento?.imagem;
  const imagem = imgUrl?.startsWith('http') 
    ? imgUrl 
    : `https://res.cloudinary.com/dj32txsol/image/upload/${imgUrl}`;

  // Formatação simplificada de data (Estilo Agenda)
  const dataObj = new Date(evento?.data_inicio || evento?.data);
  const dia = dataObj.getUTCDate();
  const mes = dataObj.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', '');

  return (
    <Link
      href={`/evento/${evento?.id}`}
      className="group flex items-center gap-5 py-5 border-b border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-400 px-4 -mx-4 rounded-[2rem]"
    >
      {/* 1. DATA (CALENDÁRIO) */}
      <div className="flex flex-col items-center min-w-[45px] select-none">
        <span className="text-[10px] font-black text-rose-500 tracking-widest">{mes}</span>
        <span className="text-2xl font-black text-slate-900 leading-none">{dia}</span>
      </div>

      {/* 2. IMAGEM QUADRADA */}
      <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={imagem}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={evento?.nome}
        />
      </div>

      {/* 3. CONTEÚDO */}
      <div className="flex flex-col flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            {evento?.horario || 'Horário a definir'}
          </span>
          {evento?.categoria && (
            <span className="w-1 h-1 rounded-full bg-slate-300" />
          )}
          <span className="text-[10px] font-bold text-slate-400 uppercase truncate">
            {evento?.categoria}
          </span>
        </div>

        <h3 className="text-slate-900 font-bold text-lg md:text-xl leading-snug truncate group-hover:text-rose-500 transition-colors">
          {evento?.nome}
        </h3>

        <div className="flex items-center gap-1 text-slate-400">
          <MapPin size={12} className="opacity-40" />
          <span className="text-xs font-medium truncate italic">
            {evento?.local_nome || 'Local'}, {evento?.cidade}
          </span>
        </div>
      </div>

      {/* 4. PREÇO & BOTÃO */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Entry</span>
          <span className="text-sm font-black text-slate-900">
            {evento?.preco_minimo > 0 ? `R$ ${Number(evento.preco_minimo).toFixed(0)}` : 'Grátis'}
          </span>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </Link>
  );
}