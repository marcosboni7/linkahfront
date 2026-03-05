'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  UserCircle, Save, Loader2, ArrowLeft, Info, 
  MapPin, CreditCard, ExternalLink, CheckCircle2,
  Calendar, Ticket, ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

function CheckoutContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [evento, setEvento] = useState<any>(null);

  // ✅ Função de formatação para evitar o erro 00.,00
  const formatarMoeda = (valor: any) => {
    const num = Number(valor);
    if (isNaN(num) || !num) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  useEffect(() => {
    const carregarEvento = async () => {
      if (!id) return;
      try {
        const response = await fetch(`${API_URL}/api/eventos/${id}`);
        const data = await response.json();
        if (response.ok) {
          setEvento(data);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar evento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarEvento();
  }, [id]);

  const handleFinalizarCompra = async () => {
    setIsSaving(true);
    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const emailLogado = userStorage ? JSON.parse(userStorage).email : localStorage.getItem('userEmail');

      // ✅ CORREÇÃO: Alterado de /api/pagamentos para /api/pagamento (sem o S)
      const response = await fetch(`${API_URL}/api/pagamento/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: id,
          quantidade: 1,
          emailComprador: emailLogado || 'comprador@teste.com',
        }),
      });

      // Se der 404 ou 500, o response.json() pode falhar se o corpo for HTML
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta do servidor não é um JSON válido. Verifique a rota no Back-end.");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao gerar checkout');
      }
    } catch (error: any) {
      console.error("Erro na transação:", error);
      Swal.fire({
        title: 'Erro no Pagamento',
        text: error.message || 'Não foi possível conectar ao provedor de pagamentos.',
        icon: 'error',
        confirmButtonColor: '#C22973'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="animate-spin text-[#C22973]" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Preparando segurança...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans">
      <div className="max-w-[850px] mx-auto">
        <button onClick={() => router.back()} className="inline-flex items-center gap-3 text-slate-400 hover:text-[#C22973] transition-all mb-10 font-black text-[10px] tracking-[0.2em] uppercase group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar
        </button>

        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-pink-100/20 p-8 md:p-16 border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50/50 rounded-bl-[5rem] -z-0"></div>

          <div className="flex items-center gap-6 mb-16 relative z-10">
            <div className="w-20 h-20 bg-[#C22973] rounded-[2rem] flex items-center justify-center shadow-lg shadow-pink-200">
              <Ticket className="text-white" size={40} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 leading-none tracking-tighter italic uppercase">Checkout</h2>
              <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest italic">Finalize sua reserva com segurança</p>
            </div>
          </div>
          
          <div className="space-y-12 relative z-10">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
              <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] italic mb-6 flex items-center gap-2">
                <Info size={18} className="text-[#C22973]" /> Detalhes do Evento
              </h3>
              <div className="flex flex-col md:flex-row gap-8">
                <img 
                  src={evento?.imagem_url || 'https://via.placeholder.com/300x200'} 
                  className="w-full md:w-48 h-32 object-cover rounded-3xl shadow-md"
                  alt="Banner"
                />
                <div className="space-y-3">
                  <h4 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">{evento?.titulo}</h4>
                  <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {evento?.data ? new Date(evento.data).toLocaleDateString() : 'A definir'}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {evento?.local || 'Local não informado'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] italic">Total a Pagar</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase mt-1">Taxas de processamento inclusas</p>
                </div>
                {/* ✅ VALOR FORMATADO AQUI */}
                <div className="text-right">
                  <span className="text-5xl font-black italic tracking-tighter text-[#C22973]">
                    {formatarMoeda(evento?.preco)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/30 p-8 rounded-[2.5rem] flex gap-5 items-center border border-emerald-100/50">
              <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
              <p className="text-[11px] text-emerald-900 font-bold uppercase tracking-tight leading-relaxed">
                Pagamento processado pelo Stripe. Seus dados de cartão nunca são salvos em nosso servidor.
              </p>
            </div>

            <button 
              onClick={handleFinalizarCompra}
              disabled={isSaving} 
              className="w-full bg-[#C22973] text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 hover:bg-[#a62262] transition-all shadow-2xl shadow-pink-200 disabled:opacity-50 active:scale-95 group"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <CreditCard size={22} className="group-hover:rotate-12 transition-transform" />} 
              {isSaving ? 'Processando...' : 'Confirmar e Pagar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4 font-sans">
        <Loader2 className="animate-spin text-[#C22973]" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Carregando Checkout...</span>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}