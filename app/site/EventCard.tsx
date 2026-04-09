'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowUpRight, Calendar } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <div className="h-32 w-full bg-slate-50 rounded-3xl mb-6 animate-pulse" />;

  const imgUrl = evento?.imagem_capa || evento?.imagem;
  const imagem = imgUrl?.startsWith('http') 
    ? imgUrl 
    : `https://res.cloudinary.com/dj32txsol/image/upload/${imgUrl}`;

  const dataObj = new Date(evento?.data_inicio || evento?.data);
  const dia = dataObj.getUTCDate();
  const mes = dataObj.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', '');

  return (
    <Link
      href={`/evento/${evento?.id}`}
      className="group relative block w-full mb-6"
    >
      <div className="flex items-center gap-8 p-6 bg-white rounded-[2.5rem] border border-transparent hover:border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500">
        
        {/* 1. DATA COM DESTAQUE (BOX) */}
        <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-slate-50 rounded-2xl group-hover:bg-rose-50 transition-colors duration-500">
          <span className="text-[10px] font-black text-slate-400 group-hover:text-rose-500 tracking-widest">{mes}</span>
          <span className="text-2xl font-black text-slate-900 leading-none">{dia}</span>
        </div>

        {/* 2. IMAGEM COM MOLDURA LARGA */}
        <div className="relative h-24 w-24 md:h-28 md:w-28 flex-shrink-0 overflow-hidden rounded-[1.8rem] shadow-sm">
          <img
            src={imagem}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={evento?.nome}
          />
        </div>

        {/* 3. CONTEÚDO COM ESPAÇAMENTO INTERNO */}
        <div className="flex flex-col flex-grow min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full">
              <Calendar size={10} className="text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {evento?.horario || 'A definir'}
              </span>
            </div>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              • {evento?.categoria}
            </span>
          </div>

          <h3 className="text-slate-900 font-bold text-xl md:text-2xl leading-tight group-hover:text-rose-500 transition-colors duration-300">
            {evento?.nome}
          </h3>

          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin size={14} className="text-slate-300" />
            <span className="text-sm font-medium truncate">
              {evento?.local_nome || 'Local'} • <span className="text-slate-300">{evento?.cidade}</span>
            </span>
          </div>
        </div>

        {/* 4. PREÇO & ACTION */}
        <div className="flex items-center gap-6 pl-4 border-l border-slate-50">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Entry</span>
            <span className="text-lg font-black text-slate-900">
              {evento?.preco_minimo > 0 ? `R$ ${Number(evento.preco_minimo).toFixed(0)}` : 'FREE'}
            </span>
          </div>
          
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-rose-500 group-hover:shadow-[0_10px_20px_rgba(244,63,94,0.3)] transition-all duration-500">
            <ArrowUpRight size={22} />
          </div>
        </div>
      </div>
    </Link>
  );
}