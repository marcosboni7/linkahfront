'use client';

import { useEffect, useState, useCallback } from 'react';
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

// Banners fictícios para o Carousel
const BANNERS = [
  {
    id: 1,
    title: "Sinta a Energia dos Palcos",
    subtitle: "OS MELHORES SHOWS DE 2026",
    image: "https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=2070&auto=format&fit=crop",
    color: "#ff0082"
  },
  {
    id: 2,
    title: "Conecte-se com Mentores",
    subtitle: "WORKSHOPS E MENTORIAS EXCLUSIVAS",
    image: "https://images.unsplash.com/photo-1540575861501-7ad05823c93f?q=80&w=2070&auto=format&fit=crop",
    color: "#3b82f6"
  },
  {
    id: 3,
    title: "Viva a Gastronomia",
    subtitle: "EXPERIÊNCIAS CULINÁRIAS ÚNICAS",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop",
    color: "#10b981"
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
  
  // Estado do Slider
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  // Lógica do Slider Automático
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));

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
    <div className="bg-[#fcfcfc] min-h-screen text-slate-900 font-sans">
      <Navbar />

      {/* CAROUSEL SLIDER HERO */}
      <section className="relative h-[600px] w-full overflow-hidden bg-black">
        {BANNERS.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Imagem com Zoom suave */}
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#fcfcfc]" />
            </div>

            {/* Conteúdo do Slide */}
            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
              <span className="text-[#ff0082] text-xs font-black uppercase tracking-[0.4em] mb-4 drop-shadow-lg">
                {slide.subtitle}
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter uppercase italic drop-shadow-2xl">
                {slide.title.split(' ').map((word, i) => (
                  <span key={i}>{word === 'Energia' || word === 'Mentores' || word === 'Gastronomia' ? <span className="text-[#ff0082]">{word} </span> : word + ' '}</span>
                ))}
              </h1>
            </div>
          </div>
        ))}

        {/* Controles do Slider */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all">
          <ChevronLeft size={30} />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all">
          <ChevronRight size={30} />
        </button>

        {/* Indicadores (Dots) */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {BANNERS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-8 bg-[#ff0082]' : 'w-2 bg-white/50'}`} 
            />
          ))}
        </div>

        {/* BUSCA INTEGRADA AO SLIDER */}
        <div className="absolute bottom-[-40px] left-0 w-full z-40 px-6">
           <div className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 flex flex-col md:flex-row items-center border border-slate-100">
              <div className="flex-1 flex items-center px-6 py-3 w-full border-b md:border-b-0 md:border-r border-slate-50">
                <Search size={18} className="text-[#ff0082] mr-3" />
                <input 
                  type="text" 
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  placeholder="Encontre sua vibe..." 
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>
              <div className="flex-1 flex items-center px-6 py-3 w-full">
                <MapPin size={18} className="text-slate-400 mr-3" />
                <input 
                  type="text" 
                  value={buscaCidade}
                  onChange={(e) => setBuscaCidade(e.target.value)}
                  placeholder="Onde?" 
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>
              <button className="bg-[#ff0082] text-white px-10 py-4 rounded-xl md:rounded-full font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all w-full md:w-auto">
                Buscar
              </button>
           </div>
        </div>
      </section>

      {/* CATEGORIAS CLEAN - PILLS */}
      <section className="max-w-6xl mx-auto px-6 mt-24 mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles size={18} className="text-[#ff0082]" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Explore Categorias</h2>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
          {categoriasExistentes.map((cat) => {
            const Icon = iconMap[cat] || Ticket;
            const isAtiva = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 whitespace-nowrap ${
                  isAtiva 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-[#ff0082] hover:text-[#ff0082]'
                }`}
              >
                <Icon size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* VITRINE DE EVENTOS */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-3xl h-80" />
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