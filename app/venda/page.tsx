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

// ✅ URL DO BACKEND - Certifique-se de que esta é a URL da API Node.js
const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

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
        console.log(`📡 [1] Buscando detalhes do evento ID: ${eventoId}...`);
        const res = await fetch(`${API_URL}/api/eventos/${eventoId}`);
        
        console.log(`📡 [2] Resposta do Servidor (Status): ${res.status}`);
        
        if (res.ok) {
          const data = await res.json();
          console.log("✅ [3] Evento carregado com sucesso:", data);
          setEvento(data);
        } else {
          const errorText = await res.text();
          console.error("❌ [Erro] Falha ao carregar evento:", errorText);
        }
      } catch (err) {
        console.error("🚨 [Erro] Falha de conexão ao carregar evento:", err);
      }
    }
    carregarEvento();
  }, [eventoId]);

  const precoBase = evento?.preco ? Number(evento.preco) : 0;
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
    
    console.log("🚀 [4] Iniciando processo de Checkout...");
    const payload = {
      evento: { 
        id: eventoId, 
        nome: evento?.nome, 
        preco: precoBase 
      },
      usuarioEmail: formData.email,
      quantidade: qtd
    };
    
    console.log("📦 [5] Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${API_URL}/api/pagamento/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(`📡 [6] Resposta da API Checkout (Status): ${response.status}`);

      // Lendo a resposta como texto primeiro para depurar o erro do JSON
      const textResponse = await response.text();
      console.log("📄 [7] Conteúdo bruto da resposta:", textResponse);

      if (textResponse.startsWith('<!DOCTYPE') || textResponse.startsWith('<html')) {
        console.error("🚨 O servidor retornou HTML! Isso geralmente significa um 404 (rota errada) ou 500 (crash no server).");
        throw new Error("A API retornou um erro inesperado (Página HTML). Verifique se a rota /api/pagamento/checkout existe no backend.");
      }

      const data = JSON.parse(textResponse);
      
      if (data.url) {
        console.log("💸 [8] URL do Stripe gerada! Redirecionando...");
        window.location.assign(data.url);
      } else {
        console.error("❌ [Erro] API não retornou URL:", data);
        throw new Error(data.error || "O servidor não retornou a URL de pagamento.");
      }
    } catch (err: any) {
      console.error("🚨 [Erro Crítico] Detalhes:", err.message);
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