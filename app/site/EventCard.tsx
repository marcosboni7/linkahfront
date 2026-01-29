'use client';

import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  const data = new Date(evento.data_inicio);
  const dia = data.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

  return (
    <Link href={`/evento/${evento.id}`} className="group block w-full max-w-[380px] mx-auto">
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col">
        
        {/* IMAGEM COMPACTA */}
        <div className="relative p-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem]">
            <img 
              src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={evento.nome}
            />
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                {evento.categoria || 'Evento'}
              </span>
            </div>
          </div>
        </div>

        {/* CONTEÚDO ENXUTO */}
        <div className="px-5 py-4 flex flex-col">
          
          <div className="flex items-center gap-4 mb-3">
            <div className="flex flex-col items-center min-w-[35px]">
              <span className="text-xl font-bold text-slate-900 leading-none">{dia}</span>
              <span className="text-[9px] font-black text-rose-500 uppercase">{mes}</span>
            </div>
            
            <div className="w-[1px] h-8 bg-slate-100" />

            <h3 className="text-md font-bold text-slate-800 leading-tight group-hover:text-rose-500 transition-colors line-clamp-1">
              {evento.nome}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 mb-4">
            <MapPin size={12} strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-tight truncate">
              {evento.cidade} • {evento.local_nome || 'Local'}
            </span>
          </div>

          {/* FOOTER COMPACTO */}
          <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">A partir de</p>
              <p className="text-lg font-black text-slate-900 leading-none">
                R$ {evento.preco_minimo ? Math.floor(evento.preco_minimo) : '0'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-900 px-4 py-2.5 rounded-full font-black text-[9px] uppercase tracking-wider group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
              Tickets
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}