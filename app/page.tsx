'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from './site/Navbar';
import { Footer } from './site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Search,
  Ticket,
  Sparkles,
  Zap,
  Calendar,
} from 'lucide-react';
import Image from 'next/image';

// 🔥 CONFIGURAÇÃO DINÂMICA
const EventCard = dynamic(() => import('./site/EventCard').then(mod => mod.EventCard), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-3xl" />
});

const CategoryGrid = dynamic(() => import('./site/CategoryGrid').then(mod => mod.CategoryGrid), {
  ssr: false
});

const ExploreLocal = dynamic(() => import('./site/ExploreLocal').then(mod => mod.ExploreLocal), {
  ssr: false
});

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

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
  const languageData = useLanguage();
  const t = languageData?.t as Record<string, any> | undefined;

  const [isMounted, setIsMounted] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [cidadeAtiva, setCidadeAtiva] = useState('todos');
  const [filtroData, setFiltroData] = useState('todos');
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const normalizeText = (text: string = '') =>
    String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function carregarDados() {
      setLoading(true);
      try {
        const resEventos = await fetch(`${API_URL_BASE}/api/eventos/vitrine`, { cache: 'no-store' });

        if (resEventos.ok) {
          const dadosEventos = await resEventos.json();
          setEventos(Array.isArray(dadosEventos) ? dadosEventos : []);
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
        dataEv = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      }
      dataEv.setHours(0, 0, 0, 0);

      const nomeEvento = String(
        ev.nome ||
        ev.titulo ||
        ev.nome_evento ||
        ''
      );

      const nomeMatch = normalizeText(nomeEvento).includes(normalizeText(buscaNome));

      const categoriaEvento = String(ev.categoria || '');
      const catMatch =
        categoriaAtiva === 'Todos' ||
        normalizeText(categoriaEvento) === normalizeText(categoriaAtiva);

      let cidadeMatch = true;

      if (normalizeText(cidadeAtiva) !== 'todos') {
        const cidadeFiltro = normalizeText(cidadeAtiva);

        const cidadeEvento = normalizeText(
          ev.cidade ||
          ev.cidade_evento ||
          ''
        );

        const localEvento = normalizeText(
          ev.local ||
          ev.endereco ||
          ev.endereco_completo ||
          ev.nome_local ||
          ''
        );

        const formatoEvento = normalizeText(
          ev.modalidade ||
          ev.tipo ||
          ev.formato ||
          ''
        );

        const textoCompletoLocal = `${cidadeEvento} ${localEvento} ${formatoEvento}`;

        if (cidadeFiltro === 'remoto') {
          cidadeMatch =
            formatoEvento.includes('online') ||
            formatoEvento.includes('remoto') ||
            formatoEvento.includes('virtual') ||
            cidadeEvento.includes('remoto') ||
            localEvento.includes('remoto') ||
            localEvento.includes('online') ||
            localEvento.includes('virtual');
        } else {
          cidadeMatch =
            cidadeEvento.includes(cidadeFiltro) ||
            localEvento.includes(cidadeFiltro) ||
            textoCompletoLocal.includes(cidadeFiltro);
        }
      }

      let dataMatch = true;

      if (filtroData === 'hoje') {
        dataMatch = dataEv.getTime() === hoje.getTime();
      }

      if (filtroData === 'amanha') {
        dataMatch = dataEv.getTime() === amanha.getTime();
      }

      if (filtroData === 'fds') {
        const diaSemana = dataEv.getDay();
        dataMatch = diaSemana === 0 || diaSemana === 6;
      }

      return nomeMatch && catMatch && dataMatch && cidadeMatch;
    });
  }, [eventos, buscaNome, categoriaAtiva, cidadeAtiva, filtroData, isMounted]);

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-[#ff4d4d]/20">
      <Navbar />

      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-all duration-[2000ms] ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            >
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none mb-10 uppercase">
            {String(t?.[slide.titleKey] || 'DESCUBRA')} <br />
            <span className="text-[#ff4d4d] italic font-serif font-light">
              {String(t?.[slide.highlightKey] || 'EXPERIÊNCIAS')}
            </span>
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

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-32">
        <section>
          <div className="flex flex-col mb-8">
            <h2 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Navegar por Categoria</h2>
            <div className="h-1 w-10 bg-violet-600 rounded-full mt-2" />
          </div>

          <CategoryGrid
            categories={CATEGORIAS_FIXAS}
            activeCategory={categoriaAtiva}
            onSelect={setCategoriaAtiva}
          />
        </section>

        <ExploreLocal
          activeCity={cidadeAtiva}
          onSelect={setCidadeAtiva}
        />

        <section id="vitrine-principal" className="scroll-mt-32 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Eventos</h2>
              <div className="h-1 w-12 bg-slate-900 rounded-full mt-2" />
            </div>

            <div className="flex flex-wrap gap-2 p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
              {[
                { id: 'todos', label: 'Todos', icon: Ticket },
                { id: 'hoje', label: 'Hoje', icon: Zap },
                { id: 'amanha', label: 'Amanhã', icon: Calendar },
                { id: 'fds', label: 'FDS', icon: Sparkles },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFiltroData(item.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filtroData === item.id
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-200'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {vitrineFiltrada.length > 0 ? (
              vitrineFiltrada.map((ev) => (
                <EventCard key={`vitrine-${ev.id}`} evento={ev} />
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Ticket size={32} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                  Nenhum evento encontrado.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}