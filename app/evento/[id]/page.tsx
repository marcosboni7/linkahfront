'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, 
  Loader2, Plus, Minus, Zap, ChevronLeft, Globe,
  CheckCircle2, Info, Clock, Heart, Users 
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
        const res = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`, {
          cache: 'no-store'
        });
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
      <Loader2 className="animate-spin text-[#E30031]" size={40} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  const precoBase = evento.ingressos?.[0]?.preco ? Number(evento.ingressos[0].preco) : 0;
  const total = precoBase * parseInt(String(quantidade));

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        
        {/* BREADCRUMB & ACTIONS */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold">
            <ChevronLeft size={18} />
            Explorar Eventos
          </Link>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all text-slate-600">
              <Share2 size={18} />
            </button>
            <button className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all text-slate-600">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* --- LAYOUT DE IMAGEM --- */}
        <div className="relative w-full aspect-[21/9] md:aspect-[25/9] rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 bg-slate-100">
          <img 
            src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            alt={evento.nome}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white">
             <span className="bg-[#E30031] px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">
                {evento.categoria || 'Destaque'}
             </span>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                {evento.nome}
             </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUNA ESQUERDA: INFOS */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* GRID DE INFOS RÁPIDAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <Calendar className="text-[#E30031] mt-1" size={24} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quando</p>
                  {/* DATA: Forçamos UTC para não mudar o dia */}
                  <p className="font-bold text-slate-800">
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                  {/* HORA: Pegamos apenas os primeiros 5 caracteres (HH:mm) da coluna hora_inicio */}
                  <p className="text-xs text-slate-500">
                    {evento.hora_inicio ? evento.hora_inicio.substring(0, 5) : '19:00'}h
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <MapPin className="text-[#E30031] mt-1" size={24} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Onde</p>
                  <p className="font-bold text-slate-800 line-clamp-1">{evento.link_transmissao ? 'Online' : evento.local_nome}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{evento.cidade}, {evento.estado}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <Users className="text-[#E30031] mt-1" size={24} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Organizado por</p>
                  <p className="font-bold text-slate-800 line-clamp-1">{evento.produtor_email?.split('@')[0] || 'Produtor'}</p>
                  <button className="text-xs text-[#E30031] font-bold">Ver perfil</button>
                </div>
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 flex items-center gap-3">
                SOBRE O EVENTO
              </h3>
              <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-line border-l-4 border-slate-100 pl-6">
                {evento.descricao}
              </div>
            </div>

            {/* TRANSMISSÃO */}
            {evento.link_transmissao && (
              <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full">
                    <Zap size={14} fill="white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Evento Digital</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Link da Transmissão Disponível</h3>
                  <p className="text-blue-100 text-sm font-medium">Você poderá acessar a sala virtual clicando no botão ao lado.</p>
                </div>
                <a href={evento.link_transmissao} target="_blank" className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-slate-50 transition-all whitespace-nowrap">
                  Entrar na Sala
                </a>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: CHECKOUT */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-slate-900 uppercase italic tracking-tighter">Selecione Ingressos</h4>
                    <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-1 rounded">DISPONÍVEL</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Entrada Padrão</p>
                        <p className="text-xs text-slate-400">Acesso individual ao evento</p>
                      </div>
                      <span className="text-xl font-black text-slate-900">
                        {precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd de ingressos</p>
                      <div className="flex items-center gap-5">
                        <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E30031] transition-all shadow-sm">
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-lg text-slate-900">{quantidade}</span>
                        <button onClick={() => setQuantidade(Math.min(5, quantidade + 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E30031] transition-all shadow-sm">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-dashed border-slate-100 space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest pb-1">Total investido</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <Link 
                      href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                      className="flex items-center justify-center w-full bg-[#E30031] py-6 rounded-[2rem] font-black text-white transition-all hover:bg-black hover:shadow-2xl shadow-rose-200 uppercase text-xs tracking-[0.2em] gap-3 active:scale-95"
                    >
                      <Ticket size={20} className="rotate-[-10deg]" />
                      Comprar Ingressos
                    </Link>
                  </div>

                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3 py-3 border-y border-slate-50">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                           <Clock size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo limitado</p>
                           <p className="text-[11px] font-bold text-slate-600">Garanta antes que o lote mude</p>
                        </div>
                     </div>
                     <div className="flex justify-center items-center gap-2 opacity-40">
                        <ShieldCheck size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Linkah Gateway Secure</span>
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