'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { 
  Search, MapPin, Ticket, 
  Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart,
  ChevronLeft, ChevronRight, Clock, CalendarDays
} from 'lucide-react';

const iconMap: { [key: string]: any } = {
  'Todos': Ticket, 'Show': Music, 'Mentoria': Mic2, 'Teatro': Theater,
  'Games': Gamepad2, 'Gastronomia': Utensils, 'Workshop': GraduationCap,
  'Festa': PartyPopper, 'Infantil': Heart,
};

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop', title: 'Descubra o seu', highlight: 'próximo momento' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop', title: 'Sinta a vibe dos', highlight: 'melhores shows' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070&auto=format&fit=crop', title: 'Conecte-se com', highlight: 'novas experiências' }
];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaCidade, setBuscaCidade] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1)), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);
          const extrair = dados.map((ev: any) => ev.categoria).filter(Boolean);
          setCategoriasExistentes(['Todos', ...Array.from(new Set(extrair)) as string[]]);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    carregarDados();
  }, []);

  // --- LÓGICA DE FILTROS TEMPORAIS ---
  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  const oQueFazerHoje = eventos.filter(ev => {
    const dataEv = new Date(ev.data_evento);
    dataEv.setHours(0,0,0,0);
    return dataEv.getTime() === hoje.getTime();
  });

  const ultimaChamada = eventos.filter(ev => {
    const dataEv = new Date(ev.data_evento);
    const diffTime = dataEv.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 2; // Faltando 1 ou 2 dias
  });

  const vitrineGeral = eventos.filter(ev => {
    const nomeMatch = ev.nome.toLowerCase().includes(buscaNome.toLowerCase());
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
    return nomeMatch && catMatch;
  });

  return (
    <div className="bg-[#F3F4F6] min-h-screen text-slate-900 font-sans pb-20">
      <Navbar />

      {/* HERO / CARROSSEL */}
      <section className="relative h-[480px] flex items-center justify-center overflow-hidden bg-black">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${slide.url}')` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#F3F4F6]" />
            </div>
          </div>
        ))}
        {/* BUSCA */}
        <div className="absolute bottom-10 z-30 w-full px-6">
          <div className="bg-white/95 p-1.5 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center max-w-4xl mx-auto border border-white/20">
            <div className="flex-1 flex items-center px-5 py-2 w-full border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={18} className="text-[#ff0082] mr-3" />
              <input type="text" value={buscaNome} onChange={(e) => setBuscaNome(e.target.value)} placeholder="Encontre sua vibe..." className="w-full bg-transparent outline-none text-sm font-semibold" />
            </div>
            <button className="bg-slate-900 hover:bg-[#ff0082] text-white px-8 py-3 rounded-xl md:rounded-full font-black text-xs uppercase tracking-widest transition-all w-full md:w-auto">Buscar</button>
          </div>
        </div>
      </section>

      <CategoryFilter categories={categoriasExistentes} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        
        {/* SEÇÃO 1: O QUE FAZER HOJE (Apenas se houver eventos hoje) */}
        {oQueFazerHoje.length > 0 && (
          <section>
            <SectionHeader title="O que fazer" highlight="hoje" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
            </div>
          </section>
        )}

        {/* SEÇÃO 2: ÚLTIMA CHAMADA (Faltando 1 ou 2 dias) */}
        {ultimaChamada.length > 0 && (
          <section className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-[#ff0082] animate-pulse" size={20} />
              <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
                Última <span className="text-[#ff0082]">Chamada</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ultimaChamada.map(ev => <EventCard key={ev.id} evento={ev} />)}
            </div>
          </section>
        )}

        {/* SEÇÃO 3: VITRINE GERAL */}
        <section>
          <SectionHeader title={categoriaAtiva === 'Todos' ? 'Perto de você' : categoriaAtiva} count={vitrineGeral.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-10">Carregando eventos...</div>
            ) : (
              vitrineGeral.map(ev => <EventCard key={ev.id} evento={ev} />)
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}