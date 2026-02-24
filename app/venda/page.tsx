'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { 
  ShieldCheck, Lock, Loader2, ArrowLeft, 
  Ticket as TicketIcon, Check, CreditCard
} from 'lucide-react';
import Link from 'next/link';

// --- CONFIGURAÇÃO DA API ---
// Substituímos o link do Render pelo link oficial da sua API na AWS App Runner
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://r8amtavirp.us-east-1.awsapprunner.com';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('eventoId');
  const qtd = parseInt(searchParams.get('qtd') || '1');

  const [loading, setLoading] = useState(false);
  const [evento, setEvento] = useState<any>(null);
  const [formData, setFormData] = useState({ nome: '', email: '' });

  useEffect(() => {
    async function carregarEvento() {
      if (!eventoId) return;
      try {
        // Agora buscando da API da AWS
        const res = await fetch(`${API_URL}/api/eventos/${eventoId}`);
        if (res.ok) {
          const data = await res.json();
          setEvento(data);
        }
      } catch (err) {
        console.error("Erro ao carregar evento na AWS:", err);
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
      // Chamada de checkout atualizada para o servidor AWS
      const response = await fetch(`${API_URL}/api/pagamentos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: { id: eventoId, titulo: evento?.nome, preco: precoBase },
          usuarioEmail: formData.email,
          quantidade: qtd
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redireciona para o Stripe (onde o Pix deve aparecer se configurado no Dashboard do Stripe)
        window.location.assign(data.url);
      } else {
        throw new Error("Link de pagamento não recebido do servidor AWS.");
      }
    } catch (err: any) {
      alert(`Erro na transação: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 bg-[#FCFBFA] min-h-screen">
      <div className="mb-12">
        <Link href={`/evento/${eventoId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium">
          <ArrowLeft size={16} /> Voltar para detalhes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
        <div className="lg:col-span-3 space-y-12">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Finalizar Inscrição</h1>
            <p className="text-slate-500">Preencha seus dados para receber o ingresso.</p>
          </header>

          <section className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 ml-1">Informações do Participante</label>
              <input 
                name="nome" 
                value={formData.nome} 
                onChange={handleInputChange} 
                placeholder="Nome Completo" 
                className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:border-[#ff4d4d] focus:ring-4 focus:ring-orange-50 outline-none transition-all shadow-sm" 
              />
              <input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="E-mail principal" 
                className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:border-[#ff4d4d] focus:ring-4 focus:ring-orange-50 outline-none transition-all shadow-sm" 
              />
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <CreditCard size={20} className="text-slate-400" />
                <span className="text-sm font-medium">O pagamento será processado via Stripe</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span className="text-sm font-medium">Ambiente 100% seguro (AWS Cloud)</span>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-10 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#ff4d4d]">
                <TicketIcon size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 leading-tight line-clamp-1">{evento?.nome || 'Carregando...'}</p>
                <p className="text-xs text-slate-400 font-medium">{qtd}x Ingressos</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{(precoBase * qtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Taxa de serviço</span>
                <span className="text-emerald-500 font-medium">Grátis</span>
              </div>
              <div className="pt-4 flex justify-between items-end border-t border-slate-50">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <button 
              onClick={handleFinalizarCompra} 
              disabled={loading || !formData.nome || !formData.email} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-slate-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Lock size={18}/> Confirmar e Pagar</>}
            </button>

            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest text-center">
                Powered by Linkah
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="bg-[#FCFBFA] min-h-screen">
      <Navbar />
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}