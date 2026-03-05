'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, Download, ArrowRight, Loader2, Calendar, User, Hash, MapPin, AlertCircle, CheckCircle2, Verified } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

function TicketVisual() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [compra, setCompra] = useState<any>(null);
  
  const { t, language }: any = useLanguage();

  useEffect(() => {
    let tentativas = 0;
    const maxTentativas = 6; // Aumentei um pouco o fôlego para o Webhook processar

    async function buscar() {
      if (!sessionId) { 
        setLoading(false); 
        setErro(true);
        return; 
      }

      try {
        // ✅ CORREÇÃO DA ROTA: Removido o "s" de pagamentos
        const res = await fetch(`${API_URL}/api/pagamento/detalhes/${sessionId}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setCompra(data);
            setLoading(false);
          } else {
            throw new Error("Compra confirmada, mas dados ainda não processados.");
          }
        } else {
          // Se der 404, o Webhook pode estar processando, então tentamos de novo
          if (tentativas < maxTentativas) {
            tentativas++;
            console.log(`⏳ Tentativa ${tentativas}: Aguardando confirmação do banco...`);
            setTimeout(buscar, 3000); 
          } else {
            setLoading(false);
            setErro(true);
          }
        }
      } catch (e) {
        console.error("🚨 Erro na busca da API:", e);
        setLoading(false);
        setErro(true);
      }
    }
    buscar();
  }, [sessionId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
      <Loader2 className="animate-spin text-[#C22973]" size={40} />
      <p className="font-black text-slate-400 uppercase tracking-widest italic animate-pulse text-xs text-center px-6">
        {language === 'PT' ? 'Sincronizando com a rede AWS...' : 'Syncing with AWS network...'} <br/>
        {language === 'PT' ? 'Gerando seu ticket oficial' : 'Generating your official ticket'}
      </p>
    </div>
  );

  if (erro || !compra) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center gap-4">
      <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-2">
        <AlertCircle className="text-[#C22973]" size={40} />
      </div>
      <h3 className="font-black text-slate-800 uppercase italic text-xl">
        {language === 'PT' ? 'Quase lá!' : 'Almost there!'}
      </h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        {language === 'PT' 
          ? 'Seu pagamento foi confirmado pelo Stripe, mas o servidor está finalizando a gravação no banco de dados.' 
          : 'Your payment was confirmed, but the server is finalizing the database record.'}
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 bg-[#C22973] hover:bg-[#a62262] text-white px-10 py-4 rounded-full font-bold uppercase text-xs transition-all shadow-lg active:scale-95"
      >
        {language === 'PT' ? 'Verificar Novamente' : 'Check Again'}
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
            border: 2px solid #f1f5f9 !important; 
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

      {/* HEADER */}
      <div className="text-center mb-10 no-print">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-full mb-6 border border-emerald-100 shadow-sm">
          <CheckCircle2 size={16} />
          <span className="font-bold text-[10px] uppercase tracking-widest">
            {language === 'PT' ? 'Pagamento Aprovado via Stripe' : 'Payment Approved via Stripe'}
          </span>
        </div>
        <h1 className="text-slate-900 font-black text-3xl italic tracking-tighter uppercase leading-none">
          {language === 'PT' ? 'Sua entrada está liberada!' : 'Your entry is granted!'}
        </h1>
      </div>

      {/* TICKET VISUAL */}
      <div className="ticket-card ticket-mask bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 relative mb-10">
        
        <div className="bg-gradient-to-br from-[#C22973] to-[#8a1d52] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex flex-wrap gap-6 p-4">
            {[...Array(12)].map((_, i) => <Ticket key={i} size={40} className="-rotate-12" />)}
          </div>
          <h1 className="text-white font-black italic text-5xl tracking-tighter relative z-10 mb-1">LINKAH.</h1>
          <p className="text-pink-100 font-bold text-[10px] uppercase tracking-[0.4em] relative z-10 opacity-80">
            Official Ticket • AWS Secured
          </p>
        </div>

        <div className="p-10 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.9]">
              {compra.evento_nome}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#C22973] font-bold text-[11px] uppercase tracking-widest">
               <Verified size={14} className="fill-[#C22973] text-white" /> 
               {language === 'PT' ? 'Ingresso Original' : 'Original Ticket'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#C22973]">
                <User size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   {language === 'PT' ? 'Comprador' : 'Buyer'}
                </p>
                <p className="font-bold text-slate-700 text-sm truncate">
                   {compra.usuario_email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#C22973]">
                <Hash size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   {language === 'PT' ? 'Qtd' : 'Qty'}
                </p>
                <p className="font-bold text-slate-700 text-sm">
                  {compra.quantidade} {language === 'PT' ? 'Pessoas' : 'People'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#C22973]">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   {language === 'PT' ? 'Data' : 'Date'}
                </p>
                <p className="font-bold text-slate-700 text-sm uppercase">
                  {compra.data_evento ? new Date(compra.data_evento).toLocaleDateString('pt-BR') : 'A confirmar'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#C22973]">
                <MapPin size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   {language === 'PT' ? 'Local' : 'Venue'}
                </p>
                <p className="font-bold text-slate-700 text-sm uppercase truncate">
                  {compra.local_evento || 'Check-in Digital'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-slate-200 pt-10 flex flex-col items-center space-y-6">
            <div className="absolute -top-[13px] -left-[53px] w-6 h-6 bg-white rounded-full border-r border-slate-100 no-print" />
            <div className="absolute -top-[13px] -right-[53px] w-6 h-6 bg-white rounded-full border-l border-slate-100 no-print" />
            
            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-pink-500/10">
               <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${sessionId}&color=0f172a`} 
                alt="QR Code Ticket"
                className="w-40 h-40"
               />
            </div>
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                   {language === 'PT' ? 'Apresente este QR Code' : 'Show this QR Code'}
                </p>
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
          <Download size={18}/> {language === 'PT' ? 'Salvar Ingresso' : 'Save Ticket'}
        </button>
        <Link 
          href="/" 
          className="w-full bg-slate-50 text-slate-500 py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all border border-slate-100"
        >
          {language === 'PT' ? 'Voltar para o Início' : 'Back to Home'} <ArrowRight size={18}/>
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
          <Loader2 className="animate-spin text-[#C22973]" size={50} />
          <p className="font-black text-[#C22973] uppercase tracking-widest animate-pulse italic text-sm">Validando transação...</p>
        </div>
      }>
        <TicketVisual />
      </Suspense>
    </div>
  );
}