'use client';

import Link from 'next/link';
import { MapPin, ArrowUpRight, Calendar } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  const data = new Date(evento.data_inicio);
  const dia = data.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

  return (
    <Link href={`/evento/${evento.id}`} className="group block relative">
      {/* Efeito de Sombra Sólida (Neo-brutalismo) */}
      <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
      
      <div className="relative bg-white border-2 border-black rounded-xl overflow-hidden flex flex-col h-full transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
        
        {/* Header da Imagem com Badge Flutuante */}
        <div className="relative h-48 overflow-hidden border-b-2 border-black">
          <img 
            src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
            alt={evento.nome}
          />
          <div className="absolute bottom-0 left-0 bg-yellow-400 border-t-2 border-r-2 border-black px-4 py-1 font-black text-xs uppercase tracking-tighter">
            {evento.categoria || 'Live Experience'}
          </div>
        </div>

        {/* Corpo do Card */}
        <div className="p-5 flex flex-col flex-1 bg-[#f8f8f8]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 bg-black text-white px-2 py-1 rounded-sm">
              <Calendar size={14} />
              <span className="text-[11px] font-bold uppercase">{dia} {mes}</span>
            </div>
            <div className="text-black group-hover:rotate-45 transition-transform duration-300">
              <ArrowUpRight size={24} strokeWidth={3} />
            </div>
          </div>

          <h3 className="text-xl font-black text-black leading-[1.1] mb-3 uppercase italic">
            {evento.nome}
          </h3>

          <div className="flex items-center gap-2 text-slate-600 mb-6">
            <MapPin size={14} className="shrink-0" />
            <span className="text-xs font-bold truncate">{evento.local_nome || evento.cidade}</span>
          </div>

          {/* Footer com Preço em Destaque */}
          <div className="mt-auto pt-4 border-t-2 border-black/5 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 leading-none">Tickets</span>
              <span className="text-2xl font-black text-black">
                {evento.preco_minimo ? `R$ ${Math.floor(evento.preco_minimo)}` : 'FREE'}
              </span>
            </div>
            
            <button className="bg-[#ff0082] text-white border-2 border-black px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
              Garantir Vaga
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}