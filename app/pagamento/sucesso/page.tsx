'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, Wallet, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function TicketVisual() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  
  // Começamos como null para não exibir dados fakes de "0.00"
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
          // Se a API falhar (venda ainda não processada no banco), tenta de novo
          if (tentativas < maxTentativas) {
            tentativas++;
            setTimeout(buscar, 2500); // Espera 2.5 segundos e tenta de novo
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

  // Formata o valor tratando centavos (se vier 10000 vira 100,00)
  const formatarMoeda = (valor: any) => {
    let num = parseFloat(valor);
    if (isNaN(num)) return "0,00";
    
    // Se o valor for muito alto (ex: 10000 para representar 100 reais), dividimos por 100
    // Remova o "/ 100" se o seu banco já salvar como decimal (100.00)
    if (num > 1000) num = num / 100; 

    return num.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-rose-500" size={40} />
      <p className="font-black text-slate-400 uppercase tracking-tighter italic">Validando seu pagamento...</p>
      <p className="text-[10px] text-slate-300">Aguardando confirmação do Stripe</p>
    </div>
  );

  if (erro || !compra) return (
    <div className="flex flex-col items-center justify-center py-40 px-6 text-center gap-4">
      <AlertCircle className="text-amber-500" size={40} />
      <h3 className="font-black text-slate-800 uppercase italic">Ticket não encontrado</h3>
      <p className="text-slate-500 text-sm">Ainda não recebemos a confirmação do pagamento. Se você já pagou, aguarde 1 minuto e atualize a página.</p>
      <Link href="/" className="mt-4 text-rose-500 font-bold uppercase text-xs border-b-2 border-rose-500">Voltar para a Home</Link>
    </div>
  );

  return (
    <main className="max-w-md mx-auto px-4 py-12 min-h-screen bg-slate-50">
      <style jsx global>{`
        @media print { .no-print { display: none !important; } body { background: white; } .ticket-card { box-shadow: none !important; border: 1px solid #000; } }
      `}</style>

      <div className="ticket-card bg-white rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Ticket size={100} className="text-white rotate-12" />
          </div>
          <h1 className="text-white font-black italic text-3xl tracking-tighter">LINKAH.</h1>
          <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Ingresso Confirmado</p>
        </div>

        <div className="p-8 space-y-8">
          <h2 className="text-3xl font-black text-slate-900 text-center uppercase italic tracking-tighter leading-tight">
            {compra.evento_nome || 'Evento Linkah'}
          </h2>

          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-[2rem] shadow-xl border-2 border-slate-900">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : sessionId || 'linkah')}`} 
                className="w-32 h-32"
                alt="QR Code do Ingresso"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between border-b pb-4 border-slate-200">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Titular</p>
                <p className="font-bold text-slate-800 flex items-center gap-1 text-sm uppercase">
                  <User size={12} className="text-rose-500"/> {compra.usuario_email?.split('@')[0] || 'Usuário'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qtd</p>
                <p className="font-bold text-slate-800 flex items-center justify-end gap-1 text-sm">
                  <Hash size={12} className="text-rose-500"/> {compra.quantidade || 1}x
                </p>
              </div>
            </div>
            
            <div className="flex justify-between pt-2">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</p>
                <p className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                  <Calendar size={12} className="text-rose-500"/> {compra.data_evento_formatada || new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pago</p>
                <p className="font-black text-emerald-600 flex items-center justify-end gap-1 text-base">
                  <Wallet size={14}/> R$ {formatarMoeda(compra.valor_total)}
                </p>
              </div>
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-slate-200 pt-6">
            <div className="absolute -top-3 -left-12 w-6 h-6 bg-slate-50 rounded-full border border-slate-100"></div>
            <div className="absolute -top-3 -right-12 w-6 h-6 bg-slate-50 rounded-full border border-slate-100"></div>
            <p className="text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Apresente este código na portaria para check-in
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3 no-print">
        <button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-transform">
          <Download size={18}/> Baixar PDF
        </button>
        <Link href="/" className="w-full bg-white border-2 border-slate-200 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
          Voltar ao Início <ArrowRight size={18}/>
        </Link>
      </div>
    </main>
  );
}

export default function PaginaSucesso() {
  return (
    <Suspense fallback={<div className="py-40 text-center font-black text-slate-300 uppercase italic animate-pulse">Carregando...</div>}>
      <TicketVisual />
    </Suspense>
  );
}