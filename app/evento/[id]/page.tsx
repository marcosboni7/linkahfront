'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, 
  Loader2, Plus, Minus, Zap, ChevronLeft, Globe,
  CheckCircle2, Info, Users, Clock
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
    <div className="h-screen w-full flex items-center justify-center bg-white text-[#E30031]">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  const precoBase = evento.ingressos?.[0]?.preco ? Number(evento.ingressos[0].preco) : 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      {/* --- HERO SECTION (Banner Superior Profissional) --- */}
      <div className="relative h-[400px] w-full overflow-hidden bg-slate-900">
        <img 
          src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
          className="w-full h-full object-cover opacity-40 blur-[2px]"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
             <div className="flex flex-col md:flex-row gap-8 items-end">
                {/* Capa Menor "Flutuante" */}
                <div className="hidden md:block w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform -rotate-1 translate-y-6">
                   <img src={evento.imagem_capa} className="w-full h-full object-cover" alt={evento.nome} />
                </div>
                
                <div className="flex-1 space-y-4 pb-6">
                   <div className="flex gap-2">
                      <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {evento.categoria}
                      </span>
                      {evento.link_transmissao && (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <Globe size={10} /> Online
                        </span>
                      )}
                   </div>
                   <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
                      {evento.nome}
                   </h1>
                   <div className="flex flex-wrap gap-6 text-slate-600 font-medium">
                      <span className="flex items-center gap-2"><Calendar size={18} className="text-rose-500"/> {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}</span>
                      <span className="flex items-center gap-2"><MapPin size={18} className="text-rose-500"/> {evento.link_transmissao ? 'Plataforma Online' : `${evento.cidade}, ${evento.estado}`}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUNA ESQUERDA: CONTEÚDO */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* DESCRIÇÃO */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Info className="text-rose-500" /> Detalhes do Evento
              </h3>
              <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                {evento.descricao}
              </div>
            </div>

            {/* TRANSMISSÃO (Se houver) */}
            {evento.link_transmissao && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 text-white shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Zap fill="white" /> Acesso Digital
                    </h3>
                    <p className="text-blue-100 max-w-md">
                      Este evento é 100% online. O link de acesso será enviado também para seu e-mail após a confirmação.
                    </p>
                    <a href={evento.link_transmissao} target="_blank" className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">
                      Entrar na sala agora
                    </a>
                  </div>
                  <Globe size={80} className="text-white/10 hidden md:block" />
                </div>
              </div>
            )}
            
            {/* PRODUTOR BOX */}
            <div className="bg-slate-100 rounded-3xl p-8 flex items-center justify-between border border-slate-200">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-600">
                    {evento.produtor_email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organizado por</p>
                    <p className="font-bold text-slate-800">{evento.produtor_email}</p>
                  </div>
               </div>
               <button className="text-rose-500 font-bold text-sm hover:underline">Seguir Produtor</button>
            </div>
          </div>

          {/* COLUNA DIREITA: CHECKOUT FIXO */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-[#0F172A] p-6 text-white flex justify-between items-center">
                   <span className="font-bold tracking-tight">INGRESSOS DISPONÍVEIS</span>
                   <Clock size={18} className="text-rose-400 animate-pulse" />
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg uppercase italic tracking-tighter">Entrada Geral</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Lote 01 • Vendas até {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className="text-xl font-black text-rose-600">
                      {precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-500">Qtd:</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm">
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-lg text-slate-900 w-4 text-center">{quantidade}</span>
                      <button onClick={() => setQuantidade(Math.min(5, quantidade + 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-dashed border-slate-200">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total a pagar</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>

                  <Link 
                    href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                    className="flex items-center justify-center w-full bg-[#E30031] py-5 rounded-2xl font-black text-white transition-all hover:bg-[#c2002a] hover:-translate-y-1 shadow-lg shadow-rose-200 uppercase text-xs tracking-[0.2em] gap-3"
                  >
                    <Ticket size={20} className="rotate-[-10deg]" />
                    Garantir minha vaga
                  </Link>

                  <div className="flex flex-col gap-3">
                     <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase">Ingressos 100% Autênticos</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Processamento Linkah Secure</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Card de Compartilhamento */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-600">Gostou desse evento?</span>
                 <button className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                    <Share2 size={18} /> Compartilhar
                 </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}