'use client';

import { Navbar } from '../site/Navbar';
import { CreditCard, QrCode, ShieldCheck, Lock, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function CheckoutPage() {
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');

  return (
    <div className="bg-[#FBFCFE] min-h-screen text-slate-900">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* COLUNA ESQUERDA: FLUXO DE PAGAMENTO */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ETAPA 1: IDENTIFICAÇÃO */}
            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h2 className="text-xl font-semibold">Seus Dados</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Nome Completo</label>
                  <input placeholder="Ex: João Silva" className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">E-mail</label>
                  <input placeholder="seu@email.com" className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" />
                </div>
              </div>
            </section>

            {/* ETAPA 2: PAGAMENTO */}
            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h2 className="text-xl font-semibold">Forma de Pagamento</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setMetodo('pix')}
                  className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 group ${metodo === 'pix' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <QrCode size={24} className={metodo === 'pix' ? 'text-rose-500' : 'text-slate-400'} />
                  <span className={`text-sm font-bold ${metodo === 'pix' ? 'text-rose-600' : 'text-slate-500'}`}>Pix</span>
                  {metodo === 'pix' && <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full" />}
                </button>

                <button 
                  onClick={() => setMetodo('cartao')}
                  className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 group ${metodo === 'cartao' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <CreditCard size={24} className={metodo === 'cartao' ? 'text-rose-500' : 'text-slate-400'} />
                  <span className={`text-sm font-bold ${metodo === 'cartao' ? 'text-rose-600' : 'text-slate-500'}`}>Cartão</span>
                  {metodo === 'cartao' && <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full" />}
                </button>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {metodo === 'pix' ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Ao clicar em finalizar, um <strong>QR Code</strong> será gerado para o pagamento. O acesso será enviado após a confirmação.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Número do Cartão</label>
                      <input placeholder="0000 0000 0000 0000" className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Validade</label>
                        <input placeholder="MM/AA" className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">CVV</label>
                        <input placeholder="123" className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA: RESUMO (DARK MODE ELEGANTE) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-slate-200">
              <h3 className="text-lg font-semibold mb-8 flex items-center justify-between">
                Resumo da Reserva
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded uppercase tracking-widest font-bold">Checkout</span>
              </h3>

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium">2x Pista Premium</p>
                    <p className="text-xs text-slate-400 uppercase tracking-tight">Ingresso Inteira</p>
                  </div>
                  <span className="font-semibold text-slate-200">R$ 500,00</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Taxas de serviço</span>
                  <span className="text-slate-200">R$ 50,00</span>
                </div>

                <div className="h-[1px] bg-white/10 w-full my-6" />

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase font-bold">Total a pagar</p>
                    <p className="text-3xl font-bold tracking-tighter">R$ 550,00</p>
                  </div>
                  <ShieldCheck className="text-emerald-400 mb-1" size={24} />
                </div>

                <button className="group w-full bg-rose-600 hover:bg-rose-500 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2 mt-4">
                  <Lock size={16} /> Finalizar Compra
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="pt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                   <div className="flex items-center gap-1.5 text-[9px] font-bold">
                     <ShieldCheck size={12} /> COMPRA SEGURA
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] font-bold">
                     🔒 SSL ENCRYPTED
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}