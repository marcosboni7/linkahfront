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
  MapPin,
  ChevronRight,
  MessageCircle,
  Calendar,
  X,
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
  const [filtroData, setFiltroData] = useState('todos'); // 'todos', 'hoje', 'amanha', 'fds'
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // --- LÓGICA DE HOJE (BANNER SUPERIOR) ---
  const oQueFazerHoje = useMemo(() => {
    const hojeLocal = new Date().toISOString().split('T')[0];
    return eventos.filter(ev => {
      const d = ev.data_inicio || ev.data || '';
      return d.split('T')[0] === hojeLocal;
    });
  }, [eventos]);

  // --- LÓGICA DA VITRINE (COM FILTROS DE DATA) ---
  const vitrineFiltrada = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    return eventos.filter((ev) => {
      const dataEv = new Date(ev.data_inicio || ev.data);
      dataEv.setHours(0, 0, 0, 0);

      const nomeMatch = String(ev.nome || '').toLowerCase().includes(buscaNome.toLowerCase());
      const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
      
      let dataMatch = true;
      if (filtroData === 'hoje') dataMatch = dataEv.getTime() === hoje.getTime();
      if (filtroData === 'amanha') dataMatch = dataEv.getTime() === amanha.getTime();
      if (filtroData === 'fds') {
        const diaSemana = dataEv.getDay(); // 0 = Dom, 6 = Sáb
        dataMatch = diaSemana === 0 || diaSemana === 6;
      }

      return nomeMatch && catMatch && dataMatch;
    });
  }, [eventos, buscaNome, categoriaAtiva, filtroData]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#ff4d4d]/20 font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div key={s.id} className={`absolute inset-0 transition-all duration-[2000ms] ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/40 to-[#ff4d4d]/10 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-none mb-10 uppercase">
            {String(t?.[slide.titleKey] || "VIVA O")} <br />
            <span className="text-[#ff4d4d] italic font-serif font-light">{String(t?.[slide.highlightKey] || "AGORA")}</span>
          </h1>

          <div className="mx-auto max-w-3xl bg-white rounded-full shadow-2xl shadow-[#ff4d4d]/15 p-2 flex border border-slate-100">
            <div className="flex-[1.5] flex items-center gap-3 px-6 py-3">
              <Search size={22} className="text-[#ff4d4d]" />
              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="O que você quer fazer hoje?"
                className="w-full bg-transparent outline-none text-slate-700 font-bold text-lg"
              />
            </div>
            <button className="bg-gradient-to-r from-[#ff4d4d] to-[#ff7070] text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
              Explorar
            </button>
          </div>
        </div>
      </section>

      {/* FILTROS STICKY */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 py-4">
        <div className="mx-auto max-w-7xl px-6">
          <CategoryFilter categories={CATEGORIAS_FIXAS} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-20 space-y-32">
        
        {/* --- 1. ACONTECENDO HOJE (BANNER CORAL) --- */}
        {!loading && oQueFazerHoje.length > 0 && (
          <section className="bg-gradient-to-br from-[#ff4d4d] to-[#ff7070] rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-[#ff4d4d]/30 relative overflow-hidden">
            <Zap size={200} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="bg-white p-3 rounded-2xl text-[#ff4d4d] shadow-lg animate-pulse">
                  <Zap size={24} fill="currentColor" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Perto de você hoje</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {oQueFazerHoje.map((ev) => <EventCard key={`hoje-${ev.id}`} evento={ev} />)}
              </div>
            </div>
          </section>
        )}

        {/* --- 2. VITRINE COM FILTROS DE DATA --- */}
        <section id="vitrine-principal" className="scroll-mt-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Explorar Tudo</h2>
              <div className="h-1.5 w-16 bg-[#ff4d4d] rounded-full mt-4" />
            </div>

            {/* PILLS DE DATA */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-full border border-slate-100">
              {[
                { id: 'todos', label: 'Todos', icon: Ticket },
                { id: 'hoje', label: 'Hoje', icon: Zap },
                { id: 'amanha', label: 'Amanhã', icon: Calendar },
                { id: 'fds', label: 'FDS', icon: Sparkles },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFiltroData(item.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    filtroData === item.id 
                    ? 'bg-[#ff4d4d] text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {vitrineFiltrada.length > 0 ? (
              vitrineFiltrada.map((ev) => <EventCard key={`vitrine-${ev.id}`} evento={ev} />)
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest italic">Nenhum evento encontrado para esta data.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- 3. COMUNIDADES (VISUAL CLEAN) --- */}
        {!loading && comunidades.length > 0 && (
          <section className="space-y-12">
            <div className="flex items-end justify-between border-b border-slate-100 pb-8">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Comunidades</h2>
              <Link href="/comunidades" className="text-[#ff4d4d] font-bold text-xs uppercase tracking-widest flex items-center gap-2 group">
                Ver todas <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comunidades.map((com) => {
                const rawFoto = com.foto_url || com.imagem || com.capa;
                const fotoFinal = rawFoto ? (rawFoto.startsWith('http') ? rawFoto : `${API_URL_BASE}${rawFoto.startsWith('/') ? '' : '/'}${rawFoto}`) : 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070';
                
                return (
                  <Link key={com.id} href={`/comunidades/${com.id}`} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col min-h-[480px]">
                    <div className="relative h-64 w-full overflow-hidden rounded-[2rem] mb-6 bg-slate-50">
                      <Image src={fotoFinal} alt={com.nome} fill unoptimized className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute bottom-4 left-4 bg-white/95 px-4 py-2 rounded-full text-[10px] font-black text-[#ff4d4d] flex items-center gap-2">
                        <Users size={14} /> {com.membros_count || 0} MEMBROS
                      </div>
                    </div>
                    <div className="px-2 flex-grow">
                      <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-[#ff4d4d] transition-colors uppercase tracking-tight">{com.nome}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{com.descricao || "Participe das discussões exclusivas desta comunidade."}</p>
                    </div>
                    <div className="w-full py-5 bg-slate-50 group-hover:bg-[#ff4d4d] rounded-2xl flex items-center justify-center gap-3 text-slate-500 group-hover:text-white font-black text-xs uppercase tracking-widest transition-all">
                      <MessageCircle size={18} /> Ir para o Chat
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}