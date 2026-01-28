'use client';

import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Ticket } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  const formatarData = (dataIso: string) => {
    try {
      if (!dataIso) return "Data a definir";
      return new Date(dataIso).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short' 
      }).replace('.', ''); // Ex: 12 Out
    } catch (e) {
      return "---";
    }
  };

  return (
    <Link href={`/evento/${evento.id}`} className="group relative block w-full max-w-[280px] mx-auto">
      {/* CONTAINER PRINCIPAL */}
      <div className="relative bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 border border-slate-100 group-hover:shadow-[0_20px_40px_rgba(194,41,115,0.12)]">
        
        {/* IMAGEM COM PROPORÇÃO VERTICAL (ESTILO POSTER) */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img 
            src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={evento.nome}
          />
          
          {/* GRADIENTE SOBRE A IMAGEM */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* BADGE DE DATA (FLUTUANTE) */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm text-center min-w-[50px]">
            <p className="text-[10px] font-black uppercase text-[#C22973] leading-none mb-0.5">
               {formatarData(evento.data_inicio).split(' ')[1]}
            </p>
            <p className="text-sm font-black text-slate-900 leading-none">
               {formatarData(evento.data_inicio).split(' ')[0]}
            </p>
          </div>

          {/* PREÇO (FLUTUANTE NO CANTO) */}
          <div className="absolute bottom-4 left-4">
             <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest block mb-0.5">A partir de</span>
             <p className="text-white font-black text-lg">
                R$ {evento.preco_minimo ? Math.floor(evento.preco_minimo) : '0'}
             </p>
          </div>
        </div>
        
        {/* INFO DO EVENTO */}
        <div className="p-5">
          <div className="flex items-center gap-1 text-[#C22973] font-bold text-[9px] uppercase tracking-widest mb-2">
            <Ticket size={10} /> {evento.categoria || 'Evento'}
          </div>
          
          <h3 className="text-base font-black text-slate-900 leading-tight mb-2 group-hover:text-[#C22973] transition-colors line-clamp-2 uppercase tracking-tight h-10">
            {evento.nome}
          </h3>
          
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
            <MapPin size={12} className="text-slate-300" /> 
            <span className="truncate">
                {evento.cidade ? `${evento.cidade}, ${evento.estado}` : 'Local a definir'}
            </span>
          </div>
        </div>

        {/* OVERLAY DE HOVER (BOTÃO QUE APARECE) */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#C22973]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-[#C22973] text-white p-3 rounded-full shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                <ArrowRight size={20} />
            </div>
        </div>
      </div>
    </Link>
  );
}