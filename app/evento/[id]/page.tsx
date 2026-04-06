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
  Verified
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

export default function DetalhesMinimalist() {
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
      <Loader2 className="animate-spin text-slate-200" size={24} strokeWidth={1.5} />
    </div>
  );

  if (!evento) return <div className="h-screen flex items-center justify-center font-light">Evento não encontrado.</div>;

  const urlFinalImagem = evento.imagem_capa?.startsWith('http') ? evento.imagem_capa : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.imagem_capa}`;
  const urlFinalPatrocinador = evento.banner_patrocinio?.startsWith('http') ? evento.banner_patrocinio : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.banner_patrocinio}`;
  const totalGeral = evento.ingressos?.reduce((acc: number, ing: any) => acc + Number(ing.preco) * (quantidades[ing.id] || 0), 0) || 0;
  const linkVenda = `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-slate-100 selection:text-black">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-8 lg:px-20 pt-12 pb-40">
        
        {/* NAVEGAÇÃO DISCRETA */}
        <button 
          onClick={() => router.back()} 
          className="mb-16 flex items-center gap-2 text-slate-400 hover:text-black transition-colors text-[10px] tracking-[0.4em] uppercase"
        >
          <ChevronLeft size={14} strokeWidth={1} /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          {/* COVER ART (1080x1350) */}
          <div className="lg:col-span-7">
            <div className="sticky top-32">
              <div className="relative aspect-[1080/1350] w-full overflow-hidden bg-slate-50 border border-slate-100 group">
                <img 
                  src={urlFinalImagem} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" 
                  alt={evento.nome}
                />
                <div className="absolute top-8 left-8">
                  <div className="bg-white/40 backdrop-blur-md px-3 py-1.5 border border-white/20 rounded-full flex items-center gap-2">
                    <Verified size={12} className="text-blue-500" />
                    <span className="text-[9px] font-medium tracking-widest uppercase text-slate-800">Official</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT INFO */}
          <div className="lg:col-span-5 space-y-20">
            
            <header className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-extralight tracking-tighter leading-none text-slate-950 uppercase italic">
                  {evento.nome}
                </h1>
                <div className="flex items-center gap-6 pt-4 text-[10px] tracking-[0.3em] uppercase text-slate-400 font-medium">
                  <span className="flex items-center gap-2 italic">
                    <Calendar size={12} strokeWidth={1.5} />
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                  </span>
                  <span className="flex items-center gap-2 italic">
                    <MapPin size={12} strokeWidth={1.5} />
                    {evento.cidade}
                  </span>
                </div>
              </div>

              <p className="text-slate-500 leading-relaxed font-light text-xl italic border-l border-slate-100 pl-8">
                {evento.descricao}
              </p>
            </header>

            {/* TICKETS SELECTION */}
            <section className="space-y-12">
              <div className="flex items-center gap-4">
                <h3 className="text-[11px] font-black tracking-[0.5em] uppercase text-slate-300">Acesso</h3>
                <div className="h-px bg-slate-100 flex-1" />
              </div>
              
              <div className="space-y-1">
                {evento.ingressos?.map((ing: any) => (
                  <div key={ing.id} className="group flex items-center justify-between py-10 border-b border-slate-50">
                    <div>
                      <p className="text-sm font-light uppercase tracking-widest text-slate-900 italic transition-all group-hover:translate-x-2">
                        {ing.nome}
                      </p>
                      <p className="text-slate-400 font-medium text-xs mt-2">
                        {Number(ing.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-8 px-6 py-3 border border-slate-100 rounded-full transition-all group-hover:border-slate-300">
                      <button onClick={() => setQuantidades(p => ({...p, [ing.id]: Math.max(0, p[ing.id]-1)}))} className="text-slate-300 hover:text-black transition-colors">
                        <Minus size={14} strokeWidth={1.5} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{quantidades[ing.id] || 0}</span>
                      <button onClick={() => setQuantidades(p => ({...p, [ing.id]: p[ing.id]+1}))} className="text-slate-300 hover:text-black transition-colors">
                        <Plus size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CURATED BY / PARTNER (236x354) */}
            <div className="flex flex-col gap-6 items-start pt-4">
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">In partnership with</span>
              <div className="w-[180px] h-[270px] bg-slate-50 border border-slate-100 overflow-hidden relative group transition-all duration-700 hover:grayscale-0 grayscale">
                 <img src={urlFinalPatrocinador} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Partner" />
                 <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
              </div>
            </div>

            {/* FINAL BUTTON */}
            <div className="pt-20 border-t border-slate-100 flex flex-col items-center gap-10">
               <div className="text-center">
                  <span className="text-[10px] font-bold tracking-[0.6em] text-slate-300 uppercase">Subtotal</span>
                  <p className="text-5xl font-extralight italic tracking-tighter text-slate-950 mt-2">
                    {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
               </div>

               <Link 
                  href={totalGeral > 0 ? linkVenda : '#'}
                  className={`group flex items-center justify-between w-full px-12 py-7 transition-all duration-700 border ${
                    totalGeral > 0 
                    ? 'border-slate-950 bg-white text-black hover:bg-black hover:text-white' 
                    : 'border-slate-100 text-slate-200 cursor-not-allowed pointer-events-none'
                  }`}
               >
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Confirmar Reserva</span>
                  <ArrowRight size={18} strokeWidth={1} className="group-hover:translate-x-4 transition-transform" />
               </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}