'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { 
  CreditCard, ShieldCheck, Lock, 
  Loader2, ArrowLeft, Ticket
} from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

// Inicializa o Stripe com sua CHAVE PÚBLICA REAL
const stripePromise = loadStripe('pk_live_51Sv4VnEFlXyonekdm17FB09ptaqOhnxvBSqtWcX3jZcopNopxn6GgWKX1IOmcdqKTSpVU8bWyg9Wbd4ko6oaxAfv002MdIJCHW');

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('eventoId');
  const qtd = parseInt(searchParams.get('qtd') || '1');

  const [loading, setLoading] = useState(false);
  const [evento, setEvento] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
  });

  useEffect(() => {
    async function carregarEvento() {
      if (!eventoId) return;
      try {
        const res = await fetch(`https://linkah-api.onrender.com/api/eventos/${eventoId}`);
        if (res.ok) {
          const data = await res.json();
          setEvento(data);
        }
      } catch (err) {
        console.error("Erro ao carregar evento:", err);
      }
    }
    carregarEvento();
  }, [eventoId]);

  const precoBase = evento?.ingressos?.[0]?.preco ? Number(evento.ingressos[0].preco) : 0;
  const total = precoBase * qtd;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalizarCompra = async () => {
    if (!formData.email || !formData.nome) {
      alert("Por favor, preencha seus dados.");
      return;
    }

    setLoading(true);

    try {
      // 1. Chamada ao seu backend no Render
      const response = await fetch('https://linkah-api.onrender.com/api/pagamentos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: {
            id: eventoId,
            titulo: evento?.nome,
            preco: precoBase,
          },
          usuarioEmail: formData.email,
          quantidade: qtd
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erro ao processar checkout');
      }

      // 2. Redirecionamento seguro
      const stripe = await stripePromise;
      
      if (stripe && data.id) {
        // O (stripe as any) resolve o erro de tipo Property 'redirectToCheckout' does not exist
        const { error } = await (stripe as any).redirectToCheckout({
          sessionId: data.id,
        });

        if (error) throw new Error(error.message);
      } else {
        throw new Error("Falha ao inicializar o Stripe ou ID da sessão ausente.");
      }

    } catch (err: any) {
      console.error("Erro completo no checkout:", err);
      alert(`Ops! ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-10">
        <Link href={`/evento/${eventoId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold">
          <ArrowLeft size={18} />
          Voltar para o evento
        </Link>
        <div className="hidden md:flex items-center gap-3 text-slate-400">
           <ShieldCheck size={18} className="text-green-500" />
           <span className="text-[10px] font-black uppercase tracking-widest">Pagamento Seguro via Stripe</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
              <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">1. Seus Dados</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome Completo</label>
                <input 
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Seu nome" 
                  className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">E-mail para envio</label>
                <input 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemplo@email.com" 
                  className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm" 
                />
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
              <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">2. Pagamento</h3>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-4">
              <div className="flex justify-center gap-4 text-slate-300">
                <CreditCard size={32} />
                <Lock size={32} />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest px-4">
                Você será redirecionado para o ambiente seguro da Stripe para finalizar com seu cartão.
              </p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
               <div className="p-8 md:p-10 space-y-8">
                  <h4 className="font-black text-slate-900 uppercase italic tracking-tighter">Resumo da Compra</h4>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-500">
                           <Ticket size={24} />
                        </div>
                        <div className="flex-1">
                           <p className="font-black text-slate-800 text-sm uppercase italic tracking-tighter line-clamp-1">{evento?.nome || 'Carregando...'}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{qtd}x Ingressos</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t-2 border-dashed border-slate-100 space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest pb-1">Total a pagar</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <button 
                      onClick={handleFinalizarCompra}
                      disabled={loading || !formData.nome || !formData.email}
                      className="flex items-center justify-center w-full bg-[#E30031] py-6 rounded-[2rem] font-black text-white transition-all hover:bg-black hover:shadow-2xl uppercase text-xs tracking-[0.2em] gap-3 active:scale-95 disabled:opacity-30"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Lock size={18} />
                          Pagar Agora
                        </>
                      )}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="bg-white min-h-screen text-slate-900">
      <Navbar />
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin text-rose-500" size={40} />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}