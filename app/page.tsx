'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic'; // ✅ Importação correta do Next.js
import { Navbar } from './site/Navbar'; //teste
import { Footer } from './site/Footer';
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
  ChevronRight,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import Link from 'next/link'; // ✅ Corrigido: 'next/link'
import Image from 'next/image';

// 🔥 CONFIGURAÇÃO DINÂMICA: Resolve o erro de hidratação
const EventCard = dynamic(() => import('./site/EventCard').then(mod => mod.EventCard), { 
  ssr: false,
  loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-3xl" /> 
});

const CategoryFilter = dynamic(() => import('./site/CategoryFilter').then(mod => mod.CategoryFilter), { 
  ssr: false 
});

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
  const [isMounted, setIsMounted] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [filtroData, setFiltroData] = useState('todos'); 
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

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
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6500);
    return () => clearInterval(interval);
  }, [isMounted]);

  const vitrineFiltrada = useMemo(() => {
    if (!isMounted) return [];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    return (eventos || []).filter((ev) => {
      const dataString = String(ev.data_inicio || ev.data || '').split('T')[0];
      const partes = dataString.split('-');
      
      let dataEv = new Date(0);
      if (partes.length === 3) {
        const [ano, mes, dia] = partes.map(Number);
        dataEv = new Date(ano, mes - 1, dia);
      }
      dataEv.setHours(0, 0, 0, 0);

      const nomeMatch = String(ev.nome || '').toLowerCase().includes(buscaNome.toLowerCase());
      const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
      
      let dataMatch = true;
      if (filtroData === 'hoje') dataMatch = dataEv.getTime() === hoje.getTime();
      if (filtroData === 'amanha') dataMatch = dataEv.getTime() === amanha.getTime();
      if (filtroData === 'fds') {
        const diaSemana = dataEv.getDay();
        dataMatch = diaSemana === 0 || diaSemana === 6;
      }

      return nomeMatch && catMatch && dataMatch;
    });
  }, [eventos, buscaNome, categoriaAtiva, filtroData, isMounted]);

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#ff4d4d]/20">
      <Navbar />

      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div key={s.id} className={`absolute inset-0 transition-all duration-[2000ms] ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none mb-10 uppercase">
            {String(t?.[slide.titleKey] || "CRIANDO")} <br />
            <span className="text-[#ff4d4d] italic font-serif font-light">{String(t?.[slide.highlightKey] || "MOMENTOS")}</span>
          </h1>

          <div className="mx-auto max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-1.5 flex border border-slate-100">
            <div className="flex-grow flex items-center gap-3 px-4">
              <Search size={20} className="text-slate-400" />
              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Buscar eventos..."
                className="w-full bg-transparent outline-none text-slate-700 font-medium text-base"
              />
            </div>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition-all">
              Buscar
            </button>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4">
        <div className="mx-auto max-w-7xl px-6">
          <CategoryFilter categories={CATEGORIAS_FIXAS} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-24">
        <section id="vitrine-principal" className="scroll-mt-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Eventos</h2>
              <div className="h-1 w-12 bg-slate-900 rounded-full mt-2" />
            </div>

            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'todos', label: 'Todos', icon: Ticket },
                { id: 'hoje', label: 'Hoje', icon: Zap },
                { id: 'amanha', label: 'Amanhã', icon: Calendar },
                { id: 'fds', label: 'FDS', icon: Sparkles },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFiltroData(item.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filtroData === item.id 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {vitrineFiltrada.length > 0 ? (
              vitrineFiltrada.map((ev) => <EventCard key={`vitrine-${ev.id}`} evento={ev} />)
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Nenhum evento para esta data.</p>
              </div>
            )}
          </div>
        </section>

        {!loading && comunidades.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-end justify-between border-b border-slate-100 pb-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Comunidades</h2>
              <Link href="/comunidades" className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-slate-900 transition-colors group">
                Explorar <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comunidades.map((com) => {
                const rawFoto = com.foto_url || com.imagem || com.capa;
                const fotoFinal = (rawFoto && typeof rawFoto === 'string') 
                  ? (rawFoto.startsWith('http') ? rawFoto : `${API_URL_BASE}/uploads/${rawFoto.replace(/^\/+/, '')}`) 
                  : 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070';
                
                return (
                  <Link key={com.id} href={`/comunidades/${com.id}`} className="group bg-white rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
                    <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                      <Image src={fotoFinal} alt={com.nome || "Comunidade"} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6 flex-grow">
                      <div className="bg-slate-100 w-fit px-3 py-1 rounded-full text-[9px] font-bold text-slate-600 mb-4 flex items-center gap-1.5 uppercase">
                        <Users size={12} /> {com.membros_count || 0} Membros
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-[#ff4d4d] transition-colors uppercase tracking-tight">{com.nome || "Sem Nome"}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{com.descricao || "Participe das discussões exclusivas."}</p>
                    </div>
                    <div className="px-6 pb-6">
                      <div className="w-full py-4 bg-slate-900 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest group-hover:bg-slate-800 transition-all">
                        <MessageCircle size={16} /> Entrar no Chat
                      </div>
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