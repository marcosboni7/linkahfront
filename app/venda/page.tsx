'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { CreditCard, QrCode, ShieldCheck, Lock, ChevronRight, Loader2 } from 'lucide-react';

// Componente interno para usar searchParams com segurança no Next.js
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

  // Busca os detalhes do evento para saber o preço real
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

  // Lógica de Preço (Igual à página anterior)
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
    
    const payload = {
      evento_id: eventoId,
      quantidade: qtd,
      valor_total: total,
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
      alert(metodo === 'pix' ? "Gerando QR Code do Pix..." : "Pagamento processado com sucesso!");
    }, 2000);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <div className="lg:col-span-7 space-y-6">
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
              <div className="space-y-4">
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

        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h3 className="text-lg font-semibold mb-6">Resumo do Pedido</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>{evento?.nome || 'Evento'}</span>
                <span>{qtd}x</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-4">
                <span className="text-slate-400">Total a pagar</span>
                <span className="text-3xl font-bold tracking-tighter text-white">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
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
  );
}

// Página principal com Suspense (necessário para useSearchParams no Next.js)
export default function CheckoutPage() {
  return (
    <div className="bg-[#FBFCFE] min-h-screen text-slate-900">
      <Navbar />
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-rose-500" /></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}