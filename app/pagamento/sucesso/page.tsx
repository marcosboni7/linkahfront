'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
      <Loader2 className="animate-spin text-rose-500" size={40} />
      <p className="font-black text-slate-400 uppercase tracking-widest italic animate-pulse">Gerando seu ingresso...</p>
    </div>
  );

  if (erro || !compra) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center gap-4">
      <AlertCircle className="text-rose-500" size={40} />
      <h3 className="font-black text-slate-800 uppercase italic">Ticket não encontrado</h3>
      <p className="text-slate-500 text-sm">Aguarde um instante e atualize a página.</p>
      <Link href="/" className="mt-4 text-rose-500 font-bold uppercase text-xs border-b-2 border-rose-500">Voltar para a Home</Link>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 min-h-screen bg-white">
      <style jsx global>{`
        @media print { .no-print { display: none !important; } body { background: white; } .ticket-card { border: 2px solid #f43f5e !important; box-shadow: none !important; } }
        .ticket-mask {
          mask-image: radial-gradient(circle at 0 70%, transparent 20px, black 21px), 
                      radial-gradient(circle at 100% 70%, transparent 20px, black 21px);
        }
      `}</style>

      {/* HEADER DA PÁGINA */}
      <div className="text-center mb-8 no-print">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full mb-4">
          <CheckCircle2 size={16} />
          <span className="font-bold text-xs uppercase tracking-wider">Pagamento Aprovado</span>
        </div>
        <h1 className="text-slate-900 font-black text-2xl italic tracking-tighter uppercase">Seu Ingresso Chegou!</h1>
      </div>

      {/* CARD DO INGRESSO - ESTILO BRANCO E ROSA */}
      <div className="ticket-card ticket-mask bg-white rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(244,63,94,0.2)] overflow-hidden border border-rose-100 relative mb-8">
        
        {/* TOPO COM NOME DO EVENTO */}
        <div className="bg-rose-500 p-10 text-center relative overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex flex-wrap gap-4 p-2">
            {[...Array(20)].map((_, i) => <Ticket key={i} size={40} className="-rotate-12" />)}
          </div>
          
          <h1 className="text-white font-black italic text-5xl tracking-tighter relative z-10 mb-2">LINKAH.</h1>
          <p className="text-rose-100 font-bold text-[10px] uppercase tracking-[0.5em] relative z-10">Official Event Ticket</p>
        </div>

        <div className="p-10 space-y-10">
          {/* NOME DO EVENTO EM DESTAQUE */}
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              {compra.evento_nome || 'SHOW DA LINKAH'}
            </h2>
            <div className="h-1 w-20 bg-rose-500 mx-auto rounded-full"></div>
          </div>

          {/* GRID DE INFORMAÇÕES - MAIS LARGO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-rose-50/50 rounded-[2.5rem] p-8 border border-rose-100">
            <div className="flex items-center gap-4">
              <div className="bg-rose-500 p-3 rounded-2xl shadow-md shadow-rose-200">
                <User size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Titular</p>
                <p className="font-black text-slate-800 text-lg uppercase truncate">
                   {compra.usuario_email?.split('@')[0] || 'MarcosPhara'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-rose-500 p-3 rounded-2xl shadow-md shadow-rose-200">
                <Hash size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Quantidade</p>
                <p className="font-black text-slate-800 text-lg uppercase">
                  {compra.quantidade || 1} Unidade(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-rose-500 p-3 rounded-2xl shadow-md shadow-rose-200">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Data do Evento</p>
                <p className="font-black text-slate-800 text-lg uppercase">
                  {compra.data_evento_formatada || '12/02/2026'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-2xl shadow-md shadow-emerald-100">
                <Wallet size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Pago</p>
                <p className="font-black text-emerald-600 text-xl uppercase italic">
                  R$ {formatarMoeda(compra.valor_total)}
                </p>
              </div>
            </div>
          </div>

          {/* RODAPÉ DO INGRESSO */}
          <div className="relative border-t-2 border-dashed border-rose-200 pt-8 text-center space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Apresente este ticket na portaria para check-in
            </p>
            <div className="bg-slate-100 inline-block px-4 py-1 rounded-lg">
               <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                ID: {sessionId?.slice(-16).toUpperCase() || 'LINKAH-VALID-2026'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO - MAIS LARGOS */}
      <div className="space-y-4 no-print max-w-lg mx-auto">
        <button onClick={() => window.print()} className="w-full bg-rose-500 text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all active:scale-[0.98]">
          <Download size={20}/> Baixar Ingresso PDF
        </button>
        <Link href="/" className="w-full bg-white border-2 border-slate-100 text-slate-400 py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
          Voltar ao Início <ArrowRight size={20}/>
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
        <p className="font-black text-rose-500 uppercase tracking-widest animate-pulse italic text-sm">Carregando Ticket...</p>
      </div>
    }>
      <TicketVisual />
    </Suspense>
  );
}