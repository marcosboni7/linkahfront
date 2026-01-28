'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Calendar, MapPin, Ticket, ShieldCheck, Share2, Loader2, Info } from 'lucide-react';
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
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#C22973]" size={40} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center font-black text-slate-900">Evento não encontrado.</div>;

  // Cálculo do total considerando o preço que vem do banco
  const precoBase = parseFloat(evento.preco_minimo) || 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LADO ESQUERDO: CONTEÚDO */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                // AJUSTE: imagem_capa
                src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
                className="w-full h-full object-cover"
                alt={evento.nome}
              />
              <div className="absolute top-6 right-6">
                <button className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:text-[#C22973] transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-white">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tighter">
                {evento.nome}
              </h1>
              
              <div className="flex flex-wrap gap-8 py-8 border-y border-slate-100 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#C22973]">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Data e Hora</p>
                    {/* AJUSTE: data_inicio */}
                    <p className="font-bold text-slate-700">
                      {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#C22973]">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Localização</p>
                    {/* AJUSTE: local_nome e cidade */}
                    <p className="font-bold text-slate-700 line-clamp-1">
                      {evento.local_nome || evento.cidade || 'Local a definir'}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2 text-slate-900">
                <Info size={18} className="text-[#C22973]" /> Sobre o Evento
              </h3>
              <p className="text-slate-500 leading-relaxed font-medium whitespace-pre-line">
                {evento.descricao || "Nenhuma descrição detalhada fornecida para este evento."}
              </p>
            </div>
          </div>

          {/* LADO DIREITO: COMPRA (STICKY) */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-pink-50">
              <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-slate-900">
                <Ticket className="text-[#C22973]" /> Selecione seu Ingresso
              </h3>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-black text-slate-900 uppercase text-sm">Ingresso Único</p>
                    <p className="text-[#C22973] font-black text-lg">
                      R$ {precoBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                    <button 
                      onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                      className="font-black text-slate-300 hover:text-[#C22973] text-xl px-2 transition-colors"
                    > - </button>
                    <span className="font-black text-slate-900 w-4 text-center">{quantidade}</span>
                    <button 
                      onClick={() => setQuantidade(quantidade + 1)}
                      className="font-black text-slate-300 hover:text-[#C22973] text-xl px-2 transition-colors"
                    > + </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Subtotal</span>
                  <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                    R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Link 
                  href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                  className="w-full bg-[#C22973] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 active:scale-95"
                >
                  Comprar Agora
                </Link>

                <div className="flex items-center justify-center gap-2 py-2 border-t border-slate-50">
                   <ShieldCheck size={16} className="text-green-500" />
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Plataforma Segura Linkah</span>
                </div>
              </div>
            </div>

            <div className="mt-6 px-4 py-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 flex gap-4 items-start">
              <Info size={20} className="text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                Após a confirmação do pagamento, seu ingresso será enviado automaticamente para o e-mail cadastrado.
              </p>
            </div>
          </div>

        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          © 2026 Linkah Eventos • Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}