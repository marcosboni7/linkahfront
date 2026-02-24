'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, MapPin, AlertCircle, CheckCircle2, Verified } from 'lucide-react';
import Link from 'next/link';

// --- CONFIGURAÇÃO DA API DA AWS ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://r8amtavirp.us-east-1.awsapprunner.com';

function TicketVisual() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [compra, setCompra] = useState<any>(null);

  useEffect(() => {
    let tentativas = 0;
    const maxTentativas = 4; // Aumentei para 4 para dar tempo do Webhook processar

    async function buscar() {
      if (!sessionId) { 
        setLoading(false); 
        setErro(true);
        return; 
      }

      try {
        // Busca os detalhes da compra na AWS
        const res = await fetch(`${API_URL}/api/pagamentos/detalhes/${sessionId}`);
        
        if (res.ok) {
          const data = await res.json();
          setCompra(data);
          setLoading(false);
        } else {
          // Se não encontrar de primeira, espera 3 segundos e tenta de novo (tempo do webhook)
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
      <p className="font-black text-slate-400 uppercase tracking-widest italic animate-pulse">Validando com a rede AWS...</p>
    </div>
  );

  if (erro || !compra) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center gap-4">
      <AlertCircle className="text-rose-500" size={40} />
      <h3 className="font-black text-slate-800 uppercase italic text-xl">Ingresso em processamento</h3>
      <p className="text-slate-500 text-sm max-w-xs">
        Seu pagamento foi aprovado, mas estamos gerando seu QR Code. 
        Por favor, <b>atualize a página</b> em instantes.
      </p>
      <button onClick={() => window.location.reload()} className="mt-4 bg-slate-900 text-white px-8 py-3 rounded-full font-bold uppercase text-xs">
        Atualizar Agora
      </button>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 min-h-screen bg-white">
      <style jsx global>{`
        @media print { .no-print { display: none !important; } body { background: white; } .ticket-card { border: 2px solid #f43f5e !important; box-shadow: none !important; margin: 0; padding: 0; } }
        .ticket-mask {
          mask-image: radial-gradient(circle at 0 72%, transparent 20px, black 21px), 
                      radial-gradient(circle at 100% 72%, transparent 20px, black 21px);
        }
      `}</style>

      {/* HEADER DA PÁGINA */}
      <div className="text-center mb-8 no-print">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full mb-4 border border-emerald-100">
          <CheckCircle2 size={16} />
          <span className="font-bold text-xs uppercase tracking-wider">Acesso Garantido</span>
        </div>
        <h1 className="text-slate-900 font-black text-2xl italic tracking-tighter uppercase">Prepare sua Energia!</h1>
      </div>

      {/* CARD DO INGRESSO */}
      <div className="ticket-card ticket-mask bg-white rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(244,63,94,0.15)] overflow-hidden border border-rose-100 relative mb-8">
        
        {/* TOPO ESTILIZADO */}
        <div className="bg-rose-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex flex-wrap gap-4 p-2">
            {[...Array(15)].map((_, i) => <Ticket key={i} size={30} className="-rotate-12" />)}
          </div>
          <h1 className="text-white font-black italic text-4xl tracking-tighter relative z-10 mb-1">LINKAH.</h1>
          <p className="text-rose-100 font-bold text-[9px] uppercase tracking-[0.5em] relative z-10">Confirmação de Compra AWS</p>
        </div>

        <div className="p-8 space-y-8">
          {/* NOME DO EVENTO */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              {compra.evento_nome}
            </h2>
            <div className="flex items-center justify-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest">
               <Verified size={14} /> Linkah Verified Experience
            </div>
          </div>

          {/* GRID DE INFORMAÇÕES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <User size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Comprador</p>
                <p className="font-bold text-slate-700 text-sm uppercase truncate max-w-[150px]">
                   {compra.usuario_email?.split('@')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <Hash size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantidade</p>
                <p className="font-bold text-slate-700 text-sm uppercase">
                  {compra.quantidade} Ingresso(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <Calendar size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</p>
                <p className="font-bold text-slate-700 text-sm uppercase">
                  {compra.data_evento_formatada || 'Em breve'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <MapPin size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                <p className="font-bold text-slate-700 text-sm uppercase truncate max-w-[150px]">
                  {compra.local_evento || 'Online / A Definir'}
                </p>
              </div>
            </div>
          </div>

          {/* ÁREA DO QR CODE */}
          <div className="relative border-t-2 border-dashed border-slate-200 pt-8 flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-inner">
               <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${sessionId}`} 
                alt="QR Code"
                className="w-36 h-36"
               />
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
                  Apresente na portaria
                </p>
                <code className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-bold">
                  AUTH_{sessionId?.slice(-8).toUpperCase()}
                </code>
            </div>
          </div>
        </div>
      </div>

      {/* AÇÕES NO-PRINT */}
      <div className="space-y-3 no-print max-w-md mx-auto">
        <button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95">
          <Download size={18}/> Baixar Ingresso
        </button>
        <Link href="/dashboard/meus-ingressos" className="w-full bg-slate-50 text-slate-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
          Ver na minha conta <ArrowRight size={18}/>
        </Link>
      </div>
    </main>
  );
}

export default function PaginaSucesso() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-rose-500" size={50} />
        <p className="font-black text-rose-500 uppercase tracking-widest animate-pulse italic text-sm">Sincronizando com AWS...</p>
      </div>
    }>
      <TicketVisual />
    </Suspense>
  );
}