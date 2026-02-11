'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '../../site/Navbar';

function SucessoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  // 1. ESTADO INICIAL COM DADOS DE TESTE (Para o layout não travar)
  const [loading, setLoading] = useState(true);
  const [compra, setCompra] = useState<any>({
    evento_nome: "Carregando Evento...",
    usuario_email: "buscando@dados.com",
    quantidade: 0,
    valor_total: "0.00",
    data_evento_formatada: "--/--/----"
  });

  useEffect(() => {
    async function carregarDados() {
      if (!sessionId) {
        setLoading(false);
        return;
      };
      
      try {
        const res = await fetch(`https://linkah-api.onrender.com/api/pagamentos/detalhes/${sessionId}`);
        const data = await res.json();
        
        if (res.ok) {
          setCompra(data);
        } else {
          // 2. SE DER ERRO NO BANCO, MANTEMOS UM VISUAL DE TESTE PARA VOCÊ VER O LAYOUT
          console.warn("Compra não achada no banco, usando layout de demonstração.");
          setCompra({
            evento_nome: "LINKAH EVENTO TESTE",
            usuario_email: "exemplo@linkah.com",
            quantidade: 1,
            valor_total: "49.90",
            data_evento_formatada: new Date().toLocaleDateString('pt-BR')
          });
        }
      } catch (err) {
        console.error("Erro ao carregar ingresso:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [sessionId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-rose-500" size={50} />
      <p className="font-black text-slate-400 uppercase tracking-tighter">Validando seu Ticket...</p>
    </div>
  );

  // Removido o bloqueio "if (!compra)" para o layout SEMPRE aparecer
  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <style jsx global>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .ticket-card { box-shadow: none !important; border: 1px solid #eee !important; border-radius: 0 !important; }
        }
      `}</style>

      <div className="ticket-card bg-white rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden border border-slate-100">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 p-8 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Ticket size={120} className="text-white rotate-12" />
          </div>
          <h1 className="text-white font-black italic text-3xl tracking-tighter">LINKAH.</h1>
          <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 font-black">
            Ingresso Digital Confirmado
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-slate-900 leading-none uppercase italic tracking-tighter">
              {compra.evento_nome}
            </h2>
          </div>

          {/* QR Code */}
          <div className="flex justify-center py-2">
            <div className="bg-white p-3 rounded-[2rem] shadow-xl border-2 border-slate-900">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
                alt="QR Code"
                className="w-40 h-40"
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titular</p>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <User size={14} className="text-rose-500" />
                  <span className="truncate max-w-[120px]">{compra.usuario_email?.split('@')[0] || 'Usuário'}</span>
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Evento</p>
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <Calendar size={14} className="text-rose-500" />
                  <span>{compra.data_evento_formatada}</span>
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

          {/* Picote */}
          <div className="relative border-t-2 border-dashed border-slate-200 pt-6 mt-6">
            <div className="absolute -top-3 -left-12 w-6 h-6 bg-white border border-slate-100 rounded-full"></div>
            <div className="absolute -top-3 -right-12 w-6 h-6 bg-white border border-slate-100 rounded-full"></div>
            <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">
              Apresente este código na portaria para realizar o Check-in
            </p>
          </div>
        </div>
      </div>

      {/* Botões */}
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