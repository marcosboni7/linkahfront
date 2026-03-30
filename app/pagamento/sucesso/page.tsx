'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Ticket, Download, ArrowRight, Loader2, Calendar, User, 
  Hash, MapPin, AlertCircle, CheckCircle2, Verified, 
  ExternalLink, Video, Globe 
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-back.onrender.com';

function TicketVisual() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [compra, setCompra] = useState<any>(null);
  
  const { language }: any = useLanguage();

  useEffect(() => {
    let tentativas = 0;
    const maxTentativas = 12;

    async function buscar() {
      if (!sessionId) { 
        setLoading(false); 
        setErro(true);
        return; 
      }

      try {
        const res = await fetch(`${API_URL}/api/pagamento/detalhes/${sessionId}`);
        const textoResponse = await res.text();

        if (res.ok && textoResponse && textoResponse.trim().length > 0) {
          const data = JSON.parse(textoResponse);
          setCompra(data);
          setLoading(false);
        } else {
          if (tentativas < maxTentativas) {
            tentativas++;
            setTimeout(buscar, 4000); 
          } else {
            setLoading(false);
            setErro(true);
          }
        }
      } catch (e) {
        if (tentativas < maxTentativas) {
          tentativas++;
          setTimeout(buscar, 4000);
        } else {
          setLoading(false);
          setErro(true);
        }
      }
    }
    buscar();
  }, [sessionId, API_URL]);

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
      <AlertCircle className="text-[#C22973]" size={40} />
      <h3 className="font-black text-slate-800 uppercase italic text-xl">
        {language === 'PT' ? 'Processando Registro' : 'Processing Record'}
      </h3>
      <button onClick={() => window.location.reload()} className="bg-[#C22973] text-white px-10 py-4 rounded-full font-bold uppercase text-xs shadow-lg transition-transform active:scale-95">
        {language === 'PT' ? 'Atualizar Agora' : 'Refresh Now'}
      </button>
    </div>
  );

  // Lógica para identificar se o evento é online
  const isOnline = compra.tipo_evento === 'Online' || !!compra.link_reuniao;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 min-h-screen bg-white">
      <style jsx global>{`
        @media print { .no-print { display: none !important; } }
        .ticket-mask {
          mask-image: radial-gradient(circle at 0 75%, transparent 15px, black 16px), 
                      radial-gradient(circle at 100% 75%, transparent 15px, black 16px);
        }
      `}</style>

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

      <div className="ticket-card ticket-mask bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 relative mb-10">
        <div className="bg-gradient-to-br from-[#C22973] to-[#8a1d52] p-10 text-center relative overflow-hidden">
          <h1 className="text-white font-black italic text-5xl tracking-tighter relative z-10 mb-1">LINKAH.</h1>
          <p className="text-pink-100 font-bold text-[10px] uppercase tracking-[0.4em] relative z-10 opacity-80">Official Ticket • AWS Secured</p>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.9]">
              {compra.evento_nome}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#C22973] font-bold text-[11px] uppercase tracking-widest">
               <Verified size={14} className="fill-[#C22973] text-white" /> 
               {language === 'PT' ? 'Ingresso Original' : 'Original Ticket'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 rounded-[2.5rem] p-6 md:p-8 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#C22973]"><User size={22} /></div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{language === 'PT' ? 'Comprador' : 'Buyer'}</p>
                <p className="font-bold text-slate-700 text-sm truncate">{compra.usuario_email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#C22973]"><Hash size={22} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{language === 'PT' ? 'Quantidade' : 'Quantity'}</p>
                <p className="font-bold text-slate-700 text-sm">{compra.quantidade} {language === 'PT' ? 'Pessoas' : 'People'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#C22973]"><Calendar size={22} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{language === 'PT' ? 'Data' : 'Date'}</p>
                <p className="font-bold text-slate-700 text-sm uppercase">{compra.data_evento ? new Date(compra.data_evento).toLocaleDateString('pt-BR') : 'A confirmar'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-[#C22973]"><MapPin size={22} /></div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{language === 'PT' ? 'Local' : 'Venue'}</p>
                <p className="font-bold text-slate-700 text-sm uppercase truncate">
                  {isOnline ? 'Plataforma Online' : (compra.local_evento || 'A confirmar')}
                </p>
              </div>
            </div>
          </div>

          {/* SEÇÃO DO LINK ONLINE DENTRO DO CARD - Condicional para Evento Online */}
          {isOnline && compra.link_reuniao && (
            <div className="bg-pink-50/50 border-2 border-pink-100 rounded-[2.5rem] p-6 text-center animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-center gap-2 mb-3 text-[#C22973]">
                <Globe size={18} className="animate-spin-slow" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {language === 'PT' ? 'Acesso Liberado para a Live' : 'Live Stream Access Granted'}
                </p>
              </div>
              <a 
                href={compra.link_reuniao} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-900 font-bold text-xs break-all hover:underline flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm"
              >
                {compra.link_reuniao} <ExternalLink size={14} className="text-[#C22973]" />
              </a>
            </div>
          )}

          <div className="relative border-t-2 border-dashed border-slate-200 pt-10 flex flex-col items-center space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-pink-500/10">
               <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${sessionId}&color=0f172a`} 
                alt="QR Code"
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
        {/* BOTÃO PRINCIPAL DE ACESSO - Só aparece para eventos online */}
        {isOnline && (
          <a 
            href={compra.link_reuniao}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-[#C22973] to-[#8a1d52] text-white py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(194,41,115,0.4)] hover:scale-105 transition-all"
          >
             <Video size={18}/> {language === 'PT' ? 'Acessar Live Agora' : 'Watch Live Now'}
          </a>
        )}

        <button 
          onClick={() => window.print()} 
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all"
        >
          <Download size={18}/> {language === 'PT' ? 'Salvar Ingresso' : 'Save Ticket'}
        </button>
        
        <Link 
          href="/" 
          className="w-full bg-slate-50 text-slate-500 py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 border border-slate-100"
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
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
        <TicketVisual />
      </Suspense>
    </div>
  );
}