'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Ticket, Calendar, Download, ArrowRight, Loader2, Mail, User, Hash, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '../../site/Navbar';

function SucessoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [compra, setCompra] = useState<any>(null);

  useEffect(() => {
    async function carregarDados() {
      if (!sessionId) return;
      try {
        // 🚨 TROQUE PELA URL DO SEU BACKEND NO RENDER
        const res = await fetch(`https://seu-backend.render.com/api/pagamentos/detalhes/${sessionId}`);
        const data = await res.json();
        if (res.ok) setCompra(data);
      } catch (err) {
        console.error("Erro ao carregar ingresso", err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [sessionId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <Loader2 className="animate-spin text-rose-500" size={50} />
      <p className="font-bold text-slate-500 uppercase tracking-widest">Sincronizando Ingresso...</p>
    </div>
  );

  // Se não encontrar a compra, mostra um aviso
  if (!compra) return (
    <div className="text-center py-40">
      <h2 className="text-xl font-bold">Ingresso não encontrado ainda.</h2>
      <p className="text-slate-500">Aguarde um instante e atualize a página.</p>
    </div>
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-emerald-500 p-10 text-center text-white relative">
          <CheckCircle2 size={48} className="mx-auto mb-4" />
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Pagamento Aprovado!</h1>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          {/* TICKET DINÂMICO */}
          <div className="bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 p-8 relative">
            <div className="flex flex-col md:flex-row items-center gap-8">
              
              {/* QR CODE (Aponta para a URL da compra) */}
              <div className="bg-white p-4 rounded-3xl shadow-lg border-2 border-slate-900">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`} 
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>

              {/* DADOS QUE VOCÊ QUERIA QUE APARECESSEM */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h3 className="text-rose-500 font-black text-[10px] uppercase tracking-[0.3em]">Evento Confirmado</h3>
                  <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">
                    {compra.evento_nome}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 text-slate-600 font-bold">
                    <User size={18} className="text-rose-400" />
                    <span>{compra.usuario_email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 font-bold">
                    <Hash size={18} className="text-rose-400" />
                    <span>{compra.quantidade} Ingresso(s)</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 font-bold">
                    <CreditCard size={18} className="text-rose-400" />
                    <span>Valor Total: R$ {compra.valor_total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => window.print()} className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">
              <Download size={18} /> Imprimir PDF
            </button>
            <Link href="/" className="flex items-center justify-center gap-3 bg-rose-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">
              Voltar ao Início <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaginaSucesso() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center">Carregando...</div>}>
        <SucessoContent />
      </Suspense>
    </div>
  );
}