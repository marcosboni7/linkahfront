'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { 
  CreditCard, QrCode, ShieldCheck, Lock, 
  ChevronRight, Loader2, CheckCircle2, 
  Wallet, Info, ArrowLeft 
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
      {/* Botão Voltar Discreto */}
      <Link href={`/evento/${eventoId}`} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-sm font-bold group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para o evento
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LADO ESQUERDO: FORMULÁRIOS */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* IDENTIFICAÇÃO */}
          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight uppercase">Sua Identificação</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Onde você receberá os ingressos</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome Completo</label>
                <input 
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Nome do titular" 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">E-mail para envio</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemplo@email.com" 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-700" 
                />
              </div>
            </div>
          </section>

          {/* PAGAMENTO */}
          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
                <Wallet size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight uppercase">Pagamento</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Escolha o método mais prático</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
              <button 
                onClick={() => setMetodo('pix')}
                className={`relative p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${metodo === 'pix' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`p-3 rounded-xl ${metodo === 'pix' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   <QrCode size={20} />
                </div>
                <span className={`font-black uppercase text-xs tracking-widest ${metodo === 'pix' ? 'text-rose-600' : 'text-slate-400'}`}>Pix</span>
                {metodo === 'pix' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500" />}
              </button>

              <button 
                onClick={() => setMetodo('cartao')}
                className={`relative p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${metodo === 'cartao' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`p-3 rounded-xl ${metodo === 'cartao' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   <CreditCard size={20} />
                </div>
                <span className={`font-black uppercase text-xs tracking-widest ${metodo === 'cartao' ? 'text-rose-600' : 'text-slate-400'}`}>Cartão</span>
                {metodo === 'cartao' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500" />}
              </button>
            </div>

            {metodo === 'cartao' && (
              <div className="animate-in slide-in-from-top-4 duration-300 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Número do Cartão</label>
                  <div className="relative">
                    <input 
                      name="numeroCartao"
                      value={formData.numeroCartao}
                      onChange={handleInputChange}
                      placeholder="0000 0000 0000 0000" 
                      className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold" 
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Validade</label>
                     <input 
                        name="validade"
                        value={formData.validade}
                        onChange={handleInputChange}
                        placeholder="MM/AA" 
                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">CVV</label>
                     <input 
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123" 
                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-bold" 
                     />
                  </div>
                </div>
              </div>
            )}

            {metodo === 'pix' && (
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400">
                    <Info size={20} />
                 </div>
                 <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                    O QR Code será gerado após clicar em finalizar. <br/>
                    A aprovação é instantânea.
                 </p>
              </div>
            )}
          </section>
        </div>

        {/* LADO DIREITO: RESUMO FLUTUANTE */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white shadow-2xl overflow-hidden relative">
              {/* Círculos Decorativos */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />
              
              <h3 className="text-lg font-black uppercase italic tracking-widest mb-10 pb-4 border-b border-slate-800">Resumo da Reserva</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Evento</p>
                    <p className="font-black text-xl tracking-tighter italic uppercase leading-none">{evento?.nome || 'Processando...'}</p>
                  </div>
                  <span className="bg-slate-800 px-3 py-1 rounded-lg font-black text-xs text-rose-500">{qtd}x</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">{(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                
                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Total a Pagar</span>
                  <span className="text-4xl font-black tracking-tighter text-white">
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleFinalizarCompra}
                disabled={loading || !formData.nome || !formData.email}
                className="group w-full bg-rose-600 hover:bg-white hover:text-rose-600 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Lock size={16} /> Confirmar & Pagar
                  </>
                )}
              </button>

              <div className="mt-8 flex flex-col items-center gap-4 text-slate-500">
                 <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Ambiente Criptografado</span>
                 </div>
                 <div className="flex gap-4 grayscale opacity-30">
                    <img src="https://logodownload.org/wp-content/uploads/2014/07/visa-logo-1.png" className="h-3" alt="Visa" />
                    <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo.png" className="h-5" alt="Mastercard" />
                    <img src="https://logodownload.org/wp-content/uploads/2020/02/pix-logo-1.png" className="h-4" alt="Pix" />
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
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900">
      <Navbar />
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-rose-500" size={40} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Preparando checkout seguro...</p>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}