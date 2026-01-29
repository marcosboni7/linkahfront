'use client';

import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  const data = new Date(evento.data_inicio);
  const dia = data.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

  return (
    <Link href={`/evento/${evento.id}`} className="group block h-full">
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-slate-100">
        
        {/* IMAGEM COM MASK CURVA */}
        <div className="relative p-3">
          <div className="relative aspect-video overflow-hidden rounded-[2rem]">
            <img 
              src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={evento.nome}
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/80 backdrop-blur-md text-slate-900 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm border border-white/20">
                {evento.categoria || 'Evento'}
              </span>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="px-8 py-6 flex flex-col flex-1">
          
          {/* DATA E TÍTULO ALINHADOS */}
          <div className="flex items-start gap-6 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-light text-slate-900 leading-none">{dia}</span>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">{mes}</span>
            </div>
            
            <div className="w-[1px] h-10 bg-slate-100" /> {/* Divisor vertical */}

            <h3 className="text-lg font-medium text-slate-800 leading-tight group-hover:text-rose-500 transition-colors">
              {evento.nome}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-slate-400 mb-8">
            <MapPin size={14} strokeWidth={1.5} />
            <span className="text-[11px] font-medium tracking-wide uppercase italic">{evento.cidade}</span>
          </div>

          {/* FOOTER */}
          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] text-slate-400 font-medium italic">{evento.local_nome || 'Local do Evento'}</span>
              <span className="text-xl font-bold text-slate-900">
                R$ {evento.preco_minimo ? Math.floor(evento.preco_minimo) : '0'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-gradient-to-r from-rose-200 to-purple-200 text-rose-600 px-5 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest group-hover:from-rose-500 group-hover:to-rose-600 group-hover:text-white transition-all duration-300">
              Ver detalhes
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}