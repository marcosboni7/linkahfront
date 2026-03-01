'use client';

import { useEffect, useMemo, useState } from 'react';
import { Navbar } from './site/Navbar';
import { EventCard } from './site/EventCard';
import { Footer } from './site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Search,
  Ticket,
  Palette,
  Theater,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  Users,
  Zap,
  X,
  MapPin,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

const iconMap: { [key: string]: any } = {
  Todos: Ticket,
  'Arte & Cultura': Palette,
  'Entretenimento': Theater,
  'Negócios': Briefcase,
  'Educação & Desenvolvimento': GraduationCap,
  'Esportes & Bem-estar': Heart,
  'Experiências & Lifestyle': Sparkles,
  'Família & Comunidade': Users,
};

const CATEGORIAS_FIXAS = [
  'Todos',
  'Arte & Cultura',
  'Entretenimento',
  'Negócios',
  'Educação & Desenvolvimento',
  'Esportes & Bem-estar',
  'Experiências & Lifestyle',
  'Família & Comunidade'
];

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070', titleKey: 'slide1Title', highlightKey: 'slide1Highlight' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070', titleKey: 'slide2Title', highlightKey: 'slide2Highlight' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070', titleKey: 'slide3Title', highlightKey: 'slide3Highlight' },
];

export default function BuyTicketHome() {
  const { t }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carregamento de dados
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [resEventos, resComunidades] = await Promise.all([
          fetch(`${API_URL_BASE}/api/eventos/vitrine`, { cache: 'no-store' }),
          fetch(`${API_URL_BASE}/api/comunidades`, { cache: 'no-store' }),
        ]);

        if (resEventos.ok) setEventos(await resEventos.json());
        if (resComunidades.ok) {
          const dadosCom = await resComunidades.json();
          setComunidades(Array.isArray(dadosCom) ? dadosCom.slice(0, 3) : []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  // Timer do Carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // Lógica de Filtros
  const vitrineFiltrada = useMemo(() => {
    const query = buscaNome.trim().toLowerCase();
    return eventos.filter((ev) => {
      const nomeMatch = String(ev.nome || '').toLowerCase().includes(query);
      const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
      return nomeMatch && catMatch;
    });
  }, [eventos, buscaNome, categoriaAtiva]);

  // Seção "Mais Perto" / Hoje
  const oQueFazerHoje = useMemo(() => {
    const agora = new Date();
    const hojeLocal = agora.getFullYear() + '-' + 
                      String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(agora.getDate()).padStart(2, '0');
    return eventos.filter((ev) => {
      const dataRaw = ev.data_inicio || ev.data || '';
      return dataRaw && String(dataRaw).split('T')[0] === hojeLocal;
    });
  }, [eventos]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#ff4d4d]/20">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[75vh] min-h-[550px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div key={s.id} className={`absolute inset-0 transition-all duration-[2000ms] ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/40 to-[#ff4d4d]/10 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.95] mb-10">
            {String(t?.[slide.titleKey] || "VIVA O")} <br />
            <span className="text-[#ff4d4d] italic font-serif font-light">{String(t?.[slide.highlightKey] || "AGORA")}</span>
          </h1>

          <div className="mx-auto max-w-3xl bg-white rounded-[2rem] shadow-2xl shadow-[#ff4d4d]/15 p-2 flex flex-col md:flex-row items-center border border-slate-100">
            <div className="flex-[1.5] w-full flex items-center gap-3 px-6 py-4">
              <Search size={22} className="text-[#ff4d4d]" />
              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="O que você quer fazer hoje?"
                className="w-full bg-transparent outline-none text-slate-700 font-bold text-lg placeholder:text-slate-300"
              />
            </div>
            <button 
              onClick={() => document.getElementById('vitrine-principal')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full md:w-auto bg-gradient-to-r from-[#ff4d4d] to-[#ff7070] text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-[#ff4d4d]/30"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* FILTROS STICKY */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-50 py-4">
        <div className="mx-auto max-w-7xl px-6">
          <CategoryFilter categories={CATEGORIAS_FIXAS} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-20 space-y-32">
        
        {/* --- MAIS PERTO / ACONTECENDO HOJE --- */}
        {!loading && oQueFazerHoje.length > 0 && (
          <section className="bg-gradient-to-br from-[#ff4d4d]/5 to-white rounded-[3rem] p-8 md:p-12 border border-[#ff4d4d]/10">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-gradient-to-tr from-[#ff4d4d] to-[#ff7070] p-3 rounded-2xl text-white shadow-lg shadow-[#ff4d4d]/20">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Perto de você</h2>
                <p className="text-[#ff4d4d] font-bold text-xs uppercase tracking-[0.2em]">Acontecendo agora</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {oQueFazerHoje.map((ev) => <EventCard key={`hoje-${ev.id}`} evento={ev} />)}
            </div>
          </section>
        )}

        {/* --- COMUNIDADES --- */}
        {!loading && comunidades.length > 0 && (
          <section className="space-y-12">
            <div className="flex items-end justify-between border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Comunidades</h2>
                <p className="text-slate-400 font-medium mt-1">Conecte-se e entre no chat direto das salas.</p>
              </div>
              <Link href="/comunidades" className="text-[#ff4d4d] font-bold text-xs uppercase tracking-widest flex items-center gap-2 group">
                Ver todas <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comunidades.map((com) => {
                // Lógica de Foto reforçada para banco de dados
                const rawFoto = com.foto_url || com.imagem || com.capa || com.banner;
                let fotoFinal = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070';
                
                if (rawFoto) {
                  fotoFinal = rawFoto.startsWith('http') ? rawFoto : `${API_URL_BASE}${rawFoto.startsWith('/') ? '' : '/'}${rawFoto}`;
                }

                return (
                  <Link 
                    key={com.id} 
                    href={`/comunidades/${com.id}`} 
                    className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:shadow-2xl hover:shadow-[#ff4d4d]/10 transition-all duration-500 flex flex-col min-h-[480px]"
                  >
                    <div className="relative h-64 w-full overflow-hidden rounded-[2rem] mb-6 bg-slate-50">
                      <Image 
                        src={fotoFinal} 
                        alt={com.nome}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-4 left-4 bg-white/95 px-4 py-2 rounded-full text-[11px] font-black text-[#ff4d4d] shadow-sm flex items-center gap-2">
                        <Users size={14} /> {com.membros_count || 0} MEMBROS
                      </div>
                    </div>

                    <div className="px-2 flex-grow">
                      <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-[#ff4d4d] transition-colors uppercase tracking-tight">
                        {com.nome}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8">
                        {com.descricao || "Participe desta comunidade exclusiva e conecte-se com novas pessoas."}
                      </p>
                    </div>

                    <div className="w-full py-5 bg-slate-50 group-hover:bg-gradient-to-r group-hover:from-[#ff4d4d] group-hover:to-[#ff7070] rounded-2xl flex items-center justify-center gap-3 text-slate-500 group-hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all">
                      <MessageCircle size={18} /> Entrar no Chat
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* --- VITRINE PRINCIPAL --- */}
        <section id="vitrine-principal" className="scroll-mt-32">
          <div className="mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Explorar Tudo</h2>
            <div className="h-1.5 w-16 bg-[#ff4d4d] rounded-full mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {vitrineFiltrada.map((ev) => (
              <EventCard key={`vitrine-${ev.id}`} evento={ev} />
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}