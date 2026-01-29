'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { 
  CreditCard, QrCode, ShieldCheck, Lock, 
  ChevronRight, Loader2, CheckCircle2, 
  Wallet, Info, ArrowLeft, Ticket
} from 'lucide-react';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('eventoId');
  const qtd = parseInt(searchParams.get('qtd') || '1');

  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');
  const [loading, setLoading] = useState(false);
  const [evento, setEvento] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    numeroCartao: '',
    validade: '',
    cvv: ''
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
        console.error("Erro ao carregar evento no checkout:", err);
      }
    }
    carregarEvento();
  }, [eventoId]);

  const precoBase = evento?.ingressos?.[0]?.preco ? Number(evento.ingressos[0].preco) : 0;
  const total = precoBase * qtd;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'numeroCartao') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    }
    if (name === 'validade') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').substring(0, 5);
    }
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleFinalizarCompra = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(metodo === 'pix' ? "Gerando QR Code do Pix..." : "Pagamento processado com sucesso!");
    }, 2000);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* HEADER DE NAVEGAÇÃO */}
      <div className="flex justify-between items-center mb-10">
        <Link href={`/evento/${eventoId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold">
          <ArrowLeft size={18} />
          Voltar para o evento
        </Link>
        <div className="hidden md:flex items-center gap-3 text-slate-400">
           <ShieldCheck size={18} className="text-green-500" />
           <span className="text-[10px] font-black uppercase tracking-widest">Pagamento 100% Seguro</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* COLUNA ESQUERDA: FORMULÁRIOS */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* IDENTIFICAÇÃO */}
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
                  placeholder="Nome do titular" 
                  className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">E-mail para envio</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemplo@email.com" 
                  className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm" 
                />
              </div>
            </div>
          </section>

          {/* PAGAMENTO */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
              <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">2. Pagamento</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setMetodo('pix')}
                className={`relative p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${metodo === 'pix' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
              >
                <div className={`p-3 rounded-xl ${metodo === 'pix' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   <QrCode size={20} />
                </div>
                <span className={`font-black uppercase text-xs tracking-widest ${metodo === 'pix' ? 'text-rose-600' : 'text-slate-500'}`}>Pagar com Pix</span>
              </button>

              <button 
                onClick={() => setMetodo('cartao')}
                className={`relative p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${metodo === 'cartao' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
              >
                <div className={`p-3 rounded-xl ${metodo === 'cartao' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   <CreditCard size={20} />
                </div>
                <span className={`font-black uppercase text-xs tracking-widest ${metodo === 'cartao' ? 'text-rose-600' : 'text-slate-500'}`}>Cartão de Crédito</span>
              </button>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
               {metodo === 'cartao' ? (
                 <div className="animate-in fade-in slide-in-from-top-2 duration-500 space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Número do Cartão</label>
                      <input 
                        name="numeroCartao"
                        value={formData.numeroCartao}
                        onChange={handleInputChange}
                        placeholder="0000 0000 0000 0000" 
                        className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <input 
                        name="validade"
                        value={formData.validade}
                        onChange={handleInputChange}
                        placeholder="MM/AA" 
                        className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold" 
                      />
                      <input 
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="CVV" 
                        className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold" 
                      />
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center text-center py-4 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                       <QrCode size={32} />
                    </div>
                    <div className="max-w-xs">
                       <p className="font-black uppercase tracking-tighter text-slate-900">QR Code Instantâneo</p>
                       <p className="text-xs text-slate-400 font-bold leading-relaxed mt-2 uppercase tracking-widest">
                          O código Pix será gerado após a confirmação. A liberação do seu ingresso acontece em segundos.
                       </p>
                    </div>
                 </div>
               )}
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA: RESUMO (IGUAL À OUTRA PÁGINA) */}
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
                           <p className="font-black text-slate-800 text-sm uppercase italic tracking-tighter line-clamp-1">{evento?.nome || 'Processando...'}</p>
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
                      className="flex items-center justify-center w-full bg-[#E30031] py-6 rounded-[2rem] font-black text-white transition-all hover:bg-black hover:shadow-2xl shadow-rose-200 uppercase text-xs tracking-[0.2em] gap-3 active:scale-95 disabled:opacity-30"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Lock size={18} />
                          Finalizar Pagamento
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                     <div className="flex justify-center items-center gap-2 opacity-40">
                        <ShieldCheck size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Linkah Secure Payment</span>
                     </div>
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