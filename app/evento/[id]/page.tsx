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
  Verified,
  Award,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

export default function DetalhesEventoPremium() {
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
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#C22973]" size={40} /></div>;
  if (!evento) return <div className="h-screen flex items-center justify-center">Evento não encontrado.</div>;

  // Lógica de Imagens
  const urlFinalImagem = evento.imagem_capa ? 
    (evento.imagem_capa.startsWith('http') ? evento.imagem_capa : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.imagem_capa}`) : 
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1080&h=1350&auto=format&fit=crop';

  const urlFinalPatrocinador = evento.banner_patrocinio ? 
    (evento.banner_patrocinio.startsWith('http') ? evento.banner_patrocinio : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.banner_patrocinio}`) : 
    null;

  const totalGeral = evento.ingressos?.reduce((acc: number, ing: any) => acc + Number(ing.preco) * (quantidades[ing.id] || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 selection:bg-[#C22973] selection:text-white">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 md:px-10 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* COLUNA ESQUERDA: O BANNER 1080x1350 (FIXO NO DESKTOP) */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-28 space-y-8">
              <div className="relative aspect-[1080/1350] w-full rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] bg-slate-100 group">
                <img 
                  src={urlFinalImagem} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt="Evento Main"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                
                {/* Badge de Verificado flutuante na capa */}
                <div className="absolute top-8 left-8">
                  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-2 rounded-full shadow-2xl">
                    <Verified className="text-[#C22973]" size={24} />
                  </div>
                </div>
              </div>

              {/* RODAPÉ DA CAPA: Share & Info */}
              <div className="flex items-center justify-between px-4">
                <div className="flex -space-x-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                    </div>
                  ))}
                  <div className="h-12 px-4 rounded-full bg-slate-900 text-white flex items-center text-xs font-black">+420 confirmados</div>
                </div>
                <button className="w-14 h-14 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CONTEÚDO E PATROCÍNIO 236x354 */}
          <div className="lg:col-span-7 space-y-12 pb-20">
            
            {/* HEADER DO EVENTO */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C22973]">{evento.categoria || 'Experience'}</span>
                 <div className="h-[1px] w-12 bg-slate-200"></div>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] text-slate-900">
                {evento.nome}
              </h1>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm font-bold">
                  <Calendar className="text-[#C22973]" size={18} />
                  {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm font-bold">
                  <MapPin className="text-blue-500" size={18} />
                  {evento.local_nome || 'Local Privado'}
                </div>
              </div>
            </div>

            {/* SEÇÃO HÍBRIDA: DESCRIÇÃO + PATROCINADOR 236x354 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-8 space-y-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tight">O Conceito</h3>
                <p className="text-slate-500 text-xl leading-relaxed italic font-medium">
                  {evento.descricao}
                </p>
              </div>

              {/* BANNER PATROCINADOR (PROPORÇÃO 236x354) */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-[236px] h-[354px] rounded-[2.5rem] overflow-hidden shadow-2xl group border-2 border-white">
                  {urlFinalPatrocinador ? (
                    <img src={urlFinalPatrocinador} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                       <Award className="text-yellow-400 mb-4" size={40} />
                       <span className="text-white font-black text-xs uppercase tracking-widest">Apoio<br/>Oficial</span>
                    </div>
                  )}
                  {/* Overlay interativo */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                     <button className="bg-white p-4 rounded-full text-black"><Maximize2 size={20}/></button>
                  </div>
                </div>
              </div>
            </div>

            {/* TICKETS DESIGN */}
            <section className="bg-slate-900 rounded-[4rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C22973]/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Bilheteria</h4>
                    <p className="text-4xl font-black italic uppercase tracking-tighter">Escolha seu acesso</p>
                  </div>
                  <Ticket size={40} className="text-[#C22973] opacity-50" />
                </div>

                <div className="space-y-4">
                  {evento.ingressos?.map((ing: any) => (
                    <div key={ing.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between transition-all hover:bg-white/10">
                       <div>
                         <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{ing.nome}</p>
                         <p className="text-3xl font-black tracking-tight italic">
                           {Number(ing.preco).toLocaleString(language === 'PT' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' })}
                         </p>
                       </div>
                       <div className="flex items-center gap-6 bg-black/40 p-2 rounded-2xl border border-white/5">
                          <button onClick={() => setQuantidades(p => ({...p, [ing.id]: Math.max(0, p[ing.id]-1)}))} className="w-12 h-12 flex items-center justify-center hover:text-[#C22973] transition-all"><Minus size={18} /></button>
                          <span className="text-xl font-black italic w-6 text-center">{quantidades[ing.id] || 0}</span>
                          <button onClick={() => setQuantidades(p => ({...p, [ing.id]: p[ing.id]+1}))} className="w-12 h-12 flex items-center justify-center hover:text-[#C22973] transition-all"><Plus size={18} /></button>
                       </div>
                    </div>
                  ))}
                </div>

                <Link 
                  href={totalGeral > 0 ? `/checkout` : '#'} 
                  className={`flex items-center justify-between w-full p-8 rounded-[2.5rem] text-xl font-black uppercase italic transition-all ${totalGeral > 0 ? 'bg-[#C22973] hover:bg-white hover:text-black shadow-lg' : 'bg-white/10 text-slate-500 cursor-not-allowed'}`}
                >
                  <span>Check-out</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm tracking-widest opacity-60">Total: {totalGeral.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    <ArrowRight size={24} />
                  </div>
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