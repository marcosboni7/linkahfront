'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, Wallet } from 'lucide-react';
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
        // 🚨 COLOQUE A URL DO SEU BACKEND AQUI
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
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-rose-500" size={50} />
      <p className="font-black text-slate-400 uppercase tracking-tighter">Gerando seu Ingresso...</p>
    </div>
  );

  if (!compra) return (
    <div className="text-center py-40 space-y-4">
      <h2 className="text-2xl font-black text-slate-800 uppercase">Ingresso em processamento...</h2>
      <p className="text-slate-500">Aguarde alguns segundos e atualize a página.</p>
    </div>
  );

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      {/* Estilos para o PDF sair perfeito */}
      <style jsx global>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .ticket-card { box-shadow: none !important; border: 1px solid #eee !important; border-radius: 0 !important; }
        }
      `}</style>

      <div className="ticket-card bg-white rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden border border-slate-100">
        
        {/* Topo / Header do Ticket */}
        <div className="bg-slate-900 p-8 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Ticket size={120} className="text-white rotate-12" />
          </div>
          <h1 className="text-white font-black italic text-3xl tracking-tighter">LINKAH.</h1>
          <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Ingresso Digital Confirmado</p>
        </div>

        {/* Corpo do Ingresso */}
        <div className="p-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-slate-900 leading-none uppercase italic tracking-tighter">
              {compra.evento_nome}
            </h2>
          </div>

          {/* QR Code central - Agora envia para a URL da página para validação */}
          <div className="flex justify-center py-2">
            <div className="bg-white p-3 rounded-[2rem] shadow-xl border-2 border-slate-900">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}`} 
                alt="QR Code do Ingresso"
                className="w-40 h-40"
              />
            </div>
          </div>

          {/* Dados do Evento Estilizados */}
          <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titular</p>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <User size={14} className="text-rose-500" />
                  <span className="truncate max-w-[120px]">{compra.usuario_email.split('@')[0]}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantidade</p>
                <div className="flex items-center justify-end gap-2 font-bold text-slate-800">
                  <Hash size={14} className="text-rose-500" />
                  <span>{compra.quantidade}x Ingresso</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start pt-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data da Compra</p>
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <Calendar size={14} className="text-rose-500" />
                  <span>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</p>
                <div className="flex items-center justify-end gap-2 font-bold text-emerald-600">
                  <Wallet size={14} />
                  <span>R$ {compra.valor_total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Picote Visual Estilo Ticket de Cinema */}
          <div className="relative border-t-2 border-dashed border-slate-200 pt-6 mt-6">
            <div className="absolute -top-3 -left-12 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full"></div>
            <div className="absolute -top-3 -right-12 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full"></div>
            <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">
              Apresente este código na portaria para realizar o Check-in
            </p>
          </div>
        </div>
      </div>

      {/* Botões - Sumirão ao salvar em PDF */}
      <div className="mt-8 space-y-4 no-print">
        <button 
          onClick={() => window.print()}
          className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
        >
          <Download size={20} /> Baixar Ingresso PDF
        </button>
        
        <Link 
          href="/"
          className="w-full bg-white border-2 border-slate-100 text-slate-400 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all text-center"
        >
          Voltar ao Início
          <ArrowRight size={20} />
        </Link>
      </div>
    </main>
  );
}

export default function PaginaSucesso() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="no-print">
        <Navbar />
      </div>
      <Suspense fallback={<div className="p-20 text-center font-black uppercase tracking-tighter text-slate-300">Carregando Ticket...</div>}>
        <SucessoContent />
      </Suspense>
    </div>
  );
}