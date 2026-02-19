'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  // Verificação de segurança para a data
  const data = evento.data_inicio ? new Date(evento.data_inicio) : new Date();
  
  // Formatação segura
  const dia = data.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
  const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');

  // Pega o menor preço dos ingressos se o preco_minimo não existir
  const precoExibicao = evento.preco_minimo 
    ? Number(evento.preco_minimo) 
    : (evento.ingressos && evento.ingressos.length > 0 
        ? Math.min(...evento.ingressos.map((i: any) => Number(i.preco))) 
        : 0);

  return (
    <Link href={`/evento/${evento.id}`} className="group block w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      
      {/* IMAGEM */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img 
          src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={evento.nome}
          onError={(e: any) => {
            e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4";
          }}
        />
        <div className="absolute bottom-2 left-2">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
            {evento.categoria || 'Evento'}
          </span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* DATA E HORA */}
        <p className="text-[#C22973] text-[11px] font-bold uppercase mb-1">
          {diaSemana}, {dia} {mes} · {evento.hora_inicio ? evento.hora_inicio.slice(0, 5) : '00:00'}
        </p>

        {/* TÍTULO */}
        <h3 className="text-gray-900 font-bold text-base leading-tight mb-2 group-hover:text-[#C22973] transition-colors line-clamp-2 min-h-[40px]">
          {evento.nome}
        </h3>

        {/* LOCALIZAÇÃO */}
        <div className="flex items-center gap-1 text-gray-500 mb-4">
          <MapPin size={14} className="flex-shrink-0" />
          <span className="text-sm truncate">
            {evento.tipo === 'online' ? 'Evento Online' : `${evento.local_nome || 'Local'}, ${evento.cidade || ''}`}
          </span>
        </div>

        {/* PREÇO */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">A partir de</p>
          <p className="text-lg font-bold text-gray-900">
            {precoExibicao === 0 ? 'Grátis' : `R$ ${precoExibicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          </p>
        </div>
      </div>
    </Link>
  );
}