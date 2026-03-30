'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  ShieldCheck, Lock, Loader2, ArrowLeft, 
  Ticket as TicketIcon, CreditCard
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-back.onrender.com';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('eventoId');
  const qtd = parseInt(searchParams.get('qtd') || '1');

  const [loading, setLoading] = useState(false);
  const [evento, setEvento] = useState<any>(null);
  const [formData, setFormData] = useState({ nome: '', email: '' });

  const { t, language }: any = useLanguage();

  useEffect(() => {
    async function carregarEvento() {
      if (!eventoId) return;
      try {
        console.log(`📡 Buscando dados do evento ID: ${eventoId}...`);
        const res = await fetch(`${API_URL}/api/eventos/${eventoId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("📦 Dados recebidos:", data);
          setEvento(data);
        } else {
          console.error("❌ Erro ao carregar:", res.status);
        }
      } catch (err) {
        console.error("🚨 Erro de conexão:", err);
      }
    }
    carregarEvento();
  }, [eventoId]);

  // ✅ LOGICA DE PREÇO: O seu JSON traz o valor real dentro do array 'ingressos'
  const precoDoIngresso = evento?.ingressos?.[0]?.preco;
  const precoBase = precoDoIngresso !== undefined ? Number(precoDoIngresso) : Number(evento?.preco || 0);
  const total = precoBase * qtd;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalizarCompra = async () => {
    if (!formData.email || !formData.nome) {
      alert("Por favor, preencha nome e e-mail.");
      return;
    }

    setLoading(true);
    console.log("🚀 Iniciando Checkout para:", formData.email);

    try {
      // ✅ ROTA CORRIGIDA: /api/pagamento (singular)
      const response = await fetch(`${API_URL}/api/pagamento/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: { 
            id: eventoId, 
            titulo: evento?.nome, 
            preco: precoBase 
          },
          usuarioEmail: formData.email,
          quantidade: qtd
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        console.error("❌ Resposta não é JSON:", textError);
        throw new Error("Erro no servidor de pagamentos. Tente novamente.");
      }

      const data = await response.json();
      
      if (data.url) {
        console.log("🔗 Redirecionando para Stripe...");
        window.location.assign(data.url);
      } else {
        throw new Error(data.error || "Erro ao gerar sessão de pagamento.");
      }
    } catch (err: any) {
      console.error("🚨 Erro:", err.message);
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 bg-[#FCFBFA] min-h-screen">
      <div className="mb-12">
        <Link href={`/evento/${eventoId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium">
          <ArrowLeft size={16} /> Voltar para o evento
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-3 space-y-12">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finalizar Compra</h1>
            <p className="text-slate-500 font-medium">Preencha os dados para receber seu ingresso.</p>
          </header>

          <section className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 ml-1">Seus Dados</label>
              <input 
                name="nome" 
                value={formData.nome} 
                onChange={handleInputChange} 
                placeholder="Nome Completo" 
                className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 outline-none transition-all shadow-sm" 
              />
              <input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="E-mail para receber o ingresso" 
                className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 outline-none transition-all shadow-sm" 
              />
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <CreditCard size={20} className="text-[#C22973]" />
                <span className="text-sm font-semibold">Pagamento via Stripe (Pix ou Cartão)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span className="text-sm font-medium">Ambiente Criptografado na AWS</span>
              </div>
            </div>
          </section>
        </div>

        {/* Lado Direito: Resumo */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-[#C22973]">
                <TicketIcon size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 leading-tight line-clamp-2">
                  {evento?.nome || "Carregando evento..."}
                </p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mt-1">
                  {qtd}x Ingresso {evento?.ingressos?.[0]?.nome}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">Valor Unitário</span>
                <span>{precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">Taxas de serviço</span>
                <span className="text-emerald-500">R$ 0,00</span>
              </div>
              <div className="pt-4 flex justify-between items-end border-t border-slate-50">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-3xl font-black tracking-tight text-[#C22973]">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <button 
              onClick={handleFinalizarCompra} 
              disabled={loading || !formData.nome || !formData.email} 
              className="w-full bg-[#C22973] text-white py-5 rounded-2xl font-bold hover:bg-[#a62262] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-xl active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Lock size={18}/> Ir para Pagamento</>}
            </button>

            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] text-center">
              Secured by Linkah Architecture
            </p>
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
      <Suspense fallback={<div className="flex justify-center mt-20"><Loader2 className="animate-spin text-pink-500" size={40} /></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}