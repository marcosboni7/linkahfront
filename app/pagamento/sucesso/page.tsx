'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// CORREÇÃO: O pacote correto é lucide-react
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, MapPin, AlertCircle, CheckCircle2, Verified } from 'lucide-react';
import Link from 'next/link';

// --- CONFIGURAÇÃO DA API DA AWS ATUALIZADA ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

function TicketVisual() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [compra, setCompra] = useState<any>(null);

  useEffect(() => {
    let tentativas = 0;
    const maxTentativas = 5; // Aumentei um pouco para dar tempo do Pix processar

    async function buscar() {
      if (!sessionId) { 
        setLoading(false); 
        setErro(true);
        return; 
      }

      try {
        // Chamada para a nova URL da AWS App Runner
        const res = await fetch(`${API_URL}/api/pagamentos/detalhes/${sessionId}`);
        
        if (res.ok) {
          const data = await res.json();
          setCompra(data);
          setLoading(false);
        } else {
          // Lógica de Retry: Útil para aguardar o Webhook do Stripe/Pix
          if (tentativas < maxTentativas) {
            tentativas++;
            setTimeout(buscar, 3000); 
          } else {
            setLoading(false);
            setErro(true);
          }
        }
      } catch (e) {
        console.error("Erro na busca da API AWS:", e);
        setLoading(false);
        setErro(true);
      }
    }
    buscar();
  }, [sessionId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
      <Loader2 className="animate-spin text-rose-500" size={40} />
      <p className="font-black text-slate-400 uppercase tracking-widest italic animate-pulse text-xs text-center px-6">
        Sincronizando com a rede AWS... <br/>Gerando seu ticket oficial
      </p>
    </div>
  );

  if (erro || !compra) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center gap-4">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-2">
        <AlertCircle className="text-rose-500" size={40} />
      </div>
      <h3 className="font-black text-slate-800 uppercase italic text-xl">Processando Dados</h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        Seu pagamento foi confirmado, mas o servidor está finalizando a emissão do QR Code. 
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-full font-bold uppercase text-xs transition-all shadow-lg active:scale-95"
      >
        Atualizar Ticket
      </button>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 min-h-screen bg-white">
      <style jsx global>{`
        @media print { 
          .no-print { display: none !important; } 
          body { background: white; padding: 0; } 
          .ticket-card { 
            border: 2px solid #e2e8f0 !important; 
            box-shadow: none !important; 
            margin: 0 !important;
            -webkit-print-color-adjust: exact;
          } 
        }
        .ticket-mask {
          mask-image: radial-gradient(circle at 0 75%, transparent 15px, black 16px), 
                      radial-gradient(circle at 100% 75%, transparent 15px, black 16px);
        }
      `}</style>

      {/* HEADER DA PÁGINA */}
      <div className="text-center mb-10 no-print">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-full mb-6 border border-emerald-100 shadow-sm">
          <CheckCircle2 size={16} />
          <span className="font-bold text-[10px] uppercase tracking-widest">Pagamento Verificado via Stripe</span>
        </div>
        <h1 className="text-slate-900 font-black text-3xl italic tracking-tighter uppercase leading-none">
          Sua entrada está liberada!
        </h1>
      </div>

      {/* CARD DO INGRESSO */}
      <div className="ticket-card ticket-mask bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 relative mb-10">
        
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex flex-wrap gap-6 p-4">
            {[...Array(12)].map((_, i) => <Ticket key={i} size={40} className="-rotate-12" />)}
          </div>
          <h1 className="text-white font-black italic text-5xl tracking-tighter relative z-10 mb-1">LINKAH.</h1>
          <p className="text-rose-100 font-bold text-[10px] uppercase tracking-[0.4em] relative z-10 opacity-80">
            Official AWS Secured Ticket
          </p>
        </div>

        <div className="p-10 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.9]">
              {compra.evento_nome}
            </h2>
            <div className="flex items-center justify-center gap-2 text-rose-500 font-bold text-[11px] uppercase tracking-widest">
               <Verified size={14} className="fill-rose-500 text-white" /> 
               Ingresso Autêntico
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-rose-500">
                <User size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Titular</p>
                <p className="font-bold text-slate-700 text-sm uppercase truncate">
                   {compra.usuario_email || 'Usuário Linkah'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-rose-500">
                <Hash size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Quantidade</p>
                <p className="font-bold text-slate-700 text-sm uppercase">
                  {compra.quantidade || 1} Un.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-rose-500">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</p>
                <p className="font-bold text-slate-700 text-sm uppercase">
                  {compra.data_evento_formatada || 'Ver no app'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-rose-500">
                <MapPin size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Local</p>
                <p className="font-bold text-slate-700 text-sm uppercase truncate">
                  {compra.local_evento || 'Check-in Digital'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-slate-200 pt-10 flex flex-col items-center space-y-6">
            <div className="absolute -top-[13px] -left-[53px] w-6 h-6 bg-white rounded-full border-r border-slate-100 no-print" />
            <div className="absolute -top-[13px] -right-[53px] w-6 h-6 bg-white rounded-full border-l border-slate-100 no-print" />
            
            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-rose-500/10">
               <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${sessionId}&color=0f172a`} 
                alt="QR Code"
                className="w-40 h-40"
               />
            </div>
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Apresente no Local</p>
                <code className="inline-block text-[11px] bg-slate-900 px-4 py-1.5 rounded-full text-white font-mono font-bold tracking-widest">
                  {sessionId?.slice(-12).toUpperCase()}
                </code>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 no-print max-w-sm mx-auto">
        <button 
          onClick={() => window.print()} 
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all active:scale-95"
        >
          <Download size={18}/> Baixar Ingresso
        </button>
        <Link 
          href="/" 
          className="w-full bg-slate-50 text-slate-500 py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all border border-slate-100"
        >
          Explorar mais eventos <ArrowRight size={18}/>
        </Link>
      </div>
    </main>
  );
}

export default function PaginaSucesso() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-rose-500" size={50} />
          <p className="font-black text-rose-500 uppercase tracking-widest animate-pulse italic text-sm">Validando transação...</p>
        </div>
      }>
        <TicketVisual />
      </Suspense>
    </div>
  );
}