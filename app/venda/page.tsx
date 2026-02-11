'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { 
  CreditCard, ShieldCheck, Lock, 
  Loader2, ArrowLeft, Ticket as TicketIcon 
} from 'lucide-react';
import Link from 'next/link';

// ATENÇÃO: Verifique se não há nenhum import de '@stripe/stripe-js' aqui no topo!

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
    console.log("🚀 Iniciando Checkout...");
    
    if (!formData.email || !formData.nome) {
      alert("Por favor, preencha seus dados.");
      return;
    }

    setLoading(true);

    try {
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
      console.log("📥 Resposta recebida do backend:", data);

      if (!response.ok) throw new Error(data.details || data.error || 'Erro no servidor');

      // O SEGREDO: Se o backend mandou a URL, nós usamos o redirecionamento nativo do navegador.
      // Isso ignora qualquer erro de "stripe.redirectToCheckout is no longer supported".
      if (data.url) {
        console.log("🔗 URL encontrada! Redirecionando para Stripe...");
        window.location.assign(data.url); // .assign é mais forte que .href para forçar a saída
      } else {
        throw new Error("Link de pagamento não recebido.");
      }

    } catch (err: any) {
      console.error("❌ Erro capturado:", err.message);
      alert(`Ops! ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white min-h-screen text-slate-900">
      <div className="flex justify-between items-center mb-10">
        <Link href={`/evento/${eventoId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold">
          <ArrowLeft size={18} /> Voltar para o evento
        </Link>
        <div className="hidden md:flex items-center gap-3 text-slate-400">
           <ShieldCheck size={18} className="text-green-500" />
           <span className="text-[10px] font-black uppercase text-slate-900">Pagamento Seguro</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <section className="space-y-8">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">1. Seus Dados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Nome Completo" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-500 outline-none font-bold" />
              <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="E-mail" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-500 outline-none font-bold" />
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">2. Pagamento</h3>
            <div className="bg-slate-50 p-8 rounded-3xl text-center border-2 border-dashed border-slate-200">
              <CreditCard size={32} className="mx-auto mb-4 text-slate-400" />
              <p className="font-bold text-slate-500 uppercase text-[10px]">Redirecionando para a Stripe...</p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl sticky top-10">
            <h4 className="font-black uppercase italic tracking-tighter mb-8 text-xl">Resumo</h4>
            <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl">
              <TicketIcon className="text-rose-500" />
              <div>
                <p className="font-bold text-sm uppercase">{evento?.nome || 'Carregando...'}</p>
                <p className="text-[10px] text-white/50 font-bold uppercase">{qtd}x Ingressos</p>
              </div>
            </div>
            <div className="flex justify-between items-end mb-8 border-t border-white/10 pt-6">
              <span className="text-[10px] font-black uppercase text-white/40">Total</span>
              <span className="text-4xl font-black tracking-tighter">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <button 
              onClick={handleFinalizarCompra} 
              disabled={loading || !formData.nome || !formData.email} 
              className="w-full bg-rose-600 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-500 transition-all disabled:opacity-20 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Lock size={16}/> Pagar Agora</>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center font-bold">Carregando...</div>}>
        <CheckoutContent />
      </Suspense>
    </>
  );
}