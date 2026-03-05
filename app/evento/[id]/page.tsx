'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, 
  Loader2, Plus, Minus, Zap, ChevronLeft,
  CheckCircle2, Clock, Heart, Users, Verified, Info
} from 'lucide-center'; // Nota: Certifique-se que o pacote é 'lucide-react' no seu projeto
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

// Usando o ícones do lucide-react (corrigido o import para o padrão do Next)
import * as Lucide from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function DetalhesEvento() {
  const { id } = useParams();
  const router = useRouter();
  const { t, language }: any = useLanguage(); 
  
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<{[key: string]: number}>({});

  useEffect(() => {
    async function carregarEvento() {
      try {
        console.log(`%c[AWS Debug] Buscando evento ID: ${id}`, "color: #C22973; font-weight: bold;");
        
        const timestamp = new Date().getTime();
        const res = await fetch(`${API_URL}/api/eventos/${id}?t=${timestamp}`, {
          cache: 'no-store'
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("[AWS Debug] Objeto completo recebido:", data);
          
          setEvento(data);
          
          if (data.ingressos && Array.isArray(data.ingressos)) {
            const qts: any = {};
            data.ingressos.forEach((ing: any) => {
              qts[ing.id] = 0;
            });
            // Começa com 1 no primeiro ingresso por padrão
            if (data.ingressos.length > 0) qts[data.ingressos[0].id] = 1;
            setQuantidades(qts);
          }
        } else {
          console.error(`[AWS Debug] Erro HTTP: ${res.status}`);
        }
      } catch (err) {
        console.error("[AWS Debug] Erro na conexão com App Runner:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Lucide.Loader2 className="animate-spin text-[#C22973]" size={40} />
        <p className="text-slate-400 font-medium animate-pulse">{t.sync || 'Sincronizando...'}</p>
      </div>
    </div>
  );

  if (!evento) return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
       <p className="text-slate-500 font-medium italic">Evento não encontrado.</p>
       <button onClick={() => router.push('/')} className="text-[#C22973] font-bold underline">Voltar para o início</button>
    </div>
  );

  // --- LÓGICA DE IMAGEM CORRIGIDA COM SEU BUCKET REAL ---
  const rawImage = evento.imagem_capa || evento.capa_url || evento.imagem_url || evento.imagem;
  const BUCKET_NAME = "linkah-backend-storage-2026"; 
  let urlFinalImagem = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30";

  if (rawImage) {
    if (rawImage.startsWith('http')) {
      urlFinalImagem = rawImage;
    } else {
      // Montagem da URL para o S3 em us-east-1 (onde está seu App Runner)
      urlFinalImagem = `https://${BUCKET_NAME}.s3.us-east-1.amazonaws.com/${rawImage}`;
    }
  }
  console.log(`[Render Debug] URL Final Construída:`, urlFinalImagem);

  const moedaFinal = (evento.moeda || 'BRL').toUpperCase();
  const locale = language === 'PT' ? 'pt-BR' : 'en-US';

  const totalGeral = evento.ingressos?.reduce((acc: number, ing: any) => {
    return acc + (Number(ing.preco) * (quantidades[ing.id] || 0));
  }, 0) || 0;

  const temIngressoSelecionado = totalGeral > 0;

  const handleMudarQuantidade = (ingId: string, operacao: 'soma' | 'sub') => {
    setQuantidades(prev => ({
      ...prev,
      [ingId]: operacao === 'soma' ? (prev[ingId] || 0) + 1 : Math.max(0, (prev[ingId] || 0) - 1)
    }));
  };

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.back()} className="group inline-flex items-center gap-2 text-slate-400 hover:text-[#C22973] transition-all text-sm font-bold">
            <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
              <Lucide.ChevronLeft size={20} />
            </div>
            {language === 'PT' ? 'Voltar' : 'Back'}
          </button>
          <div className="flex gap-3">
            <button className="p-3 rounded-full border border-slate-100 hover:bg-slate-50 text-slate-400 shadow-sm active:scale-90 transition-all">
              <Lucide.Share2 size={18} />
            </button>
            <button className="p-3 rounded-full border border-slate-100 hover:bg-slate-50 text-slate-400 shadow-sm active:scale-90 transition-all">
              <Lucide.Heart size={18} />
            </button>
          </div>
        </div>

        {/* HERO SECTION - IMAGEM DINÂMICA */}
        <div className="relative w-full aspect-[21/9] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl mb-16 bg-slate-100 group">
          <img 
            src={urlFinalImagem} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt={evento.nome}
            onError={(e) => { 
              console.warn("[Render Debug] Erro ao carregar imagem, aplicando fallback.");
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"; 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gradient-to-r from-[#C22973] to-[#ff8c42] px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg">
                  {evento.categoria || "Evento"}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                  <Lucide.Verified size={14} className="text-blue-400" /> {language === 'PT' ? 'Verificado AWS' : 'AWS Verified'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none drop-shadow-md italic uppercase">
                {evento.nome}
              </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* INFO COLUNA */}
          <div className="lg:col-span-8 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-pink-50 flex items-center justify-center text-[#C22973] shrink-0">
                  <Lucide.Calendar size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">DATA</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString(locale, {day: '2-digit', month: 'long'}) : '---'}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">{evento.horario || '19:00'}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <Lucide.MapPin size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">LOCAL</p>
                  <p className="font-bold text-slate-800 text-lg line-clamp-1">
                    {evento.tipo === 'online' ? 'Linkah Digital' : (evento.local_nome || evento.local)}
                  </p>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">{evento.cidade || 'Digital'}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                  <Lucide.Users size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">ORGANIZADOR</p>
                  <p className="font-bold text-slate-800 text-lg line-clamp-1">{evento.produtor_nome || 'Linkah Produtora'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">Sobre o Evento</h3>
              <div className="text-slate-600 leading-relaxed text-xl font-light whitespace-pre-line max-w-3xl">
                {evento.descricao}
              </div>
            </div>
          </div>

          {/* CHECKOUT CARD */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-8 md:p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900 text-xl italic uppercase">Ingressos</h4>
                <Lucide.CheckCircle2 size={20} className="text-emerald-500" />
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {evento.ingressos?.map((ing: any) => (
                  <div key={ing.id} className={`p-5 rounded-[2.5rem] border transition-all ${quantidades[ing.id] > 0 ? 'bg-pink-50/30 border-[#C22973]/20' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="font-bold text-slate-800 uppercase text-sm">{ing.nome || 'Individual'}</p>
                    <p className="text-[#C22973] font-black text-lg italic mb-3">
                      {Number(ing.preco).toLocaleString(locale, { style: 'currency', currency: moedaFinal })}
                    </p>
                    <div className="flex items-center justify-between bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                      <button onClick={() => handleMudarQuantidade(ing.id, 'sub')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#C22973] transition-colors active:scale-90"><Lucide.Minus size={16} /></button>
                      <span className="font-black text-lg italic">{quantidades[ing.id] || 0}</span>
                      <button onClick={() => handleMudarQuantidade(ing.id, 'soma')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#C22973] transition-colors active:scale-90"><Lucide.Plus size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-6">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">Total Geral</p>
                  <p className="text-3xl font-black text-slate-900 italic">
                    {totalGeral.toLocaleString(locale, { style: 'currency', currency: moedaFinal })}
                  </p>
                </div>

                <Link 
                  href={temIngressoSelecionado ? `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}` : '#'}
                  className={`flex items-center justify-center w-full py-7 rounded-[2.5rem] font-black text-white transition-all shadow-xl text-base gap-3 italic uppercase ${temIngressoSelecionado ? 'bg-gradient-to-r from-[#C22973] to-[#ff8c42] hover:scale-105 active:scale-95' : 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none'}`}
                >
                  <Lucide.Ticket size={24} />
                  CONTINUAR
                </Link>
                <div className="text-center opacity-40">
                  <p className="text-[9px] font-black uppercase tracking-widest italic text-slate-400">Checkout Seguro via AWS & Stripe</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4 px-6">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Lucide.ShieldCheck size={20} />
                </div>
                <p className="text-[11px] text-slate-400 font-bold leading-tight uppercase tracking-wider italic">
                  Compra Protegida <br/> 
                  <span className="text-slate-900">Garantia Linkah</span>
                </p>
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}