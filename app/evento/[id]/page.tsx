'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { Calendar, MapPin, Ticket, ShieldCheck, Share2, Loader2, Plus, Minus, Zap, ChevronLeft } from 'lucide-react';
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
          // ESSA LINHA É A MAIS IMPORTANTE: 
          // Abra o site, aperte F12, vá em 'Console' e veja o que aparece aqui.
          console.log("CONTEÚDO DA API:", data); 
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
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-rose-500" size={32} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  // LÓGICA DE PREÇO MEGA AMPLIADA
  // Adicionei todos os nomes possíveis que podem estar vindo da sua API
  const precoBase = Number(
    evento.preco_minimo || 
    evento.preco || 
    evento.valor || 
    evento.price || 
    evento.preco_venda || 
    evento.ticket_price ||
    0
  );
  
  const total = precoBase * quantidade;

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors mb-8 text-sm font-medium group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para eventos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md">
                    {evento.categoria || 'Evento'}
                  </span>
                </div>

                {/* BADGE DE PREÇO - SE CONTINUAR 0, O NOME NA API ESTÁ MUITO DIFERENTE */}
                <div className="bg-[#0F172A] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg">
                  {precoBase > 0 
                    ? `A partir de ${precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : 'Valor sob consulta'}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                {evento.nome}
              </h1>

              <div className="flex flex-wrap gap-8 py-8 border-y border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Data</p>
                    <p className="text-md font-semibold text-slate-800">
                       {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString('pt-BR') : 'Verificar data'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Local</p>
                    <p className="text-md font-semibold text-slate-800">{evento.cidade || 'Local não informado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-xl border border-slate-100">
              <img 
                src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
                className="w-full h-full object-cover"
                alt={evento.nome}
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-12">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Ingressos</h2>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Quantidade</p>
                      <p className="text-[11px] text-slate-400">Máximo 5 por pessoa</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                      <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="p-1 hover:text-rose-500 transition-colors">
                        <Minus size={20} />
                      </button>
                      <span className="text-xl font-bold text-slate-900 min-w-[20px] text-center">{quantidade}</span>
                      <button onClick={() => setQuantidade(Math.min(5, quantidade + 1))} className="p-1 hover:text-rose-500 transition-colors">
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-400 font-medium text-sm px-2">
                      <span>Preço unitário</span>
                      <span>{precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between items-end px-2">
                      <span className="text-lg font-bold text-slate-900">Total</span>
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>

                  <Link 
                    href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                    className="flex items-center justify-center w-full bg-[#E30031] py-6 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-100 gap-3 text-lg"
                  >
                    <Ticket size={24} className="rotate-[-10deg]" />
                    Confirmar Reserva
                  </Link>

                  <div className="flex justify-center items-center gap-2 text-slate-300 pt-2">
                    <ShieldCheck size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Linkah Secure Pay</span>
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