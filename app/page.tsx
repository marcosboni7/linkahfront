'use client';

import { Calendar, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  evento: {
    id: number;
    nome: string;
    imagem_capa: string;
    local_nome: string;
    cidade: string;
    estado: string;
    data_inicio: string;
    hora_inicio: string; // Coluna enviada pelo banco
    preco_minimo?: number;
  };
}

export function EventCard({ evento }: EventCardProps) {
  
  // --- FUNÇÕES DE CORREÇÃO DE EXIBIÇÃO ---

  // 1. Corrige a Data: Transforma "2026-02-19T00:00:00" em "19/02/2026" sem erro de fuso
  const exibirData = (dataBruta: string) => {
    if (!dataBruta) return '';
    const dataApenas = dataBruta.substring(0, 10); // Pega apenas YYYY-MM-DD
    const [ano, mes, dia] = dataApenas.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // 2. Corrige a Hora: Pega a hora_inicio (ex: "19:30:00") e mostra "19:30"
  // Se o banco não mandar hora_inicio, ele não tenta converter a data_inicio (evita o 21h)
  const exibirHora = () => {
    if (evento.hora_inicio) {
      return evento.hora_inicio.substring(0, 5); // Retorna HH:MM
    }
    return ''; // Retorna vazio se não houver hora definida
  };

  return (
    <Link href={`/evento/${evento.id}`}>
      <div className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        
        {/* IMAGEM DE CAPA */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={evento.imagem_capa || 'https://via.placeholder.com/400x200'} 
            alt={evento.nome}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            <span className="text-[10px] font-black text-[#ff0082] uppercase">
              {evento.preco_minimo && evento.preco_minimo > 0 
                ? `A partir de R$ ${evento.preco_minimo}` 
                : 'Grátis'}
            </span>
          </div>
        </div>

        {/* CONTEÚDO DO CARD */}
        <div className="p-6 flex flex-col flex-1">
          
          {/* DATA E HORA - ONDE ESTAVA O BUG */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#ff0082] uppercase tracking-wider">
              <Calendar size={12} />
              {exibirData(evento.data_inicio)}
            </div>
            {exibirHora() && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Clock size={12} />
                {exibirHora()}h
              </div>
            )}
          </div>

          <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-[#ff0082] transition-colors line-clamp-2 uppercase italic">
            {evento.nome}
          </h3>

          <div className="mt-auto space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin size={14} className="shrink-0 text-slate-400" />
              <span className="text-xs font-medium truncate">{evento.local_nome}</span>
            </div>
            <div className="ml-5 text-[10px] font-bold text-slate-400 uppercase">
              {evento.cidade} - {evento.estado}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}