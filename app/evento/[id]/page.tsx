'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { 
  Calendar, MapPin, Ticket, Share2, 
  Loader2, Plus, Minus, ChevronLeft,
  Heart, Users, Verified, Check
} from 'lucide-react';
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
        console.error("Erro ao carregar:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#FCFBFA]">
      <Loader2 className="animate-spin text-slate-300" size={32} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  const precoBase = evento.ingressos?.[0]?.preco ? Number(evento.ingressos[0].preco) : 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-[#FCFBFA] min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        
        {/* HEADER MINIMALISTA */}
        <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
          
          {/* IMAGEM ESTILO PORTA-RETRATO */}
          <div className="w-full md:w-1/2">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <img 
                src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
                className="w-full h-full object-cover"
                alt={evento.nome}
              />
            </div>
          </div>

          {/* TÍTULO E INFOS RÁPIDAS */}
          <div className="w-full md:w-1/2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#ff4d4d] bg-orange-50 px-3 py-1 rounded-full">
                  {evento.categoria || 'Evento'}
                </span>
                {evento.link_transmissao && (
                   <span className="text-[11px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">Virtual</span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-slate-900">
                {evento.nome}
              </h1>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </p>
                  <p className="text-sm text-slate-500">{evento.hora_inicio || '19:00'} - {evento.hora_fim || '22:00'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {evento.link_transmissao ? 'Link enviado após inscrição' : evento.local_nome}
                  </p>
                  <p className="text-sm text-slate-500">{evento.cidade}, {evento.estado}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                  <Users size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">Por {evento.produtor_email.split('@')[0]}</p>
                  <Verified size={14} className="text-blue-500" />
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO RÁPIDA */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95">
                  <Ticket size={20} />
                  Ingressos {precoBase > 0 ? `· R$ ${precoBase}` : 'Grátis'}
                </button>
                <button className="p-4 rounded-2xl border border-slate-200 hover:bg-white transition-all text-slate-500 shadow-sm active:scale-95">
                  <Share2 size={20} />
                </button>
            </div>
          </div>
        </div>

        {/* CONTEÚDO INFERIOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-slate-100 pt-16">
          
          {/* DESCRIÇÃO - COLUNA LARGA */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-bold text-slate-900">Sobre o evento</h2>
            <div className="text-slate-600 leading-relaxed text-lg font-light whitespace-pre-line">
              {evento.descricao}
            </div>
          </div>

          {/* SIDEBAR DE CHECKOUT ESTILO LUMA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
              <h3 className="font-bold text-slate-900 text-lg">Inscrição</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#FCFBFA] rounded-2xl border border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Quantidade</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="text-slate-400 hover:text-slate-900"><Minus size={16}/></button>
                    <span className="font-bold text-slate-900">{quantidade}</span>
                    <button onClick={() => setQuantidade(Math.min(10, quantidade + 1))} className="text-slate-400 hover:text-slate-900"><Plus size={16}/></button>
                  </div>
                </div>

                <div className="flex justify-between items-center px-2">
                  <span className="text-sm text-slate-500 font-medium">Total</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <Link 
                href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                className="block w-full text-center bg-[#ff4d4d] text-white py-5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                Garantir Vaga
              </Link>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
                  <Check size={14} className="text-green-500" /> Confirmação instantânea
                </div>
                <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
                  <Check size={14} className="text-green-500" /> Pagamento seguro (Stripe)
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