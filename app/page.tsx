'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './site/Navbar'; 
import { EventCard } from './site/EventCard';
import { Footer } from './site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { 
  Search, Ticket, Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart,
  Clock, Sparkles, Users, ChevronRight, TrendingUp,
  Zap, PlusCircle, MessageCircle, Calendar
} from 'lucide-react';
import Link from 'next/link';

const iconMap: { [key: string]: any } = {
  'Todos': Ticket, 'Show': Music, 'Mentoria': Mic2, 'Teatro': Theater,
  'Games': Gamepad2, 'Gastronomia': Utensils, 'Workshop': GraduationCap,
  'Festa': PartyPopper, 'Infantil': Heart,
};

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070', title: 'Descubra o seu', highlight: 'próximo momento' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070', title: 'Sinta a vibe dos', highlight: 'melhores shows' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070', title: 'Conecte-se com', highlight: 'novas experiências' }
];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';
  const API_COMUNIDADES = 'https://linkah-api.onrender.com/api/comunidades';

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1)), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [resEventos, resComunidades] = await Promise.all([
          fetch(API_URL),
          fetch(API_COMUNIDADES)
        ]);

        if (resEventos.ok) {
          const dados = await resEventos.json();
          setEventos(dados);
          const extrair = dados.map((ev: any) => ev.categoria).filter(Boolean);
          setCategoriasExistentes(['Todos', ...Array.from(new Set(extrair)) as string[]]);
        }

        if (resComunidades.ok) {
          const dadosCom = await resComunidades.json();
          setComunidades(dadosCom.slice(0, 3));
        }
      } catch (error) { 
        console.error("Erro ao carregar dados:", error); 
      } finally { 
        setLoading(false); 
      }
    }
    carregarDados();
  }, []);

  // Lógica de Datas Normalizada
  const hojeStr = new Date().toISOString().split('T')[0];
  const seteDiasDepois = new Date();
  seteDiasDepois.setDate(seteDiasDepois.getDate() + 7);
  const seteDiasStr = seteDiasDepois.toISOString().split('T')[0];

  const normalizeDate = (ev: any) => {
    const d = ev.data || ev.data_inicio;
    return d ? d.split('T')[0] : '';
  };

  const oQueFazerHoje = eventos.filter(ev => normalizeDate(ev) === hojeStr);
  const eventosChegando = eventos.filter(ev => {
    const d = normalizeDate(ev);
    return d > hojeStr && d <= seteDiasStr;
  });
  
  const vitrineFiltrada = eventos.filter(ev => {
    const nomeMatch = ev.nome.toLowerCase().includes(buscaNome.toLowerCase());
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
    return nomeMatch && catMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBFA] text-slate-900 font-sans">
      <Navbar />
      {/* HERO */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden bg-slate-900 shrink-0">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${slide.url}')` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-[#FCFBFA]" />
            </div>
            <div className="relative z-10 text-center px-6">
              <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter">
                {slide.title} <br /> <span className="text-[#ff4d4d]">{slide.highlight}</span>
              </h1>
            </div>
          </div>
        ))}
        <div className="absolute bottom-16 z-30 w-full px-6 max-w-4xl">
           <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl flex items-center border border-slate-100 mx-auto">
              <Search size={22} className="text-slate-400 mx-4" />
              <input type="text" value={buscaNome} onChange={(e) => setBuscaNome(e.target.value)} placeholder="O que vamos fazer hoje?" className="w-full bg-transparent outline-none text-lg font-medium" />
           </div>
        </div>
      </section>

      <div className="sticky top-[68px] z-40 bg-white/80 backdrop-blur-xl py-5 border-b border-slate-100">
        <CategoryFilter categories={categoriasExistentes} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 space-y-28 w-full">
        {!buscaNome && categoriaAtiva === 'Todos' && (
          <>
            {oQueFazerHoje.length > 0 && (
              <section>
                <SectionHeader title="Acontecendo" highlight="hoje" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                  {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              </section>
            )}

            {eventosChegando.length > 0 && (
              <section>
                <SectionHeader title="Chegando" highlight="em breve" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                  {eventosChegando.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              </section>
            )}
          </>
        )}

        <section id="vitrine-principal">
          <SectionHeader title={buscaNome ? "Resultados" : "Todos os eventos"} count={vitrineFiltrada.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}