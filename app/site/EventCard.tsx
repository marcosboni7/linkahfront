'use client';

import Link from 'next/link';
import { MapPin, Ticket } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  // Formatação de data otimizada
  const data = new Date(evento.data_inicio);
  const dia = data.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

  return (
    <Link href={`/evento/${evento.id}`} className="group block h-full">
      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(255,0,130,0.1)] hover:border-[#ff0082]/20 h-full flex flex-col relative">
        
        {/* IMAGEM COM OVERLAY DE CATEGORIA */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img 
            src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={evento.nome}
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-md text-[#ff0082] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
              {evento.categoria || 'Evento'}
            </span>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-6 flex gap-5 flex-1">
          {/* BLOCO DE DATA (ESTILO CALENDÁRIO MODERNO) */}
          <div className="flex flex-col items-center min-w-[45px]">
            <span className="text-[#ff0082] text-[10px] font-black uppercase tracking-tighter">
              {mes}
            </span>
            <span className="text-slate-900 text-2xl font-black leading-none">
              {dia}
            </span>
          </div>

          {/* INFORMAÇÕES ESCRITAS */}
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-900 group-hover:text-[#ff0082] transition-colors line-clamp-2 leading-tight uppercase tracking-tight mb-2 h-9">
              {evento.nome}
            </h3>
            
            <div className="space-y-1.5 mb-4">
              <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 truncate">
                <MapPin size={12} className="text-[#ff0082]/50" /> 
                {evento.local_nome || evento.cidade}
              </p>
            </div>

            {/* PREÇO E BOTÃO (FOOTER DO CARD) */}
            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">A partir de</p>
                <p className="text-base font-black text-slate-900">
                  R$ {evento.preco_minimo ? parseFloat(evento.preco_minimo).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#ff0082] group-hover:text-white transition-all duration-300">
                <Ticket size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}