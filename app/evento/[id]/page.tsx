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
  Verified
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

export default function DetalhesCleanFinal() {
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
      <Loader2 className="animate-spin text-slate-200" size={30} />
    </div>
  );

  if (!evento) return <div className="h-screen flex items-center justify-center">Evento não encontrado.</div>;

  // Lógica de Imagens
  const urlFinalImagem = evento.imagem_capa?.startsWith('http') ? evento.imagem_capa : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.imagem_capa}`;
  const urlFinalPatrocinador = evento.banner_patrocinio?.startsWith('http') ? evento.banner_patrocinio : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.banner_patrocinio}`;

  const totalGeral = evento.ingressos?.reduce((acc: number, ing: any) => acc + Number(ing.preco) * (quantidades[ing.id] || 0), 0) || 0;
  const temIngresso = totalGeral > 0;

  // Link de redirecionamento corrigido
  const linkVenda = `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-black selection:text-white antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-32">
        
        {/* HEADER VOLTAR */}
        <button onClick={() => router.back()} className="mb-12 group flex items-center gap-2 text-slate-400 hover:text-black transition-all text-[10px] tracking-[0.3em] uppercase">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* LADO ESQUERDO: BANNER 1080x1350 */}
          <div className="lg:col-span-6">
            <div className="sticky top-28">
              <div className="relative aspect-[1080/1350] w-full bg-slate-50 rounded-sm overflow-hidden border border-slate-100">
                <img 
                  src={urlFinalImagem} 
                  className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000 ease-in-out" 
                  alt={evento.nome}
                />
                <div className="absolute top-6 left-6">
                  <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/50">
                    <Verified size={12} className="text-blue-500" />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600 tracking-tighter">Official Event</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: INFO + TICKET */}
          <div className="lg:col-span-6 space-y-16">
            
            <section className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-extralight tracking-tighter leading-none text-slate-950 italic uppercase">
                {evento.nome}
              </h1>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 uppercase tracking-widest text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                  <Calendar size={14} strokeWidth={1} />
                  {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} — {evento.hora_inicio || '19:00'}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} strokeWidth={1} />
                  {evento.local_nome} / {evento.cidade}
                </div>
              </div>
            </section>

            {/* DESCRIÇÃO E PATROCINADOR 236x354 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-7">
                <p className="text-slate-500 leading-relaxed font-light text-lg italic whitespace-pre-line">
                  {evento.descricao}
                </p>
              </div>

              {/* CAPA PATROCINADOR 236x354 */}
              <div className="md:col-span-5 flex justify-end">
                <div className="group relative w-[200px] h-[300px] md:w-[236px] md:h-[354px] bg-slate-50 border border-slate-100 rounded-sm overflow-hidden">
                  {urlFinalPatrocinador ? (
                    <img src={urlFinalPatrocinador} className="w-full h-full object-cover opacity-90 transition-all group-hover:opacity-100" alt="Patrocinador" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] uppercase tracking-widest text-slate-300 italic p-6 text-center">Featured Partner</div>
                  )}
                  <div className="absolute inset-0 border-[10px] border-white/0 group-hover:border-white/20 transition-all pointer-events-none" />
                </div>
              </div>
            </div>

            {/* INGRESSOS */}
            <section className="pt-10 border-t border-slate-100 space-y-8">
              <h3 className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-300">Seleção de Acesso</h3>
              
              <div className="divide-y divide-slate-50">
                {evento.ingressos?.map((ing: any) => (
                  <div key={ing.id} className="flex items-center justify-between py-8">
                    <div>
                      <p className="text-sm font-light uppercase tracking-widest text-slate-800 italic">{ing.nome}</p>
                      <p className="text-slate-400 font-medium text-xs mt-1">
                        {Number(ing.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 border border-slate-100 px-5 py-2.5 rounded-full">
                      <button onClick={() => setQuantidades(p => ({...p, [ing.id]: Math.max(0, p[ing.id]-1)}))} className="text-slate-300 hover:text-black transition-colors"><Minus size={14} /></button>
                      <span className="text-xs font-bold w-4 text-center">{quantidades[ing.id] || 0}</span>
                      <button onClick={() => setQuantidades(p => ({...p, [ing.id]: p[ing.id]+1}))} className="text-slate-300 hover:text-black transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CHECKOUT SECTION */}
              <div className="pt-12 flex flex-col items-center space-y-8">
                <div className="text-center">
                  <span className="text-[9px] font-bold tracking-[0.5em] text-slate-300 uppercase">Subtotal</span>
                  <p className="text-4xl font-extralight text-slate-950 mt-1 italic">
                    {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                <Link 
                  href={temIngresso ? linkVenda : '#'}
                  className={`group flex items-center justify-between w-full md:w-[320px] px-10 py-6 rounded-full border transition-all duration-500 ${
                    temIngresso 
                    ? 'border-slate-950 bg-slate-950 text-white hover:bg-white hover:text-black' 
                    : 'border-slate-100 text-slate-200 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Confirmar</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
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