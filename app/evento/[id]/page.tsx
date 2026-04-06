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
  Share2,
  Loader2,
  Plus,
  Minus,
  ChevronLeft,
  CheckCircle2,
  Heart,
  Users,
  Verified,
  Building2,
  Globe,
  Award
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

export default function DetalhesEvento() {
  const { id } = useParams();
  const router = useRouter();
  const { t, language }: any = useLanguage();

  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function carregarEvento() {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`${API_URL}/api/eventos/${id}?t=${timestamp}`, {
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          setEvento(data);

          if (data.ingressos && Array.isArray(data.ingressos)) {
            const qts: any = {};
            data.ingressos.forEach((ing: any) => { qts[ing.id] = 0; });
            if (data.ingressos.length > 0) qts[data.ingressos[0].id] = 1;
            setQuantidades(qts);
          }
        }
      } catch (err) {
        console.error('[AWS Debug] Erro na conexão:', err);
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

  if (!evento) return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
      <p className="italic text-slate-400">Evento não encontrado.</p>
      <button onClick={() => router.push('/')} className="text-[#C22973] font-bold underline">Voltar</button>
    </div>
  );

  // Tratamento de Imagens
  const rawImage = evento.imagem_capa || evento.capa_url || evento.imagem_url || evento.imagem;
  let urlFinalImagem = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';
  if (rawImage && rawImage !== 'null') {
    const valor = String(rawImage).trim();
    urlFinalImagem = valor.startsWith('http') ? valor : valor.startsWith('linkah/') 
      ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${valor}` 
      : `${API_URL}/uploads/${valor.replace(/^\/+/, '')}`;
  }

  const rawBanner = evento.banner_patrocinio;
  let urlFinalBanner = null;
  if (rawBanner && rawBanner !== 'null') {
    const vB = String(rawBanner).trim();
    urlFinalBanner = vB.startsWith('http') ? vB : vB.startsWith('linkah/')
      ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${vB}`
      : `${API_URL}/uploads/${vB.replace(/^\/+/, '')}`;
  }

  const moedaFinal = (evento.moeda || 'BRL').toUpperCase();
  const locale = language === 'PT' ? 'pt-BR' : 'en-US';
  const totalGeral = evento.ingressos?.reduce((acc: number, ing: any) => acc + Number(ing.preco) * (quantidades[ing.id] || 0), 0) || 0;

  const handleMudarQuantidade = (ingId: string, operacao: 'soma' | 'sub') => {
    setQuantidades(prev => ({
      ...prev,
      [ingId]: operacao === 'soma' ? (prev[ingId] || 0) + 1 : Math.max(0, (prev[ingId] || 0) - 1)
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 antialiased pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-10 pt-8">
        
        {/* NAVEGAÇÃO SUPERIOR */}
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-400 hover:text-black transition-all font-black uppercase text-[10px] tracking-[0.2em]">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm"><ChevronLeft size={16} /></div>
            Voltar
          </button>
          <div className="flex gap-3">
            <button className="p-3.5 rounded-[1.2rem] bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-[#C22973] transition-all"><Share2 size={18} /></button>
            <button className="p-3.5 rounded-[1.2rem] bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-red-500 transition-all"><Heart size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
          
          {/* COLUNA ESQUERDA: CAPA 1080x1350 FIXA */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] bg-slate-200 group border-4 border-white">
              <img 
                src={urlFinalImagem} 
                alt={evento.nome} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                <span className="bg-white/10 backdrop-blur-2xl border border-white/20 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
                   {evento.categoria || 'Experience'}
                </span>
                <span className="bg-[#C22973] px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 shadow-2xl w-fit">
                   <Verified size={12} /> Oficial
                </span>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: INFO, PATROCÍNIO E COMPRA */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* 1. DESTAQUE DO PATROCINADOR (VISIBILIDADE MÁXIMA) */}
            {urlFinalBanner && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#C22973]/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={14} className="text-yellow-400" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Presented by</p>
                  </div>
                  <p className="text-white font-black italic uppercase text-lg tracking-tight">Parceiro Oficial</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-inner relative z-10">
                  <img src={urlFinalBanner} className="h-10 w-auto object-contain" />
                </div>
              </div>
            )}

            {/* TÍTULO */}
            <div className="space-y-6">
               <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900">
                  {evento.nome}
               </h1>
               <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <Calendar size={16} className="text-[#C22973]" />
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <Globe size={16} className="text-blue-500" />
                    {evento.tipo === 'Online' ? 'Cloud Stream' : evento.local_nome}
                  </div>
               </div>
            </div>

            {/* TICKETS - DESIGN REFINADO */}
            <section className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
               <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-black italic uppercase text-xs tracking-[0.3em] text-slate-400 mb-1">Passaportes</h3>
                    <p className="text-xl font-black uppercase italic">Garanta seu acesso</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Ticket size={20} /></div>
               </div>
               
               <div className="p-10 space-y-5">
                  {evento.ingressos?.map((ing: any) => (
                    <div key={ing.id} className={`flex items-center justify-between p-7 rounded-[2rem] border-2 transition-all duration-500 ${quantidades[ing.id] > 0 ? 'border-[#C22973] bg-pink-50/30' : 'border-slate-50 bg-slate-50/50'}`}>
                       <div>
                          <p className="font-black uppercase italic text-[10px] tracking-widest mb-1 text-slate-400">{ing.nome}</p>
                          <p className="text-3xl font-black text-slate-900 leading-none">
                            {Number(ing.preco).toLocaleString(locale, { style: 'currency', currency: moedaFinal })}
                          </p>
                       </div>
                       <div className="flex items-center gap-5 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
                          <button onClick={() => handleMudarQuantidade(ing.id, 'sub')} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-[#C22973] hover:bg-pink-50 rounded-xl transition-all"><Minus size={18} /></button>
                          <span className="font-black text-lg w-6 text-center">{quantidades[ing.id] || 0}</span>
                          <button onClick={() => handleMudarQuantidade(ing.id, 'soma')} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-[#C22973] hover:bg-pink-50 rounded-xl transition-all"><Plus size={18} /></button>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-10 pt-0">
                  <Link 
                    href={totalGeral > 0 ? `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}` : '#'}
                    className={`group w-full py-7 rounded-[2.2rem] font-black text-[12px] tracking-[0.3em] uppercase flex items-center justify-center gap-4 transition-all duration-500 ${totalGeral > 0 ? 'bg-black text-white hover:bg-[#C22973] shadow-[0_20px_40px_rgba(194,41,115,0.3)]' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    <span>Finalizar Compra — {totalGeral.toLocaleString(locale, { style: 'currency', currency: moedaFinal })}</span>
                    <CheckCircle2 size={18} className={`transition-all ${totalGeral > 0 ? 'opacity-100' : 'opacity-0'}`} />
                  </Link>
               </div>
            </section>

            {/* SOBRE O EVENTO */}
            <section className="space-y-8 pb-10">
               <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-[#C22973]"></div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">The Vision</h2>
               </div>
               <div className="text-slate-500 leading-[1.8] font-medium text-xl whitespace-pre-line bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm italic">
                  {evento.descricao || 'Information pending by producer.'}
               </div>
            </section>

            {/* RODAPÉ DO CONTEÚDO (REFORÇO DO PATROCÍNIO) */}
            {urlFinalBanner && (
              <div className="flex flex-col items-center py-10 border-t border-slate-100 space-y-4">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Powered and Supported by</p>
                 <img src={urlFinalBanner} className="h-16 w-auto grayscale hover:grayscale-0 transition-all duration-700 cursor-help" />
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}