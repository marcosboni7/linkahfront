'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';

export default function ListaComunidades() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [estaLogado, setEstaLogado] = useState(false);

  useEffect(() => {
    // 1. VERIFICAÇÃO DE SEGURANÇA (Mesma chave da Navbar)
    const savedUser = localStorage.getItem('@Linkah:User');
    
    if (!savedUser) {
      setEstaLogado(false);
      setLoading(false);
      return;
    }

    setEstaLogado(true);

    // 2. BUSCA OS DADOS (SÓ SE ESTIVER LOGADO)
    fetch('https://linkah-api.onrender.com/api/eventos/vitrine')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar comunidades');
        return res.json();
      })
      .then(data => {
        setEventos(data);
        setLoading(false);
      })
      .catch(err => {
        setErro("O servidor está acordando... tente atualizar em alguns segundos.");
        setLoading(false);
      });
  }, []);

  // TELA DE LOADING
  if (loading) return (
    <div className="flex justify-center items-center h-screen !bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d6006d]"></div>
    </div>
  );

  // TELA DE ANÚNCIO / BLOQUEIO (PARA QUEM NÃO ESTÁ LOGADO)
  if (!estaLogado) return (
    <div className="min-h-screen flex flex-col !bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-[#d6006d]" size={32} />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">
            Acesse a nossa <br/><span className="text-[#d6006d]">Comunidade</span>
          </h1>
          
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Para ver os eventos ativos e conversar com a galera, você precisa fazer parte da Linkah.
          </p>

          <div className="space-y-3">
            <Link 
              href="/site/login"
              className="flex items-center justify-center gap-2 w-full bg-[#d6006d] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#b5005c] transition-all shadow-lg shadow-pink-200 active:scale-95"
            >
              <LogIn size={18} />
              Fazer Login
            </Link>
            
            <Link 
              href="/site/cadastro" 
              className="flex items-center justify-center gap-2 w-full bg-white text-slate-700 py-4 rounded-2xl font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
            >
              <UserPlus size={18} />
              Criar minha conta
            </Link>
          </div>

          <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Rápido, fácil e gratuito. ⚡
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );

  // CONTEÚDO LIBERADO (LISTA DE EVENTOS)
  return (
    <div className="flex flex-col min-h-screen !bg-[#F8FAFC] !text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-12 pb-20 w-full">
        <div className="mb-12">
          <span className="text-[#d6006d] font-black text-[10px] uppercase tracking-[0.3em]">Exclusivo Linkah</span>
          <h1 className="text-4xl md:text-5xl font-black mt-2 mb-4 tracking-tight">
            Nossa <span className="text-[#d6006d]">Comunidade</span>
          </h1>
          <p className="text-slate-500 max-w-lg leading-relaxed font-medium">
            Escolha um evento abaixo para entrar na sala de conversa oficial.
          </p>
        </div>

        {erro && (
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl text-center mb-8 border border-amber-100 font-bold">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.map((evento: any) => (
            <div key={evento.id} className="group bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-pink-100 transition-all duration-500">
              <div className="relative h-44">
                <img 
                  src={evento.imagem_capa || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
                  alt={evento.nome} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-black text-[#d6006d] uppercase">
                  Ativo Agora
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-black mb-2 text-slate-800 line-clamp-1">{evento.nome}</h2>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px] font-medium">
                  {evento.descricao || "Participe do chat oficial e conecte-se com os participantes."}
                </p>
                
                <Link 
                  href={`/evento/${evento.id}/comunidade`}
                  className="flex items-center justify-center w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#d6006d] transition-all group"
                >
                  Entrar no Chat
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}