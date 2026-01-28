'use client';

import { Navbar } from '@/components/site/Navbar';
import { CreditCard, QrCode, ShieldCheck, Lock } from 'lucide-react';
import { useState } from 'react';

export default function CheckoutPage() {
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* COLUNA ESQUERDA: DADOS E PAGAMENTO */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm">1</span>
                Seus Dados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input placeholder="Nome Completo" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
                <input placeholder="E-mail para receber o ingresso" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm">2</span>
                Pagamento
              </h2>
              
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => setMetodo('pix')}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${metodo === 'pix' ? 'border-[#C22973] bg-pink-50 text-[#C22973]' : 'border-slate-100 text-slate-400'}`}
                >
                  <QrCode size={18} /> Pix
                </button>
                <button 
                  onClick={() => setMetodo('cartao')}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${metodo === 'cartao' ? 'border-[#C22973] bg-pink-50 text-[#C22973]' : 'border-slate-100 text-slate-400'}`}
                >
                  <CreditCard size={18} /> Cartão
                </button>
              </div>

              {metodo === 'pix' ? (
                <div className="text-center p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">O QR Code será gerado após finalizar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <input placeholder="Número do Cartão" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Validade (MM/AA)" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
                    <input placeholder="CVV" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: RESUMO */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C22973] rounded-full blur-[80px] opacity-30" />
              
              <h3 className="text-xl font-black mb-8 uppercase tracking-widest flex items-center gap-2">
                Resumo do Pedido
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-bold">2x Pista Premium</span>
                  <span className="font-black text-white">R$ 500,00</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-bold">Taxa de Serviço</span>
                  <span className="font-black text-white">R$ 50,00</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-end mb-10">
                <span className="text-xs font-black uppercase text-slate-400">Total</span>
                <span className="text-4xl font-black text-[#C22973]">R$ 550,00</span>
              </div>

              <button className="w-full bg-[#C22973] py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                <Lock size={18} /> Finalizar Compra
              </button>

              <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500" /> Seguro</span>
                <span className="flex items-center gap-1">💳 SSL Encrypt</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}