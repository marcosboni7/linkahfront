'use client';

import Link from 'next/link';

export function EventCard({ evento }: { evento: any }) {
  const data = new Date(evento.data_inicio);
  const dia = data.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();

  return (
    <Link href={`/evento/${evento.id}`} className="group block bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
      {/* IMAGEM HORIZONTAL 16:9 */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={evento.nome}
        />
      </div>

      {/* CONTEÚDO */}
      <div className="p-4 flex gap-4">
        {/* DATA ESTILO SYMPLA (LADO ESQUERDO) */}
        <div className="text-center">
          <p className="text-blue-500 text-xs font-bold">{mes}</p>
          <p className="text-slate-700 text-xl font-black">{dia}</p>
        </div>

        {/* INFO (LADO DIREITO) */}
        <div className="flex flex-col gap-1 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">
            {evento.nome}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-1">
            {evento.local_nome || evento.cidade}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-auto pt-2">
            R$ {evento.preco_minimo ? parseFloat(evento.preco_minimo).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </p>
        </div>
      </div>
    </Link>
  );
}