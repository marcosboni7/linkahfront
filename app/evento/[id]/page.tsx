'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Calendar,
  MapPin,
  Loader2,
  Plus,
  Minus,
  ChevronLeft,
  ArrowRight,
  Verified,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

export default function DetalhesExtravagante() {
  const { id } = useParams();
  const router = useRouter();
  const { language }: any = useLanguage();

  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function carregarEvento() {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`${API_URL}/api/eventos/${id}?t=${timestamp}`);
        if (res.ok) {
          const data = await res.json();
          setEvento(data);
          if (data.ingressos) {
            const qts: any = {};
            data.ingressos.forEach((ing: any) => { qts[ing.id] = 0; });
            if (data.ingressos.length > 0) qts[data.ingressos[0].id] = 1;
            setQuantidades(qts);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="relative">
        <Loader2 className="animate-spin text-purple-600" size={50} />
        <div className="absolute inset-0 blur-xl bg-purple-400 opacity-20 animate-pulse"></div>
      </div>
    </div>
  );

  if (!evento) return <div className="h-screen flex items-center justify-center font-bold">Evento não encontrado.</div>;

  const urlFinalImagem = evento.imagem_capa?.startsWith('http') ? evento.imagem_capa : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.imagem_capa}`;
  const urlFinalPatrocinador = evento.banner_patrocinio?.startsWith('http') ? evento.banner_patrocinio : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.banner_patrocinio}`;
  const totalGeral = evento.ingressos?.reduce((acc: number, ing: any) => acc + Number(ing.preco) * (quantidades[ing.id] || 0), 0) || 0;
  const temIngresso = totalGeral > 0;
  const linkVenda = `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}`;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-purple-600 selection:text-white antialiased overflow-x-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-32">
        
        {/* HEADER VOLTAR */}
        <button 
          onClick={() => router.back()} 
          className="mb-12 group flex items-center gap-3 text-slate-400 hover:text-purple-600 transition-all text-[11px] font-black tracking-[0.4em] uppercase"
        >
          <div className="p-2 rounded-full border border-slate-100 group-hover:border-purple-200 transition-colors">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* LADO ESQUERDO: BANNER CINEMATOGRÁFICO */}
          <div className="lg:col-span-6">
            <div className="sticky top-28">
              <div className="group relative aspect-[1080/1350] w-full rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-transform duration-700 hover:scale-[1.01]">
                <img 
                  src={urlFinalImagem} 
                  className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110" 
                  alt={evento.nome}
                />
                
                {/* OVERLAY DE BRILHO */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="absolute top-8 left-8">
                  <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl border border-white">
                    <Verified size={16} className="text-purple-600 fill-purple-100" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-900">Linkah Verified</span>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                   <p className="text-white/80 text-xs font-medium tracking-widest uppercase">Experience the Unforgettable</p>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: INFO EXTRAVAGANTE */}
          <div className="lg:col-span-6 space-y-16">
            
            <section className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold tracking-widest uppercase">
                <Sparkles size={12} /> Special Event
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-[ -0.05em] leading-[0.85] text-slate-950 uppercase italic break-words">
                {evento.nome}
              </h1>
              
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-200">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">When</p>
                  <p className="text-sm font-bold text-slate-800 uppercase italic">
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} / {evento.hora_inicio || '20:00'}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Where</p>
                  <p className="text-sm font-bold text-slate-800 uppercase italic">{evento.local_nome}</p>
                </div>
              </div>
            </section>

            {/* DESCRIÇÃO E PATROCINADOR */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-7">
                <p className="text-slate-500 leading-relaxed font-normal text-lg italic bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
                  {evento.descricao}
                </p>
              </div>

              {/* CAPA PATROCINADOR "ART GALLERY" STYLE */}
              <div className="md:col-span-5 flex justify-end">
                <div className="group relative w-full h-[300px] bg-white p-3 rounded-[40px] shadow-xl border border-slate-100 -rotate-3 hover:rotate-0 transition-all duration-500">
                  <div className="w-full h-full rounded-[30px] overflow-hidden bg-slate-50">
                    {urlFinalPatrocinador ? (
                      <img src={urlFinalPatrocinador} className="w-full h-full object-cover" alt="Patrocinador" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] uppercase tracking-widest text-slate-300 italic p-6 text-center font-bold">Partner Showcase</div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                     <Sparkles size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* INGRESSOS ESTILO GLASS */}
            <section className="pt-10 border-t border-slate-100 space-y-10">
              <h3 className="text-[12px] font-black tracking-[0.6em] uppercase text-slate-400 flex items-center gap-4">
                Tickets <div className="h-px bg-slate-100 flex-1"></div>
              </h3>
              
              <div className="space-y-4">
                {evento.ingressos?.map((ing: any) => (
                  <div key={ing.id} className="group relative bg-white hover:bg-slate-950 p-8 rounded-[32px] border border-slate-100 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                    <div className="relative z-10 text-center md:text-left">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-1">Access</p>
                      <p className="text-2xl font-black uppercase italic text-slate-900 group-hover:text-white transition-colors">{ing.nome}</p>
                      <p className="text-slate-400 font-medium text-sm mt-2 group-hover:text-slate-500">
                        {Number(ing.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-8 bg-slate-50 group-hover:bg-white/10 px-6 py-3 rounded-full transition-colors border border-transparent group-hover:border-white/20">
                      <button 
                        onClick={() => setQuantidades(p => ({...p, [ing.id]: Math.max(0, p[ing.id]-1)}))} 
                        className="text-slate-400 hover:text-purple-600 group-hover:text-white transition-colors p-1"
                      >
                        <Minus size={18} strokeWidth={3} />
                      </button>
                      <span className="text-lg font-black w-6 text-center group-hover:text-white">{quantidades[ing.id] || 0}</span>
                      <button 
                        onClick={() => setQuantidades(p => ({...p, [ing.id]: p[ing.id]+1}))} 
                        className="text-slate-400 hover:text-purple-600 group-hover:text-white transition-colors p-1"
                      >
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CHECKOUT EXTRAVAGANTE */}
              <div className="pt-12 flex flex-col items-center space-y-10">
                <div className="relative">
                  <div className="absolute inset-0 blur-3xl bg-purple-400 opacity-20"></div>
                  <div className="relative text-center">
                    <span className="text-[10px] font-black tracking-[0.8em] text-slate-300 uppercase">Total Investment</span>
                    <p className="text-6xl font-black text-slate-950 mt-2 italic tracking-tighter">
                      {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>

                <Link 
                  href={temIngresso ? linkVenda : '#'}
                  className={`group relative flex items-center justify-center w-full md:w-[400px] h-24 rounded-full overflow-hidden transition-all duration-500 active:scale-95 ${
                    temIngresso 
                    ? 'shadow-[0_20px_50px_rgba(147,51,234,0.3)]' 
                    : 'opacity-40 grayscale pointer-events-none'
                  }`}
                >
                  <div className="absolute inset-0 bg-slate-950 group-hover:bg-purple-600 transition-colors duration-500" />
                  <div className="relative flex items-center gap-4 text-white">
                    <span className="text-[13px] font-black uppercase tracking-[0.4em]">Checkout Now</span>
                    <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-500" />
                  </div>
                </Link>

                <p className="text-[9px] font-black tracking-[0.3em] text-slate-300 uppercase italic">Limited availability • Secure your spot</p>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}