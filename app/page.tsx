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
  Clock
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
      } catch (error) { console.error("Erro API:", error); } finally { setLoading(false); }
    }
    carregarDados();
  }, []);

  // --- LÓGICA DE FILTROS TEMPORAIS (À prova de fuso horário) ---
  const hojeObj = new Date();
  const hojeStr = hojeObj.toLocaleDateString('en-CA'); // Retorna "YYYY-MM-DD" local

  // 1. Filtrar eventos para HOJE
  const oQueFazerHoje = eventos.filter(ev => {
    if (!ev.data_inicio) return false;
    const dataEvStr = new Date(ev.data_inicio).toLocaleDateString('en-CA');
    return dataEvStr === hojeStr;
  });

  // 2. Filtrar eventos para ÚLTIMA CHAMADA (Próximos 1 ou 2 dias)
  const ultimaChamada = eventos.filter(ev => {
    if (!ev.data_inicio) return false;
    
    const dataEv = new Date(ev.data_inicio);
    const dataEvStr = dataEv.toLocaleDateString('en-CA');
    
    // Se for hoje, não mostra na última chamada para não duplicar
    if (dataEvStr === hojeStr) return false;

    const diffTime = dataEv.getTime() - hojeObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 1 && diffDays <= 2;
  });

  // 3. Vitrine Geral
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
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms]" style={{ backgroundImage: `url('${slide.url}')`, transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#F3F4F6]" />
            </div>
            <div className="relative z-10 text-center px-6">
              <span className="inline-block bg-[#ff0082] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-4 shadow-lg shadow-pink-500/20">Linkah Experience</span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-tight">
                {slide.title} <br /> <span className="text-[#ff0082]">{slide.highlight}</span>
              </h1>
            </div>
          </div>
        ))}
        
        {/* BUSCA */}
        <div className="absolute bottom-10 z-30 w-full px-6">
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center max-w-4xl mx-auto border border-white/20">
            <div className="flex-1 flex items-center px-5 py-2 w-full border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={18} className="text-[#ff0082] mr-3" />
              <input type="text" value={buscaNome} onChange={(e) => setBuscaNome(e.target.value)} placeholder="Encontre sua vibe..." className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800" />
            </div>
            <div className="flex-1 flex items-center px-5 py-2 w-full">
              <MapPin size={18} className="text-slate-400 mr-3" />
              <input type="text" placeholder="Onde você está?" className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800" />
            </div>
            <button className="bg-slate-900 hover:bg-[#ff0082] text-white px-8 py-3 rounded-xl md:rounded-full font-black text-xs uppercase tracking-widest transition-all w-full md:w-auto">Buscar</button>
          </div>
        </div>
      </section>

      <CategoryFilter categories={categoriasExistentes} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        
        {/* SEÇÃO 1: O QUE FAZER HOJE */}
        {oQueFazerHoje.length > 0 && (
          <section>
            <SectionHeader title="O que fazer" highlight="hoje" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
            </div>
          </section>
        )}

        {/* SEÇÃO 2: ÚLTIMA CHAMADA */}
        {ultimaChamada.length > 0 && (
          <section className="bg-pink-50/30 p-8 rounded-[2rem] border border-pink-100/50">
            <div className="flex items-center gap-2 mb-8">
              <Clock className="text-[#ff0082] animate-pulse" size={24} />
              <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
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
          <SectionHeader 
            title={categoriaAtiva === 'Todos' ? 'Perto de você' : categoriaAtiva} 
            count={vitrineGeral.length} 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-[360px] border border-slate-100" />
              ))
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