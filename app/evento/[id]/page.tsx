'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Calendar, MapPin, Ticket, ShieldCheck, Share2, Loader2, Info, Clock, CheckCircle2 } from 'lucide-react';
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
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#C22973]" size={40} />
    </div>
  );

  if (!evento) return <div className="p-20 text-center font-black text-slate-900">Evento não encontrado.</div>;

  const precoBase = parseFloat(evento.preco_minimo) || 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      <Navbar />

      {/* HERO SECTION MODERNA */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
            className="w-full h-full object-cover scale-105 blur-sm brightness-[0.3]"
            alt=""
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
           <div className="flex flex-col md:flex-row gap-12 items-end">
              {/* Card da Imagem Principal */}
              <div className="hidden md:block w-80 h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 shrink-0 transform -rotate-2 hover:rotate-0 transition-all duration-500">
                <img 
                  src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
                  className="w-full h-full object-cover"
                  alt={evento.nome}
                />
              </div>

              <div className="flex-1 space-y-4">
                <span className="bg-[#C22973] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                  {evento.categoria || 'Evento'}
                </span>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase italic">
                  {evento.nome}
                </h1>
                <div className="flex flex-wrap gap-6 text-white/80 font-bold text-sm">
                  <span className="flex items-center gap-2"><Calendar size={18} className="text-[#C22973]" /> {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'}</span>
                  <span className="flex items-center gap-2"><MapPin size={18} className="text-[#C22973]" /> {evento.cidade}, {evento.estado}</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* COLUNA ESQUERDA: DETALHES */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic uppercase">
                  <div className="w-2 h-10 bg-[#C22973] rounded-full" />
                  Experiência
                </h2>
                <button className="flex items-center gap-2 text-slate-400 hover:text-[#C22973] font-bold text-xs uppercase tracking-widest transition-colors">
                  <Share2 size={16} /> Compartilhar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#C22973] shrink-0">
                    <Clock size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abertura dos Portões</p>
                    <p className="font-black text-slate-800 text-lg">{evento.hora_inicio || '18:00'}</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#C22973] shrink-0">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Onde será</p>
                    <p className="font-black text-slate-800 text-lg line-clamp-1">{evento.local_nome || 'Local a definir'}</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-black text-slate-900 uppercase mb-4 tracking-tight flex items-center gap-2">
                  <Info size={20} className="text-[#C22973]" /> Detalhes do Evento
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-lg whitespace-pre-line">
                  {evento.descricao || "Prepare-se para uma experiência inesquecível na Linkah. Garanta seu lugar antecipadamente."}
                </p>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CHECKOUT BOX */}
          <div className="lg:-mt-40">
            <div className="bg-[#111] p-10 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(194,41,115,0.3)] border border-white/10 sticky top-28">
              <div className="mb-10 text-center">
                <p className="text-pink-500 font-black uppercase text-[10px] tracking-[0.4em] mb-2">Ingressos Disponíveis</p>
                <h3 className="text-white text-3xl font-black uppercase italic tracking-tighter">Garanta o seu</h3>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center p-6 bg-white/5 rounded-[2.5rem] border border-white/10">
                  <div className="flex-1">
                    <p className="text-white font-black uppercase text-xs mb-1">Entrada Geral</p>
                    <p className="text-pink-500 font-black text-2xl">R$ {precoBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-black rounded-2xl p-2 border border-white/20">
                    <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="text-white hover:text-pink-500 w-8 h-8 flex items-center justify-center font-black">-</button>
                    <span className="text-white font-black">{quantidade}</span>
                    <button onClick={() => setQuantidade(quantidade + 1)} className="text-white hover:text-pink-500 w-8 h-8 flex items-center justify-center font-black">+</button>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-6">
                   <div className="flex justify-between items-end">
                      <span className="text-white/40 font-black text-[10px] uppercase tracking-widest leading-none">Total</span>
                      <span className="text-white text-4xl font-black tracking-tighter leading-none italic">
                        R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                   </div>

                   <Link 
                    href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                    className="w-full bg-[#C22973] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-[#C22973] transition-all duration-300 shadow-2xl active:scale-95"
                  >
                    Finalizar Compra
                  </Link>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-white/40 justify-center">
                      <ShieldCheck size={14} className="text-green-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Pagamento 100% Criptografado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Benefícios Linkah */}
            <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 flex flex-col items-center text-center gap-2">
                  <CheckCircle2 size={20} className="text-[#C22973]" />
                  <p className="text-[9px] font-black text-slate-800 uppercase leading-tight">Envio Instantâneo</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 flex flex-col items-center text-center gap-2">
                  <Ticket size={20} className="text-[#C22973]" />
                  <p className="text-[9px] font-black text-slate-800 uppercase leading-tight">QR Code Dinâmico</p>
               </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="mt-20 py-16 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="text-2xl font-black text-[#C22973] tracking-tighter italic">LINKAH.</div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
            © 2026 Inteligência em Eventos
          </p>
        </div>
      </footer>
    </div>
  );
}