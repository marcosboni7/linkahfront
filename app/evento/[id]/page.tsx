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
  Verified,
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
      <button onClick={() => router.push('/')} className="text-[#C22973] font-bold">Voltar</button>
    </div>
  );

  // Lógica de Imagem de Capa
  const rawImage = evento.imagem_capa || evento.capa_url || evento.imagem_url || evento.imagem;
  let urlFinalImagem = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';
  if (rawImage && rawImage !== 'null') {
    const valor = String(rawImage).trim();
    urlFinalImagem = valor.startsWith('http') ? valor : valor.startsWith('linkah/') 
      ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${valor}` 
      : `${API_URL}/uploads/${valor.replace(/^\/+/, '')}`;
  }

  // Lógica de Banner de Patrocínio
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
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 antialiased pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        
        {/* NAVEGAÇÃO */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-black transition-all font-black uppercase text-[10px] tracking-widest">
            <ChevronLeft size={16} /> Voltar
          </button>
          <div className="flex gap-2">
            <button className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-[#C22973] transition-all"><Share2 size={18} /></button>
            <button className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-red-500 transition-all"><Heart size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* COLUNA ESQUERDA: CAPA 1080x1350 */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] bg-slate-200 group border-4 border-white">
              <img 
                src={urlFinalImagem} 
                alt={evento.nome} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute top-8 left-8 flex gap-2">
                <span className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                   {evento.categoria || 'Special'}
                </span>
                <span className="bg-[#C22973] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 shadow-xl">
                   <Verified size={12} /> Oficial
                </span>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CONTEÚDO */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* TÍTULO PRINCIPAL */}
            <div className="space-y-4">
               <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900">
                  {evento.nome}
               </h1>
               <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-full text-xs font-bold text-slate-600">
                    <Calendar size={14} className="text-[#C22973]" />
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-full text-xs font-bold text-slate-600">
                    <Globe size={14} className="text-blue-500" />
                    {evento.tipo === 'Online' ? 'Digital Experience' : evento.cidade}
                  </div>
               </div>
            </div>

            {/* SEÇÃO DO PATROCINADOR - MAIOR E MAIS VISÍVEL */}
            {urlFinalBanner && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                {/* Efeito de brilho no fundo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C22973]/10 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="flex flex-col items-center md:items-start text-center md:text-left z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={16} className="text-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Apresentado por</span>
                  </div>
                  <h4 className="text-white text-2xl font-black italic uppercase tracking-tight leading-none">Parceiro Global</h4>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all duration-500 group z-10">
                  <img 
                    src={urlFinalBanner} 
                    className="h-20 md:h-24 w-auto object-contain transition-transform duration-500 group-hover:scale-110" 
                    alt="Sponsor Logo"
                  />
                </div>
              </div>
            )}

            {/* SELEÇÃO DE INGRESSOS */}
            <section className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <h3 className="font-black italic uppercase text-sm tracking-widest">Tickets</h3>
                  <Ticket size={20} className="text-[#C22973]" />
               </div>
               <div className="p-8 space-y-4">
                  {evento.ingressos?.map((ing: any) => (
                    <div key={ing.id} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${quantidades[ing.id] > 0 ? 'border-[#C22973] bg-pink-50/20' : 'border-slate-50 bg-slate-50/50'}`}>
                       <div>
                          <p className="font-black uppercase italic text-[10px] tracking-widest mb-1 text-slate-400">{ing.nome}</p>
                          <p className="text-3xl font-black text-slate-900 leading-none">
                            {Number(ing.preco).toLocaleString(locale, { style: 'currency', currency: moedaFinal })}
                          </p>
                       </div>
                       <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
                          <button onClick={() => handleMudarQuantidade(ing.id, 'sub')} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-black transition-all"><Minus size={16} /></button>
                          <span className="font-black text-lg w-6 text-center">{quantidades[ing.id] || 0}</span>
                          <button onClick={() => handleMudarQuantidade(ing.id, 'soma')} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-black transition-all"><Plus size={16} /></button>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="p-8 pt-0">
                  <Link 
                    href={totalGeral > 0 ? `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}` : '#'}
                    className={`w-full py-7 rounded-[2rem] font-black text-[12px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all ${totalGeral > 0 ? 'bg-[#C22973] text-white hover:bg-black shadow-2xl shadow-pink-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    Confirmar Reserva — {totalGeral.toLocaleString(locale, { style: 'currency', currency: moedaFinal })}
                  </Link>
               </div>
            </section>

            {/* DESCRIÇÃO */}
            <section className="space-y-6">
               <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                 <div className="h-1 w-8 bg-[#C22973]"></div>
                 The Event
               </h2>
               <div className="text-slate-500 leading-[1.8] font-medium text-xl whitespace-pre-line bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm italic">
                  {evento.descricao || 'No additional info.'}
               </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}