'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Calendar, MapPin, Ticket, ShieldCheck, Share2, Loader2, Info, Plus, Minus, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DetalhesEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    async function carregarEvento() {
      try {
        const res = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvento(data);
        }
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#C22973]" size={32} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  const precoBase = parseFloat(evento.preco_minimo) || 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-[#FCFCFD] min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      {/* BACKGROUND DECORATIVO SUTIL */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-pink-50/50 to-transparent -z-10" />

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LADO ESQUERDO: CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* CARD DE IMAGEM COM EFEITO */}
            <div className="group relative aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-pink-200/20">
              <img 
                src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={evento.nome}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-[#C22973]/10 text-[#C22973] text-[11px] font-black uppercase tracking-widest rounded-full">
                  {evento.categoria || 'Destaque'}
                </span>
                <span className="flex items-center gap-1.5 text-amber-500 text-[11px] font-black uppercase tracking-widest">
                  <Zap size={14} fill="currentColor" /> Poucos Ingressos
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                {evento.nome}
              </h1>

              <div className="flex flex-wrap gap-y-4 gap-x-8 py-6 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#C22973]">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Quando</p>
                    <p className="text-sm font-bold text-slate-700">
                       {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#C22973]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Onde</p>
                    <p className="text-sm font-bold text-slate-700">{evento.cidade}, {evento.estado}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Info size={20} className="text-[#C22973]" /> Detalhes do evento
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line">
                  {evento.descricao || "Uma experiência exclusiva preparada especialmente para você. Garanta seu acesso agora."}
                </p>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: CHECKOUT BOX VIVO */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="p-1 w-full bg-gradient-to-br from-[#C22973] to-pink-400 rounded-[2.8rem] shadow-2xl shadow-pink-200/50">
                <div className="bg-white rounded-[2.6rem] p-8 md:p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ingressos</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Lote Único</p>
                    </div>
                    <button className="p-3 bg-slate-50 text-slate-400 hover:text-[#C22973] rounded-2xl transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-sm">Quantidade</p>
                        <p className="text-xs text-slate-500 font-medium">Máx. 5 por pessoa</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white rounded-2xl p-2 border border-slate-200 shadow-sm">
                        <button 
                          onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-pink-50 text-slate-400 hover:text-[#C22973] transition-all"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="text-lg font-black text-slate-900 w-4 text-center">{quantidade}</span>
                        <button 
                          onClick={() => setQuantidade(quantidade + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-pink-50 text-slate-400 hover:text-[#C22973] transition-all"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-slate-400 font-bold text-[10px] uppercase tracking-widest px-2">
                        <span>Valor Unitário</span>
                        <span>R$ {precoBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-lg font-black text-slate-900">Total</span>
                        <span className="text-3xl font-black text-[#C22973] tracking-tighter">
                          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <Link 
                      href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                      className="group relative flex items-center justify-center w-full bg-[#C22973] py-6 rounded-3xl font-black text-white uppercase tracking-[0.2em] text-sm transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(194,41,115,0.4)] active:scale-95 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <Ticket size={20} className="mr-3" /> Garantir meu lugar
                    </Link>

                    <div className="flex flex-col gap-3 items-center pt-2">
                      <div className="flex items-center gap-2 text-emerald-500">
                        <ShieldCheck size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ambiente 100% Seguro</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}