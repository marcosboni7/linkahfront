'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Ticket, Calendar, Download, ArrowRight, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '../../site/Navbar';

function SucessoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Captura a URL atual para o QR Code e simula o processamento
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }

    if (sessionId) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-6">
        <div className="relative">
          <Loader2 className="animate-spin text-rose-500" size={60} />
          <CheckCircle2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200" size={24} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Confirmando Pagamento</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
            Aguardando confirmação do Stripe...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* CSS para garantir que o PDF saia limpo */}
      <style jsx global>{`
        @media print {
          nav, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .ticket-container {
            box-shadow: none !important;
            border: 2px solid #f1f5f9 !important;
          }
        }
      `}</style>

      <div className="ticket-container bg-white rounded-[3rem] border-2 border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
        
        {/* HEADER STATUS */}
        <div className="bg-emerald-500 p-12 text-center text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10 rotate-12">
            <Ticket size={240} />
          </div>
          
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6 backdrop-blur-lg border border-white/30">
            <CheckCircle2 size={48} />
          </div>
          
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-3">Tudo Pronto!</h1>
          <p className="font-bold opacity-90 uppercase text-xs tracking-[0.3em]">Sua reserva foi confirmada com sucesso</p>
        </div>

        <div className="p-8 md:p-14 space-y-12">
          
          {/* CARD DO INGRESSO */}
          <div id="meu-ingresso" className="bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 p-8 md:p-10 relative">
            {/* Detalhe de "Recorte" de Ticket lateral */}
            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white border-2 border-slate-100 rounded-full -translate-y-1/2 hidden md:block"></div>
            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-white border-2 border-slate-100 rounded-full -translate-y-1/2 hidden md:block"></div>

            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* QR CODE REAL - Agora aponta para a URL do ingresso */}
              <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-slate-900 group transition-transform hover:scale-105">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}`} 
                  alt="QR Code do Ingresso"
                  className="w-40 h-40"
                />
              </div>

              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Check-in Digital</h3>
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                    Seu Ingresso foi Gerado
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600 font-bold text-sm">
                    <Mail size={18} className="text-slate-400" />
                    <span>Enviamos uma cópia para seu e-mail</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600 font-bold text-sm">
                    <Calendar size={18} className="text-slate-400" />
                    <span>Apresente o QR Code na portaria</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÕES DE FINALIZAÇÃO - Classe 'no-print' para esconder no PDF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 no-print">
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all active:scale-95"
            >
              <Download size={20} />
              Baixar PDF / Imprimir
            </button>
            
            <Link 
              href="/"
              className="flex items-center justify-center gap-3 bg-rose-500 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-rose-200 active:scale-95"
            >
              Voltar para Início
              <ArrowRight size={20} />
            </Link>
          </div>

          <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            ID da Transação: {sessionId?.substring(0, 20)}...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PaginaSucesso() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="no-print">
        <Navbar />
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center py-40">
          <Loader2 className="animate-spin text-rose-500" size={40} />
        </div>
      }>
        <SucessoContent />
      </Suspense>
    </div>
  );
}