'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, Wallet, AlertCircle, CheckCircle2, MapPin, Clock } from 'lucide-react';
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
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
      <Loader2 className="animate-spin text-rose-500" size={40} />
      <p className="font-black text-slate-400 uppercase tracking-widest italic animate-pulse">Gerando seu ingresso...</p>
    </div>
  );

  if (erro || !compra) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center gap-4">
      <AlertCircle className="text-rose-500" size={40} />
      <h3 className="font-black text-slate-800 uppercase italic">Ticket não encontrado</h3>
      <p className="text-slate-500 text-sm">Aguarde um instante ou verifique sua conexão.</p>
      <Link href="/" className="mt-4 text-rose-500 font-bold uppercase text-xs border-b-2 border-rose-500">Voltar para a Home</Link>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 min-h-screen bg-white">
      <style jsx global>{`
        @media print { .no-print { display: none !important; } body { background: white; } .ticket-card { border: 2px solid #f43f5e !important; box-shadow: none !important; margin: 0; } }
        .ticket-mask {
          mask-image: radial-gradient(circle at 0 72%, transparent 20px, black 21px), 
                      radial-gradient(circle at 100% 72%, transparent 20px, black 21px);
        }
      `}</style>

      {/* HEADER DA PÁGINA */}
      <div className="text-center mb-8 no-print">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full mb-4">
          <CheckCircle2 size={16} />
          <span className="font-bold text-xs uppercase tracking-wider">Pagamento Confirmado</span>
        </div>
        <h1 className="text-slate-900 font-black text-2xl italic tracking-tighter uppercase">Seu Ingresso Chegou!</h1>
      </div>

      {/* CARD DO INGRESSO */}
      <div className="ticket-card ticket-mask bg-white rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(244,63,94,0.15)] overflow-hidden border border-rose-100 relative mb-8">
        
        {/* TOPO */}
        <div className="bg-rose-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex flex-wrap gap-4 p-2">
            {[...Array(15)].map((_, i) => <Ticket key={i} size={30} className="-rotate-12" />)}
          </div>
          <h1 className="text-white font-black italic text-4xl tracking-tighter relative z-10 mb-1">LINKAH.</h1>
          <p className="text-rose-100 font-bold text-[9px] uppercase tracking-[0.5em] relative z-10">Ticket Digital Oficial</p>
        </div>

        <div className="p-8 space-y-8">
          {/* NOME DO EVENTO */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              {compra.evento_nome}
            </h2>
            <div className="h-1 w-16 bg-rose-500 mx-auto rounded-full"></div>
          </div>

          {/* GRID DE INFORMAÇÕES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <User size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Titular</p>
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
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entradas</p>
                <p className="font-bold text-slate-700 text-sm uppercase">
                  {compra.quantidade} Unidade(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <Calendar size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data e Hora</p>
                <p className="font-bold text-slate-700 text-sm uppercase">
                  {compra.data_evento_formatada} às {compra.hora_evento || '20:00'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <MapPin size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local</p>
                <p className="font-bold text-slate-700 text-sm uppercase truncate max-w-[150px]">
                  {compra.local_evento || 'A Definir'}
                </p>
              </div>
            </div>
          </div>

          {/* ÁREA DO QR CODE */}
          <div className="relative border-t-2 border-dashed border-slate-200 pt-8 flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-inner">
               {/* Gerador de QR Code Simples usando API pública */}
               <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://linkah.com.br/validar/${sessionId}`} 
                alt="QR Code Ingresso"
                className="w-32 h-32"
               />
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
                  Apresente para Check-in
                </p>
                <code className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-bold uppercase">
                  ID: {sessionId?.slice(-12).toUpperCase()}
                </code>
            </div>
          </div>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="space-y-3 no-print max-w-md mx-auto">
        <button onClick={() => window.print()} className="w-full bg-rose-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95">
          <Download size={18}/> Salvar Ingresso (PDF)
        </button>
        <Link href="/" className="w-full bg-slate-50 text-slate-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
          Voltar para Home <ArrowRight size={18}/>
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
        <p className="font-black text-rose-500 uppercase tracking-widest animate-pulse italic text-sm">Validando Pagamento...</p>
      </div>
    }>
      <TicketVisual />
    </Suspense>
  );
}