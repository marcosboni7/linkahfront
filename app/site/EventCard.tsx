import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export function EventCard({ evento }: { evento: any }) {
  return (
    <Link href={`/evento/${evento.id}`} className="group">
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-pink-100 transition-all duration-500">
        <div className="relative h-60 overflow-hidden">
          <img 
            src={evento.imagem_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute bottom-4 right-4 bg-[#C22973] text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl">
            R$ {evento.preco_minimo || '0,00'}
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-[#C22973] font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
            <Calendar size={12} /> {new Date(evento.data).toLocaleDateString('pt-BR')}
          </div>
          <h3 className="text-xl font-black text-slate-900 group-hover:text-[#C22973] transition-colors line-clamp-1">
            {evento.nome}
          </h3>
          <p className="flex items-center gap-2 text-slate-400 text-sm mt-2 font-medium mb-6">
            <MapPin size={14} /> {evento.local || 'Local a definir'}
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