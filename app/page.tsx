'use client';
import { Navbar } from '../app/site/Navbar';
import { Ticket, Calendar, MapPin, Share2, ShieldCheck } from 'lucide-react';

export default function EventoDetalhes() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Lado Esquerdo: Banner e Descrição */}
        <div className="lg:col-span-2 space-y-8">
          <div className="h-[450px] rounded-[3rem] overflow-hidden shadow-2xl relative">
            <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30" className="w-full h-full object-cover" />
            <div className="absolute top-6 right-6">
              <button className="p-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg hover:text-[#C22973] transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm">
            <h1 className="text-4xl font-black mb-6 uppercase tracking-tighter">Nome do Evento Incrível</h1>
            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-3 text-slate-500 font-bold">
                <Calendar className="text-[#C22973]" size={20} /> 20 Dez, 2026
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-bold">
                <MapPin className="text-[#C22973]" size={20} /> Allianz Parque, SP
              </div>
            </div>
            <h3 className="text-lg font-black uppercase mb-4">Sobre o evento</h3>
            <p className="text-slate-500 leading-relaxed font-medium">Prepare-se para uma experiência única...</p>
          </div>
        </div>

        {/* Lado Direito: Ingressos */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-pink-50 sticky top-28">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Ticket className="text-[#C22973]" /> Selecione seu Ingresso
            </h3>
            
            <div className="space-y-4 mb-8">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-pink-100 transition-all">
                  <div>
                    <p className="font-black text-slate-900">Pista Premium</p>
                    <p className="text-xs text-[#C22973] font-black">R$ 250,00</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                    <button className="font-black text-slate-400 hover:text-[#C22973]">-</button>
                    <span className="font-black text-sm w-4 text-center">0</span>
                    <button className="font-black text-slate-400 hover:text-[#C22973]">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end mb-6">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-slate-900 leading-none">R$ 0,00</span>
              </div>
              <button className="w-full bg-[#C22973] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-pink-100 hover:scale-[1.02] transition-all active:scale-95">
                Comprar Agora
              </button>
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-500" /> Pagamento 100% Seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}