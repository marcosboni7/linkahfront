'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, 
  Loader2, Plus, Minus, Zap, ChevronLeft,
  CheckCircle2, Clock, Heart, Users, Verified,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DetalhesEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    async function carregarEvento() {
      try {
        const res = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvento(data);
        }
      } catch (err) {
        console.error("Erro ao carregar:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#ff4d4d]" size={40} />
        <p className="text-slate-400 font-medium animate-pulse">Carregando experiência...</p>
      </div>
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  const precoBase = evento.ingressos?.[0]?.preco ? Number(evento.ingressos[0].preco) : 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        
        {/* TOP NAVIGATION */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="group inline-flex items-center gap-2 text-slate-400 hover:text-[#ff4d4d] transition-all text-sm font-bold">
            <div className="p-2 rounded-full group-hover:bg-orange-50 transition-colors">
              <ChevronLeft size={20} />
            </div>
            Explorar Eventos
          </Link>
          <div className="flex gap-3">
            <button className="p-3 rounded-full border border-slate-100 hover:bg-slate-50 transition-all text-slate-400 shadow-sm active:scale-90">
              <Share2 size={18} />
            </button>
            <button className="p-3 rounded-full border border-slate-100 hover:bg-slate-50 transition-all text-slate-400 shadow-sm active:scale-90">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* HERO SECTION - CINEMATIC WIDE COM BORDAS ARREDONDADAS */}
        <div className="relative w-full aspect-[21/9] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl mb-16 bg-slate-100 group">
          <img 
            src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt={evento.nome}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10 text-white">
             <div className="flex items-center gap-3 mb-4">
                <span className="bg-gradient-to-r from-[#ff4d4d] to-[#ff8c42] px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg">
                  {evento.categoria || 'Experiência'}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                  <Verified size={14} className="text-blue-400" /> Evento Verificado
                </span>
             </div>
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none drop-shadow-md">
                {evento.nome}
             </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* COLUNA ESQUERDA: CONTEÚDO */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* INFO CARDS - CLEAN DESIGN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 flex items-center justify-center text-[#ff4d4d] shrink-0">
                  <Calendar size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Data</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long'})}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">{evento.hora_inicio || '19:00'}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Local</p>
                  <p className="font-bold text-slate-800 text-lg line-clamp-1">{evento.link_transmissao ? 'Online' : evento.local_nome}</p>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">{evento.cidade}, {evento.estado}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Organizador</p>
                  <p className="font-bold text-slate-800 text-lg line-clamp-1 capitalize">{evento.produtor_email.split('@')[0]}</p>
                  <button className="text-sm text-[#ff4d4d] font-bold hover:underline">Ver Perfil</button>
                </div>
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sobre esta experiência</h3>
                <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>
              <div className="text-slate-600 leading-relaxed text-xl font-light whitespace-pre-line max-w-3xl">
                {evento.descricao}
              </div>
            </div>

            {/* BANNER DIGITAL (SE HOUVER) */}
            {evento.link_transmissao && (
              <div className="bg-gradient-to-br from-[#702082] to-[#ff4d4d] rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-orange-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
                    <Zap size={16} className="text-yellow-300 fill-yellow-300" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Acesso Digital Linkah</span>
                  </div>
                  <h3 className="text-4xl font-bold tracking-tight">Assista de qualquer lugar</h3>
                  <p className="text-white/80 text-lg">A sala virtual já está pronta para receber você.</p>
                </div>
                <a href={evento.link_transmissao} target="_blank" className="bg-white text-slate-900 px-10 py-6 rounded-2xl font-bold text-sm tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3 active:scale-95">
                  ENTRAR AGORA
                  <ArrowRight size={18} />
                </a>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: CHECKOUT - FLOATING CARD */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="p-10 space-y-10">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-xl tracking-tight">Ingressos</h4>
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                      <CheckCircle2 size={12} /> DISPONÍVEL
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">Entrada Padrão</p>
                          <p className="text-xs text-slate-500 font-medium italic">Lote promocional</p>
                        </div>
                        <span className="text-2xl font-bold text-slate-900">
                          {precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>

                      {/* QUANTITY SELECTOR */}
                      <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <button 
                          onClick={() => setQuantidade(Math.max(1, quantidade - 1))} 
                          className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#ff4d4d] transition-all active:scale-90"
                        >
                          <Minus size={20} />
                        </button>
                        <span className="font-bold text-xl text-slate-900">{quantidade}</span>
                        <button 
                          onClick={() => setQuantidade(Math.min(10, quantidade + 1))} 
                          className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#ff4d4d] transition-all active:scale-90"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TOTAL & BUY BUTTON */}
                  <div className="space-y-8">
                    <div className="flex justify-between items-end px-2">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Total a investir</span>
                      <span className="text-4xl font-bold text-slate-900 tracking-tighter">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <Link 
                      href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                      className="group flex items-center justify-center w-full bg-gradient-to-r from-[#ff4d4d] to-[#ff8c42] py-7 rounded-[2.5rem] font-bold text-white transition-all hover:scale-[1.02] shadow-xl shadow-orange-200 text-base gap-3 active:scale-95 overflow-hidden relative"
                    >
                      <Ticket size={24} className="group-hover:rotate-12 transition-transform" />
                      RESERVAR MEU LUGAR
                    </Link>

                    {/* SECURITY FOOTER */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-center gap-3 text-slate-400">
                        <Clock size={16} className="text-orange-400" />
                        <p className="text-[11px] font-semibold italic">Processamento seguro em 2 min</p>
                      </div>
                      <div className="flex flex-col items-center gap-2 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2 opacity-40">
                          <ShieldCheck size={18} className="text-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900">Linkah Secure Gateway</span>
                        </div>
                        <p className="text-[9px] text-slate-300 font-medium">Aceitamos Stripe & Pix</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}