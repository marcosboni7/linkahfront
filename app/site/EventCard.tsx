'use client';

import Link from 'next/link';
import { MapPin, Calendar, Clock } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  // Tratamento seguro de Data
  const dataValida = evento.data_inicio ? new Date(evento.data_inicio) : new Date();
  const dia = dataValida.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mes = dataValida.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
  const diaSemana = dataValida.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');

  // Cálculo de Preço Mínimo (Turbinado para aceitar o campo 'preco' também)
  const precoFinal = () => {
    // 1. Tenta preco_minimo
    if (evento.preco_minimo !== undefined && evento.preco_minimo !== null && Number(evento.preco_minimo) > 0) {
      return Number(evento.preco_minimo);
    }
    // 2. Tenta preco (campo simples que costuma vir da API)
    if (evento.preco !== undefined && evento.preco !== null && Number(evento.preco) > 0) {
      return Number(evento.preco);
    }
    // 3. Tenta lista de ingressos
    if (evento.ingressos && Array.isArray(evento.ingressos) && evento.ingressos.length > 0) {
      const precos = evento.ingressos.map((i: any) => Number(i.preco)).filter(p => p > 0);
      if (precos.length > 0) return Math.min(...precos);
    }
    return 0;
  };

  const valorExibicao = precoFinal();

  return (
    <Link href={`/evento/${evento.id}`} className="group block w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col h-full">
      
      {/* IMAGEM COM TAG */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img 
          src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={evento.nome}
          onError={(e: any) => {
            e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4";
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-md text-[#C22973] text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm">
            {evento.categoria || 'Evento'}
          </span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* DATA */}
        <div className="flex items-center gap-1.5 text-[#C22973] text-[10px] font-black uppercase tracking-widest mb-2">
          <Calendar size={12} />
          {diaSemana}, {dia} {mes} • {evento.hora_inicio?.slice(0, 5) || '00:00'}
        </div>

        {/* TÍTULO */}
        <h3 className="text-slate-900 font-black text-lg leading-tight mb-3 group-hover:text-[#C22973] transition-colors line-clamp-2 min-h-[56px]">
          {evento.nome}
        </h3>

        {/* LOCALIZAÇÃO */}
        <div className="flex items-center gap-1.5 text-slate-500 mb-6">
          <MapPin size={14} className="shrink-0 text-slate-400" />
          <span className="text-xs font-bold truncate">
            {evento.tipo === 'online' ? 'Evento Online' : `${evento.local_nome || 'Local'}, ${evento.cidade || ''}`}
          </span>
        </div>

        {/* FOOTER DO CARD (PREÇO) */}
        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">A partir de</p>
            <div className="text-xl font-black text-slate-900 leading-none">
              {valorExibicao === 0 ? (
                <span className="text-emerald-500">GRÁTIS</span>
              ) : (
                <span>
                  <span className="text-sm mr-0.5">R$</span>
                  {valorExibicao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#C22973] group-hover:text-white transition-all">
            <Clock size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}