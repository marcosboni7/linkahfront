'use client';

import { useState } from 'react';
import { Navbar } from '../site/Navbar';
import { CreditCard, QrCode, ShieldCheck, Lock, ChevronRight, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');
  const [loading, setLoading] = useState(false);
  
  // Estados para os campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    numeroCartao: '',
    validade: '',
    cvv: ''
  });

  // Função simples para aplicar máscaras
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
    
    // Simulação de chamada de API
    const payload = {
      metodo_pagamento: metodo,
      cliente: { nome: formData.nome, email: formData.email },
      cartao: metodo === 'cartao' ? { 
        numero: formData.numeroCartao, 
        validade: formData.validade, 
        cvv: formData.cvv 
      } : null
    };

    console.log("Enviando para API:", payload);

    setTimeout(() => {
      setLoading(false);
      alert(metodo === 'pix' ? "Gerando QR Code..." : "Pagamento processado com sucesso!");
    }, 2000);
  };

  return (
    <div className="bg-[#FBFCFE] min-h-screen text-slate-900">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            {/* DADOS DO CLIENTE */}
            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">1</div>
                <h2 className="text-xl font-semibold">Seus Dados</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Nome Completo</label>
                  <input 
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: João Silva" 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">E-mail</label>
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com" 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" 
                  />
                </div>
              </div>
            </section>

            {/* MÉTODO DE PAGAMENTO */}
            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">2</div>
                <h2 className="text-xl font-semibold">Forma de Pagamento</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setMetodo('pix')}
                  className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 ${metodo === 'pix' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                >
                  <QrCode size={24} className={metodo === 'pix' ? 'text-rose-500' : 'text-slate-400'} />
                  <span className={`text-sm font-bold ${metodo === 'pix' ? 'text-rose-600' : 'text-slate-500'}`}>Pix</span>
                </button>

                <button 
                  onClick={() => setMetodo('cartao')}
                  className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 ${metodo === 'cartao' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                >
                  <CreditCard size={24} className={metodo === 'cartao' ? 'text-rose-500' : 'text-slate-400'} />
                  <span className={`text-sm font-bold ${metodo === 'cartao' ? 'text-rose-600' : 'text-slate-500'}`}>Cartão</span>
                </button>
              </div>

              {metodo === 'cartao' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                   <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Número do Cartão</label>
                    <input 
                      name="numeroCartao"
                      value={formData.numeroCartao}
                      onChange={handleInputChange}
                      placeholder="0000 0000 0000 0000" 
                      className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      name="validade"
                      value={formData.validade}
                      onChange={handleInputChange}
                      placeholder="MM/AA" 
                      className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" 
                    />
                    <input 
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="CVV" 
                      className="w-full p-4 bg-slate-50 rounded-xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" 
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RESUMO E BOTÃO FINALIZAR */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <h3 className="text-lg font-semibold mb-6">Resumo do Pedido</h3>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total a pagar</span>
                  <span className="text-3xl font-bold tracking-tighter text-white">R$ 550,00</span>
                </div>
              </div>

              <button 
                onClick={handleFinalizarCompra}
                disabled={loading || !formData.nome || !formData.email}
                className="group w-full bg-rose-600 hover:bg-rose-500 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Lock size={16} /> Finalizar Compra
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}