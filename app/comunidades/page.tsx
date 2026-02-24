'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, LogIn, UserPlus, ArrowRight, MessageCircle, Users, Loader2 } from 'lucide-react';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';

// --- CONFIGURAÇÃO DA API DA AWS ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://r8amtavirp.us-east-1.awsapprunner.com';

export default function ListaComunidades() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [estaLogado, setEstaLogado] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (!savedUser) {
      setEstaLogado(false);
      setLoading(false);
      return;
    }
    setEstaLogado(true);

    // Agora buscando a vitrine de comunidades no servidor da AWS
    fetch(`${API_URL}/api/eventos/vitrine`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar comunidades');
        return res.json();
      })
      .then(data => {
        setEventos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro na AWS:", err);
        setErro("Não foi possível carregar as comunidades agora. Verifique se o servidor está ativo.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#FCFBFA] gap-4">
      <Loader2 className="animate-spin text-slate-300" size={32} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando Salas...</p>
    </div>
  );

  // TELA DE BLOQUEIO (Membros apenas)
  if (!estaLogado) return (
    <div className="min-h-screen flex flex-col bg-[#FCFBFA]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Lock className="text-[#ff4d4d]" size={32} />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">
            Acesso Restrito
          </h1>
          
          <p className="text-slate-500 font-light mb-10 leading-relaxed text-lg">
            Esta comunidade é exclusiva para membros. Entre ou crie sua conta para participar das conversas.
          </p>

          <div className="space-y-4">
            <Link 
              href="/site/login"
              className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 active:scale-95"
            >
              <LogIn size={18} />
              Entrar agora
            </Link>
            
            <Link 
              href="/site/register" 
              className="flex items-center justify-center gap-2 w-full bg-white text-slate-600 py-5 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBFA] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-16 pb-24 w-full">
        {/* HEADER */}
        <div className="mb-16 text-center md:text-left space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Comunidades Ativas</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Explore as <span className="text-[#ff4d4d]">Salas</span>
          </h1>
          <p className="text-slate-500 max-w-lg leading-relaxed text-lg font-light">
            Conecte-se com pessoas que vão aos mesmos eventos que você.
          </p>
        </div>

        {erro && (
          <div className="bg-orange-50 text-orange-600 p-5 rounded-2xl text-center mb-12 border border-orange-100 font-medium">
            {erro}
          </div>
        )}

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {eventos.map((evento: any) => (
            <div key={evento.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={evento.imagem_capa || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
                  alt={evento.nome} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <Users size={12} className="text-[#ff4d4d]" /> Chat Livre
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h2 className="text-xl font-bold mb-3 text-slate-900 line-clamp-1 group-hover:text-[#ff4d4d] transition-colors">
                  {evento.nome}
                </h2>
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-light leading-relaxed">
                  {evento.descricao || "Participe do chat oficial e conecte-se com os participantes deste evento."}
                </p>
                
                <div className="mt-auto">
                  <Link 
                    href={`/evento/${evento.id}/comunidade`}
                    className="flex items-center justify-between w-full bg-slate-50 text-slate-900 p-5 rounded-2xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all group/btn"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} className="text-[#ff4d4d]" />
                      Entrar no grupo
                    </div>
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform opacity-50" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}