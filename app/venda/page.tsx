'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  ShieldCheck, Lock, Loader2, ArrowLeft, 
  Ticket as TicketIcon, Check, CreditCard
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

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
        console.log(`📡 Carregando evento ID: ${eventoId}...`);
        const res = await fetch(`${API_URL}/api/eventos/${eventoId}`);
        if (res.ok) {
          const data = await res.json();
          setEvento(data);
        } else {
          console.error("❌ Falha ao carregar evento:", res.status);
        }
      } catch (err) {
        console.error("🚨 Erro de conexão ao carregar evento:", err);
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
      alert(t.fillData || "Por favor, preencha seus dados.");
      return;
    }

    setLoading(true);
    console.log("🚀 Iniciando Checkout...");
    
    try {
      // CORREÇÃO: Removido o 's' de /pagamentos para bater com a rota do Backend
      const response = await fetch(`${API_URL}/api/pagamento/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: eventoId, // Enviando ID direto conforme esperado pelo controller
          titulo: evento?.nome,
          preco: precoBase,
          usuarioEmail: formData.email,
          quantidade: qtd,
          nomeComprador: formData.nome
        }),
      });

      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        const errorData = contentType?.includes("application/json") 
          ? await response.json() 
          : { message: await response.text() };
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const data = await response.json();
      
      if (data.url) {
        console.log("💸 Redirecionando para Stripe...");
        window.location.assign(data.url);
      } else {
        throw new Error("O servidor não retornou a URL de pagamento.");
      }
    } catch (err: any) {
      console.error("🚨 Erro no Checkout:", err.message);
      alert(`Erro na transação: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 bg-[#FCFBFA] min-h-screen">
      <div className="mb-12">
        <Link href={`/evento/${eventoId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium">
          <ArrowLeft size={16} /> {t.backToEvent || 'Voltar para o evento'}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
        <div className="lg:col-span-3 space-y-12">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.finishPurchase || 'Finalizar Compra'}</h1>
            <p className="text-slate-500 font-medium">{t.ticketsEmailInfo || 'Os ingressos serão enviados para o seu e-mail.'}</p>
          </header>

          <section className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 ml-1">{t.yourData || 'Seus Dados'}</label>
              <input 
                name="nome" 
                value={formData.nome} 
                onChange={handleInputChange} 
                placeholder={t.fullNamePlaceholder || "Nome Completo"} 
                className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm" 
              />
              <input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder={t.emailPlaceholder || "E-mail principal"} 
                className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm" 
              />
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <CreditCard size={20} className="text-blue-600" />
                <span className="text-sm font-semibold">{t.paymentMethods || 'Pix ou Cartão via Stripe'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span className="text-sm font-medium">{t.securePaymentInfo || 'Pagamento seguro processado na AWS'}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <TicketIcon size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 leading-tight line-clamp-1">{evento?.nome || t.processing || 'Processando...'}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{qtd}x {qtd > 1 ? (t.placesPlural || 'Ingressos') : (t.places || 'Ingresso')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">{t.unitValue || 'Valor Unitário'}</span>
                <span>{precoBase.toLocaleString(language === 'PT' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">{t.fees || 'Taxas'}</span>
                <span className="text-emerald-500">R$ 0,00</span>
              </div>
              <div className="pt-4 flex justify-between items-end border-t border-slate-50">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-3xl font-black tracking-tight text-slate-900">
                  {total.toLocaleString(language === 'PT' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <button 
              onClick={handleFinalizarCompra} 
              disabled={loading || !formData.nome || !formData.email} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-xl active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Lock size={18}/> {t.goToPayment || 'Ir para Pagamento'}</>}
            </button>

            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] text-center">
              Secured by Linkah AWS Architecture
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
      <Suspense fallback={
        <div className="flex justify-center mt-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}