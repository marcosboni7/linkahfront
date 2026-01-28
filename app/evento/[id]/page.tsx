'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Calendar, MapPin, Ticket, ShieldCheck, Share2, Loader2, Info, Plus, Minus } from 'lucide-react';
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
      <Loader2 className="animate-spin text-slate-200" size={32} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  const precoBase = parseFloat(evento.preco_minimo) || 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-8 pb-24">
        {/* HEADER DO EVENTO */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {evento.categoria || 'Geral'}
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
                {evento.nome}
              </h1>
              <div className="flex items-center gap-6 text-slate-500 text-sm">
                <span className="flex items-center gap-2"><Calendar size={16} /> {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'}</span>
                <span className="flex items-center gap-2"><MapPin size={16} /> {evento.cidade}, {evento.estado}</span>
              </div>
            </div>
            <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest">
              <Share2 size={16} /> Compartilhar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LADO ESQUERDO: IMAGEM E DESCRIÇÃO */}
          <div className="lg:col-span-7 space-y-12">
            <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
              <img 
                src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
                className="w-full h-full object-cover"
                alt={evento.nome}
              />
            </div>

            <section className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Info size={20} className="text-slate-400" /> Sobre o evento
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg font-normal whitespace-pre-line">
                {evento.descricao || "Nenhuma descrição detalhada fornecida."}
              </p>
            </section>
          </div>

          {/* LADO DIREITO: CHECKOUT BOX (CLEAN) */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 p-8 rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Ingressos</h3>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">Entrada Individual</p>
                    <p className="text-sm text-slate-400">Venda exclusiva Linkah</p>
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    R$ {precoBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex items-center justify-between py-6 border-y border-slate-50">
                  <span className="text-sm font-medium text-slate-600">Quantidade</span>
                  <div className="flex items-center gap-4 border border-slate-200 rounded-full px-4 py-2">
                    <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="text-slate-400 hover:text-slate-900 transition-colors">
                      <Minus size={18} />
                    </button>
                    <span className="w-4 text-center font-semibold">{quantidade}</span>
                    <button onClick={() => setQuantidade(quantidade + 1)} className="text-slate-400 hover:text-slate-900 transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-slate-900">
                      R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <Link 
                    href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                    className="flex items-center justify-center w-full bg-[#C22973] hover:bg-slate-900 text-white py-5 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-pink-100 hover:shadow-none active:scale-[0.98]"
                  >
                    Garantir ingresso
                  </Link>
                </div>

                <div className="flex flex-col gap-4 items-center pt-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[11px] font-medium tracking-wide">Pagamento seguro via Linkah</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-12 border-t border-slate-50 text-center">
        <p className="text-xs font-medium text-slate-400">
          © 2026 Linkah • Experiências memoráveis.
        </p>
      </footer>
    </div>
  );
}