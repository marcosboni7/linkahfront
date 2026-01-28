'use client';

import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  // Função para formatar a data com segurança
  const formatarData = (dataIso: string) => {
    try {
      if (!dataIso) return "Data a definir";
      return new Date(dataIso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <Link href={`/evento/${evento.id}`} className="group">
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-pink-100 transition-all duration-500">
        <div className="relative h-60 overflow-hidden">
          <img 
            /* AJUSTE: Usando imagem_capa que vem do seu Backend */
            src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            alt={evento.nome}
          />
          <div className="absolute bottom-4 right-4 bg-[#C22973] text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl">
            R$ {evento.preco_minimo ? parseFloat(evento.preco_minimo).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-[#C22973] font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
            {/* AJUSTE: Usando data_inicio do seu banco */}
            <Calendar size={12} /> {formatarData(evento.data_inicio)}
          </div>
          
          <h3 className="text-xl font-black text-slate-900 group-hover:text-[#C22973] transition-colors line-clamp-1">
            {evento.nome}
          </h3>
          
          <p className="flex items-center gap-2 text-slate-400 text-sm mt-2 font-medium mb-6">
            {/* AJUSTE: Usando local_nome ou cidade/estado como fallback */}
            <MapPin size={14} /> 
            {evento.local_nome || (evento.cidade ? `${evento.cidade}, ${evento.estado}` : 'Local a definir')}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ver detalhes</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#C22973] group-hover:text-white transition-all">
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}