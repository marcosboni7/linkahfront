'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { Calendar, MapPin, Ticket, ShieldCheck, Share2, Loader2, Info, Plus, Minus, Zap, ChevronLeft } from 'lucide-react';
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
      <Loader2 className="animate-spin text-rose-500" size={32} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  const precoBase = parseFloat(evento.preco_minimo) || 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        
        {/* BOTÃO VOLTAR SUTIL */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors mb-8 text-sm font-medium group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para eventos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LADO ESQUERDO: CONTEÚDO */}
          <div className="lg:col-span-7 space-y-12">
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-[0.15em] rounded-md">
                  {evento.categoria || 'Experience'}
                </span>
                {precoBase > 0 && (
                   <span className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase tracking-widest">
                    <Zap size={12} fill="currentColor" /> Vagas Limitadas
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
                {evento.nome}
              </h1>

              {/* INFO BAR - CLEAN */}
              <div className="flex flex-wrap gap-8 py-8 border-y border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <Calendar size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Data do Evento</p>
                    <p className="text-md font-semibold text-slate-800">
                       {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'A definir'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <MapPin size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Localização</p>
                    <p className="text-md font-semibold text-slate-800">{evento.cidade}, {evento.estado}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* IMAGEM PRINCIPAL COM CURVATURA SUAVE */}
            <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-100">
              <img 
                src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
                className="w-full h-full object-cover"
                alt={evento.nome}
              />
            </div>

            {/* DESCRIÇÃO */}
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                Sobre o evento
              </h3>
              <p className="text-slate-500 leading-relaxed text-lg whitespace-pre-line font-light">
                {evento.descricao || "Uma experiência exclusiva preparada especialmente para você. Garanta seu acesso agora e viva momentos inesquecíveis."}
              </p>
            </div>
          </div>

          {/* LADO DIREITO: CHECKOUT (MINIMALISTA) */}
          <div className="lg:col-span-5">
            <div className="sticky top-12">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-semibold text-slate-900">Ingressos</h3>
                  <button className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Share2 size={20} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* SELETOR DE QUANTIDADE */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Quantidade</p>
                      <p className="text-[11px] text-slate-400">Limite de 5 convites</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-rose-500 hover:text-rose-500 transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-lg font-medium text-slate-900 w-4 text-center">{quantidade}</span>
                      <button 
                        onClick={() => setQuantidade(Math.min(5, quantidade + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-rose-500 hover:text-rose-500 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* RESUMO DE PREÇO */}
                  <div className="py-4 space-y-3">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Preço unitário</span>
                      <span>R$ {precoBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-semibold text-slate-900">Total</span>
                      <div className="text-right">
                        <span className="block text-3xl font-bold text-slate-900">
                          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BOTÃO DE AÇÃO */}
                  <Link 
                    href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                    className="flex items-center justify-center w-full bg-slate-900 py-5 rounded-2xl font-semibold text-white transition-all hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 active:scale-[0.98]"
                  >
                    <Ticket size={18} className="mr-2" strokeWidth={1.5} />
                    Comprar Ingressos
                  </Link>

                  <div className="pt-4 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Pagamento Processado via Linkah</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}