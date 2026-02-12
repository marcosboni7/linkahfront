'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, Wallet, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function TicketVisual() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [compra, setCompra] = useState<any>(null);

  useEffect(() => {
    let tentativas = 0;
    const maxTentativas = 3;

    async function buscar() {
      if (!sessionId) { 
        setLoading(false); 
        setErro(true);
        return; 
      }

      try {
        const res = await fetch(`https://linkah-api.onrender.com/api/pagamentos/detalhes/${sessionId}`);
        
        if (res.ok) {
          const data = await res.json();
          setCompra(data);
          setLoading(false);
        } else {
          if (tentativas < maxTentativas) {
            tentativas++;
            setTimeout(buscar, 2500);
          } else {
            setLoading(false);
            setErro(true);
          }
        }
      } catch (e) {
        console.error("Erro na busca da API:", e);
        setLoading(false);
        setErro(true);
      }
    }
    buscar();
  }, [sessionId]);

  const formatarMoeda = (valor: any) => {
    let num = parseFloat(valor);
    if (isNaN(num)) return "0,00";
    if (num > 1000) num = num / 100; 
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] gap-4">
      <Loader2 className="animate-spin text-amber-500" size={40} />
      <p className="font-black text-amber-500 uppercase tracking-widest italic animate-pulse">Autenticando Ticket...</p>
    </div>
  );

  if (erro || !compra) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] px-6 text-center gap-4">
      <AlertCircle className="text-amber-500" size={40} />
      <h3 className="font-black text-white uppercase italic">Ticket não encontrado</h3>
      <p className="text-slate-400 text-sm">Ainda não recebemos a confirmação. Aguarde um instante e atualize.</p>
      <Link href="/" className="mt-4 text-amber-500 font-bold uppercase text-xs border-b-2 border-amber-500">Voltar para a Home</Link>
    </div>
  );

  return (
    <main className="max-w-md mx-auto px-4 py-12 min-h-screen bg-[#050505]">
      <style jsx global>{`
        @media print { .no-print { display: none !important; } body { background: white; } }
        .ticket-mask {
          mask-image: radial-gradient(circle at 0 75%, transparent 15px, black 16px), 
                      radial-gradient(circle at 100% 75%, transparent 15px, black 16px);
        }
      `}</style>

      {/* CARD DO INGRESSO */}
      <div className="ticket-card ticket-mask bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative">
        
        {/* TOPO PREMIUM */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 p-8 text-center relative">
          <div className="flex justify-center items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-black" />
            <span className="text-black font-black text-[10px] uppercase tracking-[0.3em]">Acesso Confirmado</span>
          </div>
          <h1 className="text-black font-black italic text-4xl tracking-tighter">LINKAH.</h1>
        </div>

        <div className="p-8 space-y-8">
          {/* NOME DO EVENTO */}
          <div className="text-center space-y-2">
            <p className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.4em]">Ingresso Exclusive VIP</p>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-md">
              {compra.evento_nome || 'Evento Linkah'}
            </h2>
          </div>

          {/* BOX DE INFORMAÇÕES GLASSMORPISM */}
          <div className="bg-white/5 rounded-[2rem] p-6 space-y-6 border border-white/10 backdrop-blur-md">
            <div className="flex justify-between border-b pb-4 border-white/10">
              <div>
                <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-1">Titular</p>
                <p className="font-bold text-white flex items-center gap-2 text-sm uppercase">
                  <User size={14} className="text-amber-500"/> {compra.usuario_email?.split('@')[0] || 'Marcos'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-1">Quantidade</p>
                <p className="font-bold text-white flex items-center justify-end gap-2 text-sm">
                  <Hash size={14} className="text-amber-500"/> {compra.quantidade || 1}x
                </p>
              </div>
            </div>
            
            <div className="flex justify-between pt-2">
              <div>
                <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-1">Data</p>
                <p className="font-bold text-white flex items-center gap-2 text-xs">
                  <Calendar size={14} className="text-amber-500"/> {compra.data_evento_formatada || '12/02/2026'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-1">Total Pago</p>
                <p className="font-black text-white flex items-center justify-end gap-1 text-lg italic">
                  <Wallet size={16} className="text-amber-500"/> R$ {formatarMoeda(compra.valor_total)}
                </p>
              </div>
            </div>
          </div>

          {/* RODAPÉ COM EFEITO DE CORTE */}
          <div className="relative border-t border-dashed border-white/20 pt-6 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
              Apresente este ticket na portaria
            </p>
            <p className="text-[8px] text-white/20 mt-2 font-mono uppercase">
              ID: {sessionId?.slice(-12).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="mt-8 space-y-3 no-print">
        <button onClick={() => window.print()} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl hover:brightness-110 transition-all active:scale-95">
          <Download size={18}/> Salvar PDF
        </button>
        <Link href="/" className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
          Voltar ao Início <ArrowRight size={18}/>
        </Link>
      </div>
    </main>
  );
}

export default function PaginaSucesso() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-black text-amber-500 animate-pulse uppercase italic">Carregando...</div>}>
      <TicketVisual />
    </Suspense>
  );
}