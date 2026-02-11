'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, Wallet } from 'lucide-react';
import Link from 'next/link';

function TicketVisual() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  
  // DADOS DEFAULT: Se a API der erro, o layout NOVO aparece com esses dados
  const [compra, setCompra] = useState<any>({
    evento_nome: "INGRESSO LINKAH",
    usuario_email: "cliente@linkah.com",
    quantidade: 1,
    valor_total: "00,00",
    data_evento_formatada: new Date().toLocaleDateString('pt-BR')
  });

  useEffect(() => {
    async function buscar() {
      if (!sessionId) { setLoading(false); return; }
      try {
        const res = await fetch(`https://linkah-api.onrender.com/api/pagamentos/detalhes/${sessionId}`);
        const data = await res.json();
        if (res.ok) setCompra(data);
      } catch (e) {
        console.log("API fora do ar, mantendo layout de teste");
      } finally {
        setLoading(false);
      }
    }
    buscar();
  }, [sessionId]);

  if (loading) return <div className="py-40 text-center font-black text-slate-400 animate-pulse">GERANDO TICKET...</div>;

  return (
    <main className="max-w-md mx-auto px-4 py-12 min-h-screen bg-slate-50">
      {/* CSS para o PDF */}
      <style jsx global>{`
        @media print { .no-print { display: none !important; } body { background: white; } .ticket-card { box-shadow: none !important; border: 1px solid #000; } }
      `}</style>

      {/* CARD DO INGRESSO (O DESIGN PRETO NOVO) */}
      <div className="ticket-card bg-white rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Ticket size={100} className="text-white rotate-12" />
          </div>
          <h1 className="text-white font-black italic text-3xl tracking-tighter">LINKAH.</h1>
          <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Ingresso Confirmado</p>
        </div>

        <div className="p-8 space-y-8">
          <h2 className="text-3xl font-black text-slate-900 text-center uppercase italic tracking-tighter">
            {compra.evento_nome}
          </h2>

          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-[2rem] shadow-xl border-2 border-slate-900">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${sessionId || 'linkah'}`} 
                className="w-32 h-32"
                alt="QR"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
            <div className="flex justify-between border-b pb-4 border-slate-200">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Titular</p>
                <p className="font-bold text-slate-800 flex items-center gap-1 text-sm"><User size={12}/> {compra.usuario_email.split('@')[0]}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase">Qtd</p>
                <p className="font-bold text-slate-800 flex items-center justify-end gap-1 text-sm"><Hash size={12}/> {compra.quantidade}x</p>
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Data</p>
                <p className="font-bold text-slate-800 flex items-center gap-1 text-xs"><Calendar size={12}/> {compra.data_evento_formatada}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase">Total</p>
                <p className="font-bold text-emerald-600 flex items-center justify-end gap-1 text-sm"><Wallet size={12}/> R$ {compra.valor_total}</p>
              </div>
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-slate-200 pt-6">
            <div className="absolute -top-3 -left-12 w-6 h-6 bg-slate-50 rounded-full border border-slate-100"></div>
            <div className="absolute -top-3 -right-12 w-6 h-6 bg-slate-50 rounded-full border border-slate-100"></div>
            <p className="text-center text-[8px] font-black text-slate-400 uppercase">Válido apenas com documento original</p>
          </div>
        </div>
      </div>

      {/* BOTÕES */}
      <div className="mt-8 space-y-3 no-print">
        <button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg">
          <Download size={18}/> Baixar PDF
        </button>
        <Link href="/" className="w-full bg-white border-2 border-slate-200 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
          Voltar ao Início <ArrowRight size={18}/>
        </Link>
      </div>
    </main>
  );
}

export default function PaginaSucesso() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <TicketVisual />
    </Suspense>
  );
}