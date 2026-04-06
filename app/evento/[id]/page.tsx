'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Calendar,
  MapPin,
  Ticket,
  Loader2,
  Plus,
  Minus,
  ChevronLeft,
  ArrowRight,
  Info
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

export default function LayoutClean() {
  const { id } = useParams();
  const router = useRouter();
  const { language }: any = useLanguage();
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function carregarEvento() {
      try {
        const res = await fetch(`${API_URL}/api/eventos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvento(data);
          const qts: any = {};
          data.ingressos?.forEach((ing: any) => { qts[ing.id] = 0; });
          if (data.ingressos?.length > 0) qts[data.ingressos[0].id] = 1;
          setQuantidades(qts);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={30} /></div>;

  const urlFinalImagem = evento.imagem_capa?.startsWith('http') ? evento.imagem_capa : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.imagem_capa}`;
  const urlFinalPatrocinador = evento.banner_patrocinio?.startsWith('http') ? evento.banner_patrocinio : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.banner_patrocinio}`;
  const totalGeral = evento.ingressos?.reduce((acc: number, ing: any) => acc + Number(ing.preco) * (quantidades[ing.id] || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-light antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-32">
        {/* BOTÃO VOLTAR DISCRETO */}
        <button onClick={() => router.back()} className="mb-12 flex items-center gap-2 text-slate-400 hover:text-black transition-colors text-xs tracking-widest uppercase">
          <ChevronLeft size={14} /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* BANNER 1080x1350 */}
          <div className="lg:col-span-6">
            <div className="sticky top-24">
              <div className="relative aspect-[1080/1350] w-full overflow-hidden bg-slate-50 rounded-sm">
                <img 
                  src={urlFinalImagem} 
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
                  alt="Main Cover"
                />
              </div>
            </div>
          </div>

          {/* CONTEÚDO CLEAN */}
          <div className="lg:col-span-6 space-y-16">
            
            <section className="space-y-4">
              <span className="text-[10px] tracking-[0.5em] text-slate-400 uppercase">{evento.categoria || 'Event'}</span>
              <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-slate-950 leading-tight">
                {evento.nome}
              </h1>
              <div className="flex gap-8 pt-4 text-sm text-slate-500 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2 italic">
                  <Calendar size={14} strokeWidth={1.5} />
                  {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 italic">
                  <MapPin size={14} strokeWidth={1.5} />
                  {evento.local_nome}, {evento.cidade}
                </div>
              </div>
            </section>

            {/* GRID INFO + PATROCINADOR 236x354 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-300 italic">Detalhes</h2>
                <p className="text-slate-500 leading-relaxed font-normal">
                  {evento.descricao || "Informações em breve."}
                </p>
              </div>

              {/* CAPA PATROCINADOR 236x354 */}
              <div className="flex flex-col items-center md:items-end gap-3">
                <span className="text-[9px] text-slate-300 uppercase tracking-widest">Support</span>
                <div className="w-[180px] h-[270px] md:w-[236px] md:h-[354px] bg-slate-50 border border-slate-100 overflow-hidden rounded-sm relative group">
                  {urlFinalPatrocinador ? (
                    <img src={urlFinalPatrocinador} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Sponsor" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center italic text-slate-300 text-xs">Partner Image</div>
                  )}
                </div>
              </div>
            </div>

            {/* SELEÇÃO DE INGRESSOS MINIMALISTA */}
            <section className="pt-16 border-t border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-light italic">Selecione o acesso</h3>
                <Info size={16} className="text-slate-200" />
              </div>

              <div className="space-y-1">
                {evento.ingressos?.map((ing: any) => (
                  <div key={ing.id} className="group flex items-center justify-between py-6 border-b border-slate-50 hover:border-slate-200 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-800 uppercase tracking-wide">{ing.nome}</p>
                      <p className="text-slate-400 text-sm mt-1">
                        {Number(ing.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 border border-slate-100 px-4 py-2 rounded-full group-hover:border-slate-300 transition-all">
                      <button onClick={() => setQuantidades(p => ({...p, [ing.id]: Math.max(0, p[ing.id]-1)}))} className="text-slate-300 hover:text-black"><Minus size={14} /></button>
                      <span className="text-xs font-bold w-4 text-center">{quantidades[ing.id] || 0}</span>
                      <button onClick={() => setQuantidades(p => ({...p, [ing.id]: p[ing.id]+1}))} className="text-slate-300 hover:text-black"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTÃO FINAL TOTALMENTE CLEAN */}
              <div className="mt-16 flex flex-col items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-slate-300 mb-1">Subtotal</p>
                  <p className="text-3xl font-light">{totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                
                <Link 
                  href={totalGeral > 0 ? `/checkout` : '#'}
                  className={`group flex items-center gap-4 px-12 py-5 rounded-full border transition-all ${
                    totalGeral > 0 
                    ? 'border-slate-900 bg-slate-900 text-white hover:bg-white hover:text-black' 
                    : 'border-slate-100 text-slate-200 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Finalizar Reserva</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}