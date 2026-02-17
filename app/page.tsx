'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { 
  Search, MapPin, Ticket, Loader2, 
  Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart, Sparkles,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const iconMap: { [key: string]: any } = {
  'Todos': Ticket,
  'Show': Music,
  'Mentoria': Mic2,
  'Teatro': Theater,
  'Games': Gamepad2,
  'Gastronomia': Utensils,
  'Workshop': GraduationCap,
  'Festa': PartyPopper,
  'Infantil': Heart,
};

const SLIDES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop',
    title: 'Descubra o seu',
    highlight: 'próximo momento'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
    title: 'Sinta a vibe dos',
    highlight: 'melhores shows'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070&auto=format&fit=crop',
    title: 'Conecte-se com',
    highlight: 'novas experiências'
  }
];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaCidade, setBuscaCidade] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const urlFetch = categoriaAtiva === 'Todos' ? API_URL : `${API_URL}?categoria=${categoriaAtiva}`;
        const response = await fetch(urlFetch);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);
          setEventosFiltrados(dados);

          if (categoriaAtiva === 'Todos') {
            const extrair = dados.map((ev: any) => ev.categoria).filter(Boolean);
            const unicas = Array.from(new Set(extrair)) as string[];
            setCategoriasExistentes(['Todos', ...unicas]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [categoriaAtiva]);

  useEffect(() => {
    const resultado = eventos.filter((evento: any) => {
      const nomeMatch = evento.nome.toLowerCase().includes(buscaNome.toLowerCase());
      const cidadeMatch = evento.cidade?.toLowerCase().includes(buscaCidade.toLowerCase()) || 
                          evento.estado?.toLowerCase().includes(buscaCidade.toLowerCase());
      return buscaCidade === '' ? nomeMatch : (nomeMatch && cidadeMatch);
    });
    setEventosFiltrados(resultado);
  }, [buscaNome, buscaCidade, eventos]);

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-slate-900 font-sans">
      <Navbar />

      {/* CARROSSEL HERO */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-black">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
              style={{ backgroundImage: `url('${slide.url}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#F8F9FA]" />
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
              <span className="inline-block bg-[#ff0082] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6 shadow-lg shadow-pink-500/20">
                Linkah Experience
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight uppercase italic drop-shadow-2xl">
                {slide.title} <br /> <span className="text-[#ff0082]">{slide.highlight}</span>
              </h1>
            </div>
          </div>
        ))}

        {/* Setas de Controle */}
        <button 
          onClick={() => setCurrentSlide(currentSlide === 0 ? SLIDES.length - 1 : currentSlide - 1)}
          className="absolute left-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hidden md:block"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={() => setCurrentSlide(currentSlide === SLIDES.length - 1 ? 0 : currentSlide + 1)}
          className="absolute right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hidden md:block"
        >
          <ChevronRight size={32} />
        </button>

        {/* Busca Floating Glass */}
        <div className="absolute bottom-16 z-30 w-full px-6">
          <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl md:rounded-full shadow-2xl border border-white/50 flex flex-col md:flex-row items-center max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-6 py-3 w-full border-b md:border-b-0 md:border-r border-slate-200/50">
              <Search size={18} className="text-[#ff0082] mr-3" />
              <input 
                type="text" 
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="O que você busca?" 
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex-1 flex items-center px-6 py-3 w-full">
              <MapPin size={18} className="text-slate-400 mr-3" />
              <input 
                type="text" 
                value={buscaCidade}
                onChange={(e) => setBuscaCidade(e.target.value)}
                placeholder="Onde?" 
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button className="bg-slate-900 hover:bg-[#ff0082] text-white px-10 py-4 rounded-xl md:rounded-full font-black text-xs uppercase tracking-widest transition-all active:scale-95 w-full md:w-auto">
              Explorar
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {SLIDES.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-[#ff0082]' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* CATEGORIAS CENTRALIZADAS */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-40">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 px-2">
            <Sparkles size={16} className="text-[#ff0082]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Filtrar por Vibe</h3>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
            {categoriasExistentes.map((cat) => {
              const Icon = iconMap[cat] || Ticket;
              const isAtiva = categoriaAtiva === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 whitespace-nowrap ${
                    isAtiva 
                    ? 'bg-[#ff0082] border-[#ff0082] text-white shadow-lg shadow-pink-200 scale-105' 
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-pink-200 hover:text-[#ff0082]'
                  }`}
                >
                  <Icon size={16} strokeWidth={isAtiva ? 3 : 2} />
                  <span className="text-xs font-bold uppercase tracking-wider">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* VITRINE */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1.5 bg-[#ff0082] rounded-full" />
            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
              {categoriaAtiva === 'Todos' ? 'Perto de você' : categoriaAtiva}
            </h2>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {eventosFiltrados.length} encontrados
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-3xl h-[400px]" />
            ))
          ) : (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}